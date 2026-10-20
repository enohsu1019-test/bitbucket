import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/users';
import { ApiService } from './api.service';
import { PermissionService } from './permission.service';
import { environment } from 'src/environments/environment';
import { ResponseData } from '../models/response-data';
import { JwtHelperService } from '@auth0/angular-jwt';
import { RefreshRequest, RoleResp } from '../models/authorization';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  gateway: any;

  /** token refreshing */
  isRefreshing = false;

  constructor(
    private api: ApiService,
    private data: DataService,
    public permission: PermissionService,
    private httpBackend: HttpBackend,
  ) {
    const userText = localStorage.getItem('currentUser');
    this._currentUserValue = userText ? JSON.parse(userText) : null;
    this.gateway = environment['gateway'];
  }


  private _currentUserValue: User | null = null;
  public get currentUserValue(): User | null {
    return this._currentUserValue;
  }

  isTokenExpired() {
    const loginData = localStorage.getItem('loginData');
    if (!loginData) {
      return true;
    }
    const exp = JSON.parse(loginData)?.exp;
    const now = (new Date()).getTime() / 1000;
    if (exp < now) {
      return true;
    }

    return false;
  }


  /** API: 取得指定使用者
   * @param id 若有，管理者用 id 編輯使用者
   * @param id 若 ''，查詢個人使用者使用
   */
  getUser(id?: string): Observable<ResponseData> {
    const uid = id ? `/${id}` : '';
    return this.api.get(this.gateway.user + 'user' + uid);
  }

  getUserData(accessToken: string, refreshToken: string) {
    this.getUser().subscribe({
      next: (res) => {
        console.log('[user] getUser done', res);
        if (res.info.success && res?.data) {
          // 真實的登入者資料
          const userData = res.data;
          const userRole = userData.roleList.find((role: RoleResp) => role.id === userData.roleId);
          if (this._currentUserValue) {
            this._currentUserValue.id = userData.id;
            this._currentUserValue.username = userData.name;
            this._currentUserValue.email = userData.email;
            this._currentUserValue.roleList = userData.roleList;
            this._currentUserValue.role = userRole;
            this._currentUserValue.roleId = userData.roleId;
            this._currentUserValue.accessToken = accessToken;
            this._currentUserValue.refreshToken = refreshToken;
          }
          console.log(this._currentUserValue);

          // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(this._currentUserValue));

          // 將 refreshToken 寫入 dataService 中取用，避免於 Circular dependency in DI 問題
          this.data.refreshToken = refreshToken;

          // 查詢使用者設定權限
          this.permission.getPermissionRule();

          // refresh 動作都做完
          this.isRefreshing = false;
        }
      },
      error: (err) => {
        console.error('auth > getUserData fail' + err);
        this.isRefreshing = false;
      }
    });
  }


  loginWithToken(token: string, refreshToken: string) {
    // parse token to payload and store in local storage
    const jwt = new JwtHelperService();
    const decodedToken = jwt.decodeToken(token);

    localStorage.setItem('loginData', JSON.stringify(decodedToken));
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);

    const user: User = {
      id: '',
      username: 'fakeUserForApiRequest',
      accessToken: token,
      refreshToken: refreshToken
    };

    // 先儲存一個假用戶 (真 token)，用來發出查詢登入用戶的 Api request
    // this.currentUserSubject.next(user);
    this._currentUserValue = user;

    // 查詢登入用戶
    this.getUserData(token, refreshToken);
  }

  logout(brand?: string) {
    // Meta-Match logout
    const loginData = JSON.parse(localStorage.getItem('loginData')!);
    // const logoutUrl = loginData.azp === 'meta-match' ? environment['oauthMetaSignOutUrl'] : environment['oauthSignOutUrl'];
    const logoutUrl = brand === '雲市集' ? environment['oauthMetaSignOutUrl'] : environment['oauthSignOutUrl'];

    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    localStorage.removeItem('loginData');
    localStorage.removeItem('permissionData');
    localStorage.removeItem('permissionFlat');
    // this.currentUserSubject.next(null);
    const isCloudRole = this._currentUserValue?.role?.brand.id === '290ebb3e-ad5d-42e1-8b02-836de25b0807' ? true : false;
    this._currentUserValue = null;

    // 這個方式會觸發 AuthGuard，帶入 returnUrl，讓下次登入時回到最後登出位置
    // location.reload();  // reload page to trigger canActivate behavior of route
    // 手動登出不套用 returnUrl
    // this.router.navigate(['/login']);
    // const redirectUrl = encodeURIComponent(environment.oauthUrl + '?redirectUrl=' + environment.loginUrl);
    const redirectUrl = encodeURIComponent(environment['loginUrl']);
    const url = logoutUrl + '?redirectUrl=' + redirectUrl;
    window.location.href = url;
  }

  /** token 過期時，須透過 refresh token 取得新的 token */
  refresh() {
    // 若已經在進行 refresh token 時，不重新 get
    if (this.isRefreshing === true) {
      return;
    } else {
      this.isRefreshing = true
    }

    if (this._currentUserValue?.refreshToken) {
      const req: RefreshRequest = {
        refreshToken: this._currentUserValue.refreshToken
      }

      const authService = this;
      const newHttpClient = new HttpClient(this.httpBackend);  // 此處 API 不用帶入 token
      newHttpClient.post(`${environment['apiUrl']}/token/refresh`, req).subscribe({
        next(res: any) {
          console.log('get refresh token', res);
          localStorage.removeItem('currentUser');
          localStorage.removeItem('loginData');
          localStorage.removeItem('permissionData');
          localStorage.removeItem('permissionFlat');
          // authService.currentUserSubject.next(null);
          authService._currentUserValue = null;
          authService.loginWithToken(res['access_token'], res['refresh_token']);
        },
        error(err) {
          console.error('[auth.service] refresh token fail..')
          authService.logout();
        }
      });
    }
  }

  // login(email: string, password: string) {
  //   return this.http.post<any>(`${environment['apiUrl']}/signin`, { email, password })
  //     .pipe(map((user: User) => {
  //       // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
  //       localStorage.setItem('currentUser', JSON.stringify(user));
  //       this.currentUserSubject.next(user);
  //       return user;
  //     }));
  // }

  /** 透過查詢 ping 來判斷 session 是否失效，如果失效，就會因為 http status code 自動跳轉登入畫面 */
  // pingSession() {
  //   this.api.get(environment['gateway'].setting + 'ping').subscribe(
  //     res => { /* console.log('ping session done', res) */ },
  //     err => {
  //       console.error('ping session fail', err);
  //       this.logout();
  //     }
  //   );
  // }

  // ======================== Menu readonly ======================== //

  /** API: 各功能頁面操作權限
   * @param id 各功能所對應要查詢的id
   * @param type 要查詢的功能類別
   */
  // getEditPermission(id: string, type?: string): Observable<ResponseData> {
  //   const menuType = type ?? this.getMenuType();
  //   return this.api.get(environment['gateway'].setting + `readonly?type=${menuType}&id=${id}`);
  // }

  /** 從網址取得 menuType */
  // getMenuType() {
  //   const url = location.pathname;
  //   const functionMenu = 'admin/';
  //   const settingMenu = 'admin/settings/';

  //   let type = url.indexOf(settingMenu) === -1 ? url.split(functionMenu)[1] : url.split(settingMenu)[1];

  //   type = type ? type?.split('/')[0] : 'contacts';
  //   const menuType = this.getMenuName(type);
  //   return menuType;
  // }

  /** 將網址所得 menuType 轉為 api 所需參數
   * @param type 從網址擷取要查詢的功能類別
   */
  // getMenuName(type: string) {
  //   switch (type) {
  //   case MenuPath.contacts:
  //     return MenuName.contacts;
  //   case MenuPath.contactLists:
  //     return MenuName.contactLists;
  //   case MenuPath.emails:
  //     return MenuName.emails;
  //   case MenuPath.sms:
  //     return MenuName.sms;
  //   case MenuPath.workflows:
  //     return MenuName.workflows;
  //   case MenuPath.deals:
  //     return MenuName.deals;
  //   case MenuPath.dashboard:
  //     return MenuName.dashboard;
  //   case MenuPath.product:
  //     return MenuName.product;
  //   }
  // }
  // ================================================================= //
}
