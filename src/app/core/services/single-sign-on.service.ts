import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class SingleSignOnService {
  singlesignon!: {
    [urlTypeKey: string]: {
      urlTemplate: string,
      params: {
        [paramKey: string]: string | string[]
      }
    }
  };

  constructor() {
    this.singlesignon = environment['singleSignOn'];
  }

  getUrl(urlTypeKey: string) {
    let ssoUrl = this.singlesignon[urlTypeKey].urlTemplate;
    // const ssoParams = _.cloneDeep(this.singlesignon[urlTypeKey].params);
    // for (const paramKey in ssoParams) {
    //   if (ssoParams.hasOwnProperty(paramKey)) {
    //     const param = ssoParams[paramKey];
    //     let result = '';
    //     if (Array.isArray(param)) {
    //       if (param.length === 2 && param[0] === 'loginData') {
    //         result = this.data.loginData[param[1]];
    //       }
    //     } else {
    //       result = param;
    //     }
    //     if (result) {
    //       result = result.replace('{{origin}}', window.location.origin);
    //       result = result.replace('{{uuid}}', uuid());
    //       ssoUrl = ssoUrl.replace('{{' + paramKey + '}}', encodeURIComponent(result));
    //     }
    //   }
    // }
    return ssoUrl;
  }
}
