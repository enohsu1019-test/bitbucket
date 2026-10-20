import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import * as FileSaver from 'file-saver';
import { AliasData, SavingPlanExcel, SavingPlansData } from '../saving-info';
import moment from 'moment';
import { AlertService } from 'src/app/core/services/alert.service';
import { SavingInfoService } from '../saving-info.service';
import { InTableConfig } from '@sysage/in-table';
import { Filter, Sort } from 'src/app/core/models/filter';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-saving-plan',
  templateUrl: './saving-plan.component.html',
  styleUrls: ['./saving-plan.component.scss']
})
export class SavingPlanComponent implements OnInit {

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
  // 依據過去天數
  basedOnThePastDay = '';
  // 目前每月支出
  currentSpending = '';
  // 目前每月支出小時
  currentSpendingHour = 0;
  // 預估每月節省
  estimatedSavings = '';
  // 預估每月節省小時
  estimatedSavingsHour = 0;
  // 預估每月支出
  estimatedSpending = '';
  // 預估每月支出小時
  estimatedSpendingHour = 0;
  // 節省幅度(%)
  estimatedSavingsPercentage = 0;

  // excel資料
  excelDatas: SavingPlanExcel[] = [];

  // 每小時總承諾
  hourlyCommitmentToPurchase = 0;

  // 每小時保留的隨需費用
  hourlyLeaveOnDemandSpend = 0;

  // intable資料
  intableDatas: SavingPlansData[] = [];

  profileForm = new FormGroup({
    savingsPlans: new FormControl('COMPUTE_SP'),
    recommendedLevel: new FormGroup({
      termInYear: new FormControl('ONE_YEAR'),
      paymentOption: new FormControl('ALL_UPFRONT'),
      LookBackPeriodInDays: new FormControl('SEVEN_DAYS')
    }),
  });

  /** 設定分頁參數 */
  pageConfig = {
    totalItems: 0,
    itemsPerPage: 10,
    currentPage: 1,
  };
  // savingPlans 資料
  savingPlans: SavingPlansData[] = [];

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

  // 建議購買數量
  totalRecommendationCount = 0
  // 選擇幾年
  termInYear = '';
  // ui狀態設定
  ui = {
    isLoading: false,
    isData: false,
    dropdownExcel: false,
  }
  // 更新時間
  updateTime = '上次更新日期2022年2月14日 05:14:03 UTC';

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
        this.getSavingPlanAPI();
      }
    };
  }

  /** 選擇不同的payer id */
  payerChange() {
    this.selectList.view.accountId = [];
    this.selectList.select.accountId = [];
    this.getAccountId(false);
  }

  // 下載Ｅxcel
  excelDownLoad() {
    this.ui.dropdownExcel = true;
    let data = {
      type: 'SavingPlan',
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

  getSavingPlanAPI() {
    this.ui.isLoading = true;
    this.ui.isData = false;
    this.intableDatas = [];
    const termInYear = <FormControl>this.profileForm.get('recommendedLevel.termInYear');
    const paymentOption = <FormControl>this.profileForm.get('recommendedLevel.paymentOption');
    const LookBackPeriodInDays = <FormControl>this.profileForm.get('recommendedLevel.LookBackPeriodInDays');
    this.termInYear = termInYear.value;
    this.basedOnThePastDay = LookBackPeriodInDays.value
    let accountIds: string[] = [];
    this.savingPlans = [];

    accountIds = this.setAccountId(this.selectList.select.accountId);

    let data = {
      payerId: this.selectList.select.payerId[0].id,
      accountIds: accountIds,
      type: 'SavingPlan',
      savingsPlansType: this.profileForm.controls['savingsPlans'].value,
      termInYear: termInYear.value,
      paymentOption: paymentOption.value,
      lookBackPeriodInDays: LookBackPeriodInDays.value
    }
    this.api.postRecommendation(data).subscribe(
      (res) => {
        if (res.info && res.info.success) {
          if (res.data.summary) {
            const summaryIndex = res.data.summary;
            this.currentSpending = this.formatCurrency(String(this.roundNumber(summaryIndex.currentMonthlyOnDemandSpend, 2)));
            this.currentSpendingHour = this.roundNumber(summaryIndex.currentHourlyOnDemandSpend, 2);
            this.estimatedSpending = this.formatCurrency(String(this.roundNumber(summaryIndex.estimatedMonthlySpend, 2)));
            this.estimatedSpendingHour = this.roundNumber(summaryIndex.estimatedHourlySpend, 2);
            this.estimatedSavings = this.formatCurrency(String(this.roundNumber(summaryIndex.estimatedMonthlySavingsAmount, 2)));
            this.estimatedSavingsHour = this.roundNumber(summaryIndex.estimatedHourlySavingsAmount, 2);
            this.totalRecommendationCount = summaryIndex.totalRecommendationCount;
            this.hourlyCommitmentToPurchase = summaryIndex.hourlyCommitmentToPurchase;
            this.estimatedSavingsPercentage = this.roundNumber(summaryIndex.estimatedSavingsPercentage, 0);
            this.hourlyLeaveOnDemandSpend = this.roundNumber(summaryIndex.hourlyLeaveOnDemandSpend, 2);


            this.updateTime = moment(res.data.recommendationDate).format('上次更新日期YYYY年MM月DD日 hh:mm:ss UTC');
            this.savingPlans = this.setSavingPlansData(res.data.detail);

            this.excelDatas = res.data.export;

            this.setIntableTableData();
          } else {
            this.ui.isData = true;
            this.currentSpending = '0';
            this.currentSpendingHour = 0;
            this.estimatedSpending = '0';
            this.estimatedSpendingHour = 0;
            this.estimatedSavings = '0';
            this.estimatedSavingsHour = 0;
            this.totalRecommendationCount = 0;
            this.hourlyCommitmentToPurchase = 0;
            this.estimatedSavingsPercentage = 0;
            this.hourlyLeaveOnDemandSpend = 0;
          }



          this.ui.isLoading = false;
        } else {
          this.alert.errorAlert(res.info.message);
          this.ui.isLoading = false;
        }
      },
      (err: any) => {
        this.alert.errorAlert(err);
        this.ui.isLoading = false;
      },
    );

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
    if (this.savingPlans.length !== 0) {
      this.pageConfig.totalItems = this.savingPlans.length
      this.pageConfig.itemsPerPage = this.pageConfig.itemsPerPage;

      const minData = (this.pageConfig.currentPage * this.pageConfig.itemsPerPage) - this.pageConfig.itemsPerPage + 1;
      const maxData = (this.pageConfig.currentPage * this.pageConfig.itemsPerPage);

      this.savingPlans.forEach((savingPlansItem, savingPlans) => {
        const num = savingPlans + 1;

        if (num >= minData && num <= maxData) {
          this.intableDatas.push(savingPlansItem);
        }
      });
    }
  }


  // 設定savingPlans資料
  setSavingPlansData(detail:any) : SavingPlansData[] {
    let results: SavingPlansData[] = [];

    detail.forEach((item: any) => {
      let index = new SavingPlansData();
      index = item;
      index.estimatedHourlySavingsAmount = String(this.roundNumber(item.estimatedHourlySavingsAmount, 2));
      index.estimatedSavingsPercentage = String(this.roundNumber(item.estimatedSavingsPercentage, 0));
      results.push(index);
    });
    return results;
  }


}
