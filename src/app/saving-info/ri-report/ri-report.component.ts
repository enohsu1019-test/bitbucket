import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import * as _ from 'lodash';
import * as FileSaver from 'file-saver';
import {
  RiFormData, RiResponse, RiDetail, RiResSummary, AliasData, ServiceType,
  service, termInYear, paymentOption, lookBackPeriodInDays, offeringClass, sortOptions,
} from '../saving-info';
import { AlertService } from 'src/app/core/services/alert.service';
import { SavingInfoService } from '../saving-info.service';
import { InTableConfig } from '@sysage/in-table';
import { Filter, Sort } from 'src/app/core/models/filter';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-ri-report',
  templateUrl: './ri-report.component.html',
  styleUrls: ['./ri-report.component.scss']
})
export class RiReportComponent implements OnInit {
  // ri 表單
  riForm: FormGroup;
  riFormData: RiFormData = new RiFormData();

  // ri Response Summary
  riSummary: RiResSummary = new RiResSummary();

  // ri Response Data List
  riList: RiDetail[] = [];
  riTableDatas: RiDetail[] = [];
  riExportData: RiDetail[] = [];

  /** payerId, accountId下拉選單 */
  selectList: {
    view: {
      payerId: {
        id: string,
        itemName: string
      }[],
      accountId: {
        id: string,
        itemName: string
      }[]
    },
    select: {
      payerId: {
        id: string,
        itemName: string
      }[],
      accountId: {
        id: string,
        itemName: string
      }[]
    }
  } = {
    view: {
      payerId: [],
      accountId: []
    },
    select: {
      payerId: [],
      accountId: []
    }
  };

  /** 別名資料 */
  aliasData: AliasData[] = [];

  ui = {
    isLoading: false,
    isDownloading: false
  };

  /** payer id下拉選單基礎設定 */
  payerIdSettings = {
    text: this.translate.instant('please select'),
    enableSearchFilter: true,
    singleSelection: true,
    badgeShowLimit: 1,
    maxHeight: 250,
    position: 'bottom',
    autoPosition: false,
    noDataLabel: this.translate.instant('no data found'),
    classes: 'dropdown-icon dropdown-position',
  };

  // 下拉選單基礎設定
  settings = {
    text: this.translate.instant('please select'),
    selectAllText: this.translate.instant('select all'),
    unSelectAllText: this.translate.instant('unselect all'),
    filterSelectAllText: this.translate.instant('select all filtered results'),
    filterUnSelectAllText: this.translate.instant('unselect all filtered results'),
    enableSearchFilter: true,
    singleSelection: false,
    badgeShowLimit: 1,
    maxHeight: 250,
    position: 'bottom',
    autoPosition: false,
    noDataLabel: this.translate.instant('no data found'),
    classes: 'custom-dropdown dropdown-position'
  };

  /** 設定分頁參數 */
  pageConfig = {
    boundaryLinks: true,
    totalItems: 0,
    itemsPerPage: 10,
    currentPage: 1,
    maxSize: 10,
  };

  /** 設定排序參數 */
  sortBy = sortOptions[0];

  inTableConfig = new InTableConfig;

  get f() { return this.riForm.controls; }
  get service() { return service; }
  get termInYear() { return termInYear; }
  get offeringClass() { return offeringClass; }
  get paymentOption() { return paymentOption; }
  get lookBackPeriodInDays() { return lookBackPeriodInDays; }
  get sortOptions() { return sortOptions; }
  get ServiceType() { return ServiceType; }

  constructor(
    private fb: FormBuilder,
    private api: SavingInfoService,
    private alert: AlertService,
    private decimalPipe: DecimalPipe,
    private translate: TranslateService,
  ) {
    this.riForm = this.fb.group({
      payerId: [{ value: '', disabled: false }, Validators.required],
      accountIds: [{ value: [], disabled: false }, Validators.required],
      type: [{ value: this.riFormData.type, disabled: false }, Validators.required],
      service: [{ value: this.riFormData.service, disabled: false }, Validators.required],
      termInYear: [{ value: this.riFormData.termInYear, disabled: false }, Validators.required],
      paymentOption: [{ value: this.riFormData.paymentOption, disabled: false }, Validators.required],
      lookBackPeriodInDays: [{ value: this.riFormData.lookBackPeriodInDays, disabled: false }, Validators.required],
      offeringClass: [{ value: this.riFormData.offeringClass, disabled: false }],
    });

    /** in-table setting */
    this.inTableConfig.rowLinkKey = 'routerlink';
    this.inTableConfig.queryParamsKey = 'queryParams';
    this.inTableConfig.sitckyElemId = 'page-header';
    this.inTableConfig.enableResizeColWidth = true;
    this.inTableConfig.showBorder = true;
    this.inTableConfig.showAllSubRowOnlyIfMoreThanOne = false;
  }

  ngOnInit(): void {
    this.getPayerId();
  }

  /** 取得payer id列表 */
  getPayerId() {
    this.ui.isLoading = true;
    this.selectList.view.payerId = [];
    this.selectList.select.payerId = [];
    const filter = new Filter;
    filter.pageSize = -1;
    filter.sort['updateTime'] = Sort.desc;
    this.api.getUserRights(filter).subscribe((res) => {
      if (res && res.info && res.info.success) {
        this.aliasData = res.data !== null ? res.data : [];
        this.aliasData.forEach((item) => {
          const dataIndex = {
            id: item.payerId,
            itemName: item.nickName + '(' + item.payerId + ')'
          };
          this.selectList.view.payerId.push(dataIndex);
        });

        // 去除重複與空白
        let result: {id: string, itemName: string}[] = [];
        this.selectList.view.payerId.forEach(item => {
          if (result.length === 0) {
            result.push(item);
          } else {
            const filterData = result.filter(filter => filter.id === item.id);
            if (filterData.length === 0 && item.id !== '') {
              result.push(item);
            }
          }
        })
        this.selectList.view.payerId = result;
        this.selectList.select.payerId = result.length !== 0 ? [result[0]] : [];
        this.f['payerId'].setValue(this.selectList.select.payerId.map(item => item.id)[0]);
        this.getAccountId(true);
      }
      this.ui.isLoading = false;
    }, (err: any) => {
      this.ui.isLoading = false;
      this.selectList.view.payerId = [];
      this.selectList.select.payerId = [];
      this.alert.errorAlert(err);
    });
  }

  /**
   * 取得account id
   *
   * @param isFirst 是否為第一次載入畫面
   */
  getAccountId(isFirst: boolean) {
    this.selectList.view.accountId = [];
    this.selectList.select.accountId = [];
    const filterData = this.aliasData.filter(ori => ori.payerId === this.selectList.select.payerId[0].id);
    if (filterData.length !== 0) {
      filterData.forEach(filterItem => {
        const data = {
          id: filterItem.cloudId,
          itemName: filterItem.name ? filterItem.name + '(' + filterItem.cloudId + ')' : filterItem.cloudId
        };
        this.selectList.view.accountId.push(data);
        if (isFirst) {
          this.selectList.select.accountId.push(data);
        }
      });
      if (isFirst) {
        this.f['payerId'].setValue(this.selectList.select.payerId.map(item => item.id)[0]);
        this.f['accountIds'].setValue(this.selectList.select.accountId.map(item => item.id));
        this.searchRi();
      }
    };
  }

  /** 選擇不同的payer id */
  payerChange() {
    this.selectList.view.accountId = [];
    this.selectList.select.accountId = [];
    this.getAccountId(false);
  }

  searchRi() {
    this.ui.isLoading = true;
    this.riForm.disable();
    this.riTableDatas = [];

    // 只有 EC2 需要提供 offeringClass
    const data = { ... this.riForm.value };
    if (this.f['service'].value !== ServiceType.EC2) {
      delete data.offeringClass;
    }
    this.getRecommendation(data);
  }

  getRecommendation(data: RiFormData) {
    this.api.postRecommendation(data).subscribe((res) => {
      if (res.info && res.info.success) {
        this.riSummary = res.data.summary;
        this.riExportData = res.data.export;
        this.riList = res.data.detail?.map((listItem: RiDetail) => {
          const newItem = {
            ...listItem,
            instanceDetail: this.getServiceInstanceDetail(listItem),
            instanceType: this.getServiceInstanceType(listItem)
          };
          return newItem;
        });
        this.setIntableTableData();

        this.ui.isLoading = false;
        this.riForm.enable();
      } else {
        this.alert.errorAlert(res.info.message);
        this.ui.isLoading = false;
      }
    }, (err: any) => {
      this.alert.errorAlert(err);
      this.ui.isLoading = false;
      this.riForm.enable();
    });
  }

  decimalTransform(value: string | number, digit: string) {
    const isNumber = !isNaN(Number(value));
    const newVal = isNumber ? this.decimalPipe.transform(value, digit) : value;
    return newVal;
  }

  /** 下載 excel */
  excelDownLoad() {
    this.ui.isDownloading = true;

    const data = {
      type: 'RI',
      service: this.f['service'].value,
      exportData: this.riExportData
    };

    this.api.postRecommendationExcel(data).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.ui.isDownloading = false;
        if (res.blob) {
          // FileSaver.saveAs(res.blob, res.filename || 'export.xls');
          FileSaver.saveAs(res.blob, res.filename ? res.filename :  'export.csv');
        }
      } else {
        this.ui.isDownloading = false;
        this.alert.errorAlert('Api.EXCEL ERROR： ' + res.info.message);
      }
    }, (err: any) => {
      this.ui.isDownloading = false;
      this.alert.errorAlert('Api.EXCEL ERROR： ' + err.message);
    });
  }

  /** 選擇不同的account id時觸發 */
  accountChange() {
    const accountIds = this.selectList.select.accountId.map(item => item.id);
    const result = _.isEqual(accountIds, this.f['accountIds'].value);
    if (!result) {
      this.f['payerId'].setValue(this.selectList.select.payerId.map(item => item.id)[0]);
      this.f['accountIds'].setValue(this.selectList.select.accountId.map(item => item.id));
      this.searchRi();
    }
  }

  /** 設定intable資料 */
  setIntableTableData() {
    this.riTableDatas = [];

    if (!this.riList || this.riList?.length === 0 || this.riList === null) {
      this.pageConfig.totalItems = this.riList?.length ?? 0;
      return;
    }
    this.pageConfig.totalItems = this.riList.length;
    this.pageConfig.itemsPerPage = this.pageConfig.itemsPerPage;

    const minData = (this.pageConfig.currentPage * this.pageConfig.itemsPerPage) - this.pageConfig.itemsPerPage + 1;
    const maxData = (this.pageConfig.currentPage * this.pageConfig.itemsPerPage);

    const sortedList = this.sortTableData();

    sortedList.forEach((riListItem: any, riList: any) => {
      const num = riList + 1;
      if (num >= minData && num <= maxData) {
        this.riTableDatas.push(riListItem);
      }
    });
  }

  /** 排序 TableData */
  sortTableData() {
    const isStringType = (this.sortBy === 'accountId' || this.sortBy === 'instanceType'); // 型別為 string，其他為 number

    let sortedList = this.riList.map((item: any) => {
      return {
        ...item,
        [this.sortBy]: isStringType ? item[this.sortBy] : Number(item[this.sortBy]) // 轉為 number 型別比大小
      };
    });

    isStringType ?
      sortedList.sort((a: any, b: any) => ((a[this.sortBy] > b[this.sortBy]) ? 1 : ((b[this.sortBy] > a[this.sortBy])) ? -1 : 0)) :
      sortedList.sort((a: any, b: any) => b[this.sortBy] - a[this.sortBy]);

    sortedList = sortedList.map((listItem: RiDetail) => {
      const newItem = {
        accountId: listItem.accountId,
        expectedRIUtilization: this.decimalTransform(listItem.expectedRIUtilization, '1.0-2'),
        upfrontCost: this.decimalTransform(listItem.upfrontCost, '1.2-2'),
        recurringMonthlyCost: this.decimalTransform(listItem.recurringMonthlyCost, '1.2-2'),
        estimatedMonthlySavingsAmount: this.decimalTransform(listItem.estimatedMonthlySavingsAmount, '1.2-2'),
        recommendedNumberOfInstancesToPurchase: this.decimalTransform(listItem.recommendedNumberOfInstancesToPurchase, '1.0-2'),
        recommendedNormalizedUnitsToPurchase: this.decimalTransform(listItem.recommendedNormalizedUnitsToPurchase, '1.0-2'),
        instanceDetail: listItem.instanceDetail,
        instanceType: listItem.instanceType
      };
      return newItem;
    });

    return sortedList;
  }

  /** 排序
   * @param opt 所選排序
   */
  sort(opt: string) {
    this.sortBy = opt;
    this.pageConfig.currentPage = 1;
    this.setIntableTableData();
  }

  /** 是否要用到「大小可變」按鈕 (sizeFlexEligible)
   * 需要: EC2, RDS
   */
  isSizeFlexEligible(): boolean {
    const serviceValue = this.f['service'].value;
    const EC2 = ServiceType.EC2;
    const RDS = ServiceType.RDS;
    if (serviceValue === EC2 || serviceValue === RDS) {
      return true;
    } else {
      return false;
    }
  }

  /** 個體 or 節點
   * 個體: EC2, RDS, OS
   * 節點: Redshift, ElastiCache
   */
  isInstance(): boolean {
    const serviceValue = this.f['service'].value;
    const Redshift = ServiceType.Redshift;
    const ElastiCache = ServiceType.ElastiCache;
    if (serviceValue === Redshift || serviceValue === ElastiCache) {
      return false;
    } else {
      return true;
    }
  }

  /** 不同 service -> 不同 InstanceDetail Name */
  getServiceInstanceDetail(item: any) {
    switch (this.f['service'].value) {
      case ServiceType.EC2:
        return item.ec2InstanceDetail;
      case ServiceType.RDS:
        return item.rdsInstanceDetail;
      case ServiceType.Redshift:
        return item.redshiftInstanceDetail;
      case ServiceType.ElastiCache:
        return item.elastiCacheInstanceDetail;
      case ServiceType.OS:
        return item.esInstanceDetail;
    }
  }

  /** 不同 service -> 個體 or 節點 -> 不同 instanceType
   * 個體: EC2, RDS, OS -> 'instanceType'
   * 節點: Redshift, ElastiCache -> 'nodeType'
   * @param item RiDetail
  */
  getServiceInstanceType(item: RiDetail) {
    const instance = this.getServiceInstanceDetail(item);
    if (this.isInstance()) {
      return instance?.instanceType;
    } else {
      return instance?.nodeType;
    }
  }

  /** return 所選 lookBackPeriodInDays 縮寫 */
  getLookBackDaysName() {
    const data = this.lookBackPeriodInDays.find(item => item.value === this.f['lookBackPeriodInDays'].value);
    // return data?.value;
    return data ? data.value : '';
  }

  /** return 所選 service 縮寫 */
  getServiceValue() {
    const data = this.service.find(item => item.value === this.f['service'].value);
    return data?.shortName;
  }
}
