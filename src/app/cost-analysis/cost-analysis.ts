/** intable 設定檔 */
export class PageConfig {
  boundaryLinks = true;
  totalItems = 0;
  itemsPerPage = 10;
  currentPage = 1;
  maxSize = 10;
}

/** 專案名稱 */
export class ProjectList {
  /** id */
  id = '';
  /** 名稱 */
  name = '';
  /** 編輯狀態 */
  edit = false;
}

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

/** 成本分析列表 */
export class CostList {
  /** cloud id */
  cloudId = '';
  /** payer id */
  payer = '';
  /** payer別名 */
  nickName = '';
  /** 編輯狀態 */
  edit = false;
}

/** 成本分析細節列表 */
export class CostDetailList {
  /** id */
  id = '';
  /** cloud id */
  cloudId = '';
  /** 名稱 */
  name = '';
  /** 專案細節 */
  projectInfo: ProjectInfo[] = [];
  /** 編輯狀態 */
  edit = false;
}

/** 標籤分析細節列表 */
export class TagDetailList {
  /** id */
  id = '';
  /** cloud id */
  cloudId = '';
  /** 標籤 */
  tag = '';
  /** 名稱 */
  name = '';
  /** 專案細節 */
  projectInfo: ProjectInfo[] = [];
  /** 編輯狀態 */
  edit = false;
  /** 合併時間 */
  modifyDate = '';
  /** 屬於哪個標籤下的專案 */
  comFromTagId: string[] = [];
}

/** 專案細節 */
 export class ProjectInfo {
  /** 百分比 */
  costPercentage = 0;
  /** 專案ID */
  projectManagementId = '';
  /** 名稱 */
  name = '';
}

/** 統計圖(輸入) */
export class AnalysisDataInput {
  /** account id */
  accountIds: string[] = [];
  /** 服務 */
  service: string[] = [];
  /** 區域 */
  region: string[] = [];
  /** 標籤 */
  tag: string[] = [];
  /** ??? */
  recordType: string[] = [];
  /** ??? */
  groupBy = '';
  /** ??? */
  granularity = '';
  /** 專案 */
  project: string[] = [];
  /** 開始時間 */
  startDate = '';
  /** 結束時間 */
  endDate = '';
  /** payer id */
  payerId = '';
}

/** 統計圖(api回傳) */
export class AnalysisDataOut {
  total = [{
    tag: '',
    name: '',
    service: '',
    amount: 0
  }];
  details = [{
    date: '',
    tag: '',
    name: '',
    service: '',
    amount: 0
  }];
}
