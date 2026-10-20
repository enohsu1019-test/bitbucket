import { Filter } from "../core/models/filter";

/** cloud id與payer id關聯 */
export class AliasData {
  /** id */
  id = '';
  /** cloud別名 */
  name = '';
  /** payer別名 */
  nickName = '';
  /** payer id */
  payerId = '';
  /** cloud id */
  cloudId = '';
}

/** 訂單資料 */
export class Order {
  /** 訂單編號 */
  orderId = '';
  /** 子單id */
  subOrderId = '';
  /** 312編號 */
  orderErpNumber = '';
  /** 訂單類型 */
  orderStatus = '';
  /** 方案 */
  solution = '';
  /** 訂單狀態 */
  approvalStatus = '';
  /** 品牌 */
  brand = '';
  /** 公司 */
  customer = {
    /** id */
    id: '',
    /** 名稱 */
    name: '',
    /** 統一編號 */
    serialNumber: ''
  };
  /** 合約開始日期 */
  startDate = '';
  /** 合約結束日期 */
  endDate = '';
  /** 最終使用者 */
  endUser = {
    /** id */
    id: '',
    /** 名稱 */
    name: '',
    /** 統一編號 */
    serialNumber: ''
  };
  /** 更新時間 */
  updateTime = '';
}

export class Address {
  postalCode = '';
  address = '';
  area = '';
  city = '';
  country = '';
  state = '';
  status?: string = '';
}

export class Enduser {
  customerId = '';
  names: {
    [key: string]: any;
  } = {};
  addresses: {
    postalCode: string;
    address: string;
  }[] = [];
  taxNumber = '';
  principal = '';
  updateDate = new Date();
}

export class CustomerLite {
  id = '';
  names: {
    [key: string]: string;
  } = {};
  taxNumber = '';
  addresses: Address[] = [];
  contacts: ContactLite[] = [];
  updateDate = new Date();
}

export class ContactLite {
  id = '';
  name = '';
  tel = '';
}

export class Collector {
  name = '';
  route ='';
  filter: Filter = new Filter;
}

export class ChartTemplate {
  id?: string = '';
  name = '';
  type = 'line';
  collectors: Collector[] = [];
  transfer = '';
  extend: {[key: string]: string} = {};
}

export class AmountTable {
  dataType: string[] = [];
  name = '';
  serviceList: string[] = [];
  tag: {[key: string]: Tag} = {};
  usages: Usages[] = [];
}

export class Tag {
  application: string[] = [];
  awsCreatedBy: string[] = [];
  createBy: string[] = [];
  createdBy: string[] = [];
  environment: string[] = [];
  name: string[] = [];
  project: string[] = [];
  stack: string[] = [];
}

export class Usages {
  accountId = '';
  data = [{
    BlendedCost: 0,
    date: '',
    pricePerUnitList: [{
      expense: 0,
      quantity: '',
      title: ''
    }],
    quantity: 0
  }]
  month = '';
  name = '';
  year = '';
}
