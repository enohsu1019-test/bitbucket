import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { AliasService } from '../alias.service';
import { Alias, PageConfig } from '../alias';
import { InTableConfig } from '@sysage/in-table';
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';
import { Filter, Sort } from 'src/app/core/models/filter';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  inTableConfig = new InTableConfig;

  /** 目前的使用者 */
  get currentUserValue() {
    return this.authService.currentUserValue;
  }

  /** 登入角色資訊 */
  get loginRole() {
    return {
      // 品牌
      brand: this.currentUserValue?.role ? this.currentUserValue?.role.brand?.name : '',
      // 公司
      company: this.currentUserValue?.role ? this.currentUserValue?.role.company.nickCh : '',
    }
  }

  constructor(
    private api: AliasService,
    private alert: AlertService,
    private translate: TranslateService,
    private authService: AuthService,
  ) {
    /** in-table setting */
    this.inTableConfig.sitckyElemId = 'page-header';
  }

  // intable資料
  intableDatas: Alias[] = [];
  /** 設定聯絡人分頁參數 */
  pageConfig = new PageConfig;

  /** cloud id下拉選單 */
  cloudIdList: Alias[] = [];
  /** 需要被刪除別名資料 */
  deleteDatas: string[] = [];

  /** loading */
  loading = false;
  /** save loading */
  saveLoading = false;

  /** 選項顯示列表 */
  cloudIdDropdown: {id: string, itemName: string, alias: Alias, disabled: boolean}[] = [];
  /** 使用者選項顯示列表 */
  selectDropdown: {
    item: {
      id: string,
      itemName: string,
      alias: Alias,
      disabled: boolean
    }[]
  }[] = [];

  /** 下拉選單基礎設定 */
  filterConfig = {
    text: this.translate.instant('please select'),
    enableSearchFilter: true,
    singleSelection: true,
    badgeShowLimit: 1,
    maxHeight: 250,
    position: 'bottom',
    autoPosition: true,
    lazyLoading: false,
    noDataLabel: this.translate.instant('no data found'),
    classes: 'dropdown-icon dropdown-position',
  };

  /** 顯示cloud id名稱 */
  cloudIdName = '';

  ngOnInit(): void {
    this.getDataList();
    // cloud id顯示名稱
    switch (this.loginRole.brand) {
      case 'AWS':
        this.cloudIdName = 'Account ID';
        break;
      case 'Microsoft':
        this.cloudIdName = this.translate.instant('domain');
        break;
      default:
        this.cloudIdName = 'Cloud ID';
        break;
    }
  }

  /** 取得列表與下拉選單 */
  getDataList() {
    this.loading = true;
    this.cloudIdList = [];
    this.cloudIdDropdown = [];
    this.selectDropdown = [];
    const filter = new Filter;
    filter.pageSize = -1;
    filter.sort['updateTime'] = Sort.desc;
    this.api.getUserRights(filter).subscribe((res) => {
      if (res.info && res.info.success) {
        // 顯示下拉選單
        this.cloudIdList = res.data !== null ? res.data : [];
        this.cloudIdList.forEach(cloudId => {
          const data = {
            id: cloudId.cloudId,
            itemName: cloudId.cloudId,
            alias: cloudId,
            disabled: false
          };
          this.cloudIdDropdown.push(data);
        });
        this.cloudIdDropdown = _.cloneDeep(this.cloudIdDropdown);

        // 寫入dropdown
        let uniqCloudId = this.cloudIdList.filter(x => x.id !== '').map(item => item.cloudId);
        uniqCloudId = _.uniq(uniqCloudId);
        uniqCloudId.forEach(cloudId => {
          const selectData = {
            item: [{
              id: cloudId,
              itemName: cloudId,
              alias: this.cloudIdList.filter(item => item.cloudId === cloudId)[0],
              disabled: false
            }]
          };
          this.selectDropdown.push(selectData);
        });
        this.selectDropdown = _.cloneDeep(this.selectDropdown);
      }
      this.loading = false;
    }, (err: any) => {
      this.alert.errorAlert(err);
      this.loading = false;
    });
  }

  /** 新增別名資料 */
  addAliasUIData() {
    const aliasData = new Alias;
    const formData = {
      item: [{
        id: '',
        itemName: '',
        alias: aliasData,
        disabled: false
      }]
    }
    this.selectDropdown.splice(0, 0, formData);
    this.selectDropdown = _.cloneDeep(this.selectDropdown);
  }

  /**
   * 刪除別名資料
   * @param idx 第幾筆
   */
  delAlias(idx: number, data: {item: {id: string, itemName: string, alias: Alias, disabled: boolean}[]}) {
    // 如果是以新增的資料要記錄
    if (this.selectDropdown[idx].item[0].alias.id !== '') {
      this.deleteDatas.push(this.selectDropdown[idx].item[0].alias.id);
    }
    this.selectDropdown.splice(idx, 1);
    this.selectDropdown = _.cloneDeep(this.selectDropdown);
    this.cloudIdDropdown.forEach((item, idx) => {
      if (item.itemName === data.item[0].itemName) {
        item.disabled = false;
      }
    });
  }

  /** 儲存 */
  save() {
    this.saveLoading = true;
    // 篩選出需要新增或修改的資料
    const update: Alias[] = [];
    const isNew = this.selectDropdown.filter(x => x.item[0].alias.id === '' || x.item[0].alias.isNew);
    isNew.forEach(item => {
      update.push(item.item[0].alias);
    });
    const data = {
      update: update,
      delete: this.deleteDatas
    };

    this.api.updateAlias(data).subscribe((res) => {
      if (res.info && res.info.success) {
        this.alert.successAlert(res.info.message);
        this.deleteDatas = [];
        this.getDataList();
      }
      this.saveLoading = false;
    }, (err: any) => {
      this.alert.errorAlert(err);
      this.saveLoading = false;
    });
  }

  /** 檢查是否要disabled */
  checkDisabled() {
    let needDisabled = false;
    this.selectDropdown.forEach((data, dataIdx) => {
      // cloud id有無選擇
      if (data.item[0].itemName === '') {
        needDisabled = true;
      }
      // cloud id是否重複
      const filter = this.selectDropdown.filter((x, xIdx) => x.item[0].itemName === data.item[0].itemName && dataIdx !== xIdx);
      if (filter.length > 0) {
        needDisabled = true;
      }
    });
    return needDisabled;
  }

  /** 移除已選擇過的cloud id */
  filterCloudIdList() {
    this.cloudIdDropdown.forEach(filter => {
      let isFind = false;
      this.selectDropdown.forEach(item => {
        if (item.item[0].itemName === filter.itemName) {
          filter.disabled = true;
          isFind = true;
        }
      });
      if (!isFind) {
        filter.disabled = false;
      }
    });
    this.cloudIdDropdown = _.cloneDeep(this.cloudIdDropdown);
  }

  /**
   * cloud id是否重複選擇
   * @param idx 第幾筆
   */
  checkCloudId(idx: number) {
    let isExist = false;
    this.selectDropdown.forEach((item, itemIdx) => {
      if (idx !== itemIdx) {
        if (item.item[0].itemName === this.selectDropdown[idx].item[0].itemName) {
          isExist = true;
        }
      }
    });
    return isExist;
  }

  /**設定intable資料 */
  setIntableTableData() {
    this.pageConfig.totalItems = this.selectDropdown.length;
    this.pageConfig.itemsPerPage = this.pageConfig.itemsPerPage;
    this.intableDatas = [];
    const minData = (this.pageConfig.currentPage * this.pageConfig.itemsPerPage) - this.pageConfig.itemsPerPage + 1;
    const maxData = (this.pageConfig.currentPage * this.pageConfig.itemsPerPage);

    this.selectDropdown.forEach((aliasItem, aliasIndex) => {
      const num = aliasIndex + 1;

      if (num >= minData && num <= maxData) {
        this.intableDatas.push(aliasItem.item[aliasIndex].alias);
      }
    });
  }

}
