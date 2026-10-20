import { DynamicEnvironment } from "./dynamic-environment";

class Environment extends DynamicEnvironment {
  production = true;
}

export const environment = new Environment();