import { CloudIdsInfo } from "./authorization";

export class Commodity {
  productId: string = '';        // 產品 ID
  productName: string = '';      // 產品名稱
  customerId?: string = '';      // 使用者 customerId
  startDate?: string = '';       // 上架日期
  endDate?: string = '';         // 下架日期
  productSku?: string = '';      // CMP料號
  originalSku?: string = '';     // 原廠料號
  specification?: string = '';   // 品名/規格
  sellingPrice?: number = 0;     // 販售價格
  originalPrice?: number = 0;    // 原廠價格
  listPrice?: number = 0;        // 原廠定價
  twdListPrice?: number = 0;     // 台幣定價
  currency?: string = '';        // 出帳幣別
  inventory?: string = '';       // 庫存
  inventoryQty?: number = 0;     // 庫存數量
  category?: string = '';        // 計價類別 (原為 商品類別)
  brandCategory?: string[] = []; // 商品分類
  leaseMode?: number = 0;       // 租約方式
  unit?: string = '';            // 計價單位
  calculateMethod?: string = ''; // 計算方式
  billingMethod?: string = '';   // 計費方式
  solutionId?: string = '';      // 方案
  erpSku?: string = '';          // ERP 料號
  brandId?: string = '';         // 原廠品牌 (only admin)
  tagList?: string[] = [];       // 商品標籤
  description?: string = '';     // 商品描述
  pageSetting?: {                // 商品頁面設定
    content: string;             // html content
    editContent: string;         // edit content for editor
  };
  // rsSalesTargets?: {            // 銷售對象
  //   customer: SalesTarget[];    // 客戶 ID 及名稱
  //   identityType: SalesTargetIdentity;  // 身份：NONE(無)、DEALER(經銷商)、ENDUSER(最終使用者)
  // };
  salesTargets?: SalesTarget;
  // {              // 銷售對象
  //   customerId: string[];       // 客戶 ID
  //   identityType: SalesTargetIdentity;  // 身份：NONE(無)、DEALER(經銷商)、ENDUSER(最終使用者)
  // };
  bannerImage?: string = '';     // Banner 圖片
  defaultImage?: string = '';    // 產品 圖片

  quantity?: number = 0;         // 購買數量
}

// export class SalesTarget {
//   customerId: string = '';
//   customerName?: CustomerName;
// }

export class SalesTarget {
  dealer: string[] = [];         // 經銷商
  endUser: string[] = [];        // 非經銷商
}

export class CustomerName {
  fullCh: string = '';
  nickCh: string = '';
  fullEn: string = '';
  nickEn: string = '';
  allName?: string = '';
}

export class CommoditySpec {
  id: string = '';
  productDescription: string = '';
  productType: string = '';
  productIdentifier: string = '';
  usdUnitListPrice: number = 0;
  unit: string = '';
  quantity: number = 0;
  rate: number = 0;
  manu: string[] = [];
}

export class DropDownItem {
  id: string = '';
  name: string = '';
  identityType: SalesTargetIdentity[] = [];
}

export class BrandMapping {
  id: string = '';
  cmpBrandId: string = '';
  cmpCustomerId: string = '';
  crmBrandId: string = '';
  crmCustomerId: string = '';
}

export class ProductImage {
  id: string = '';
  filename: string = '';
  path: string = '';
  createDate: string = '';
  modifyDate: string = '';
  isDirectory: boolean = false;
  directory: boolean = false;
}

export class CommodityCart {
  productId: string = '';        // 產品 ID
  productName?: string = '';     // 產品名稱
  productSku?: string = '';      // CMP料號
  startDate?: string | Date;     // 上架日期
  sellingPrice?: number = 0;     // 販售價格
  purchaseQuantity?: number = 0; // 數量
  maxQuantity?: number = 0;      // 剩餘數量
  paymentMethod?: PaymentMethod; // 付款方式
  timeUnit?: number = 1;         // 購買時間單位
  category?: string;             // 購買類型(訂閱制/用量型)
  leaseMode?: number;            // 計費週期
  unit?: string;                 // 計價單位

  brandId?: string;
  solutionId?: string;
  solutionName?: string;
  currency?: string;
  commonField?= [];
  specialField?: {}[] = [];
  customerId?: string;
}

export class BuyerInfo {
  // 客戶(公司名稱)
  // 客戶地址
  // 最終使用者
  // 聯絡人
  // 帳單聯絡人
  // 帳單聯絡人EMAIL
  // 指定業務+分機
  // Cloud ID
  // (Cisco 專用) DID
  // (Cisco 專用) 開通E-MAIL聯絡人
}

export class CartInfo {
  roleId: string = '';
  cartList?: CommodityCart[];
  buyerInfo?: BuyerInfo;
}

export class PayerID {
  customerId = '';
  nickName = '';
  payerId = '';
  identityType = '';
}

export class BrandDatas {
  brandId = '';
  name = '';
  status = '';
  createDate = '';
  modifyDate = '';
  payers: PayerID[] = [];
  serviceName = '';
}

export class SolutionData {
  solutionId = '';
  brandId = '';
  name = '';
  status = '';
  createDate = '';
  modifyDate = '';
}

/** 商品設定欄位 */
export class CommodityAttribute {
  id = '';                          // id
  brandId = '';                     // 品牌is
  name = '';                        // 欄位名稱
  internalVariableName = '';        // 內部變數
  description = '';                 // 欄位描述
  type!: CommodityAttributeType;    // 欄位型態
  options: AttributeOptions[] =[];  // 欄位選項
  required = false;                 // 是否必填
  hidden = false;                   // 是否隱藏
  groupType = '';                   // 欄位屬於 1.basic => 基本欄位 2.price => 價格欄位 3.dynamic => 自訂欄位
  createdUser = '';                 // 建立者
  modifiedUser = '';                // 合併者
  createdTime = '';                 // 建立時間
  modifiedTime = '';                // 合併時間
  attribute: any = {}               // 自訂欄位值

  value: string | number | boolean | string[] = '';  // 欄位值
}

/** 商品屬性選項 */
export class AttributeOptions {
  internalVariableName = '';  // 內部變數
  name = '';                  // 欄位名稱
  index = 0;                  // index值
}

/** 商品屬性 - 欄位類型 */
export enum CommodityAttributeType {
  string = 'STRING',          // 文字
  number = 'NUMBER',          // 數字
  single = 'SINGLE_CHOICE',   // 單選
  multiple = 'MULTIPLE_CHOICE', // 複選
  boolean = 'BOOLEAN',        // 是否
  date = 'DATE',              // 日期
  mail = 'MAIL',              // mail
  password = 'PASSWORD'       // 密碼(暗碼)
}

/** 下拉選單列表 - 出帳幣別 */
export enum CurrencyType {
  TWD = 'TWD',
  USD = 'USD'
}
export const CurrencyList: { value: string, name: string }[] = [
  { value: CurrencyType.TWD, name: CurrencyType.TWD },
  { value: CurrencyType.USD, name: CurrencyType.USD }
]

/** 下拉選單列表 - 庫存 */
export enum Inventory {
  available = 'AVAILABLE',
  custom = 'CUSTOM_QUANTITY'
}
export const InventoryList: { value: string, name: string }[] = [
  { value: Inventory.available, name: 'available' },
  { value: Inventory.custom, name: 'custom quantity' }
]

/** 下拉選單列表 - 租約方式 */
export const LeaseModeList: { value: number, name: string }[] = [
  { value: 12, name: 'year payment' },    // 年計價
  { value: 36, name: '3 year payment' },  // 3 年計價
  { value: 1, name: 'month payment' },    // 月計價
  { value: -1, name: 'once payment' }     // 一次性計價
]

/** 下拉選單列表 - 計算方式 */
export enum CalculateMethod {
  costBase = 'COST_BASE',
  priceBase = 'PRICE_BASE'
}
export const CalculateMethodList: { value: CalculateMethod, name: string }[] = [
  { value: CalculateMethod.costBase, name: 'cost multiply by base' },     // 以成本 x 成數
  { value: CalculateMethod.priceBase, name: 'price multiply by base' },   // 以定價 x 成數
]

/** 下拉選單列表 - 計費方式 */
export enum BillingMethod {
  none = 'NONE',
  totalPercent = 'TOTAL_PERCENT',
  fixCost = 'FIX_COST'
}
export const BillingMethodList: { value: BillingMethod, name: string }[] = [
  { value: BillingMethod.none, name: 'no need to input' },        // 無需輸入
  { value: BillingMethod.totalPercent, name: 'total percent' },   // 依照所有品項總和百分比
  { value: BillingMethod.fixCost, name: 'fix cost' },             // 固定金額
]

/** 下拉選單列表 - 計價類別 (原為 商品類別) */
export enum ProductCate {
  perUnit = 'PER_USAGE',         // 用量制
  subscription = 'SUBSCRIPTION', // 訂閱制 計價週期選項不能是『一次性計價』
  expense = 'EXPENSE',           // 費用
  license = 'LICENSE',           // 授權制 計費週期僅能選擇『一次性計價』
  commitment = 'COMMITMENT',     // 保證用量
  commitmentOverage = 'COMMITMENT_OVERAGE',   // 超額用量
  includedUnits = 'INCLUDED_UNITS',
  quantityBasedCommit = 'QUANTITY_BASED_COMMIT'
}
export const ProductCateList: { value: string, name: string }[] = [
  { value: ProductCate.perUnit, name: 'per unit type' },          // 用量制
  { value: ProductCate.subscription, name: 'subscription type' }, // 訂閱制
  { value: ProductCate.expense, name: 'expense' },                // 費用
  { value: ProductCate.license, name: 'license type' },           // 授權制 計費週期僅能選擇『一次性計價』
  { value: ProductCate.commitment, name: 'commitment' },          // 保證用量
  { value: ProductCate.commitmentOverage, name: 'commitment overage' },   // 超額用量
  { value: ProductCate.includedUnits, name: 'included units' },
  { value: ProductCate.quantityBasedCommit, name: 'quantity based commit' },
]

export enum ImageType {
  banner = 'banner',
  default = 'default',
  description = 'description'
}

export enum SalesTargetIdentity {
  // none = 'NONE',
  dealer = 'DEALER',
  endUser = 'ENDUSER'
}

export enum PaymentMethod {
  null = '',
  transfer = 'transfer',
  creditCard = 'credit card',
}

/** 下拉選單列表 - 付款方式 */
export const PaymentMethodList: { value: PaymentMethod, name: PaymentMethod }[] =
  [
    { value: PaymentMethod.null, name: PaymentMethod.null },                 // 空
    { value: PaymentMethod.transfer, name: PaymentMethod.transfer },         // 匯款
    { value: PaymentMethod.creditCard, name: PaymentMethod.creditCard },     // 信用卡
  ]


//////////////////////////
//                      //
//       Customer       //
//                      //
//////////////////////////

/** 特定客戶資訊 */
export class CommodityCustomer {
  customerId: string = '';
  customerName: CustomerName = new CustomerName();
  location?: CustomerLocation[];
  serialNumber?: string = '';
  identityType?: SalesTargetIdentity[];
  industryType?: string = '';
  status: number = 0;
  cloudRelation?: CloudIdsInfo[];
}

export class CustomerLocation {
  locationId: string = '';
  name: string = '';
  telNo?: string = '';
  faxNo?: string = '';
  address?: string = '';
  status: number = 0;
  modifiedUser?: string = '';
  modifiedUserName?: string = '';
}

export class CommodityContact {
  contactId: string = '';
  customerId: string = '';
  chineseName?: string = '';
  englishName?: string = '';
  mobile?: string = '';
  email?: string = '';
  status: number = 0;
  type?: string = '';
  phone?: { tel: string, ext: string };
  createUser?: string = '';
}

export class CommoditySales {
  id: String = '';
  email: String = '';
  job: String = '';
  name: String = '';
  englishName: String = '';
  nickName: String = '';
  employeeId: String = '';
  telephone: { number: string, ext: string } = { number: '', ext: '' };
  label?: String = '';
}

export class CartFormValue {
  customer!: { id: string, name: string };
  customerAddress: string = '';     // 客戶地址
  endUser!: { id: string, name: string };
  customerContact!: { id: string, name: string };
  billingContact!: { id: string, name: string };
  billingAddress: string = '';      // 帳單地址
  billingContactEmail: string = ''; // 帳單聯絡人email
  cloudId: string = '';             // CloudId
  salesperson!: { id: string, name: string, ext: string, email: string, label?: string };
  did?: string = '';                // DID(CISCO專用)
  openContactEmail?: string = '';   // 開通Email聯絡人(CISCO專用)
  paymentMethod: PaymentMethod = PaymentMethod.transfer; // 付款方式

  // customerName: string = '';        // 客戶(公司名稱)
  // endUserName: string = '';         // 最終使用者
  // customerContact: string = '';     // 聯絡人
  // billingContact: string = '';      // 帳單聯絡人
  // salesperson: string = '';         // 指定業務
  // ext: string = '';                 // 指定業務分機
}

export class CartOrderDetail {
  id?: string = '';
  orderId?: string = '';
  createdRole?: string;
  createdUser?: string;

  productDetails: CommodityCart[] = [];
  orderAmount: number = 0;
  tax: number = 0;
  totalAmount: number = 0;
  userDetail: CartFormValue = new CartFormValue();
  openContactEmail?: string;
  code?: string;
}

export enum OrderStatus {
  draft = 'DRAFT',
  approval = 'APPROVAL',
  review = 'REVIEW',
  pending = 'PENDING_REVIEW',
  reject = 'REJECT',
  processing = 'PROCESSING_DRAFT'
}

// 購物車轉訂單 api format
export class ShoppingCarOrder {
  header!: ShoppingCarOrderHeader;
  body!: ShoppingCarOrderBody[];
}

export class ShoppingCarOrderHeader {
  customer!: { id: string, name: string };
  endUser!: { id: string, name: string };
  customerAddress!: string;
  customerContactId!: string;
  billingAddress!: string;
  billingContactId!: string;
  shoppingCarId!: string;
  salesModel!: OrderSalesModel | null;
  status!: string;
}

export class ShoppingCarOrderBody {
  brandId!: string;
  cloudId!: string;
  solutionId!: string;
  solutionData!: any;
  startDate!: string | Date;
  exchangeRateType: string = DefaultOrderValue.exchangeRateType;
  paymentDate: number = DefaultOrderValue.paymentDate;
  timeInterval: number = DefaultOrderValue.timeInterval;
  salesId!: string;
  billingContactEmail!: string;
  status: string = DefaultOrderValue.bodyStatus;

  payerId?: string;
  quotationId?: string;
  erpNumber?: string;
  contractIds?: string[];
  advancePayments?: { remittanceDate: Date, amount: Date }[];
  products?: { name: string, quantity: number, startDate: Date }[];
  endDate?: Date;
  exchangeRate?: number;
  salesModel?: string;
}

export const DefaultOrderValue = {
  // header part
  salesModel: 'DIRECT_SELLING', // DIRECT_SELLING("直銷"), DISTRIBUTION("經銷"), DISTRIBUTOR_SELF_USE("經銷商自用")
  headerStatus: OrderStatus.processing, // DRAFT("草稿"), FAIL("失敗"), REVIEW("審核中"), APPROVAL("核准"), REJECT("退回");

  // body part
  exchangeRateType: 'CUSTOM',   // 匯率類型: 'CUSTOM' or 'BKTW'
  bodyStatus: 'NOT_ACTIVATED',  // 狀態: OrderStatus.not
  paymentDate: 1,               // 付費間隔
  timeInterval: 1,              // 付費日
}

export enum OrderSalesModel {
  directSelling = 'DIRECT_SELLING', // 直銷
  distribution = 'DISTRIBUTION',    // 經銷
  distributionSelfUse = 'DISTRIBUTOR_SELF_USE',  // 經銷商自用
}

export const OrderStatusList: { id: OrderStatus, name: OrderStatus }[] = [
  {
    id: OrderStatus.draft,
    name: OrderStatus.processing
  },
  {
    id: OrderStatus.approval,
    name: OrderStatus.approval
  },
  {
    id: OrderStatus.review,
    name: OrderStatus.review,
  },
  {
    id: OrderStatus.pending,
    name: OrderStatus.pending,
  },
  {
    id: OrderStatus.reject,
    name: OrderStatus.reject,
  }
]
