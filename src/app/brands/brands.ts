export class Brands {
  createDate = '';
  brandId = '';
  modifyDate = '';
  status = '';
  serviceName = '';
  name = '';
}

export class PayerID{
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

export class SolutionData{
  brandId = '';
  createDate = '';
  modifyDate = '';
  name = '';
  solutionId = '';
  status = '';
}

export class OrderManagement {
  brand = '';
  orderManagementName = '';
  status = false;
  createDate = '';
  id = '';
  modifyDate = '';
  name = '';
}

export class CommonFeldManagement{
  defaultName = ''; //欄位標題
  type = 'STRING';  // 資料格式
  function = 'PARAMETER'; // 功能
  key = '';
  functionDropdowns: string[] = [
    'PARAMETER',
    'API',
  ]; // 功能下拉選單內容
  require = false; // 必填
  // export = false; // 匯出
  // customName = ''; // 匯出標題
  settingStatus = false; // 進階button狀態
  settingButtonViewStatus = false; //進階設定顯示按鈕狀態
  settingViewStatus = false; // 進階設定顯示狀態
  advancedSetting?: AdvancedSetting; // 進階設定內容
  initial = true; // 是否初始資料
}

export enum DataType {
  number = 'NUMBER',
  string = 'STRING',
  boolean = 'BOOLEAN',
  dropdown = 'DROPDOWN',
  multiselect = 'MULTISELECT'
}

export class EditKBoxItems{
  label = '';
  value = '';
  checked = false;
  draggable = true;
  orderIndex = 0;
}

export class EditKBox {
  allowOther = false;
  allowMultipleSelect = false;
  items: EditKBoxItems[] = [
    {label: '', value: '', checked: false, draggable: true, orderIndex: 0},
  ];
}

export class AdvancedSetting {
  contents =  new EditKBox();
}

export class PayerId{
  initial = true;
  customerId = '';
  nickName = '';
  payerId = '';
  identityType = '';
  customerName = ''
}

export class Solution {
  brandId = '';
  createDate = '';
  modifyDate = '';
  name = '';
  solutionId = '';
  status = '';
}

export class PricebookFiled{
  name = '';
  key = '';
  require = false;
  draggable = true;
  initial = true;
}

export class PriceBookFiledData{
  name = '';
  item: PricebookFiled[] = [];
}
export class ScriptData{
  createDate = '';
  directory = false;
  filename = '';
  id = '';
  isDirectory = false;
  modifyDate = '';
  path = '';
}

export class CompanyDropdown{
  name = '';
  customerId = '';
  identityType: string[] = [];
  serialNumber = '';
}

export class PayerKeySet{
  key = '';
  value = '';
  id!: string;
  brandId = '';
  payerId = '';
  accountId = '';
  dataSource = '';
  schemaName = '';
  openCostExportAPI!: boolean;
}

export class Dealer{
  dealerId = '';
  customerId = '';
  manufacturerId = '';
  solutionId = '';
  dueDate = '';
  enable = false;
  modifyTime = '';
  partnerId = '';
  name: {fullCH: string, nickCh: string, fullEn: string, nickEn: string} = {
    fullCH: '',
    nickCh: '',
    fullEn: '',
    nickEn: ''
  };
  manufacturerName = '';
  solutionName = '';
}

/** 商品類別列表 */
export class Classification {
  // id
  id = '';
  // 名稱
  name = '';
  // 品牌ID
  brandId = '';
  // 身份別
  identity = '';
  // 客戶ID
  companyId = '';
  // 建立時間
  createDate = '';
  // 合併時間
  modifyDate = '';
  // 建立者
  createUser = '';
  // 合併者
  modifyUser = '';
}

/** 新增/刪除/修改 商品分類 */
export class InputClassification {
  updateCategory: {id: string, name: string}[] = [];
  deleteCategory: string[] = []
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

/** 商品屬性 */
export class CommodityAttribute {
  /** id */
  id = '';
  /** 品牌id */
  brandId = '';
  /** 欄位標題 */
  name = '';
  /** 內部變數名稱 */
  internalVariableName = '';
  /** 欄位描述 */
  description = '';
  /** 資料格式 */
  type!: CommodityAttributeType;
  /** 單選/多選 */
  options: AttributeOptions[] = [];
  /** 是否必填 */
  required!: boolean;
  /** 是否隱藏 */
  hidden!: boolean;
  /** 欄位分類 */
  groupType = 'DYNAMIC';
  /** 建立者 */
  createdUser = '';
  /** 合併者 */
  modifiedUser = '';
  /** 建立時間 */
  createdTime = '';
  /** 合併時間 */
  modifiedTime = '';
}

/** 單選/多選 格式 */
export class AttributeOptions {
  /** 標題名稱 */
  name = '';
  /** 內部變數 */
  internalVariableName = '';
  /** index值 */
  index = 0;
}
