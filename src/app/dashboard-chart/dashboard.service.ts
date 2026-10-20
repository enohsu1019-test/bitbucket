import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Filter } from '../core/models/filter';
import { ApiService } from '../core/services/api.service';
import { ResponseData } from '../core/models/response-data';
import { environment } from 'src/environments/environment';
import { RequestData } from '../core/models/request-data';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  gateway: any;

  constructor(
    private api: ApiService,
  ) {
    this.gateway = environment['gateway'];
  }

  //////////////////////////
  //                      //
  //       Function       //
  //                      //
  //////////////////////////


  //////////////////////////
  //                      //
  //         Api          //
  //                      //
  //////////////////////////


  /** payerId cloudId 關聯 */
  getUserRights(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.user + 'aliasList', new RequestData(filter));
  }

  /** 搜尋訂單列表 */
  getOrderList(filterData: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.dashboard + 'orders', new RequestData(filterData));
  }

  // AWS金錢使用量Exce;
  postAWSCostExplorerExcel(data: any): Observable<ResponseData> {
    return this.api.postDownload(this.gateway.awsCostAnalysis + 'costExplorer/AWS/export', new RequestData(data));
  }

  // AWS filter資料
  postAWSFilter(data: any): Observable<ResponseData> {
    return this.api.post(this.gateway.awsCostAnalysis + 'costExplorer/AWS/filter', new RequestData(data));
  }

  // AWS金錢使用量
  postAWSCostExplorer(data: any): Observable<ResponseData> {
    return this.api.post(this.gateway.awsCostAnalysis + 'costExplorer/AWS', new RequestData(data));
  }

  postCustomers(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.customer + 'customers', new RequestData(filter));
  }

  /** 最終使用者 */
  postEndUsers(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.billing + 'orders/endusers', new RequestData(filter));
  }

  /** 取得 chartTemplate 設定資訊 */
  getDashboard(dashboardname: string): Observable<ResponseData> {
    return this.api.get(this.gateway.awsCostAnalysis + 'template?name=' + dashboardname);
  }

  dashboard(charttemplatename: string): Observable<ResponseData> {
    return this.api.get(this.gateway.awsCostAnalysis + 'aggregate/' + charttemplatename);
  }

  /** 動態 filter 儀表版 */
  dynamicDashboard(filterdata: { [key: string]: any } | null): Observable<ResponseData> {
    return this.api.post(this.gateway.awsCostAnalysis + 'aggregate', new RequestData(filterdata));
  }

  /** 儀表板excel下載 */
  getdashboardFilePath(dashboardname: string, data: any): Observable<ResponseData> {
    return this.api.postDownload(this.gateway.awsCostAnalysis + 'costExplorer/exportExcel?serviceName=' + dashboardname, new RequestData(data));
  }

  /** 取得未出帳資料 */
  getNotBilled(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.awsCostAnalysis + 'costExplorer/AWS/dailyUsage', new RequestData(filter));
  }

  /** 過去24個月已出帳金額 */
  getPastBills(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.dashboard + 'getBilledBills', new RequestData(filter));
  }

}
