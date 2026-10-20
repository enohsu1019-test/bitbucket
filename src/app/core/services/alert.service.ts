import { Injectable } from '@angular/core';

export interface Alert {
  'type': string;
  'msg': string;
  'timeout': number;
  'fa'?: string;  // font-awesome icon
  'close'?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  alerts: Alert[] = [];
  log: string;

  constructor() {
    this.alerts = [];
    this.log = '';
  }
  /** 把錯誤訊息 push到 array */
  addAlert(alert: Alert) {
    // console.log('addAlert: ');
    // console.dir(alert);
    this.alerts.push(alert);
  }
  /** 錯誤alert */
  errorAlert(err: any, delay?: number, fa?: string, done?: () => {}) {
    if (err.code && err.code == "401") {
      this.return();
    }

    const msg = ((err.code) ? '[' + err.code + '] ' : '') +
      ((err.message) ? err.message : err) +
      ((err.errors) ? ' ' + JSON.stringify(err.errors) : '') +
      ((err.warnings) ? ' ' + JSON.stringify(err.warnings) : '') +
      ((err.post) ? '  |  POST request: ' + JSON.stringify(err.post) : '');
    // console.error('errorAlert: ' + msg);

    this.addAlert({
      type: 'danger',
      timeout: (!delay && delay !== 0) ? 9000 : delay,
      msg: msg,
      fa: fa,
      close: done ? done : this.return,
    });
  }
  /** 成功alert */
  successAlert(msg: string, delay?: number, fa?: string, done?: () => {}) {

    this.addAlert({
      type: 'success',
      timeout: (!delay && delay !== 0) ? 3000 : delay,
      msg: msg,
      fa: fa,
      close: done ? done : this.return,
    });
  }
  /** 警告alert */
  warningAlert(msg: string, delay?: number, fa?: string, done?: () => {}) {

    console.log('[utils] warningAlert', msg, delay, fa);

    this.addAlert({
      type: 'warning',
      timeout: (!delay && delay !== 0) ? 3000 : delay,
      msg: msg,
      fa: fa,
      close: done ? done : this.return,
    });
  }

  return() {
    return;
  }

}
