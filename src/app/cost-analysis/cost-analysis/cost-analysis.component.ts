import { Component, OnInit } from '@angular/core';
import { AlertService } from '../../core/services/alert.service';
import { CostAnalysisService } from '../cost-analysis.service';

import { FormGroup, FormControl } from '@angular/forms';
import { AliasData, CostList, PageConfig } from '../cost-analysis';
import { Filter, Sort } from '../../core/models/filter';
import * as _ from 'lodash';
import { InTableConfig } from '@sysage/in-table';
import { AuthService } from 'src/app/core/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-cost-analysis',
  templateUrl: './cost-analysis.component.html',
  styleUrls: ['./cost-analysis.component.scss']
})
export class CostAnalysisComponent implements OnInit {

  inTableConfig = new InTableConfig;

  /** 目前的使用者 */
  get currentUserValue() {
    return this.authService.currentUserValue;
  }

  constructor(
    private api: CostAnalysisService,
    private alert: AlertService,
    private authService: AuthService,
    private translate: TranslateService,
  ) {
    /** in-table setting */
    this.inTableConfig.sitckyElemId = 'page-header';
  }

  /** in-table設定 */
  pageConfig = new PageConfig;

  /** loading */
  loading = false;
  /** list loading */
  cloudLoading = false;

  /** Cloud ID */
  cloudList: CostList[] = [];
  /** cloud name */
  cloudNameList: AliasData[] = [];
  /** payer id */
  uniqPayerId: CostList[] = [];

  /** 選擇條件 */
  chartFilter: {id: string, itemName: string}[] = [];
  /** 選項顯示列表 */
  chartFilterList: {id: string, itemName: string}[] = [];
  /** 下拉選單基礎設定 */
  filterConfig = {
    text: this.translate.instant('please select'),
    selectAllText: this.translate.instant('select all'),
    unSelectAllText: this.translate.instant('unselect all'),
    filterSelectAllText: this.translate.instant('select all filtered results'),
    filterUnSelectAllText: this.translate.instant('unselect all filtered results'),
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

  ngOnInit() {
    this.getList();
    // this.getCloudNmaeList();
  }

  /** 取得列表 */
  getList() {
    this.cloudLoading = true;
    this.cloudList = [];
    const filter = new Filter;
    filter.pageSize = -1;
    filter.sort['createDate'] = Sort.desc;
    this.api.getCostList(filter).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.cloudList = res.data !== null ? res.data : [];
        this.getCloudNmaeList();

        // 設定分頁內容
        this.pageConfig.totalItems = res.page ? res.page.dataCount : 0;
        this.pageConfig.itemsPerPage = res.page ? res.page.pageSize : 0;
        this.pageConfig.currentPage = res.page ? res.page.pageIndex : 0;
      }
      // this.cloudLoading = false;
    }, (err: any) => {
      this.cloudLoading = false;
      this.cloudList = [];
      this.alert.errorAlert(err);
    });
  }

  /** 取得cloud id與payer 關聯列表  */
  getCloudNmaeList() {
    const filter = new Filter;
    filter.pageSize = -1;
    filter.sort['updateTime'] = Sort.desc;
    this.api.getUserRights(filter).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.cloudNameList = res.data !== null ? res.data : [];
        // 加入payer別名
        this.cloudList.forEach(item => {
          const filter = this.cloudNameList.filter(name => name.payerId === item.payer);
          if (filter.length > 0) {
            item.nickName = filter[0].nickName + '(' + item.payer + ')';
          } else {
            item.nickName = '(' + item.payer + ')';
          }
        });
        // 只顯示cloudId
        let cloudId = this.cloudNameList.map(x => x.cloudId);
        // 去除重複
        cloudId = _.uniq(cloudId);
        // 去除已新增
        this.cloudList.forEach(exist => {
          cloudId = cloudId.filter(x => x !== exist.cloudId);
        });
        this.chartFilterList = [];
        cloudId.forEach(item => {
          const data = {
            id: item,
            itemName: item
          };
          this.chartFilterList.push(data);
        });
        this.chartFilterList = _.cloneDeep(this.chartFilterList);
        this.uniqCloudList();
        this.cloudLoading = false;
      }
    }, (err: any) => {
      this.cloudNameList = [];
      this.cloudLoading = false;
      this.alert.errorAlert(err);
    });
  }

  /** payer去除重複 */
  uniqCloudList() {
    this.uniqPayerId = [...new Map(this.cloudList.map(item => [item['payer'], item])).values()];
  }

  /** 新增Cloud ID */
  addId() {
    this.cloudLoading = true;
    const payer = this.cloudNameList.filter(x => x.cloudId === this.chartFilter[0].id);
    const data: {cloudId: string, payer: string} = {
      cloudId: this.chartFilter[0].id,
      payer: payer[0].payerId
    };
    this.api.addCost(data).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.chartFilter = [];
        this.getList();
        this.alert.successAlert(res.info.message);
      }
    }, (err: any) => {
      this.cloudLoading = false;
      this.cloudList = [];
      this.alert.errorAlert(err);
    });
  }

  /** 刪除 */
  delId(idx: number) {
    this.api.delCost(this.cloudList[idx].cloudId).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.getList();
        this.alert.successAlert(res.info.message);
      }
    }, (err: any) => {
      this.cloudList = [];
      this.alert.errorAlert(err);
    });
  }

  /** 是否符合中英數 */
   getValidator() {
    if (this.chartFilter.length > 0 && this.chartFilter[0].id) {
      return this.chartFilter[0].id.match(new RegExp('[^\u4e00-\u9fa5\\w-]+'));
    } else {
      return true;
    }
  }

  openFilter() {
    //
  }

  closeFilter() {
    //
  }

  /** 切換分頁 */
  pageChange(event: any) {
    const filter = new Filter;
    filter.pageSize = event.itemsPerPage;
    filter.pageIndex = event.currentPage;
    this.cloudLoading = true;
    this.cloudList = [];
    this.api.getProjectList(filter).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.cloudList = res.data !== null ? res.data : [];

        // 設定分頁內容
        this.pageConfig.totalItems = res.page ? res.page.dataCount : 0;
        this.pageConfig.itemsPerPage = res.page ? res.page.pageSize : 0;
        this.pageConfig.currentPage = res.page ? res.page.pageIndex : 0;
      }
      this.cloudLoading = false;
    }, (err: any) => {
      this.cloudLoading = false;
      this.cloudList = [];
      this.alert.errorAlert(err);
    });
  }

}
