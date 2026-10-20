export class Bill {
  orderId: string = '';     // 訂單 ID
  subOrderId: string = '';  // 子單 ID
  customer?: BillCustomer;  // 客戶
  brand: string = '';       // 品牌
  solution: string = '';    // 方案
  approvalStatus: string = '';  //  訂單狀態
  orderStatus: string = '';     // 子單狀態
  startDate: string = '';   // 起始日期
  endDate: string = '';     // 結束日期
  updateTime: string = '';  // 更新日期
  rowLinks?: string;
  // 312編號
  orderErpNumber = '';

  // assignUsers: BillAssignUser[] = [];
  // contactId?: string;
  // timeInterval?: number;
  // paymentDay?: number;
  // endUserId?: string;  // 最終用戶 Id (客戶)
  // contractIds?: string[];  // 原廠合約編號
  // advancePayment?: {
  //   notice: string;
  //   advancePaymentDetail: PrePay[];
  // };
}

export class BillCustomer {
  id: string = '';
  serialNumber: string = '';  //統一編號
  name: string = '';          //客戶名稱
}

export enum BillStatus {
  inactivated = 'NOT_ACTIVATED',      // 未啟用
  using = 'USING',                    // 使用中
  suspension = 'CONTRACT_SUSPENSION', // 合約終止
  expired = 'CONTRACT_EXPIRED',       // 合約期滿
  void = 'VOID',    // 作廢
  poc = 'POC'       // POC
  // pending = 'PENDING_REVIEW',
  // reject = 'REJECT',
}

export class Brand {
  brandId: string = '';
  name: string = '';
  serviceName: string = '';
  createDate = new Date();
  modifyDate = new Date();
  payerId: string[] = [];
  status: string = '';
}

export class Invoice {
  id = '';
  year: string = '';        // 年
  month: string = '';       // 月
  locked: boolean = false;  // 是否鎖定
  lockDate = '';            // 出帳時間
  orderId?: string = '';         // 訂單ID
  orderDetailId?: string = '';   // 子單ID
  number?: string = '';          // 發票號碼
  version?: string = '';         // 腳本版本
  calculation?: { [key: string]: any } = {}; // 前台腳本資料
  data?: { [key: string]: any } = {};        // 方案數據
  info?: any = {};        // 訂單資訊
  createDate?: string = '';      // 創建日期

  yearMonth: string = '';
  pdfScreenshot: string = '';
  pngScreenshot: string = '';
  pdfData!: Blob;
  pngData: string = '';

  // 額外出帳內容
  extraBilling: ExtraBilling[] = [new ExtraBilling, new ExtraBilling];
  // 額外出帳button狀態
  extraBillingStatus = false;
  // 額外出帳讀取狀態
  extraBillingLoadStatus = false
}


export class Solution {
  id = '';
  brandID = '';
  name = '';
  status = '';
  createDate?: Date;
  modifyDate?: Date;
}

export class EndUser {
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

export enum InvoiceType {
  pdf = 'PDF',
  png = 'PNG',
  all = 'ALL'
}

export class ExtraBilling {
  id = '';
  name = '';
  type = 'DISCOUNT_NO_FEES';
  currencyType = '';
  amount = 0;
  amountIncludingTax = 0;
  modifyTime = '';
  modifyUserName = '';
  status = false;
  requiredStatus = false;
}

export class ExtraBillingSave {
  name = '';
  type = '';
  amount = 0;
  amountIncludingTax = 0;
}
