// 參考之前的設計 https://bitbucket.org/sysage-rd/lianan-web/commits/b4b9d45e594c76cca3842e409499c9f615da9ee7

/**
 * 關於前端權限部分：
 * [id] 目前有兩種：
 * 1. layout:menu:xxxx: 屬於 route 選單 (header, side-bar, tab,...)
 * 2. layout:ui:xxxx: 非 route 選單
 *
 * [name]
 * 1. menu 的 name 就直接是最後一層 route 名稱。完整 route 取得方式：
 *   (1) 從 id 上可以看出完整 route；
 *   (2) 也可透過 children 的階層關係，把 name 組合成完整 route
 * 2. 非 menu 的 name 可以任意命名
 *
 * [type] 除了 menu 固定為 menu 外，其餘 ui 可以任意指定，如：button, input,...
 *
 * [children] 目前設計階段先以階層方式排列，屆時 children 只會記錄 id
 *
 * ---------------------------------------------------------------------
 *
 * 後與 Indianan 討論過，若前後端權限拆開設定，若有一邊沒設定到，可能發生不同步
 * 因此大部分設定仍參照後端權限，若有不足，可再比照上面方式新增 "第 2 種非 route 選單"
 * 關於後端權限部分：
 * [id] (gateway):api:xxxx
 * [type] API
 * [description] 中文名稱
 */

export class Permission {
  id: string = '';
  name?: string = '';
  type: string = '';
  label?: string = '';
  icon?: string = '';
  route?: string = '';
  description: string = '';
  status?: string = '';
  children: (string | Permission)[] = [];
  createdTime?: string;
  createdUser?: string;
  modifiedTime?: string;
  modifiedUser?: string;
  groupName?: string = '';
}
