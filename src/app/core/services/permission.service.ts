import { Injectable } from '@angular/core';
import { Permission } from '../models/permission';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import * as _ from 'lodash';
import { ResponseData } from '../models/response-data';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private permissionSubject: BehaviorSubject<Permission[] | null>;
  public permission: Observable<Permission[] | null>;

  /** api 回傳的 all permission */
  allPermission!: { name: string, ruleItems: Permission[] }[];
  /** 所有的 permission */
  permissions: Permission[] = [];
  /** 所有 permission 轉成扁平 key-value object */
  flat: { [key: string]: Permission } = {};

  constructor(
    private api: ApiService,
  ) {
    this.permissionSubject = new BehaviorSubject<Permission[] | null>(JSON.parse(localStorage.getItem('permissionData')!));
    this.permission = this.permissionSubject.asObservable();

    this.permissions = JSON.parse(localStorage.getItem('permissionData')!);
    this.flat = JSON.parse(localStorage.getItem('permissionFlat')!);
  }

  /** API: 取得 permission */
  getPermissionApi(): Observable<ResponseData> {
    return this.api.get(environment['gateway'].iam + 'iam');
  }

  getPermissionRule() {
    console.log('getPermissionRule');
    this.permissions = [];

    this.getPermissionApi().subscribe({
      next: (res) => {
        console.log('[getPermissionRule] get iam :', res.data);
        if (res?.data?.rules) {
          console.log('[getPermissionRule] get permission :', res.data.rules);

          // this.allPermission 為 原始 api 取回的資料
          // this.permissions   為 整理過的資料
          this.allPermission = _.cloneDeep(res.data.rules);
          this.allPermission.forEach(item => {
            item.ruleItems.forEach(rules => {
              rules.groupName = item.name;
              this.permissions.push(rules)
            });
          })
          // this.flat  為 key-value object
          this.flat = this.getFlat(this.permissions);

          localStorage.setItem('permissionData', JSON.stringify(this.permissions));
          localStorage.setItem('permissionFlat', JSON.stringify(this.flat));

          console.log('permissions data', this.permissions);
          console.log('permissions flat', this.flat);

          this.permissionSubject.next(this.permissions);
        }
      },
      error: (err) => {
        console.error('[getPermissionRule] get permission fail: ', err);
      }
    });
  }

  /** 把 permissions 轉成扁平 key-value object */
  getFlat(permissions: Permission[]) {
    const flat: { [key: string]: Permission } = {};
    const data = _.cloneDeep(permissions);
    data?.forEach(item => {
      const name = item.id.split('::')[2];
      const key = `${item.groupName}.${name}`;
      // const name = item.id.split('::')[2];
      // const key = item.id;
      flat[key] = item;
    });

    return flat;
  }

  /** 把 permissions 轉成階層 array */
  getTree(dataList: Permission[]) {
    const treeRef = _.cloneDeep(dataList);
    const tree = treeProcess(treeRef);

    function replacePermissionById(config: (string | Permission)[], index: number, id: string) {
      const foundIdx = treeRef.findIndex(p => p.id === id);
      // parent 會回傳所有 children，但若 children 沒權限，不會回傳該 children 物件
      if (foundIdx > -1) {
        const found = treeRef[foundIdx];
        found.children = treeProcess(found.children);
        treeRef.splice(foundIdx, 1);
        config[index] = found;
      }
    }

    function treeProcess(config: (string | Permission)[]) {
      config.forEach((item: string | Permission, index) => {
        if (typeof item === 'string') {
          replacePermissionById(config, index, item);
        } else {
          item.children?.forEach((child, idx) => {
            if (typeof child === 'string') {
              replacePermissionById(item.children, idx, child);
            }
          });
        }
      });
      return config;
    }
    return tree;
  }


  /** 取得 UI Permission
   * @param component 可輸入想找的模組或關鍵字
   */
  public getPermission(component?: string): { [key: string]: Permission } {
    let permissions: Permission[] = this.permissions?.filter(item => item.groupName === component);
    return this.getFlat(permissions);
  }

}
