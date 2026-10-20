import { Component, OnInit, TemplateRef } from '@angular/core';
import moment from 'moment';
import { AlertService } from 'src/app/core/services/alert.service';
import { DashboardService } from '../dashboard.service';
import { AliasData } from '../dashboard';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import * as FileSaver from 'file-saver';
import { PermissionService } from 'src/app/core/services/permission.service';
import { Filter, Sort } from 'src/app/core/models/filter';
import { AuthService } from 'src/app/core/services/auth.service';
import _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-future-forecast-usage',
  templateUrl: './future-forecast-usage.component.html',
  styleUrls: ['./future-forecast-usage.component.scss']
})
export class FutureForecastUsageComponent implements OnInit {

  /** 目前的使用者身份 */
  get userIdentityType() {
    return this.authService.currentUserValue?.role?.identityType;
  }

  constructor(
    private api: DashboardService,
    private alert: AlertService,
    private modalService: BsModalService,
    public permission: PermissionService,
    private authService: AuthService,
    private translate: TranslateService,
  ) {}

  /** 別名資料 */
  aliasData: AliasData[] = [];
  // 結束日期
  endDate = moment().format('YYYY-MM-DD');
  // dashobard錯誤訊息
  errorMessage = '';

  // excel資料
  excelDatas: any = {};

  // 儀表板資料
  dashboardDatasets: any[] = [];
  // dashboard日期
  dashboardDate: string[] = [];
  // 儀表板每個項目係項
  dashboardItemDatas: { key: string, total: number, value: number[] }[] = [];

  // 日期選擇器暫存起始參數
  datepickerStart = '';
  // 日期選擇器暫存結束參數
  datepickerEnd = '';

  // 每日或每月總計
  dayMonthTotal: { date: string, total: number }[] = [];
  // table索引
  displayedColumns: string[] = [];

  // 篩選日期格式是否月或是日
  granularity = 'MONTHLY';
  // 分組依據
  groupBy = 'SERVICE';
  // 選擇的tag列表
  tagGroup: string[] = [];
  // 選擇的tag
  selectTagGroup = '';

  // 初始化
  initial = true;
  // 最大日期
  maxDate = new Date(moment().add(12, 'M').format('YYYY-MM-DD'));
  // 最小日期
  minDate = new Date(moment().subtract(12, 'M').format('YYYY-MM-DD'));
  // 彈跳窗
  modalRef?: BsModalRef;

  // 儀表板模式
  mode = '';
  // 角色身份
  role = {
    siAdmin: false,
    siUser: false
  };

  // 下拉選單基礎設定
  settings = {
    text: this.translate.instant('all inclusive'),
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
    lazyLoading: true,
    noDataLabel: this.translate.instant('no data found'),
    classes: 'dropdown-icon dropdown-position',
  };

  /** payer id下拉選單基礎設定 */
  settingsPayerId = {
    text: this.translate.instant('please select'),
    enableSearchFilter: true,
    singleSelection: true,
    badgeShowLimit: 1,
    maxHeight: 250,
    position: 'bottom',
    autoPosition: false,
    lazyLoading: true,
    noDataLabel: this.translate.instant('no data found'),
    classes: 'dropdown-icon dropdown-position',
  };

  // 下拉選單基礎設定
  settingsAccountId = {
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
    lazyLoading: true,
    noDataLabel: this.translate.instant('no data found'),
    classes: 'dropdown-icon dropdown-position',
  };

  sidebarFilter: { [key: string]: string[] } = {
    accountIds: [],
    payerIds: [],
    service: [],
    region: [],
    instanceType: [],
    usageType: [],
    usageTypeGroup: [],
    operation: [],
    recordType: [],
    az: [],
    platform: [],
    purchaseType: [],
    tag: [],
  };

  // 側邊欄篩選欄位下拉選單資料
  sidebarFilterDatas: { [key: string]: { id: string, itemName: string }[], tag: { id: string, itemName: string, group: string }[] } = {
    accountIds: [],
    payerIds: [],
    service: [],
    region: [],
    instanceType: [],
    usageType: [],
    operation: [],
    recordType: [],
    az: [],
    platform: [],
    purchaseType: [],
    tag: [],
    usageTypeGroup: []
  };

  // 側邊欄篩選欄位下拉選單顯示
  sidebarFilterView: { [key: string]: { id: string, itemName: string }[], tag: { id: string, itemName: string, group: string }[] } = {
    accountIds: [],
    payerIds: [],
    service: [],
    region: [],
    instanceType: [],
    usageType: [],
    operation: [],
    recordType: [],
    az: [],
    platform: [],
    purchaseType: [],
    tag: [],
    usageTypeGroup: []
  };

  // 側邊欄篩選欄位下拉選單顯示原始資料
  sidebarFilterViewOriginal: {
    [key: string]: {
      id: string,
      itemName: string
    }[],
    tag: {
      id: string,
      itemName: string,
      group: string
    }[]
  } = {
    accountIds: [],
    payerIds: [],
    service: [],
    region: [],
    instanceType: [],
    usageType: [],
    operation: [],
    recordType: [],
    az: [],
    platform: [],
    purchaseType: [],
    tag: []
  };

  // 開始日期
  startDate = moment().day(-14).format('YYYY-MM-DD');

  // 日期選擇器範圍資料
  // pickerRangeDates: (Date)[] = [];
  pickerRangeDates: (Date | undefined)[] | undefined = [];

  // table資料
  tableDatas: { [key: string]: any, }[] = [];

  // tag下拉選單設定
  tagSettings = {
    text: this.translate.instant('all inclusive'),
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
    groupBy: 'group',
    noDataLabel: this.translate.instant('no data found'),
    classes: 'dropdown-icon dropdown-position',
  };

  ui = {
    isLoadFilter: false,
    isLoadCost: false,
    isError: false,
    dropdownExcel: false,
    step: 1
  };

  options = {};

  ngOnInit(): void {
    this.pickerRangeDates = [new Date(this.startDate), new Date(this.endDate)];

    this.sidebarFilter['recordType'] = [];
    const usage: any[] = [];
    usage.push({ id: 'Usage', itemName: 'Usage' });
    this.sidebarFilterDatas['recordType'] = usage;
    this.sidebarFilter['recordType'].push('Usage');
    this.getAliasDataAPI();

    // if (this.data.loginData.roles.length === 1) {
    //   if (this.data.loginData.roles[0].id === 'SI-admin') {
    //     this.role.siAdmin = true;
    //   } else if (this.data.loginData.roles[0].id === 'SI-user') {
    //     this.role.siUser = true;
    //   }
    // }
    this.initDashboard();
  }

  /** 儀表板空白資料 */
  initDashboard() {
    const options = {
      plugins: {
        title: {
          display: true,
          text: '',
        },
        tooltip: {
          callbacks: {}
        },
      },
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true
        },
      },
      responsive: true,
    };
    this.options = options;
    const labData = {
      backgroundColor: 'rgba(255,255,255,1)',
      borderColor: 'rgba(255,99,132,1)',
      data: [],
      hoverBackgroundColor: 'rgba(255,255,255,1)',
      hoverBorderColor: 'rgba(255,255,255,1)',
      label: ''
    };
    this.dashboardDatasets.push(labData);
  }

  // 開啟側邊下拉選單事件
  openSidebarEvent(name: string) {
    this.sidebarFilterView[name] = this.sidebarFilterViewOriginal[name];
  }

  // 下載excel
  excelDownLoad() {
    this.ui.dropdownExcel = true;
    const data = {
      groupBy: this.groupBy,
      exportData: this.excelDatas
    };
    this.api.postAWSCostExplorerExcel(data).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.ui.dropdownExcel = false;
        if (res.blob) {
          FileSaver.saveAs(res.blob, res.filename || 'export.xlsx');
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

  // 取得別名資料
  getAliasDataAPI() {
    const filter = new Filter;
    filter.pageSize = -1;
    filter.sort['updateTime'] = Sort.desc;
    this.api.getUserRights(filter).subscribe((res) => {
      if (res.info && res.info.success) {
        this.aliasData = res.data;
        this.sidebarFilterViewOriginal['payerIds'] = this.getPayerData(this.aliasData);
        // 去除重複
        this.sidebarFilterViewOriginal['payerIds'] = this.removeDuplicates(this.sidebarFilterViewOriginal['payerIds']);
        this.sidebarFilterDatas['payerIds'] = this.sidebarFilterViewOriginal['payerIds'].length > 0 ? [this.removeDuplicates(this.sidebarFilterViewOriginal['payerIds'])[0]] : [];
        this.getAccountId();
        if (this.initial) {
          this.initial = false;
        }
      }
    }, (err: any) => {
      this.alert.errorAlert(err);
    });
  }

  // ＡＷＳ篩選資料
  getAWSFilter() {
    this.ui.isLoadFilter = true;
    this.handleSidebarFilterEvent('payerIds');
    this.handleSidebarFilterEvent('accountIds');

    const data = {
      accountIds: this.sidebarFilter['accountIds'],
      dataType: ['REGION', 'TAG', 'SERVICE', 'INSTANCE_TYPE', 'USAGE_TYPE', 'OPERATION', 'RECORD_TYPE', 'AZ', 'PLATFORM', 'PURCHASE_TYPE', 'USAGE_TYPE_GROUP'],
      startDate: this.startDate,
      endDate: this.endDate,
      payerId: this.sidebarFilter['payerIds'][0]
    };

    this.api.postAWSFilter(data).subscribe((res) => {
      if (res.info && res.info.success) {
        this.tagGroup = [];
        // this.selectTagGroup = '';
        const keyIndex = Object.keys(res.data);
        keyIndex.forEach((item) => {
          if (item !== 'tag') {
            this.sidebarFilterViewOriginal[item] = this.handleSidebarFilterDataToDropdown(res.data[item], item);
          } else {
            this.sidebarFilterViewOriginal[item] = this.handleTagDropdownData(res.data[item]);
          }
        });
        // if (this.initial) {
        //   this.getAWSCostExplorer();
        //   this.initial = false;
        // }
        this.ui.step = 2;
        this.ui.isLoadFilter = false;
      } else {
        this.alert.errorAlert(res.info.message);
        this.ui.isLoadFilter = false;
      }
    }, (err: any) => {
      this.ui.isLoadFilter = false;
      this.alert.errorAlert(err);

    });
  }

  // ＡＷＳ金錢資料
  getAWSCostExplorer() {
    this.ui.isLoadCost = true;
    this.ui.isError = false;
    this.handleSidebarFilterEvent('accountIds');
    this.handleSidebarFilterEvent('payerIds');
    // 預設全選
    if (this.sidebarFilter['tag'].length === 0) {
      this.sidebarFilterViewOriginal.tag.forEach(item => {
        this.tagGroup.push(item.group);
      });
      this.tagGroup = _.uniq(this.tagGroup);
    }
    // 如果有指定tag
    // let userSelectTag: string[] = [];
    // if (this.selectTagGroup !== '') {
    //   userSelectTag = this.sidebarFilterViewOriginal.tag.filter(item => item.group === this.selectTagGroup).map(id => id.id);
    // }

    const data = {
      accountIds: this.sidebarFilter['accountIds'],
      payerId: this.sidebarFilter['payerIds'][0],
      service: this.sidebarFilter['service'],
      region: this.sidebarFilter['region'],
      instanceType: this.sidebarFilter['instanceType'],
      usageType: this.sidebarFilter['usageType'],
      usageTypeGroup: this.sidebarFilter['usageTypeGroup'],
      operation: this.sidebarFilter['operation'],
      recordType: this.sidebarFilter['recordType'],
      az: this.sidebarFilter['az'],
      platform: this.sidebarFilter['platform'],
      purchaseType: this.sidebarFilter['purchaseType'],
      // tag: userSelectTag.length > 0 ? userSelectTag : this.sidebarFilter['tag'],
      tag: this.sidebarFilter['tag'],
      groupBy: this.groupBy,
      granularity: this.granularity,
      startDate: this.startDate,
      endDate: this.endDate
    };
    this.api.postAWSCostExplorer(data).subscribe((res) => {
      if (res.info && res.info.success) {
        this.excelDatas.costExplorerDetails = res.data.costExplorerDetails;
        this.excelDatas.total = res.data.total;
        this.excelDatas.costForecastDetails = [];
        this.ui.isLoadCost = false;
        this.mode = this.groupBy;
        if (res.data.costForecastDetails) {
          this.predictionInterval(res.data);
          this.excelDatas.costForecastDetails = res.data.costForecastDetails;
        } else {
          this.notPredictionInterval(res.data);
        }
      }
    }, (err: any) => {
      this.ui.isLoadCost = false;
      this.ui.isError = true;
      this.alert.errorAlert(err);
      this.errorMessage = err;
    });
  }

  /** 處理payer id資料 */
  getPayerData(aliasData: AliasData[]): { id: string, itemName: string }[] {
    const results: { id: string, itemName: string }[] = [];
    aliasData.forEach((item) => {
      const dataIndex = {
        id: item.payerId,
        itemName: item.nickName + '(' + item.payerId + ')'
      };
      results.push(dataIndex);
    });
    return results;
  }

  /** 去除重複 */
  removeDuplicates(ary: {id: string, itemName: string}[]) {
    let result: {id: string, itemName: string}[] = [];
    if (ary.length > 0) {
      ary.forEach(item => {
        if (result.length === 0) {
          result.push(item);
        } else {
          const filterData = result.filter(filter => filter.id === item.id);
          if (filterData.length === 0) {
            result.push(item);
          }
        }
      })
      result = result.filter(item => item.id !== '');
    }
    return result;
  }

  // 處理美日
  handleDashboardItemDate(data: { key: string, total: number, value: number[] }[]): any[] {
    const colors = ['#A0C2F9', '#FFCB7F', '#EC9696', '#7FE8C0', '#FDF378'];
    let dashobardData: { key: string, total: number, value: number[] }[] = [];
    const results: any = [];
    dashobardData = this.handleSort(data, 'total');
    dashobardData.forEach((dashboardItem, dashboardIndex) => {
      if (dashboardIndex <= 4) {
        results.push({
          backgroundColor: colors[dashboardIndex],
          borderColor: 'rgba(255,99,132,1)',
          hoverBackgroundColor: colors[dashboardIndex],
          hoverBorderColor: colors[dashboardIndex],
          label: dashboardIndex !== 4 ? dashboardItem.key : '其他',
          data: dashboardItem.value
        });
      } else {
        dashboardItem.value.forEach((dataItem, dataIndex) => {
          this.roundNumber(results[4].data[dataIndex] += dataItem, 2);
        });
      }
    });
    return results;
  }

  // 處理給api的資料
  handleDateAPIData(template: TemplateRef<any>) {

    const toDay = moment().add(1, 'd').format('YYYY-MM-DD');
    const startDate = moment(this.pickerRangeDates ? this.pickerRangeDates[0] : '').format('YYYY-MM-DD');
    const endDate = moment(this.pickerRangeDates ? this.pickerRangeDates[1] : '').format('YYYY-MM-DD');
    if (moment(endDate).isBefore(toDay)) {
      this.startDate = startDate;
      this.endDate = endDate;
    } else {
      this.datepickerStart = startDate;
      this.datepickerEnd = endDate;
      this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
    }

    // this.getAWSFilter();
  }

  // 處理側邊欄位資料 API to 下拉選單
  handleSidebarFilterDataToDropdown(sidebarData: string[], name: string): { id: string, itemName: string }[] {
    const results: { id: string, itemName: string }[] = [];

    sidebarData.forEach((item) => {
      /* if (name === 'recordType') {
        if (this.role.siAdmin || this.role.siUser) {
          if (item !== 'Solution Provider Program Discount' && item !== 'Refund' && item !== 'Credit') {
            const dataIndex = {
              id: item,
              itemName: item === '' ? 'Do not use： ' + name : item
            };
            results.push(dataIndex);
          }
        } else {
          const dataIndex = {
            id: item,
            itemName: item === '' ? 'Do not use： ' + name : item
          };
          results.push(dataIndex);
        }

        // if (item === 'Usage') {
        //   this.sidebarFilter.recordType = [];
        //   let usage: any[] = [];
        //   usage.push({ id: item, itemName: item });

        // }

      } else { */
        const dataIndex = {
          id: item,
          itemName: item === '' ? 'Do not use： ' + name : item
        };
        results.push(dataIndex);
      // }

    });

    return results;
  }

  // 處理側邊欄資料下拉選單 to API 資料
  handleSidebarFilterData(name: string): string[] {
    const results: string[] = [];
    if (this.sidebarFilterDatas[name].length > 0) {
      this.sidebarFilterDatas[name].forEach((item) => {
        results.push(item.id);
      });
    }
    return results;
  }

  // 處理側邊欄資料事件
  handleSidebarFilterEvent(name: string) {
    if (name !== 'tag') {
      this.tagGroup = [];
      // 帶入使用者選擇的tag
      this.sidebarFilterDatas.tag.forEach(item => {
        this.tagGroup.push(item.group);
      });
      this.sidebarFilterView[name] = [];
    }

    if (name !== 'accountIds' &&
        name !== 'payerIds' &&
        name !== 'recordType' &&
        this.sidebarFilterViewOriginal[name].length === this.sidebarFilterDatas[name].length) {
      this.sidebarFilterDatas[name] = [];
    }
    this.sidebarFilter[name] = this.handleSidebarFilterData(name);
  }

  /** 取得account id下拉選單 */
  getAccountId() {
    this.sidebarFilterViewOriginal['accountIds'] = [];
    this.sidebarFilterDatas['accountIds'] = [];
    let filterData: AliasData[] = [];
    if (this.sidebarFilterDatas['payerIds'].length > 0) {
      filterData = this.aliasData.filter(ori => ori.payerId === this.sidebarFilterDatas['payerIds'][0].id);
    }
    if (filterData.length !== 0) {
      filterData.forEach(filterItem => {
        const data = {
          id: filterItem.cloudId,
          itemName: filterItem.name ? filterItem.name + '(' + filterItem.cloudId + ')' : filterItem.cloudId
        };
        this.sidebarFilterViewOriginal['accountIds'].push(data);
      });
    };
    this.sidebarFilterView['payerIds'] = [];
  }

  /** 開啟payer id下拉選單 */
  payerIdOpen() {
    this.sidebarFilterView['payerIds'] = this.sidebarFilterViewOriginal['payerIds'];
  }

  /** 選擇不同的payer id */
  payerChange() {
    this.sidebarFilterDatas['accountIds'] = [];
    this.sidebarFilterViewOriginal['accountIds'] = [];
    this.getAccountId();
  }

  /**
   * sortFunction
   *
   * @param arr 要排序的array
   * @param textIndex 依照哪個欄位排序
   */
  handleSort(arr: any, textIndex: string): any {
    arr.sort(function (a: any, b: any) {
      return b[textIndex] - a[textIndex];
    });

    return arr;
  }

  // 組合標籤下拉選單資料
  handleTagDropdownData(values: any): any {
    const arrayIndex = ['aws:createdBy', 'user:Application', 'user:CreateBy', 'user:CreatedBy', 'user:Environment', 'user:Name', 'user:Project', 'user:Stack'];
    const results: any = [];

    arrayIndex.forEach((item) => {
      if (values[item] && values[item].length >= 1) {
        values[item].forEach((valueItem: string) => {
          results.push({ id: item + ':' + valueItem, itemName: item + ':' + valueItem, group: item });
        });
      }

    });
    return results;
  }

  /** 選擇tag */
  tagChange() {
    this.groupBy = 'TAG:' + this.selectTagGroup;
  }

  // modal 確認函數
  modalComfirm() {
    this.startDate = this.datepickerStart;
    this.endDate = this.datepickerEnd;
    this.groupBy = '';
    this.modalRef?.hide();
  }

  // modal取消函數
  modalDeCline() {
    this.pickerRangeDates = [new Date(this.startDate), new Date(this.endDate)];
    this.modalRef?.hide();
  }

  // 四捨五入
  roundNumber(num: number, scale: number): number {
    if (`${num}`.indexOf('e') === -1) {
      return +(Math.round(+(num + 'e+' + scale)) + 'e-' + scale);
    } else {
      const arr = `${num}`.split('e');
      const sig = (+arr[1] + scale > 0) ? '+' : '';
      return +(Math.round(+(+arr[0] + 'e' + sig + (+arr[1] + scale))) + 'e-' + scale);
    }
  }

  // 設定儀表板table資料
  setDashboardTableData(data: any): any[] {
    const dashboardTableData: any[] = [];
    data.forEach((dataItem: any, dataIndex: number) => {
      dashboardTableData.push({ key: dataItem.key, total: this.roundNumber(dataItem.total, 2) })
      dataItem.value.forEach((valueItem: any, valueIndex: number) => {
        dashboardTableData[dataIndex][this.dashboardDate[valueIndex]] = this.roundNumber(valueItem, 2);
      });
    });
    return dashboardTableData;
  }

  // 沒在預測未來模式下
  notPredictionInterval(data: any) {
    const date: string[] = [];
    const dayMonthTotal: { date: string, total: number }[] = [];
    const dashboardItemTotal: { key: string, total: number, value: number[] }[] = [];
    const options = {
      plugins: {
        title: {
          display: true,
          text: 'Chart.js Bar Chart - Stacked'
        },
        tooltip: {
          // callbacks: {
          //   footer: function (items: any[], data: any) {
          //     console.log
          //   },
          // }
        },
      },
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true
        },
      },
      responsive: true,
    };
    if (data.costExplorerDetails) {
      data.costExplorerDetails.forEach((detailsItem: any, detailsIndex: number) => {
        date.push(detailsItem.date);
        dayMonthTotal.push({ date: detailsItem.date, total: this.roundNumber(detailsItem.total, 2) });

        if (detailsItem.groupByCosts.length >= 1) {
          detailsItem.groupByCosts.forEach((groupItem: any) => {
            if (detailsIndex === 0) {
              dashboardItemTotal.push({
                key: groupItem.key,
                total: groupItem.amount,
                value: [groupItem.amount]
              });
            } else {
              let findIndex = 0;
              do {
                if (dashboardItemTotal[findIndex].key === groupItem.key) {
                  dashboardItemTotal[findIndex].total += groupItem.amount;
                  dashboardItemTotal[findIndex].value.push(groupItem.amount);
                  break;
                }
                findIndex ++;
              } while (findIndex < detailsItem.groupByCosts.length);
            }
          });
        } else {
          detailsIndex === 0 ? dashboardItemTotal.push({ key: '總成本($)', total: this.roundNumber(detailsItem.total, 2), value: [] })
                             : this.roundNumber(dashboardItemTotal[0].total += detailsItem.total, 2),
                                                dashboardItemTotal[0].value.push(this.roundNumber(detailsItem.total, 2));
        }
      });
    }
    // 取得日期
    this.dashboardDate = date;
    this.dayMonthTotal = dayMonthTotal;
    this.dashboardItemDatas = dashboardItemTotal;
    this.options = options;

    // 複製新變數給他去處理，不然會改變到原本的值
    const dashboardChart = _.cloneDeep(this.dashboardItemDatas);
    this.dashboardDatasets = this.handleDashboardItemDate(dashboardChart);
    this.tableDatas = this.setDashboardTableData(this.handleSort(this.dashboardItemDatas, 'total'));

    this.displayedColumns = [];
    this.displayedColumns.push('key');
    this.displayedColumns.push('total');
    this.displayedColumns = this.displayedColumns.concat(date);
  }

  // 預設區間Function
  predictionInterval(data: any) {
    const date: string[] = [];
    const dayMonthTotal: { date: string, total: number }[] = [];
    const dashboardItemTotal: { key: string, total: number, value: number[] }[] = [];
    const options = {

      scales: {
        x: {
          stacked: true, // Make it true to make the overlapping
        },
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            footer: function (items: any[]) {
              return '80%預測間隔: US$ ' + items[2].dataset.data[items[2].parsed.x] + '- US$' + items[3].dataset.data[items[3].parsed.x];
            },
          }
        },
      },

    };

    const datasets: any[] = [
      {
        data: [],
        label: '成本',
        borderColor: '#6A46CE',
        backgroundColor: '#6A46CE',
        hoverBackgroundColor: '#6A46CE',
        hoverBorderColor: '#6A46CE'
      },
      {
        data: [],
        label: '預設',
        borderWidth: 1,
        borderColor: '#6A46CE',
        backgroundColor: 'transparent',
        categoryPercentage: 0.83,
        hoverBackgroundColor: 'transparent',
        hoverBorderColor: '#6A46CE'
      },
      {
        data: [],
        label: '預測間隔下限',
        borderColor: 'white',
        backgroundColor: 'white',
        hoverBackgroundColor: 'white',
        hoverBorderColor: 'white'
      },
      {
        data: [],
        label: '預測間隔上限',
        borderColor: 'rgba(178, 178, 180, 0.35)',
        backgroundColor: 'rgba(178, 178, 180, 0.35)',
        hoverBackgroundColor: 'rgba(178, 178, 180, 0.35)',
        hoverBorderColor: 'rgba(178, 178, 180, 0.35)'
      },
    ];

    data.costExplorerDetails.forEach((detailsItem: any, detailsIndex: number) => {
      date.push(detailsItem.date);
      dayMonthTotal.push({ date: detailsItem.date, total: this.roundNumber(detailsItem.total, 2) });
      datasets[0].data.push(this.roundNumber(detailsItem.total, 2));
      datasets[1].data.push(0);
      datasets[2].data.push(0);
      datasets[3].data.push(0);
      detailsIndex === 0 ? dashboardItemTotal.push({ key: '總成本($)', total: this.roundNumber(detailsItem.total, 2), value: [] })
                         : this.roundNumber(dashboardItemTotal[0].total += detailsItem.total, 2),
                                            dashboardItemTotal[0].value.push(this.roundNumber(detailsItem.total, 2));
    });

    data.costForecastDetails.forEach((detailsItem: any, detailsIndex: number) => {
      if (detailsIndex === 0) {
        const arrayLenght = datasets[0].data.length - 1;
        datasets[1].data[arrayLenght] = this.roundNumber(detailsItem.total, 2);
        datasets[2].data[arrayLenght] = this.roundNumber(detailsItem.predictionIntervalLowerBound, 2);
        datasets[3].data[arrayLenght] = this.roundNumber(detailsItem.predictionIntervalUpperBound, 2);
      } else {
        date.push(detailsItem.date);
        dayMonthTotal.push({ date: detailsItem.date, total: this.roundNumber(detailsItem.total, 2) });
        datasets[0].data.push(0);
        datasets[1].data.push(this.roundNumber(detailsItem.total, 2));

        datasets[2].data.push(this.roundNumber(detailsItem.predictionIntervalLowerBound, 2));
        datasets[3].data.push(this.roundNumber(detailsItem.predictionIntervalUpperBound, 2));
        detailsIndex === 0 ? dashboardItemTotal.push({ key: '總成本($)', total: this.roundNumber(detailsItem.total, 2), value: [] })
                           : this.roundNumber(dashboardItemTotal[0].total += detailsItem.total, 2),
                                              dashboardItemTotal[0].value.push(this.roundNumber(detailsItem.total, 2));
      }

    });

    this.dashboardDatasets = datasets;
    this.dashboardDate = date;
    this.dayMonthTotal = dayMonthTotal;
    this.options = options;
    this.dashboardItemDatas = dashboardItemTotal;
    this.tableDatas = this.setDashboardTableData(this.dashboardItemDatas);
    this.displayedColumns = [];
    this.displayedColumns.push('key');
    this.displayedColumns.push('total');
    this.displayedColumns = this.displayedColumns.concat(date);
  }

  /**
   * 開啟條件選項跳窗
   * @param temp 跳窗template
   */
  openCondition(temp: TemplateRef<any>) {
    this.modalRef = this.modalService.show(temp, { class: 'modal-lg' });
  }

  /**
   * 關閉條件選項跳窗
   */
  closeCondition() {
    this.modalRef?.hide();
  }
}
