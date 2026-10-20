import { RoleResp } from "./authorization";

export class User {
  id: string = '';
  username: string = '';
  accessToken?: string = '';
  refreshToken?: string = '';
  email?: string = '';
  role?: RoleResp;
  roleId?: string;
  roleList?: RoleResp[] = [];
}

export class UserData {
  id?: string = '';
  roleList: UserRoleListItem = new UserRoleListItem();
  roleId: string = '';        // 該角色目前ID
  email: string = '';         // 電子郵件
  name: string = '';          // 中文姓名
  englishName?: string = '';  // 英文姓名
  nickName: string = '';      // 暱稱
  companyName: string = '';   // 公司名稱
  department?: string = '';   // 部門
  job?: string = '';          // 職稱
  employeeId?: string = '';   // 員工編號
  mobilePhone?: string = '';  // 行動電話
  telephone?:                 // 電話 + 分機
    { number: string, ext: string };
  userType: string = userType.general;      // 帳戶類型
  enabled: boolean = true;     // 狀態
  updateTime?: string = '';


  // nameCh?: string = '';
  // staffId: string = '';
  // account: string = '';
  // role: { id: string, name: string }[] = [];
  // extension?: string = '';
  // accountType?: string = '';
  // status: boolean = true;
}
export class AddUserData {
  roles: string[] = [];         // 角色ID
  email: string = '';         // 電子郵件
  userType: string = '';      // 帳戶類型
}

export class UserRoleListItem {
  id: string = '';
  brandName: string = '';
  companyName: string = '';
  name: string = '';
}

export enum userType {
  general = '一般帳號',
  // customer = '客戶帳號',
  ad = 'AD 帳號',
}

export const userTypeList: { id: string, name: userType }[] = [
  { id: 'SI', name: userType.general },
  { id: 'AD', name: userType.ad }
]
