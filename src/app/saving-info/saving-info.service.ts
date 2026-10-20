import { Injectable } from '@angular/core';
import { DataService } from '../core/services/data.service';
import { ApiService } from '../core/services/api.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ResponseData } from '../core/models/response-data';
import { Filter } from '../core/models/filter';
import { RequestData } from '../core/models/request-data';

@Injectable({
  providedIn: 'root'
})
export class SavingInfoService {
  gateway: any;

  constructor(private api: ApiService,
              private data: DataService,)
  {
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

  // AWS filter資料
  postAWSFilter(data: any): Observable<ResponseData> {
    return this.api.post(this.gateway.awsCostAnalysis + 'costExplorer/AWS/filter', new RequestData(data));
  }

  /**POST Recommendation */
  postRecommendation( data: any): Observable<ResponseData> {
    return this.api.post(this.gateway.awsCostAnalysis + 'recommendation/AWS' , new RequestData(data));
  }

  /** Recommendation excel下載 */
  postRecommendationExcel(data: any): Observable<ResponseData> {
    return this.api.postDownload(this.gateway.awsCostAnalysis + 'recommendation/AWS/export', new RequestData(data));
  }

}
