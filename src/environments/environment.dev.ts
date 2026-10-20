import { DynamicEnvironment } from './dynamic-environment';

class Environment extends DynamicEnvironment {
  production = false;

  constructor() {
    super();
  }

  /** 此部署用的環境設定會使用 k8s 的設定 */
  override override() {
    // this["apiUrl"] = 'https://cmp-dev.sysage.com.tw';
    // this["loginUrl"] = 'https://cmp.lb.sysage.tzu/login';
    // this["oauthUrl"] = 'https://cmp-dev.sysage.com.tw/token';
    // this["oauthSignOutUrl"] = 'https://cmp-dev.sysage.com.tw/sign-out';
  }
}

export const environment = new Environment();

// dev k8s setting
// "apiUrl": "https://cmp-dev.sysage.com.tw",
// "loginUrl": "https://cmp.lb.sysage.tzu/login",
// "oauthUrl": "https://cmp-dev.sysage.com.tw/token",
// "oauthSignOutUrl": "https://cmp-dev.sysage.com.tw/sign-out",
