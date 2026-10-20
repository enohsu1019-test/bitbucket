import { CustomerLocation } from "./commodity";

export class RefreshRequest {
  refreshToken: string = '';
}

export class Role {
  id: string = '';
  brandId: string = '';       // 原廠 ID
  identityType: string = '';  // 公司類別
  companyId: string = '';     // 公司
  name: string = '';          // 角色名稱
}

export class RoleForm {
  id?: string = '';
  brandId?: string = ''       // 原廠 ID
  identityType: string = '';  // 公司類別
  companyId: string = '';     // 公司
  role:                        // 角色名稱, 權限設定
    { name: string, rules: string[] } =
    { name: '', rules: [] };
  cloudInfos: CloudIdsInfo[] = [];
  time?: Date = new Date();       // 更新時間
}


export class RoleResp {
  id: string = '';
  brand: BrandData = new BrandData();  // 原廠
  identityType: IdentityType = IdentityType.AGENT;  // 公司類別
  company: CompanyData = new CompanyData();
  name: string = '';
  time?: Date = new Date();
}

export class BrandData {
  id: string = '';
  name: string = '';
  productName?: string = '';
  payers?: {payerId: string, nickName: string}[] = [];
}

export class CloudIdsInfo {
  id?: string = '';
  brandId: string = '';
  payerId: string = '';
  companyId: string = '';
  cloudIds: string[] = [];
  time?: Date = new Date();
}

export class CloudIdsData {
  id?: string = '';
  brandId: string = '';   // 付款人 ID
  payerId: { payerId: string, nickName: string } = { payerId: '', nickName: '' };   // 品牌 ID
  company: CompanyData = new CompanyData; // 公司ID (全部給 ALL)
  cloudIds: string[] = [];  // 關聯 cloudId
  time?: Date = new Date();
}

export class CloudIdRequest {
  brand: string = '';
  identityType: string = '';
  companyId: string = '';
  payerId?: string = '';
  customerId?: string = '';
}

export enum CloudIdInfoType {
  payerId = 'payerId',
  customer = 'customer',
  cloudId = 'cloudId'
}

export class RoleData {
  id?: string = '';
  roleName: string = '';
  rules: string[] = [];
}

export class CompanyData {
  id: string = '';
  fullCh: string = '';
  fullEn: string = '';
  nickCh: string = '';
  nickEn: string = '';
  allName?: string = ''; // fullCh + fullEn + nickCh + nickEn
  creator?: string = '';
}

export class RuleData {
  id: string = '';
  type: string = '';
  status: 'ENABLE' | 'DISABLE' = 'DISABLE';
  description: string = '';
  checked?: boolean = false;
  disabled?: boolean = false;
}

export enum AuthType {
  order = 'order',  // 訂單
  bill = 'bill',    // 帳單
  function = 'function'     // 功能
}

export enum IdentityType {
  AGENT = 'AGENT',        // 代理
  DEALER = 'DEALER',      // 經銷商
  ENDUSER = 'END_USER',  // 最終使用者
  SYSTEM = "SYSTEM"       // 系統管理員
}

export enum CustomerIdentity {
  AGENT = 'AGENT',        // 代理
  DEALER = 'DEALER',      // 經銷商
  ENDUSER = 'ENDUSER',  // 最終使用者
  SYSTEM = "SYSTEM",      // 系統管理員
  ORIGIN = "ORIGIN"       // 原廠
}

export const identityTypeList: { value: IdentityType, name: string }[] = [
  {
    value: IdentityType.AGENT,
    name: IdentityType.AGENT.toLocaleLowerCase()
  },
  {
    value: IdentityType.DEALER,
    name: IdentityType.DEALER.toLocaleLowerCase()
  },
  {
    value: IdentityType.ENDUSER,
    name: IdentityType.ENDUSER.toLocaleLowerCase()
  }
]


// export class RoleUpdate {
//   brandName: string = '';       // 品牌 ID
//   identityType: string = '';  // 公司類別
//   companyId: string = '';     // 公司
//   associateOrder: string[] = [];  // 所屬訂單編號
// }

// export class RoleForm {
//   brandId: string = '';       // 原廠 ID
//   identityType: string = '';  // 公司類別
//   companyId: string = '';     // 公司
//   name: string = '';          // 角色名稱
// }

export class CustomerData {
  brandId: string = '';
  brandName: string = '';
  companyId: string = '';
  companyName!: CompanyData;
  crmCustomerId: string = '';
  customerId: string = '';
  customerName!: CompanyData;
  identityType: IdentityType[] = [];
  industryType: string = '';
  location: CustomerLocation[] = [];
  serialNumber: string = '';
  status: number = 1;
  createdUser: string = '';
}
