import { HeaderService } from './header.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { LangService } from '../../core/services/lang.service';
import { LayoutService } from '../../core/services/layout.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/core/models/users';
import { RoleResp } from 'src/app/core/models/authorization';
import { PermissionService } from 'src/app/core/services/permission.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnDestroy {
  @Input() sidebarToggled!: boolean;
  breakpoint!: string;
  userName: string = '';
  announceNoReadCount = '';

  channelName = 'AnnounceIsRead';
  subscriptionNotify!: Subscription;
  checkRegister: boolean = false;

  /** 目前的使用者 */
  get currentUserValue() {
    return this.authService.currentUserValue ?? null;
  }

  /** 下拉選單 */
  get itemList() {
    return this.currentUserValue?.roleList ?? [];
  }
  get selectedItems() {
    return this.currentUserValue?.role ? [this.currentUserValue?.role] : [];
  }

  /** 登入角色資訊 */
  get loginRole() {
    return {
      // 品牌
      brand: this.currentUserValue?.role
        ? this.currentUserValue?.role.brand?.name
        : '',
      // 公司
      company: this.currentUserValue?.role
        ? this.currentUserValue?.role.company.nickCh
        : '',
    };
  }

  ui = {
    RoleLoading: false, // 判斷api狀態 不要一直讀取
  };

  /** changeRole 權限 */
  changeRolePermission: boolean = false;

  /**
   *
   * @param langService 多語系服務
   * @param api 資料庫服務
   * @param router 路由服務
   * @param alert 彈跳視窗服務
   * @param translate 多國語言服務
   * @param data 自定義服務
   */
  constructor(
    public authService: AuthService,
    public headerService: HeaderService,
    public langService: LangService,
    private layoutService: LayoutService,
    private router: Router,
    private route: ActivatedRoute,
    public permission: PermissionService,
    public alert: AlertService,
  ) {
    /** 訂閱畫面尺寸變化 */
    this.breakpoint = this.layoutService.currentBreakpoint();
    this.layoutService.$breakpointsChanges.subscribe((res) => {
      this.breakpoint = res.name;
    });
    router.events.subscribe((val) => {
      this.checkRegister = false;
      if (this.router.url.indexOf('register') > -1) {
        this.checkRegister = true;
      }
    });
  }
  // ngOnInit() {
  //   this.authService.currentUser.subscribe(res => {
  //     if (res) {
  //       this.userName = '';
  //       this.currentUserValue = this.authService.currentUserValue;
  //       this.itemList = this.currentUserValue?.roleList ?? [];
  //       this.selectedItems = this.currentUserValue?.role ? [this.currentUserValue?.role] : [];
  //       this.loginRole.brand = this.currentUserValue?.role ? this.currentUserValue?.role.brand?.name : '';
  //       this.loginRole.company = this.currentUserValue?.role ? this.currentUserValue?.role.company.nickCh : '';
  //     }
  //   });
  // }

  logout(brand: string) {
    this.authService.logout(brand);
  }

  ngOnDestroy(): void {
    if (this.subscriptionNotify) {
      this.subscriptionNotify.unsubscribe();
    }
  }

  redirectTo(uri: string) {
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() =>
        this.router.navigate([uri], { state: { route: { internal: true } } }),
      );
  }

  /** 切換角色 */
  changeRole(id: string) {
    this.ui.RoleLoading = true;
    this.headerService.changeRole(id).subscribe({
      next: (res) => {
        console.log('[header] changeRole done', res); // 判斷response 是否有拿到值
        if (res.info.success && res?.data) {
          // 重新取回目前使用者資料 (主要更新 current role)
          const token = this.authService.currentUserValue?.accessToken ?? '';
          const refreshToken =
            this.authService.currentUserValue?.refreshToken ?? '';
          console.log(refreshToken);

          this.authService.getUserData(token, refreshToken);

          // 切換成功後，回首頁
          let url = environment['loginUrl'];
          setTimeout(() => {
            const isCloudRole = this.authService.currentUserValue?.role?.brand.id === '290ebb3e-ad5d-42e1-8b02-836de25b0807' ? true : false;
            // 非雲市集角色跳轉到home
            if (!isCloudRole) {
              url = this.route.snapshot.queryParams['returnUrl'] || '/main/home';
            }
            window.location.href = url;
          }, 300);
        }
        this.ui.RoleLoading = false;
      },
      error: (err) => {
        console.error('[header] changeRole fail', err);
        this.alert.errorAlert('[header] changeRole fail' + err);
        this.ui.RoleLoading = false;
      },
    });
  }
}
