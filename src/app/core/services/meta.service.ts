import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// import { HttpBackend, HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { environment } from 'src/environments/environment';
import { PermissionService } from './permission.service';
import { ResponseData } from '../models/response-data';
import { RequestData } from '../models/request-data';
import { User } from '../models/users';


@Injectable({
  providedIn: 'root'
})

export class MetaService {
  gateway: any;

  /** token refreshing */
  isRefreshing = false;
  private _currentUserValue: User | null = null;
  public get currentUserValue(): User | null {
    return this._currentUserValue;
  }

  constructor(
    private api: ApiService,
    public permission: PermissionService,
    // private httpBackend: HttpBackend,
  ) {
    const userText = localStorage.getItem('currentUser');
    this._currentUserValue = userText ? JSON.parse(userText) : null;
    this.gateway = environment['gateway'];
  }

  /** 註冊 */
  register(data: any): Observable<ResponseData> {
    return this.api.post(this.gateway.user + 'registration', new RequestData(data));
  }

  /** 註冊列表 */
  getRegistrationList(data: any): Observable<ResponseData> {
    return this.api.post(this.gateway.user + 'registration/list', new RequestData(data));
  }

  /** 修改註冊狀態 */
  setRegistrationStatus(data: any): Observable<ResponseData> {
    return this.api.put(this.gateway.user + 'registration/update', new RequestData(data));
  }
}
