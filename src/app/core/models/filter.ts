export enum Comparator {
    equal = 'EQ',
    greater = 'GT',
    greaterEqual = 'GTE',
    lesser = 'LT',
    lesserEqual = 'LTE',
    not = 'NOT',
    in = 'IN',
    like = 'LIKE',
    null = 'NULL',
    notNull = 'NOTNULL',
    notIn = "NIN",

    and = 'AND',
    or = 'OR',
    between = 'WITHIN',
    notBetween = 'WITHOUT',
    all = 'ALL',
}

export enum Sort {
  asc = 'ASC',
  desc = 'DESC'
}

export class Filter {
  and: {
    field: string;
    comparator: Comparator;
    value: any;
  }[] = [];
  sort: {
    [key: string]: Sort;
  } = {};
  pageSize = 10;
  pageIndex = 1;
  fields: string[] = [];

  // 建立 instance 時，可初始化「部分」property（不需要完整的 filter 內容）
  // [ref] https://stackoverflow.com/a/37682352/1702774
  constructor(init?: Partial<Filter>) {
    Object.assign(this, init);
  }
}
