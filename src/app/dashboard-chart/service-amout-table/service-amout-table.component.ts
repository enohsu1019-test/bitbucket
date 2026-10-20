import { Component, OnInit } from '@angular/core';
import { Filter, Comparator, Sort } from '../../core/models/filter';
import { DashboardService } from '../dashboard.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { AliasData, AmountTable, Tag } from '../dashboard';
import { AuthService } from 'src/app/core/services/auth.service';
import moment from 'moment';
import * as FileSaver from 'file-saver';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-service-amout-table',
  templateUrl: './service-amout-table.component.html',
  styleUrls: ['./service-amout-table.component.scss']
})
export class ServiceAmoutTableComponent implements OnInit {
  brandID = '';
  nameTitle = '';

  /** 當月未出帳總金額 */
  amountTotal = 0;

  /** accountIdTop3 */
  accountIdTotals: { accountId: string, values: number }[] = [];
  /** 月份 */
  titleMonth = '';
  /** 年份 */
  titleYear = '';
  /** Excel下載狀態 */
  excelStatus = false;

  /** 為了避免一些非同步的問題，在子 component的api執行完時，才執行 dashboard component程式。 */
  loadingFinish = false;

  /** 目前的使用者身份 */
  get userIdentityType() {
    return this.authService.currentUserValue?.role?.identityType;
  }

  constructor(
    private alert: AlertService,
    private api: DashboardService,
    private authService: AuthService,
    private translate: TranslateService,
  ) {

  }

  /** 別名資料 */
  aliasData: AliasData[] = [];

  /** 服務下拉選單 */
  dropdownDatas: { id: string, itemName: string }[] = [];
  selectedItems: { id: string, itemName: string }[] = [];

  /** 收費類型下拉選單 */
  chargeTypeDatas: { id: string, itemName: string }[] = [];
  chargeTypeViews: { id: string, itemName: string }[] = [];

  /** 標籤下拉選單 */
  tagDatas: { id: string, itemName: string}[] = [];
  tagViews: { id: string, itemName: string}[] = [];

  /** 原始標籤資料 */
  origTagData: {[key: string]: Tag} = {};

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

  /** 下拉選單基礎設定 */
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

  /** tag下拉選單設定 */
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
    classes: 'dropdown-icon dropdown-position',
  };

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

  /** 明細欄位名稱 */
  displayedColumns: string[] = [];

  ui = {
    isLoading: false, // 遮罩
    isError: false,
    isFirstCall: false,
  };
  /** 錯誤訊息 */
  errorMessage = '';
  /** 未出帳資料 */
  chartDatas = new AmountTable;
  /** 儀表板資料 */
  dashboardDatasets: any[] = [];
  /** dashboard日期 */
  dashboardDate: string[] = [];
  /** 儀表板資料選項 */
  options = {};

  /** 明細 */
  tableDatas: any[] = [];
  /** 明細日期 */
  dates: string[] = [];

  ngOnInit() {
    const usage: any[] = [];
    usage.push({ id: 'Usage', itemName: 'Usage' });
    this.chargeTypeDatas = usage;

    this.titleMonth = moment().format('M');
    this.titleYear = moment().format('YYYY');
    this.getPayerId();

    // if (this.data.loginData.roles.length === 1) {
    //   if (this.data.loginData.roles[0].id === 'SI-admin') {
    //     this.isSiAdmin = true;
    //   } else if (this.data.loginData.roles[0].id === 'Sales') {
    //     this.isSiAdmin = true;
    //     this.nameTitle = '客戶';
    //   } else if (this.data.loginData.roles[0].id === 'SI-user') {
    //     this.isSiUser = true;
    //     this.nameTitle = '客戶';
    //   } else {
    //     this.nameTitle = '客戶';
    //   }
    // } else {
      this.nameTitle = '客戶';
    // }

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
        this.selectList.select.payerId = result.length > 0 ? [result[0]] : [];
        this.getAccountId();
      }
      this.ui.isLoading = false;
    }, (err: any) => {
      this.ui.isLoading = false;
      this.selectList.view.payerId = [];
      this.selectList.select.payerId = [];
      this.alert.errorAlert(err);
    });
  }

  /** 取得account id */
  getAccountId() {
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
      });
    };
  }

  /** 取得未出帳資料 */
  getNotBilledData() {
    this.ui.isLoading = true;
    // 服務
    let searchService: string[] = [];
    if (this.selectedItems.length > 0) {
      this.selectedItems.forEach(item => {
        searchService.push(item.id);
      });
    }
    // 費用類型
    let usageType: string[] = [];
    if (this.chargeTypeDatas.length > 0) {
      this.chargeTypeDatas.forEach(item => {
        usageType.push(item.id);
      });
    }
    const filter = new Filter;
    filter.pageIndex = 1;
    filter.pageSize = -1;
    const accoundId: string[] = [];
    this.selectList.select.accountId.forEach(item => {
      accoundId.push(item.id);
    });
    filter.and.push({
      field: "payerId",    // payer id
      comparator: Comparator.equal,
      value: this.selectList.select.payerId.length > 0 ?this.selectList.select.payerId[0].id : ''
    });
    filter.and.push({
      field: "accountId",    // cloudId
      comparator: Comparator.in,
      value: accoundId
    });
    filter.and.push({
      field: "name",
      comparator: Comparator.equal,
      value: 'AWS'
    });
    filter.and.push({
      field: "dashboardType",
      comparator: Comparator.equal,
      value: 'service'
    });
    filter.and.push({
      field: "year",
      comparator: Comparator.equal,
      value: this.titleYear
    });
    filter.and.push({
      field: "month",
      comparator: Comparator.equal,
      value: this.titleMonth
    });
    filter.and.push({
      field: "searchService",
      comparator: Comparator.in,
      value: searchService.length > 0 ? searchService : []
    });
    filter.and.push({
      field: "dataType",
      comparator: Comparator.in,
      value: usageType.length > 0 ? usageType : []
    });
    this.api.getNotBilled(filter).subscribe((res) => {
      if (res && res.info && res.info.success) {
        this.chartDatas = res.data !== null ? res.data : [];
        this.origTagData = res.data.tag !== null ? res.data.tag : [];
        // 服務列表，第一次才取值
        if (this.dropdownDatas.length === 0) {
          this.chartDatas.serviceList.forEach(item => {
            const data = {
              id: item,
              itemName: item
            }
            this.dropdownDatas.push(data);
            this.dropdownDatas = _.cloneDeep(this.dropdownDatas);
          });
        }
        // 費用類型，第一次才取值
        if (this.chargeTypeViews.length === 0) {
          this.chartDatas.dataType.forEach(item => {
            const data = {
              id: item,
              itemName: item
            }
            this.chargeTypeViews.push(data);
            this.chargeTypeViews = _.cloneDeep(this.chargeTypeViews);
          });
        }

        // 當月未出帳TOP3
        const usageTop3: {accountId: string, values: number}[] = [];
        this.amountTotal = 0;
        this.chartDatas.usages.forEach(usage => {
          let usageAmount = 0;
          usage.data.forEach(item => {
            // 總金額
            this.amountTotal += item.BlendedCost;
            // 各cloudId總金額
            usageAmount += item.BlendedCost
          });

          // 紀錄cloudId的總金額
          const usageItem = {
            accountId: usage.accountId,
            values: Math.round(usageAmount * 100) / 100
          }
          usageTop3.push(usageItem);
        });
        // 排序
        usageTop3.sort(function (a, b) {
          return b.values - a.values;
        });
        this.amountTotal = Math.round(this.amountTotal * 100) / 100;
        this.accountIdTotals = usageTop3;
        this.getChart();
      } else {
        this.alert.errorAlert(res.info.message);
        this.ui.isLoading = false;
      }
    }, (err: any) => {
      this.ui.isLoading = false;
      this.ui.isError = true;
      // this.accountIds.views.accountId = [];
      this.chartDatas = new AmountTable;
      this.alert.errorAlert(err);
    });
  }

  /** 取得統計圖資料 */
  getChart() {
    this.getdashboard();
    this.dashboardDate = [];
    this.dashboardDatasets = [];
    this.tableDatas = [];
    this.dates = [];
    // 明細
    this.displayedColumns = [];
    this.displayedColumns.push('name');
    this.displayedColumns.push('total');
    if (this.chartDatas.usages.length > 0) {
      this.chartDatas.usages[0].data.forEach(usage => {
        // x軸，每日日期
        this.dashboardDate.push(usage.date.split('/')[1]);
        // 明細(日期)
        this.displayedColumns.push(usage.date);
        this.dates.push(usage.date);
      });
      // 服務分組
      const title: string[] = this.chartDatas.serviceList;
      /* const title: string[] = [];
      this.chartDatas.usages[0].data[0].pricePerUnitList.forEach(item => {
        title.push(item.title);
      }) */
      this.chartDatas.usages.forEach(usage => {
        for (let i = 0; i < title.length; i++) {
          // 明細項目
          const everydayItem: {[key: string]: number | string} = {};
          // 明細日期
          const everydayDate: string[] = [];
          this.chartDatas.usages[0].data.forEach(usage => {
            everydayItem[usage.date] = 0;
            everydayDate.push(usage.date);
          });
          // 金額總和
          const amount: number[] = [];
          usage.data.forEach((item, idx) => {
            /* item.pricePerUnitList.forEach(priceList => {
              if (priceList.title === title[i]) {
                // 金額總和
                amount.push(priceList.expense);
                // 明細(細項)
                everydayItem[everydayDate[idx]] = priceList.expense;
              }
            }); */
            const filterPrice = item.pricePerUnitList.filter(priceItem => priceItem.title === title[i]);
            if (filterPrice.length > 0) {
              // 金額總和
              amount.push(filterPrice[0].expense);
              // 明細(細項)
              everydayItem[everydayDate[idx]] = filterPrice[0].expense;
            }
          });
          everydayItem['name'] = title[i];
          // 明細小記
          let everydayTotal = 0;
          amount.forEach(item => {
            everydayTotal += item;
          });
          everydayItem['total'] = Math.round(everydayTotal * 100) / 100;
          this.tableDatas.push(everydayItem);
          const color = this.getRandomColor();
          const labData = {
            backgroundColor: color,
            borderColor: 'rgba(255,99,132,1)',
            data: amount,
            hoverBackgroundColor: color,
            hoverBorderColor: color,
            label: [title[i]]
          };
          this.dashboardDatasets.push(labData);
        }
      });
    }
    this.ui.isLoading = false;
  }

  /** 儀表板資料 */
  getdashboard() {
    const options = {
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          beginAtZero: true,
        },
      },
      plugins: {
        title: {
          display: true,
          text: ''
        },
        tooltip: {
          callbacks: {
            title: function (tooltipItems: any, data: any) {
              let total = 0
              tooltipItems.forEach((tooltipItem: any) => {
                  total += tooltipItem.dataset.data[tooltipItem.parsed.x];
              });
              return tooltipItems[0].label + ' 總金額: $' + total;
            },
          }
        },
      },
      responsive: true,
    };
    this.options = options;
  }

  /** 生成隨機顏色 */
  getRandomColor() {
    let color: number[] = [];
    for (let i = 0; i < 3; i++) {
      color.push(Math.floor(Math.random() * 256));
    }
    return 'rgba(' + color[0].toString() + ',' + color[1].toString() + ',' + color[2].toString() + ',1)';
  }

  /** 下載Ｅxcel */
  excelDownLoad() {
    this.excelStatus = true;
    const accountIds: string[] = [];
    const chargeTypeDatas: string[] = [];
    // if (!this.isSiAdmin && !this.isSiUser) {
      if (this.chargeTypeDatas.length === 0) {
        this.chargeTypeViews.forEach((item) => {
          chargeTypeDatas.push(item.id);
        });
      } else {
        this.chargeTypeDatas.forEach((item) => {
          chargeTypeDatas.push(item.id);
        });
      }
    // } else {
    //   chargeTypeDatas.push('Usage');
    // }

    this.selectList.select.accountId.forEach((item) => {
      accountIds.push(item.id);
    });

    const data: any = {
      accountId: '',
      contractIds: accountIds,
      dataType: chargeTypeDatas,
      year: moment().format('YYYY'),
      month: moment().format('MM'),
      payerId: this.selectList.select.payerId[0].id
    }

    this.api.getdashboardFilePath('AWS', data).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.excelStatus = false;
        if (res.blob) {
          FileSaver.saveAs(res.blob, res.filename || 'export.xls');
        }
      } else {
        this.excelStatus = false;
        this.errorMessage = 'Api.EXCEL ERROR： ' + res.info.message;
      }
    }, (err: any) => {
      this.excelStatus = false;
      this.errorMessage = 'Api.EXCEL ERROR： ' + err.message;
      this.alert.errorAlert(err);
    });
  }

  /** 重置 */
  reset() {
    this.selectList.select.accountId = [];
    this.selectedItems = [];
    this.chargeTypeDatas = [];
    this.getPayerId();
  }

  /** 送出 */
  handleSend() {
    this.getNotBilledData();
  }

  /** 計算小記總和 */
  getTotalCost(value: any) {
    let total = 0;
    this.tableDatas.forEach(item => {
      total += item[value];
    });
    return Math.round(total * 100) / 100;
    // return this.dayTotal[value];
  }

  /** 金額增加逗號 */
  forMatCurrency(money: number) {
    const parts = money.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  /** 選擇不同的payer id */
  payerChange() {
    this.selectList.view.accountId = [];
    this.selectList.select.accountId = [];
    this.getAccountId();
  }

  /** 只選擇一個accountId時觸發此函式 */
  onClose() {
    if (this.selectList.select.accountId.length === 1) {
      this.tagDatas = [];
      this.tagViews = [];
      let tagKey = _.keys(this.origTagData[this.selectList.select.accountId[0].id]);
      // let tagKey: string[] = _.keys(this.origTagData['496119393964']);
      for (let i = 0; i < tagKey.length; i++) {
        const itemData: any = this.origTagData[this.selectList.select.accountId[0].id];
        // const itemData: any = this.origTagData['496119393964'];
        itemData[tagKey[i]].forEach((item: any) => {
          const data = {
            id: item,
            itemName: item,
          }
          this.tagViews.push(data);
        });
      }
    }
  }

}
