import { DynamicEnvironment } from './dynamic-environment';

class Environment extends DynamicEnvironment {
  production = false;

  constructor() {
    super();
  }

  override override() {
    this["apiUrl"] = 'https://cmp-uat-svc.metaage.com.tw';
    this["loginUrl"] = 'https://localhost:4200/login';
    this["oauthUrl"] = 'https://cmp-uat-svc.metaage.com.tw/token';
    this["oauthSignOutUrl"] = 'https://cmp-uat-svc.metaage.com.tw/sign-out';
  }
}

export const environment = new Environment();
