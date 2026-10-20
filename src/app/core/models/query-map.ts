export class QueryMap {
  params: {
    key: string,
    value: string | string[]
  }[] = [];

  paramArrayToString(array: string[]): string {
    let paramString = '';
    array.forEach((item, index) => {
      if (index === 0) {
        paramString = item;
      } else {
        paramString = `${paramString},${item}`;
      }
    });
    return paramString;
  }

  toString(): string {
    if (this.params.length === 0) {
      return '';
    }

    let queryText = '';
    this.params.forEach((param, index) => {
      const paramValue = Array.isArray(param.value) ? this.paramArrayToString(param.value) : param.value;
      queryText = `${queryText}${index === 0 ? '?' : '&'}${param.key}=${paramValue}`;
    });
    return queryText;
  }
}
