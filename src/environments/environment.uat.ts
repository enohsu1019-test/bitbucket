import { DynamicEnvironment } from './dynamic-environment';

class Environment extends DynamicEnvironment {
  production = false;

  constructor() {
    super();
  }

  /** 此部署用的環境設定會使用 k8s 的設定 */
  override override() {
    // this["apiUrl"] = 'https://cmp-uat-svc.sysage.com.tw';
    // this["loginUrl"] = 'https://cmp-uat.sysage.com.tw/login';
    // this["oauthUrl"] = 'https://cmp-uat-svc.sysage.com.tw/token';
    // this["oauthSignOutUrl"] = 'https://cmp-uat-svc.sysage.com.tw/sign-out';
  }
}

export const environment = new Environment();

// uat k8s setting
// "apiUrl": "https://cmp-uat-svc.sysage.com.tw",
// "loginUrl": "https://cmp-uat.sysage.com.tw/login",
// "oauthUrl": "https://cmp-uat-svc.sysage.com.tw/token",
// "oauthSignOutUrl": "https://cmp-uat-svc.sysage.com.tw/sign-out",
