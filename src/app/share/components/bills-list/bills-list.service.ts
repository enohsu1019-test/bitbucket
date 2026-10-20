import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Filter } from 'src/app/core/models/filter';
import { RequestData } from 'src/app/core/models/request-data';
import { ResponseData } from 'src/app/core/models/response-data';
import { ApiService } from 'src/app/core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class BillsListService {
  public data = new BehaviorSubject<string>('');
  constructor(private api: ApiService) { }


  ////////////////////////////////////
  //                                //
  //             帳單                //
  //                                //
  ////////////////////////////////////

  /** 搜尋帳單列表 */
  getBillList(filter: Filter): Observable<ResponseData> {
    return this.api.post(environment['gateway'].order + 'orders', new RequestData(filter));
  }


  ////////////////////////////////////
  //                                //
  //             原廠                //
  //                                //
  ////////////////////////////////////

  /** 搜尋品牌 */
  getBrandList(filter: Filter) {
    return this.api.post(environment['gateway'].brand + 'brands', new RequestData(filter));
  }

}
