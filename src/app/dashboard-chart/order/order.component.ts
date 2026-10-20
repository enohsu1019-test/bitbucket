import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { Filter, Comparator, Sort } from '../../core/models/filter';
import { Page } from 'src/app/core/models/page';
import { Order } from '../dashboard';
import { DashboardService } from '../dashboard.service';
import { formatDate } from '@angular/common';
import { AlertService } from 'src/app/core/services/alert.service';
import moment from 'moment';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  orderPage!: Page;

  constructor(
    private api: DashboardService,
    private alert: AlertService,
    @Inject(LOCALE_ID) private locale: string,
  ) {
    this.orderPage = new Page();
    this.orderPage.pageSize = 5;
  }

  /** loading */
  loading = false;

  /**訂單資料類別 */
  orders: Order[] = [];

  /** 動態 filter 資料 */
  defaultFilter: { [key: string]: any } = {};

  ngOnInit() {
    this.getOrders();
  }

  /** 取得訂單資訊 */
  getOrders() {
    this.loading = true;
    const filter = new Filter();
    const startDate = moment().format('YYYY-MM-DD');
    const endData = moment().add(6, 'month').format('YYYY-MM-DD');

    filter.and.push({
      field: 'endDate',
      comparator: Comparator.greaterEqual,
      value: startDate
    });

    filter.and.push({
      field: 'endDate',
      comparator: Comparator.lesserEqual,
      value: endData
    });

    filter.sort['endDate'] = Sort.asc;
    filter.pageIndex = this.orderPage.pageIndex;
    filter.pageSize = 5;
    this.defaultFilter = {};
    this.defaultFilter['name'] = 'contract change';
    this.defaultFilter['orders'] = filter;
    this.api.getOrderList(filter).subscribe((res) => {
      if (res && res.info && res.info.success) {
        this.orders = res.data !== null ? res.data : [];
        this.orders.forEach(item => {
          item.endDate = item.endDate ? formatDate(item.endDate, 'yyyy-MM-dd', this.locale) : item.endDate;
        });
        this.orderPage = res.page ? res.page : new Page;

        if (this.orderPage.pageCount > 10) {
          this.orderPage.pageCount = 10;
        }
      }
      this.loading = false;
    }, (err: any) => {
      this.loading = false;
      this.alert.errorAlert(err);
    });
  }

  /**點選訂單頁數時，設定filter 取得訂單資訊 */
  orderPageChanged(event: any) {
    this.orderPage.pageIndex = event.page;
    this.getOrders();
  }

}
