import { CloudIdInfoType, CloudIdRequest, CloudIdsInfo, RoleForm, Role } from './../core/models/authorization';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Filter } from '../core/models/filter';
import { RequestData } from '../core/models/request-data';
import { ResponseData } from '../core/models/response-data';
import { ApiService } from '../core/services/api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  gateway: any;

  constructor(
    private api: ApiService
  ) {
    this.gateway = environment['gateway']
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

  /** 新增角色 */
  addRole(data: RoleForm): Observable<ResponseData> {
    return this.api.post(this.gateway.iam + 'iam', new RequestData(data));
  }

  /** 取得角色資訊 */
  getRole(id: string) {
    return this.api.get(this.gateway.iam + 'iam/' + id);
  }

  /** 更新角色資訊 */
  updateRole(id: string, data: Role) {
    return this.api.put(this.gateway.iam + 'iam/' + id, new RequestData(data));
  }

  /** 刪除角色 */
  deleteRole(id: string): Observable<ResponseData> {
    return this.api.delete(this.gateway.iam + 'iam/' + id);
  }

  /** 確認角色名稱是否存在 */
  checkIamName(name: string, brandId: string, companyId: string): Observable<ResponseData> {
    return this.api.get(this.gateway.iam + `iam/checkIamName?name=${name}&brand=${brandId}&company=${companyId}`);
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

  /** 編輯權限 */
  updateRuleGroupDetail(id: string, data: { add: string[], delete: string[] }) {
    return this.api.put(this.gateway.iam + 'iam/' + id + '/rule', new RequestData(data));
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

  /** 新增 cloudId */
  addCloudId(id: string, data: CloudIdsInfo) {
    return this.api.post(this.gateway.iam + 'iam/' + id + '/cloudInfo', new RequestData(data));
  }

  /** 編輯 cloudId */
  updateCloudId(id: string, data: CloudIdsInfo) {
    return this.api.put(this.gateway.iam + 'iam/' + id + '/cloudInfo/' + data.id, new RequestData(data));
  }

  /** 刪除 cloudId */
  deleteCloudId(id: string, cloudId: string) {
    return this.api.delete(this.gateway.iam + 'iam/' + id + '/cloudInfo/' + cloudId);
  }

  /** 取得 cloudId 設定資訊
   * @param type: PayerId, Company, CloudId
   */
  getCloudIdInfo(type: CloudIdInfoType, data: CloudIdRequest) {
    return this.api.post(this.gateway.iam + 'cloudRelation/' + type, new RequestData(data));
  }


  ////////////////////////////////////
  //                                //
  //             原廠                //
  //                                //
  ////////////////////////////////////

  getBrandList() {
    return this.api.get(this.gateway.iam + 'iam/brands');
  }


  ////////////////////////////////////
  //                                //
  //             公司                //
  //                                //
  ////////////////////////////////////

  // getCompanyList(brandId: string, identityType: string) {
  //   return this.api.get(this.gateway.iam + `cloudRelation/company?brand=${brandId}&identityType=${identityType}`);
  // }

  getCompanyList(filter: Filter) {
    return this.api.post(this.gateway.customer + 'customers', new RequestData(filter));
  }
}

