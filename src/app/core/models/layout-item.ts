import { HttpMethod } from './http-method';

export enum LayoutItemType {
  menu = 'menu',
  page = 'page',
  action = 'action',
  api = 'api',
  ui = 'ui',
  link = 'link',
  fqreport = 'fqreport'
}

/**
 * 佈局選單、主畫面，以及 API 可用性的單一物件設定
 *
 * functions 內各個項目的 id 與 name 可讀性需要增加，命名規則：
 * 1. id 必須所有項目中唯一。（駝峰式命名）
 * 2. name 在項目中的 children 範圍中唯一即可。（駝峰式命名）
 * 3. 一般而言 id 與 name 相同即可，若為了 id 唯一性，可以另外加上 prefix 或 postfix（例如：父項目 id）。
 * 4. 詳細說明可以放在 label 裡面。
 * 以 brand 為例，每個 solution 都會有 getSolutions 這個 api，命名會是：
 * 1. id: {brandId}.getSolutions
 * 2. name: getSolutions
 * 3. label: Get All Solutions
 */
export class LayoutItem {

  /** Add index signature for typescript error: **has no index signature. [7017]** */
  [key: string]: any;

  /** 樹狀全域唯一識別碼 */
  id = '';
  /** 樹狀單線唯一識別名稱 */
  name = '';
  /** 種類
   * menu: 路由 (在左側菜單)。如果所有 children 都是 menu，則此 menu item 為不含頁面的純節點
   * page: 路由 (不在左側菜單)
   * action: 用戶操作項目，例如: 發給後端用的 api request
   * api: 全域控制用的 api
   * ui: 介面相關控制項
   * link: 超連結
   * fqreport: F&Q回報(因非同步取得超連結)
   * */
  type = LayoutItemType.menu;
  /** 是否可用 */
  enable = false;
  /** 角色設定權限時是否被關閉 enable/disable 調整 */
  nonadjustable?: boolean;
  /** 子節點物件 */
  children?: LayoutItem[];


  /** **(only for type='menu')** 前端路由  */
  route?: string;
  /** **(only for type='menu')** 前端路由顯示文字  */
  label?: string;
  /** **(only for type='menu')** 選單項目代表符號 (css), ex: fa fa-home  */
  icon?: string;
  /** **(only for type='menu')** 目前路由沒有出現在選單時，最接近的父節點根據此屬性決定是否高亮 */
  activeNode?: boolean;


  /** **(only for type='api')** 可使用的 api */
  api?: {
    method: HttpMethod;
    url: string;
  };

}
