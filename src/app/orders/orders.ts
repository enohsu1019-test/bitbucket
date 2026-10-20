import { Comparator } from "../core/models/filter";

export class Brands {
  createDate = '';
  brandId = '';
  modifyDate = '';
  status = '';
  serviceName = '';
  name = '';
}

export class BrandDatas {
  brandId = '';
  name = '';
  status = '';
  createDate = '';
  modifyDate = '';
  payerId: string[] = [];
  serviceName = '';

}

export class Solution {
  brandId = '';
  createDate = '';
  modifyDate = '';
  name = '';
  solutionId = '';
  status = '';
}

export enum OrderStatus {
  not = 'NOT_ACTIVATED',
  using = 'USING',
  suspension = 'CONTRACT_SUSPENSION',
  expired = 'CONTRACT_EXPIRED',
  void = 'VOID',
  poc = 'POC',

}

export class Order {
  approvalStatus = '';
  orderId = '';
  orderStatus = '';
  subOrderId = '';
  updateTime = '';
}

export class OrderHeader {
  //商機編號
  quotationId = ''
  // 客戶編號
  erpCustomerNumber = '';
  // 夥伴ＩＤ
  partnerId = '';
  billingAddress = '';
  billingContact = {
    chineseName: '',
    englishName: '',
    id: '',
    status: 'DRAFT',
    email: ''
  };
  customer = {
    id: '',
    name: '',
    serialNumber: ''
  };
  customerAddress = '';
  customerContact = {
    chineseName: '',
    englishName: '',
    id: '',
    status: ''
  };
  endUser?: {
    id: string,
    name: string,
    serialNumber: string
  };
  id = '';
  status = '';
  salesModel = 'DIRECT_SELLING';
  // 312編號
  orderErpNumber = '';
}

export class Customer{
  cloudRelation: {cloudId: string, brandId: string, payerId: string}[] = [];
  customerId = '';
  customerName = {
    fullCh: '',
    fullEn: '',
    nickCh: '',
    nickEn: '',
  }
  identityType: string[] = [];
  industryType = '';
  location: {address: string, faxNo: string,locationId: string,modifiedUser: string,modifiedUserName: string, status: number, telNo: string}[] = [];
  serialNumber = '';
  status = 1;
}

export class ContactPerson {
  chineseName = '';
  contactId = '';
  createUser = '';
  customerId = '';
  email = '';
  englishName = '';
  mobile = '';
  status = 1;
  phone = {
    ext: '',
    tel: '',
  }
}


export class OrderSolution{
  nameEditStatus = false;
  name = '方案名稱'            //名稱
  id =''                     //子單編號
  quotationId = ''           //商機編號
  solutionName = '';         //方案名稱
  payerId = '';              //payerId
  erpNumber = '';            //erp編號
  sales = {
    email: '',               //業務電子郵件
    employeeId: '',          //employeeId
    id: '',                  //id
    name: '',                //業務名稱
  }
  showSalesName = ''
  status = 'NOT_ACTIVATED'  //訂單狀態
  billingContactAddress = '' //地址
  orderCreator = ''          //建單者
  cloudId =''                //cloudId
  solutionId = ''            //方案id
  startDate = ''             //起始日期
  endDate = '2099-12-31'     //結束日期
  //出帳幣別
  exchangeRateType ='CUSTOMS_EARLY_OF_MONTH';
  exchangeRate = 1           //匯率
  paymentDate = 1            //付費日
  timeInterval = 1           //付費間隔
  advancePayments: {amount: string,remittanceDate: string}[] =[]; //預付帳款
  billingContactEmail = ''; //帳單合同電子郵件
  brand = {                  //品牌
    id: '',
    name: '',
    serviceName: '',
  };
  creator = {                //建單者
    email: '',
    employeeId: '',
    id: '',
    name: ''
  };
  contractIds: string[] = [] ;         //合同ＩＤ
  modifyUser = {                    //更新者
    email: '',
    employeeId: '',
    id: '',
    name: ''
  };
  // 每個品牌共同欄位給後端使用
  originalInfo: { [key: string]: any } = {};
  products: ProductList[] = [];
  // 產品列表狀態必填
  productsRequired = false;
  // 自定義欄位必填狀態
  customFieldRequired = false;
  currencyType = 'TWD';      //出帳幣別
  solutionData: any = {}
  deleteProductIds: string[] = [] //刪除productId
  requiredStatus = false;   //方案必填狀態
  initial = true;          //是否初始資料
  // 原廠合約狀態
  originalStatus = false;
}

export class SaveTranceNote {
  type: 'ADD'|'DELETE'|'UPDATE' = 'UPDATE';
  field = ''; // ADD, UPDATE
  orderDetailId?: string; //子單Id
  message = ''; //訊息，前端決定
  oldData: any; // UPDATE
  newData: any; // ADD, UPDATE
}

export class SaveOrderHeader{
  customer = {
    id: '',
    name: '',
    serialNumber: ''
  };
  endUser?: {
    id: string,
    name: string,
    serialNumber: string
  };
  customerAddress = '';
  customerContactId = '';
  billingAddress = '';
  billingContactId = '';
  salesModel = '';
  status = '';
  //商機編號
  quotationId = ''
  // 312編號
  orderErpNumber = '';
  // ERP編戶邊號
  tranceNote: SaveTranceNote[] = [];
  // 客戶編號
  erpCustomerNumber = '';
  // 夥伴ＩＤ
  partnerId = '';
}

export class SaveOrderBody{
  id = '';
  brandId = '';
  payerId = '';
  quotationId = '';
  cloudId = '';
  currencyType = '';
  erpNumber = '';
  solutionId = '';
  solutionData: any = {
    schema: {},
    data: {}
  };
  contractIds: string[] = [];
  advancePayments: {amount: string,remittanceDate: string}[] = [];
  products: ProductSave[] = [];
  startDate = '';
  endDate = '';
  exchangeRateType = '';
  exchangeRate = 0;
  paymentDate = 0;
  timeInterval = 0;
  salesId = '';
  billingContactEmail = '';
  status = '';
  name = '';
  deleteProductIds: string[] = []; //刪除productId
  tranceNote: SaveTranceNote[] = [];
  originalInfo: { [key: string]: any } = {};
  // 原廠合約狀態
  originalStatus = false;
}

export class SaveOrder{
  header = new SaveOrderHeader();
  body: SaveOrderBody[] = [];
}
export class PayerID{
  customerId = '';
  nickName = '';
  payerId = '';
  identityType = '';
}

export class ProductList{
  //料號
  productSku = '';
  //名稱
  name = '';
  //計價單位
  unit = '';
  //計價週期
  leaseMode = 1;
  //計價週期名稱
  leaseModeName = '';
  //時間
  times = 1;
  //數量
  quantity = 1;
  //售價計算方式
  calculateMethod = '';
  //乘數
  multiplier = 1;
  //成本幣別
  originalCurrency = 'TWD';
  //下單成本
  originalPrice = 0 ;
  //原廠定價
  listPrice = 1;
  //售價
  sellingPrice = 0;
  //啟用日
  startDate = '';
  //結束日期
  endDate = '';
  //試算金額
  total = 0;
  //erp料號
  erpNumber = '';
  //最低消費
  minimum = 0;
  //原廠料號
  originalSku = '';
  //原廠料號名稱
  originalSkuName = ''
  //費用計費方式
  billingMethod ='';
  //類型
  category = '';
  //productId
  id = '';
  twdList ='';
  extra = {};
  initial = true;;
  minDate: Date| null = null;
  // 呈現名稱
  showName = '';
  // 用量上限級距
  tierEnd = 0;
  // 單位描述
  unitDescription = '';
  // 產品狀態
  status = 'DRAFT';
  // 台幣定價
  twdListPrice = 0;
  // 是否為雲市集商品
  isCloudMarketProduct = false;
  // 內涵
  connotation = false;
  // 訂閱ID
  subscriptionId = '';

  // 動態欄位相關
  // 動態欄位
  attribute = {};
}

export class ProductSave{
  //料號
  productSku = '';
   //名稱
  name = '';
  //計價單位
  unit = '';
  //計價週期
  leaseMode = 1;
  //計價週期名稱
  leaseModeName = '';
  //時間
  times = 1;
  //數量
  quantity = 1;
  //售價計算方式
  calculateMethod = '';
  //乘數
  multiplier = 1;
  //成本幣別
  originalCurrency = 'TWD';
  //下單成本
  originalPrice = 0 ;
  //原廠定價
  listPrice = 0;
  //售價
  sellingPrice = 0;
  //啟用日
  startDate = '';
  //結束日期
  endDate = '';
  //試算金額
  total = 0;
  //erp料號
  erpNumber = '';
  //最低消費
  minimum = 0;
  //原廠料號
  originalSku = '';
  //費用計費方式
  billingMethod = '';
  //類型
  category = '';
  //productId
  id = '';
  //刪除productId
  deleteProductIds: string[] = []
  twdList = '';
  extra = {};
  // 呈現名稱
  showName = '';
  // 用量上限級距
  tierEnd = 0;
  // 單位描述
  unitDescription = '';
  // 產品狀態
  status = 'DRAFT';
  // 台幣定價
  twdListPrice = 0;
  // 內涵
  connotation = false;
  // 訂閱ID
  subscriptionId = '';

}
export class ProductSaveData{
  deleteProductIds: string[] = [] //刪除productId;
  productSave: ProductSave[] = [];
}

/** intable 設定檔 */
export class PageConfig {
  boundaryLinks = true;
  totalItems = 0;
  itemsPerPage = 10;
  currentPage = 1;
  maxSize = 10;
}

/** 微軟申請網域 */
export class RegisterData {
  firstName = '';
  // middleName = '';
  lastName = '';
  email = '';
  phoneNumber = '';
  // contract = '';
  organizationRegistrationNumber = '';
  companyName = '';
  domain = '';
  addressLine1 = '';
  addressLine2 = '';
  country = '';
  city = '';
  state = '';
  // status = '';
  postalCode = '';
  mpnId = '';
}

/** partnerId */
export class PartnerIdData{
  partnerId = '';
  name ={
    fullCh: '',
    nickCh: '',
    fullEn: '',
    nickEn: '',
  }
  customerId = '';
}

export class CreateMicrosoftProduct{
  cloudId = '';
  productList: {originalSku: string, quantity: number, mpnId: string}[] = [];
}

/** 商品屬性filter列表 */
export class FilterAttributesList {
  // 基本欄位
  basic: CommodityAttributes[] = [];
  // 價格欄位
  price: CommodityAttributes[] = [];
  // 動態欄位
  dynamic: CommodityAttributes[] = [];
}

/** 商品屬性 */
export class CommodityAttributes {
  // 欄位名稱
  name = '';
  // 內部變數
  internalVariableName = '';
  // 單/多選選項
  options: OptionAttribute[] = [];
  // 欄位型態
  type = '';
}

/** 單/多選選項 */
export class OptionAttribute {
  // index值
  index = 0;
  // 欄位名稱
  name = '';
  // 內部變數
  internalVariableName = '';
}

/** 使用者選擇條件 */
/* export class FilterAttribute {
  // 欄位名稱
  name = '';
  // 內部變數
  internalVariableName = '';
  // 單/多選選項
  options: OptionAttribute[] = [];
  // 單/多選條件
  oprator: string | string[] = '';
  // 欄位型態
  type = '';
  // 欄位型態選擇
  condition = '';
  // 輸入值
  value: string | number | boolean = '';
  // 是否顯示
  show = false;
} */

/** 使用者選擇條件 */
export class FilterAttribute {
  // 欄位名稱
  name = '';
  // 內部變數
  internalVariableName = '';
  // 單/多選選項
  options: OptionAttribute[] = [];
  // 欄位型態
  type = '';
  // 條件
  oprator = '';
  // 輸入值
  value: string | number | boolean | (string | null | string[])[] = '';
  // 是否顯示
  show = false;
}

 /**
  * filter 的操作選項 (根據不同屬性型別)
  */
 export const FilterOptions = {
   STRING: ['isEqualTo', 'isNotEqualTo', 'isEqualToAnyOf', /* 'isNotEqualToAnyOf', 'containsAnyOf', */'isKnown', 'isUnknown'],
   NUMBER: ['isEqualTo', 'isNotEqualTo', 'isLessThan', 'isLessThanOrEqualTo', 'isGreaterThan', 'isGreaterThanOrEqualTo', /* 'isEqualToAnyOf', 'isNotEqualToAnyOf', */ 'isKnown', 'isUnknown'],
   DATE: ['isEqualTo', 'isNotEqualTo', 'isBefore', 'isAfter', /* 'isLessThanDayAgo', 'isLessThanDayFromNow', 'isMoreThanDayAgo', 'isMoreThanDayFromNow', 'isBeforeProperty', 'isAfterProperty', 'isBetween', 'isNotBetween', */ 'isKnown', 'isUnknown'],
   // enum: ['isAnyOf', 'isNoneAnyOf', 'containsAllOf', 'doesntContainAllOf'],
  //  SINGLE_CHOICE: ['isAnyOf', 'isNoneAnyOf', 'containsAllOf', 'isKnown', 'isUnknown'], // 'doesntContainAllOf'],
  //  MULTIPLE_CHOICE: ['isAnyOf', 'isNoneAnyOf', 'containsAllOf', 'isKnown', 'isUnknown'], // 'doesntContainAllOf'],

   // FORMULA --> 根據 formula.type === 'NUMBER' or 'DATE' 判斷用哪一種 option
  //  OPTION: ['isEqualTo', 'isNotEqualTo', 'isKnown', 'isUnknown'],

  //  TIME: ['isEqualTo', 'isNotEqualTo', 'isBefore', 'isAfter', /* 'isBeforeProperty', 'isAfterProperty', */ 'isBetween', 'isNotBetween', 'isKnown', 'isUnknown'],
  //  ARRAY: ['isAnyOf', 'isNoneAnyOf', 'containsAllOf', 'isKnown', 'isUnknown'],

   // 前端使用的 operation，用來找出聯絡人是否為某聯絡人清單的成員
  //  CONTACTLIST: ['isMemberOfList', 'isNotMemberOfList'],

   // 前端使用的 operation，用來找出具備指定標籤的聯絡人
  //  TAGS: ['isAnyOf', 'isNoneAnyOf', 'containsAllOf'],

  // BOOLEAN: ['isKnown', 'isUnknown'],
 };
