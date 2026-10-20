import { DynamicEnvironment } from "./dynamic-environment";

class Environment extends DynamicEnvironment {
  production = false;

  constructor() {
    super();
  }

  override override() {
    this["loginUrl"] = 'https://localhost:4200/login';
  }
}



export const environment = new Environment();
