import { Injectable } from '@angular/core';
import { InTableComponent } from '@sysage/in-table';
import * as _ from 'lodash';
@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  /**
   * 透過屬性路徑方式 (例如：key1.key2.key3)，去操作物件某屬性的內容
   * @param obj 物件
   * @param path 屬性路徑
   * @param [value] 覆寫此 property 的 value，可為空
   */
  objectValyeByPath(obj: {} | any[], path: string, value?: any): any {
    path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    path = path.replace(/^\./, '');           // strip a leading dot
    const a = path.split('.');
    const len = a.length;
    let leaf: { [key: string]: any } | any[] = {};
    let ileaf;
    let co: { [key: string]: any } = obj;
    for (let i = 0, n = len; i < n; ++i) {
      const k = a[i];
      if (k in co) {
        if (i === len - 1) {
          leaf = co;
          ileaf = k;
        }
        co = co[k];
      } else {
        return;
      }
    }
    if (value !== undefined && ileaf !== undefined) {
      leaf[ileaf] = value;
      co = leaf[ileaf];
    }
    return co;
  }

  /**
   * 搜尋陣列中是否有任一元素包含指定的 {key: value}
   * @param list 目標陣列
   * @param key 指定 key
   * @param value 指定 value
   */
  isAnyMatch(list: any[], key: string, value: any): boolean {
    if (!list || !list.length) {
      return false;
    }
    for (let i = 0; i < list.length; i++) {
      if (list[i][key] === value) {
        return true;
      }
    }
    return false;
  }


  /**
   * 下載檔案
   * @param url 檔案網址
   */
  downloadFile(url: string) {
    const link = document.createElement('a');
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * 回傳列表物件中根據某 property 排序後的結果
   * @param list 列表物件
   * @param prop 排序用的 property
   */
  sortListBy(list: any[], prop: string) {
    return list.slice().sort((a, b) => {
      // 單字會轉成小寫比較
      // const la = a[prop].toLowerCase();
      // const lb = b[prop].toLowerCase();
      // return la > lb ? 1 : la === lb ? 0 : -1;
      const sa = a[prop];
      const sb = b[prop];

      return sa > sb ? 1 : -1;
    });
  }

  /**
   * 將多國語系名稱合併
   * @param names 要合併的名稱
   * @param langs 指定要合併的語系
   * @param seperator 合併用的分隔字串
   */

  combinezhLocalizeNames(names: { [key: string]: string },
    langs: string[] = ['zh-TW', 'en'],
    seperator: string = ' / '): string {

    const sortedNames: string[] = [];
    langs.forEach((lang: string) => {
      if (names[lang] !== undefined && names[lang] !== '') {
        sortedNames.push(names[lang]);
      }
    });

    return _.join(sortedNames, seperator);
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
  /**
   * 移除 html tag
   * @param htmlString ex: <p>1234</p> -> 1234
   */
  stripHtml(htmlString: string): string {
    let stripString = htmlString.replace(/<img[^>]+\>/ig, ' (image)');
    stripString = stripString.replace(/<iframe[^>]+\>/ig, ' (video)');
    stripString = stripString.replace(/<[^>]*>?/gm, '');
    return stripString;
  }

  /**
   * 移除 html 裡面的 特定 tag
   */
  stripTags(htmlString: string, tagNameArray: string[]): string {
    tagNameArray.forEach(tagName => {
      const regExp = new RegExp(`<${tagName}>?`, `gm`);
      const regExp2 = new RegExp(`<\/${tagName}>?`, `gm`);
      htmlString = htmlString.replace(regExp, '').replace(regExp2, '');
    });
    return htmlString;
  }

  /**
   * in-Table「可調整欄寬」功能 (自動讀取/寫入 localStorage)
   */
  syncInTableColWidths(intable: InTableComponent, id: string, isSave: boolean) {
    if (isSave) {
      const pref = intable.getColWidthPref();
      localStorage.setItem(id, JSON.stringify(pref));
    } else {
      const data = localStorage.getItem(id);
      if (data) {
        const pref = JSON.parse(data);
        intable.setColWidthPref(pref);
      }
    }
  }

}
