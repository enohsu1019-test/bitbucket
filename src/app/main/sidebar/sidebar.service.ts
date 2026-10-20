import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ResponseData } from '../../core/models/response-data';
import { environment } from 'src/environments/environment';
import { DataService } from '../../core/services/data.service';
import { tap } from 'rxjs/operators';
import _ from 'lodash';
@Injectable({
  providedIn: 'root'
})
export class SidebarService {
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


  /** 取得menu */
  getMenu(): Observable<ResponseData> {
    return this.api.get(this.gateway.user + 'user/menus');
  }
}
