import { Injectable } from '@angular/core';
import { ApiService } from '../core/services/api.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ResponseData } from '../core/models/response-data';
import { RequestData } from '../core/models/request-data';
import { Filter } from '../core/models/filter';
@Injectable({
  providedIn: 'root'
})
export class PostingService {
  gateway: any;
  brand = 'brand-v1/';
  order = 'order-v1/';
  customer = 'customer-v1/';
  invoice = 'invoice-v1';
  constructor(
    private api: ApiService
  ) {
    this.gateway = environment['gateway'];
    // this.gateway = 'brand-v1/';

  }

  /**--------------------brand------------------  */
  /** 搜尋品牌 */
  getBrandList(filterData: any): Observable<ResponseData> {
    return this.api.post(this.gateway.brand + 'brands', new RequestData(filterData));
  }

  /**--------------------postion------------------  */
  /** 搜尋過帳入庫資料 */
  postingList(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.invoice + 'posting/list', new RequestData(filter));
  }

  /** 更新單筆過帳入庫項目 */
  putPosting(data: any): Observable<ResponseData> {
    return this.api.put(this.gateway.invoice + 'posting/update', new RequestData(data));
  }

  /** posting excel下載 */
  downLoadPostingExcel(data: any): Observable<ResponseData> {
    return this.api.postDownload(this.gateway.invoice + 'posting/export', new RequestData(data));
  }

  /** 搜尋單一品牌 */
  postfileRecordList(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.invoice + 'posting/log', new RequestData(filter));
  }

  /** fileRecord excel下載 */
  downLoadfileRecordExcel(fileName: string){
    return this.api.getDownload(environment['apiUrl'] + '/' + environment['gateway'].invoice + `posting/log/${fileName}/export`);

  }
}
