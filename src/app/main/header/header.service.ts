// import { Role } from '././core/models/authorization';
// import { Role } from './../../core/models/authorization';
import { Injectable } from '@angular/core';
import { RoleData } from 'src/app/core/models/authorization';
import { RequestData } from 'src/app/core/models/request-data';
import { ApiService } from 'src/app/core/services/api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  gateway: any;

  constructor(
    private api: ApiService
  ) {
    this.gateway = environment['gateway']
  }

  /** 切換角色資訊 */
  // API PUT: /user-v1/user/changeRole
  changeRole(roleid: string) {
    return this.api.put(this.gateway.user + 'user/changeRole' , new RequestData(roleid));
  }

}
