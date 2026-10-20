import { Component, OnInit } from '@angular/core';
import { Filter, Comparator, Sort } from '../../core/models/filter';
import { DashboardService } from '../dashboard.service';
import moment from 'moment';
import * as _ from 'lodash';
import { AlertService } from 'src/app/core/services/alert.service';
import { AliasData } from '../dashboard';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-usages',
  templateUrl: './usages.component.html',
  styleUrls: ['./usages.component.scss']
})
export class UsagesComponent implements OnInit {

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

  /** cloud id下拉選單基礎設定 */
  cloudIdsettings = {
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

  /** loading */
  loading = false;
  /** api回傳資料 */
  billData: any = [];

  /** 別名資料 */
  aliasData: AliasData[] = [];

  // 儀表板資料
  dashboardDatasets: any[] = [];
  // dashboard日期
  dashboardDate: string[] = [];
  // 儀表板資料選項
  options = {};

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

  constructor(
    private alert: AlertService,
    private api: DashboardService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    // x軸，每月日期
    let dateCount = 0;
    const startDay = moment(new Date()).add(-23, 'M');
    const endDay = new Date();
    do {
      this.dashboardDate.push(moment(startDay).add(dateCount, 'M').format('YYYY/MM'));
      dateCount++;
    } while (moment(startDay).add(dateCount, 'M').format('YYYY/MM') !== moment(endDay).format('YYYY/MM'));
    this.dashboardDate.push(moment(endDay).format('YYYY/MM'));

    this.getPayerId();
    this.getChart();
  }

  /** 取得payer id列表 */
  getPayerId() {
    this.loading = true;
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
      this.loading = false;
    }, (err: any) => {
      this.loading = false;
      this.selectList.view.payerId = [];
      this.selectList.select.payerId = [];
      this.alert.errorAlert(err);
    });
  }

  /** 取得cloudId */
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

  /** 選擇不同的payer id */
  payerChange() {
    this.selectList.view.accountId = [];
    this.selectList.select.accountId = [];
    this.getAccountId();
  }

  /** 取得資料 */
  getPastBlls() {
    this.loading = true;
    const cloudId: string[] = [];
    this.selectList.select.accountId.forEach(item => {
      cloudId.push(item.id);
    });
    const filter = new Filter;
    filter.pageSize = -1;
    filter.and.push({
      field: 'info.order.payerId',
      comparator: Comparator.equal,
      value: this.selectList.select.payerId[0].id
    });
    filter.and.push({
      field: 'info.order.cloudId',
      comparator: Comparator.in,
      value: cloudId
    });
    this.api.getPastBills(filter).subscribe((res) => {
      if (res && res.info && res.info.success) {
        this.billData = res.data !== null ? res.data : [];
        this.getChart();
      } else {
        this.alert.errorAlert(res.info.message);
        this.loading = false;
      }
    }, (err: any) => {
      this.loading = false;
      this.alert.errorAlert(err);
    });
  }

  /** 取得統計圖資料 */
  getChart() {
    this.getdashboard();
    this.dashboardDatasets = [];
    this.billData.forEach((data: any) => {
      const amount: number[] = [];
      this.dashboardDate.forEach(date => {
        if (date.split('/')[0] === data.year && date.split('/')[1] === data.month) {
          amount.push(data.calculation.billing.total);
        } else {
          amount.push(0);
        }
      })
      const color = this.getRandomColor();
      const labData = {
        backgroundColor: color,
        borderColor: 'rgba(255,99,132,1)',
        data: amount,
        hoverBackgroundColor: color,
        hoverBorderColor: color,
        label: data.info.order.cloudId
      }
      this.dashboardDatasets.push(labData);
    });
    this.loading = false;
  }

  /** 儀表板資料 */
  getdashboard() {
    const options = {
      plugins: {
        title: {
          display: true,
          text: ''
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

}
