import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OsBrowserService {

  constructor() { }

  isShowMessage() {
    const platform = navigator.platform;
    const osKeys = ['Win32', 'MacIntel'];
    let isOs = false;
    osKeys.forEach(osKey => {
      if (platform === osKey) {
        isOs = true;
      }
    });
    // const browserKeys = ['MSIE', 'Firefox', 'Safari', 'Chrome', 'Opera'];
    const userAgent = navigator.userAgent;
    const browserKeys = ['Chrome', 'Safari'];
    let isBrowser = false;
    browserKeys.forEach(browserKey => {
      if (userAgent.indexOf(browserKey) > -1) {
        isBrowser = true;
      }
    });
    return !isOs || !isBrowser;
  }
}
