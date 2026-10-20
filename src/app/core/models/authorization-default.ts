/** 新增/編輯角色時，預設將 default permission 加入角色權限 */
export const DefaultPermissions = [
  // ====================== iam ======================
  'iam-v1::api::getIam',            // 取得登入者角色
  'iam-v1::api::rule-group',        // 取得權限群組
  'iam-v1::api::rule-get',          // 取得權限
  'iam-v1::api::cloudIdInfo-query', // 搜尋角色關聯的cloudId
  'iam-v1::api::iamSettingInfo',    // 取得IAM設置資訊
  'iam-v1::api::brands',            // 取得品牌
  'iam-v1::api::checkName',         // 確認角色名稱是否存在
  'iam-v1::api::iam-query',         // 搜尋角色
  'iam-v1::api::getIamSettingCompany',  // 取得IAM設置公司資訊

  // ===================== user ======================
  'user-v1::api::changeRole',       // 切換角色
  'user-v1::api::menus',            // 取得 side bar
  'user-v1::api::one',              // 取得使用者資訊
  'user-v1::api::checkEmailExists', // 確認使用者是否存在
  'user-v1::api::updatePassword',   // 更新密碼
  'user-v1::api::getJob',           // 取得職稱
  'user-v1::api::query-sales',      // 取得業務人員
  'user-v1::api::update',           // 更新使用者資訊
  'user-v1::api::user-query',       // 搜尋使用者
  'user-v1::api::aliasList',        // 取得別名
  'user-v1::api::update_alias',     // 變更別名

  // ==================== layout =====================
  'layout::menu::home',             // 選單-首頁
  'layout::menu::system',           // 選單-系統
  'layout::menu::system.personal',  // 選單-系統/個人頁面

  // ==================== brand ======================
  'brand-v1::api::brandMappingList',      // 搜尋crm mapping table
  'brand-v1::api::queryCommonFields',     // 搜尋方案下的共同欄位
  'brand-v1::api::queryBrands',           // 搜尋品牌
  'brand-v1::api::querySolutionFiles',    // 搜尋方案檔案
  'brand-v1::api::querySolutions',        // 搜尋方案
  'brand-v1::api::querySpecialFields',    // 搜尋方案下的特殊欄位
  'brand-v1::api::getBrandCategory',      // 取得商品分類列表

  // =================== customer =====================
  'customer-v1::api::getCRMCustomerLocationList', // 搜尋CRM特定公司之客戶資料(地址電話)
  'customer-v1::api::getCRMContactList',  // 搜尋CRM聯絡人列表
  'customer-v1::api::getCRMCustomerList', // 搜尋CRM公司資訊清單
  'customer-v1::api::getFiles',           // 搜尋客戶檔案
  'customer-v1::api::getImage',           // 檢視客戶圖檔
  'customer-v1::api::getIndustryCategory',// 搜尋產業別資訊
  'customer-v1::api::getJobTitle',        // 搜尋職稱資訊
  'customer-v1::api::queryContacts',      // 搜尋聯絡人
  'customer-v1::api::queryCustomers',     // 搜尋客戶

  // =================== product =====================
  'product-v1::api::queryBanners',        //搜尋商品櫥窗Banners
  'product-v1::api::queryStoreProducts',  //搜尋商品櫥窗

  // ==================== order ======================
  'order-v1::api::order-query',           // 搜尋訂單

  // =================== invoice =====================


  // ================== dashboard ====================
  'aws-cost-analysis-v1::api::exportAWSRecommendation',     // AWS節費資訊-下載EXCEL
  'aws-cost-analysis-v1::api::getAWSRecommendation',        // 取得AWS節費資訊
  'aws-cost-analysis-v1::api::getCostExplorerFilter',       // 取得成本分析Filter

];
