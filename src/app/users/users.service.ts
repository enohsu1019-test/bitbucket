import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiInterface } from '../core/models/apis/api-interface';
import { Filter } from '../core/models/filter';
import { RequestData } from '../core/models/request-data';
import { ResponseData } from '../core/models/response-data';
import { AddUserData, UserData } from '../core/models/users';
import { ApiService } from '../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  gateway: any;

  constructor(
    private api: ApiService
  ) {
    this.gateway = environment['gateway'];
  }

  ////////////////////////////////////
  //                                //
  //             User               //
  //                                //
  ////////////////////////////////////

  /** 搜尋使用者（管理者使用） */
  getUserList(filterData: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.user + 'user/query', new RequestData(filterData));
  }

  /** 新增使用者 */
  addUser(data: AddUserData) {
    return this.api.post(this.gateway.user + 'user', new RequestData(data));
  }

  /** 取得指定使用者
   * @param id 若有，管理者用 id 編輯使用者
   * @param id 若 ''，查詢個人使用者使用
   */
  getUser(id: string) {
    const uid = id ? `/${id}` : '';
    return this.api.get(this.gateway.user + 'user' + uid);
  }

  /** 更新使用者 */
  updateUser(id: string, data: UserData) {
    const userId = id === 'null' ? '' : ('/' + id);
    return this.api.put(this.gateway.user + 'user' + userId, new RequestData(data));
  }

  /** 刪除使用者 (盡量不要用，會把角色全部刪掉) */
  // deleteUser(id: string): Observable<ResponseData> {
  //   return this.api.delete(this.gateway.user + 'user/' + id);
  // }

  /** 刪除使用者角色 */
  deleteUserRole(id: string, data: string[]): Observable<ResponseData> {
    return this.api.post(this.gateway.user + 'user/' + id + '/deleteIam', new RequestData(data));
  }

  /** 確認使用者是否存在 */
  checkUserExist(email: string): Observable<ResponseData> {
    return this.api.get(this.gateway.user + 'user/checkUserExists?email=' + email);
  }

  /** 切換角色資訊 */
  changeRole(roleId: string) {
    return this.api.put(this.gateway.user + 'user/changeRole', new RequestData(roleId));
  }

  ////////////////////////////////////
  //                                //
  //           Job Title            //
  //                                //
  ////////////////////////////////////

  /** 取得職稱 */
  getJobTitle(): Observable<ResponseData> {
    return this.api.get(this.gateway.customer + 'title/list');
  }


  ////////////////////////////////////
  //                                //
  //            Password            //
  //                                //
  ////////////////////////////////////

  /** 更新密碼 */
  updatePassword(id: string, password: string): Observable<ResponseData> {
    return this.api.put(this.gateway.user + 'user/' + id + '/password', new RequestData(password));
  }


  ////////////////////////////////////
  //                                //
  //             Role               //
  //                                //
  ////////////////////////////////////

  /** 搜尋角色 */
  getRoleList(filterData: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.iam + 'iam/query', new RequestData(filterData));
  }


  ////////////////////////////////////
  //                                //
  //              Rule              //
  //                                //
  ////////////////////////////////////

  /** 取得權限群組 */
  getRuleGroupList() {
    return this.api.get(this.gateway.iam + 'iam/rule/group');
  }

  /** 取得群組細項 */
  getRuleGroupDetail(groupName: string, roleId: string): Observable<ResponseData> {
    const getByRole = roleId ? `?id=${roleId}` : '';
    return this.api.get(this.gateway.iam + 'iam/rule/group/' + groupName + getByRole);
  }


  ////////////////////////////////////
  //                                //
  //          關聯 cloudId           //
  //                                //
  ////////////////////////////////////

  /** 搜尋關聯 cloudId */
  getCloudIdList(id: string, filterData: Filter) {
    return this.api.post(this.gateway.iam + 'iam/' + id + '/cloudInfo/query', new RequestData(filterData));
  }

  //////////////////////////
  //                      //
  //        交易代碼       //
  //                      //
  //////////////////////////

  /** 搜尋交易代碼 */
  getPromoCodes(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.product + 'promoCodes', new RequestData(filter));
  }

  /** 新增/修改/刪除 交易代碼 */
  editPromoCodes(data: any): Observable<ResponseData> {
    return this.api.post(this.gateway.product + 'promoCode', new RequestData(data));
  }

}
