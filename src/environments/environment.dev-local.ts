import { DynamicEnvironment } from './dynamic-environment';

class Environment extends DynamicEnvironment {
  production = false;

  constructor() {
    super();
  }

  /** 此部署用的環境設定會使用 k8s 的設定 */
  override override() {
    this["apiUrl"] = 'https://cmp-dev-svc.sysage.tzu';
    this["loginUrl"] = 'https://localhost:4200/login';
    this["oauthUrl"] = 'https://cmp-dev-svc.sysage.tzu/token';
    this["oauthMetaUrl"] = 'https://cmp-dev-svc.sysage.tzu/token/meta-match';
    this["oauthSignOutUrl"] = 'https://cmp-dev-svc.sysage.tzu/sign-out';
    this["oauthMetaSignOutUrl"] = 'https://cmp-dev-svc.sysage.tzu/sign-out/meta-match';
  }

}

export const environment = new Environment();

// dev k8s setting
// "apiUrl": "https://cmp-dev.sysage.com.tw",
// "loginUrl": "https://cmp.lb.sysage.tzu/login",
// "oauthUrl": "https://cmp-dev.sysage.com.tw/token",
// "oauthSignOutUrl": "https://cmp-dev.sysage.com.tw/sign-out",
