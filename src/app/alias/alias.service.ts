import { Injectable } from '@angular/core';
import { DataService } from '../core/services/data.service';
import { Observable } from 'rxjs';
import { AlertService } from 'src/app/core/services/alert.service';
import { ApiService } from '../core/services/api.service';
import { ResponseData } from '../core/models/response-data';
import { environment } from 'src/environments/environment';
import { RequestData } from '../core/models/request-data';
import { Filter } from '../core/models/filter';

@Injectable({
  providedIn: 'root'
})
export class AliasService {
  gateway: any;

  constructor(
    private api: ApiService,
    private alert: AlertService,
    private data: DataService,
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

  /**更新別名 */
  updateAlias(data: any): Observable<ResponseData> {
    return this.api.post(this.gateway.user + 'alias', new RequestData(data));
  }

}
