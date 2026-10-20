import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AliasData, RightsizingData, RightsizingExcel } from '../saving-info';
import moment from 'moment';
import * as FileSaver from 'file-saver';
import { AlertService } from 'src/app/core/services/alert.service';
import { SavingInfoService } from '../saving-info.service';
import { InTableConfig } from '@sysage/in-table';
import { Filter, Sort } from 'src/app/core/models/filter';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-size-suggest',
  templateUrl: './size-suggest.component.html',
  styleUrls: ['./size-suggest.component.scss']
})
export class SizeSuggestComponent implements OnInit {

  inTableConfig = new InTableConfig;

  constructor(
    private api: SavingInfoService,
    private alert: AlertService,
    private translate: TranslateService,
  ) {
    /** in-table setting */
    this.inTableConfig.sitckyElemId = 'page-header';
  }

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

  // 別名資料
  aliasData: AliasData[] = [];
  // 預估每月節省
  estimatedMonthlySavings ='0';
  // 預估可省下的費用(%)
  estimatedSavingsPercentage ='0';

  // excel資料
  excelDatas: any[] = [];

  // intable資料
  intableDatas: RightsizingData[] = [];


  // 優化機會
  optimizationOpportunities = '0';

  /** 設定分頁參數 */
  pageConfig = {
    totalItems: 0,
    itemsPerPage: 10,
    currentPage: 1,
  };

  profileForm = new FormGroup({
    target: new FormControl('SAME_INSTANCE_FAMILY'),
    Modify: new FormControl(true),
    Terminate: new FormControl(true),
    advancedOptions: new FormControl(true)

  });


  // rightsizing 資料
  rightsizing: RightsizingData[] = []

  // region 資料
  regionDatas: { id: string, itemName: string }[] = [];
  regionViews: { id: string, itemName: string }[] = [];



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
    classes: 'dropdown-icon dropdown-position',
  };

  // 標籤下拉選單
  tagDatas: { id: string, itemName: string, group: string }[] = [];
  tagViews: { id: string, itemName: string, group: string }[] = [];

  // tag下拉選單設定
  tagSettings = {
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
    groupBy: 'group',
    classes: 'dropdown-icon dropdown-position',
  };

  // ui狀態
  ui = {
    isLoading: true,
    isData: false,
    dropdownExcel: false,
    isLoadRegion: false,
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
        this.getAWSFilter();
      }
    };
  }

  /** 選擇不同的payer id */
  payerChange() {
    this.selectList.view.accountId = [];
    this.selectList.select.accountId = [];
    this.getAccountId(false);
  }

  // 下載excel
  excelDownLoad() {
    this.ui.dropdownExcel = true;
    let data = {
      type: 'Rightsizing',
      exportData: this.excelDatas
    }
    this.api.postRecommendationExcel(data).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.ui.dropdownExcel = false;
        if (res.blob) {
          // FileSaver.saveAs(res.blob, res.filename || 'export.xls');
          FileSaver.saveAs(res.blob, res.filename ? res.filename :  'export.xls');
        }
      } else {
        this.ui.dropdownExcel = false;
        this.alert.errorAlert('Api.EXCEL ERROR： ' + res.info.message);
      }
    }, (err: any) => {
      this.ui.dropdownExcel = false;
      this.alert.errorAlert('Api.EXCEL ERROR： ' + err.message);
    });
  }

  // 千分位符號
  formatCurrency(money: string): string {
    if (money === '-') {
      return money;
    }
    const parts = money.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  // ＡＷＳ篩選資料
  getAWSFilter() {
    this.ui.isLoadRegion = true;
    const startDate = moment().day(-14).format('YYYY-MM-DD');
    const endDate = moment().format('YYYY-MM-DD');
    const accountIds = this.setAccountId(this.selectList.select.accountId);
    const data = {
      payerId: this.selectList.select.payerId[0].id,
      accountIds: accountIds,
      dataType: ['REGION', 'TAG'],
      startDate: startDate,
      endDate: endDate
    }

    this.api.postAWSFilter(data).subscribe(
      (res) => {
        if (res.info && res.info.success) {
          this.regionViews = [];
          this.regionDatas = []
          this.regionViews = this.hanldeRegionData(res.data.region);
          this.regionDatas = this.hanldeRegionData(res.data.region);

          this.tagViews = this.setTagDropdownData(res.data.tag);
          this.tagDatas = this.setTagDropdownData(res.data.tag);
          this.getRightsizingAPI()
          this.ui.isLoadRegion = false;
        } else {
          this.alert.errorAlert(res.info.message);
          this.ui.isLoadRegion = false;
        }
      },
      (err: any) => {
        this.alert.errorAlert(err);
        this.ui.isLoadRegion = false;
      },
    );
  }

  // 取得Rightsizing 資料API
  getRightsizingAPI() {
    this.ui.isLoading = true;
    let accountIds: string[] = [];
    let regions: string[] = [];
    let tags: any = {};
    let targetArray: string[] = [];
    this.intableDatas = [];
    this.pageConfig.totalItems = 0;
    this.ui.isData = false;
    if(this.profileForm.controls['Modify'].value) {
      targetArray.push('Modify');
    }

    if(this.profileForm.controls['Terminate'].value) {
      targetArray.push('Terminate');
    }

    accountIds = this.setAccountId(this.selectList.select.accountId);
    regions = this.setRegionDropdownData(this.regionDatas);
    tags = this.setTagCallApiData();

    let data = {
      payerId: this.selectList.select.payerId[0].id,
      accountIds: accountIds,
      type: 'Rightsizing',
      target: this.profileForm.controls['target'].value,
      findingTypes: targetArray,
      advancedOptions: this.profileForm.controls['advancedOptions'].value === true? 'true': 'false',
      regions: regions,
      tags: tags,
    }

    this.api.postRecommendation(data).subscribe(
      (res) => {
        if (res.info && res.info.success) {
          if(res.data.summary) {
            const summaryIndex = res.data.summary;
            this.optimizationOpportunities = summaryIndex.optimizationOpportunities;
            this.estimatedMonthlySavings = String(this.roundNumber(summaryIndex.estimatedMonthlySavings, 2));
            this.estimatedSavingsPercentage = String(this.roundNumber(summaryIndex.estimatedSavings, 2));
            this.rightsizing = this.setRightsizingData(res.data.detail);
            this.excelDatas = res.data.export;
            this.setIntableTableData();
          } else {
            this.optimizationOpportunities = '0';
            this.estimatedMonthlySavings = '0';
            this.estimatedSavingsPercentage = '0';
            this.ui.isData = true;
          }

          this.ui.isLoading = false;
        } else {
          this.ui.isLoading = false;
        }
      },
      (err: any) => {
        this.alert.errorAlert(err);
        this.ui.isLoading = false;
      },
    );
  }

  // 處理區域資料
  hanldeRegionData(regionDatas: string[]): { id: string, itemName: string }[] {
    let results: { id: string, itemName: string }[] = [];
    regionDatas.forEach((item) => {
      let dataIndex = {
        id: item,
        itemName: item
      };
      results.push(dataIndex);
    })

    return results;
  }



  // 四捨五入
  roundNumber(num: number, scale: number): number {
    if (`${num}`.indexOf("e") === -1) {
      return +(Math.round(+(num + "e+" + scale)) + "e-" + scale);
    } else {
      const arr = `${num}`.split("e");
      const sig = (+arr[1] + scale > 0) ? "+" : "";
      return +(Math.round(+(+arr[0] + "e" + sig + (+arr[1] + scale))) + "e-" + scale);
    }
  }

  // 下拉選單accountId轉乘呼叫ＡＰＩ所需的資料
  setAccountId(accountIds: { id: string, itemName: string }[]): string[] {
    const results: string[] = [];

    accountIds.forEach((item) => {
      results.push(item.id);
    });
    return results;
  }

  /**設定intable資料 */
  setIntableTableData() {
    this.intableDatas = [];
    if (this.rightsizing.length !== 0) {
      this.pageConfig.totalItems = this.rightsizing.length
      this.pageConfig.itemsPerPage = this.pageConfig.itemsPerPage;

      const minData = (this.pageConfig.currentPage * this.pageConfig.itemsPerPage) - this.pageConfig.itemsPerPage + 1;
      const maxData = (this.pageConfig.currentPage * this.pageConfig.itemsPerPage);

      this.rightsizing.forEach((rightsizingItem, rightsizing) => {
        const num = rightsizing + 1;

        if (num >= minData && num <= maxData) {
          this.intableDatas.push(rightsizingItem);
        }
      });
    }
  }
  // 設定區域資料
  setRegionDropdownData(regions: any): string[] {
    let results: string[] = [];
    regions.forEach((item: any) => {
      results.push(item.id);
    });
    return results;
  }

  // 設定Rightsizing資料
  setRightsizingData(detail:any) : RightsizingData[] {
    let results: RightsizingData[] = [];

    detail.forEach((item: any) => {
      let index = new RightsizingData();
      index = item;
      index.CPU = String(this.roundNumber(item.CPU, 2));
      index.estimatedSavings = String(this.roundNumber(item.estimatedSavings, 2));
      results.push(index);
    });
    return results;
  }

  // 組成標籤呼叫ＡＰＩ資料
  setTagCallApiData(): string[] {
    let results: string[] = [];
    this.tagDatas.forEach((tagItem) => {
      let index = results.indexOf(tagItem.id);
      if(index === -1) {
        results.push(tagItem.id);
      }

    });

    return results;
  }

  //組合標籤下拉選單資料
  setTagDropdownData(values: any): any {
    const arrayIndex = ['aws:createdBy', 'user:Application' ,'user:CreateBy', 'user:CreatedBy', 'user:Environment', 'user:Name', 'user:Project', 'user:Stack'];
    const results: any = [];

    arrayIndex.forEach((item) => {
      if (values[item] && values[item].length >= 1) {
        values[item].forEach((valueItem: string) => {
          results.push({ id:item +':' + valueItem, itemName:item +':' + valueItem, group: item });
        });
      }

    });
    return results;
  }
}
