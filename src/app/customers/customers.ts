export class ErpInfos {
  id = '';
  paymentTerms = '';
  sourceName = '';
}

export class Company {
  /** 建立者 */
  createdUser = '';
  /** 合併者 */
  modifiedUser: undefined | string = '';
  /** 建立時間 */
  createdTime = '';
  /** 合併時間 */
  modifiedTime: undefined | string = '';
  /** 公司編號 */
  customerId = '';
  /** 公司名稱
   * 中文全名
   * 中文簡稱
   * 英文全名
   * 英文簡稱
   */
  name = {
    fullCh: '',
    nickCh: '',
    fullEn: '',
    nickEn: ''
  };
  /** 統一編號 */
  serialNumber = '';
  /** 產業別 */
  industryClass: string = '';
  /** 身分別 */
  identityType: String[] = [];
  /** 來源 */
  sourceType = '';
  /** erp */
  erpInfos: ErpInfos[] | null = null;
  /** meta */
  meta: any;
  /** 狀態(有效無效) */
  status = 1;
}

export class LocationCompany {
  /** 建立者 */
  createdUser = '';
  /** 合併者 */
  modifiedUser = '';
  /** 建立時間 */
  createdTime = '';
  /** 合併時間 */
  modifiedTime: undefined | string = '';
  /** 聯絡人編號 */
  locationId = '';
  /** 公司編號 */
  customerId = '';
  /** 名稱 */
  name = '';
  /** 電話 */
  telNo = '';
  /** 傳真 */
  faxNo = '';
  /** 地址 */
  address = '';
  /** 地址詳細格式 */
  addressFragment: any;
  /** 非正規化地址 */
  falseAddress: undefined | string = ' ';
  /** 狀態(有效無效) */
  status = 0;
  /** 是否為第一筆(總公司欄) */
  isCorporate = false;
  /** 是否為新增的欄位 */
  newData: undefined | boolean = false;
  /** 是否更新過資料 */
  changeData: undefined | boolean = false;
  /** 合併者名稱 */
  modifiedUserName = '';
}

/** 客戶資訊 */
export class Customer {
  /** uid */
  customerId = '';
  /** CRM客戶id */
  crmCustomerId = '';
  /** 公司名稱
   * 中文全名
   * 中文簡稱
   * 英文全名
   * 英文簡稱
   */
  customerName = {
    fullCh: '',
    nickCh: '',
    fullEn: '',
    nickEn: ''
  };
  /** 地址電話 */
  location: LocationInfo[] = [];
  /** 統一編號 */
  serialNumber = '';
  /** 身分別 */
  identityType: String[] = [];
  /** 原廠合約編號 */
  cloudRelation: CloudInfo[] = [];
  /** 產業別 */
  industryType = '';
  /** 狀態(有效無效) */
  status = 1;
  /** 原廠ID */
  brandId = '';
  /** 原廠名稱 */
  brandName = '';
  /** 所屬公司ID */
  companyId = '';
  /** 所屬公司名稱 */
  companyName = {
    fullCh: '',
    nickCh: '',
    fullEn: '',
    nickEn: ''
  };
}

/** 地址電話 */
export class LocationInfo {
  /** 地址電話id */
  locationId = '';
  /** 名稱 */
  name = '';
  /** 電話 */
  telNo = '';
  /** 傳真 */
  faxNo = '';
  /** 地址 */
  address = '';
  /** 狀態(有效無效) */
  status = 1;
  /** 最後編輯人 */
  modifiedUser = '';
  /** 最後編輯人(中文) */
  modifiedUserName = '';
}

/** 原廠合約資訊 */
export class CloudInfo {
  /** 原廠編號 */
  cloudId = '';
  /** 品牌id */
  brandId = '';
  /** 品牌名稱 */
  brandName = '';
  /** 訂單id */
  orderId = '';
  /** 代理商id */
  payerId = '';
  /** 原廠合約編號 */
  contractIds: string[] = [];
}

/** 產業別 */
export class Industry {
  id = '';
  name = '';
  note = '';
  order?: number;
}

/** 身份別 */
export class Identity {
  name = '';
  value = '';
}

/** 職務別 */
export class Job {
  id = '';
  name = '';
  order?: number;
}

/** 聯絡人 */
export class Contact {
  /** 聯絡人id */
  contactId = '';
  /** 客戶id */
  customerId = '';
  /** crm聯絡人id */
  crmContactId = '';
  /** 中文姓名 */
  chineseName = '';
  /** 英文姓名 */
  englishName = '';
  /** 手機 */
  mobile = '';
  /** 電子信箱 */
  email = '';
  /** 狀態 */
  status = 1;
  /** 聯絡人種類 */
  type = '';
  /** 公司電話，分機 */
  phone = {
    tel: '',
    ext: ''
  };
  /** 建立者 */
  createdUser = '';
  /** 是否為總公司 */
  isCorporate = false;
}

/** CRM聯絡人 */
export class CRMContact {
  /** 聯絡人id */
  contactId = '';
  /** 中文姓名 */
  chineseName = '';
  /** 英文名稱 */
  englishName = '';
  /** 聯絡方式 */
  communications: Communication[] = [];
  /** 公司資訊 */
  company = {
    // 客戶id
    customerId: '',
    // 客戶名稱
    customerName: [],
    // 身份別
    identityType: [],
    // 資料id
    locationId: '',
    // 資料名稱
    locationName: '',
    // ??
    relations: [],
    // 產業別
    type: ''
  };
  /** 建立時間 */
  createdTime = '';
  /** 建立者 */
  createdUser = '';
  /** 建立者名稱 */
  createdUserName = '';
  /** ?? */
  experiences = [];
  /** 群組 */
  groups = [];
  /** ?? */
  isPublic = false;
  /** ?? */
  labelGroups = [];
  /** ?? */
  leaderName = '';
  /** 合併時間 */
  modifiedTime = '';
  /** 合併者 */
  modifiedUser = '';
  /** 合併者名稱 */
  modifiedUserName = '';
  /** ?? */
  removeReason = '';
  /** 狀態 */
  status = 1;
  /** ?? */
  territory = '';
}

export class Communication {
  communicationId = '';
  isDefault = true;
  type = '';
  value: { number?: string, mail?: string, ext?: string}[] = [];
}

export class UploadFile {
  /** id */
  id = '';
  /** 建立時間 */
  createDate = '';
  /** ?? */
  directory = false;
  /** 檔案名稱 */
  filename = '';
  /** ?? */
  isDirectory = false;
  /** 合併時間 */
  modifyDate = '';
  /** 檔案路徑 */
  path = '';
}

export class Partner {
  /** 客戶id */
  customerId = '';
  /** 公司名稱 */
  name = {
    fullCh: '',
    nickCh: '',
    fullEn: '',
    nickEn: ''
  };
  /** partner id */
  partnerId = '';
}

/** intable 設定檔 */
export class PageConfig {
  boundaryLinks = true;
  totalItems = 0;
  itemsPerPage = 10;
  currentPage = 1;
  maxSize = 10;
}
