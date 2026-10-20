import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { LayoutItem } from '../models/layout-item';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  /** 佈局設定 */
  layoutConfig: LayoutItem[] = [];

  /** 把所有 resource 的 id 和 label 儲存下來，以利 breadcrumb 查詢變數名稱 */
  idLabel: { [key: string]: any } = {
    brands: <{ [key: string]: string }>{},
    solutions: <{ [key: string]: string }>{},
  };

  refreshToken?: string;

  constructor() { }

  /** 取回佈局設定 */
  getLayoutConfig() {
    return this.layoutConfig;
    // return this.layoutConfigFake;
  }

  /**
   * 設定 resource 的 id 和 label
   * @param type resource 種類，例如：brands, solutions,...
   * @param id resource id
   * @param label resource label (or name)
   */
  setIdLabel(type: string, id: string, label: string) {
    this.idLabel[type] = this.idLabel[type] || {};
    this.idLabel[type][id] = label;
    // console.log('[data] setIdLabel', this.idLabel);
  }

  /** 根據 resource id 取得 label */
  getIdLabel(type: string, id: string) {
    if (this.idLabel && this.idLabel[type]) {
      return this.idLabel[type][id];
    } else {
      return id;
    }
  }

  /**
   * 找出樹狀結構路由裡頭含有指定路由的節點名稱
   * @param config 路由樹狀結構 layoutConfig (遞迴找出是否有 route 或 children)
   * @param route 完整路由字串
   */
  getLayoutItemLabel(config: LayoutItem[], route: string): string | undefined {
    const obj = this.getLayoutItem(config, { route: route });
    return obj && obj.length && obj[0].label ? obj[0].label : '';
  }

  /**
    * 找出樹狀結構路由裡頭含有指定條件的節點
    * @param config 路由樹狀結構物件
    * @param constrain 是否需要指定符合條件 (ex: {route: 'xxx/yyy/zzz'})
    * @param [recursive] 是否需要遍歷所有節點
    * @param [results] 存放最終結果 (內部使用或初始結果)
    */
  getLayoutItem(
    config: LayoutItem[] | undefined,
    constrain: { [key: string]: any },
    recursive = false,
    results: LayoutItem[] = [],
  ): LayoutItem[] | undefined {
    if (!config) {
      return;
    }

    // 去掉 route 最後的反斜線
    if (
      constrain['route'] &&
      constrain['route'][constrain['route'].length - 1] === '/'
    ) {
      constrain['route'] = constrain['route'].slice(0, -1);
    }

    for (let i = 0; i < config.length; i++) {
      let isMatch = true;

      // 如果有設定 constrain
      if (!_.isEmpty(constrain)) {
        const keys = Object.keys(constrain);

        // 檢查是否 config 所有 property 都符合條件
        for (let j = 0; j < keys.length; j++) {
          // if (config[i][keys[j]] !== constrain[keys[j]]) {
          if (!_.isEqual(config[i][keys[j]], constrain[keys[j]])) {
            isMatch = false;
            break;
          }
        }
      }

      // 如果找到條件吻合的 config
      if (isMatch) {
        results.push(config[i]);

        // 如果不需要遍歷所有節點，直接返回結果
        if (!recursive) {
          return results;
        }
      }

      // 如果還有子節點，繼續搜尋
      if (config[i].children) {
        this.getLayoutItem(config[i].children, constrain, recursive, results);
      }
    }

    return results;
  }
}
