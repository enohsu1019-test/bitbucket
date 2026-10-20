export class DynamicEnvironment {
  [key: string]: any;

  setEnvironment(configMap: DynamicEnvironment) {
    for (const key in configMap) {
      if (Object.prototype.hasOwnProperty.call(configMap, key)) {
        this[key] = configMap[key];
      }
    }
  }

  override() { }
}
