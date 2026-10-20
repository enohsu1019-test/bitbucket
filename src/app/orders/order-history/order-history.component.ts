import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { InTableConfig } from '@sysage/in-table';
import { Comparator, Filter, Sort } from 'src/app/core/models/filter';
import { PageConfig } from 'src/app/core/models/page';
import { AlertService } from 'src/app/core/services/alert.service';
import { UtilService } from 'src/app/core/services/util.service';
import { OrdersService } from '../orders.service';
import { DateTime } from 'luxon';
import { SaveTranceNote } from '../orders';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit {

  @Input() orderID!: string;
  @Input() mode!: string;


  // 修訂紀錄表單
  historyForm = new FormGroup({
    revisor: new FormControl(''),     // 修改人
    createDate: new FormControl(''),  // 修改時間
    keyword: new FormControl(''),     // 關鍵字
  });

  // 修訂紀錄 table list
  historyList: SaveTranceNote[] = [];

  /** in-table setting */
  inTableConfig = new InTableConfig();
  inTableTranslate: any; // = new InTableTranslate();

  defaultPageSize = 10;
  /** 設定分頁參數 */
  pageConfig = new PageConfig();

  filter = new Filter({
    pageSize: this.defaultPageSize
  });

  /** 設定排序參數 */
  sortBy = {
    prop: 'createTime',
    dir: Sort.desc,
  };

  // ui狀態
  ui = {
    isSearching: false
  }

  get f() { return this.historyForm.controls }

  constructor(
    public util: UtilService,
    private orderAPI: OrdersService,
    private alert: AlertService,
  ) {
    /** in-table setting */
    this.inTableConfig.sitckyElemId = 'page-header';
  }
  ngOnInit(): void {
    const pref = JSON.parse(localStorage.getItem('intable-order-historyList-table-pageSize')!);
    if (pref?.itemsPerPage) {
      this.filter.pageSize = pref.itemsPerPage;
      this.pageConfig.itemsPerPage = pref.itemsPerPage;
    }

    if (this.mode === 'edit') {
      this.getOrderHistoryList();
    }
  }

  /** 取得訂單修訂紀錄清單 */
  getOrderHistoryList() {
    this.historyList = [];
    this.ui.isSearching = true;

    const filter = this.getFilter(this.pageConfig.currentPage, this.pageConfig.itemsPerPage);
    console.log(filter);

    // call API
    this.orderAPI.postOrderHistory(filter, this.orderID).subscribe({
      next: (res) => {
        console.log('[order-update-record] searchUpdateRecord done', res);
        if (res.info.success && res?.data) {
          this.historyList = res.data;

          this.pageConfig.totalItems = res.page?.dataCount ?? 0;
          this.pageConfig.itemsPerPage = res.page?.pageSize ?? 10;
          this.pageConfig.currentPage = res.page?.pageIndex ?? 1;

          this.ui.isSearching = false;
        } else {
          this.alert.errorAlert('[order-update-record] searchUpdateRecord fail');
        }
        this.ui.isSearching = false;
      },
      error: (err) => {
        console.error('[order-update-record] searchUpdateRecord fail', err);
        this.alert.errorAlert('[order-update-record] searchUpdateRecord fail' + err);
        this.ui.isSearching = false;
      },
    });
  }

  /** 設定查詢條件 */
  getFilter(pageIndex: number, pageSize?: number) {
    const filter = new Filter();
    filter.pageIndex = pageIndex;

    if (pageSize !== undefined) {
      filter.pageSize = pageSize;
    }

    // 修改人
    if (this.f['revisor'].value ? this.f['revisor'].value.trim() : '') {
      filter.and.push({
        comparator: Comparator.like,
        field: 'user',
        value: this.f['revisor'].value.trim()
      });
    }

    // 修改時間
    if (this.f['createDate'].value) {
      filter.and.push({
        comparator: Comparator.greaterEqual,
        field: 'createTime',
        value: DateTime.fromJSDate(this.f['createDate'].value).toFormat('yyyy-MM-dd')
      });
      filter.and.push({
        comparator: Comparator.lesserEqual,
        field: 'createTime',
        value: DateTime.fromJSDate(this.f['createDate'].value).toFormat('yyyy-MM-dd')
      });
    }

    // 修改欄位關鍵字 (field 要查 message)
    if (this.f['keyword'].value ? this.f['keyword'].value.trim() : '') {
      filter.and.push({
        comparator: Comparator.like,
        field: 'message',
        value: this.f['keyword'].value.trim()
      });
    }

    filter.sort = {};
    filter.sort[this.sortBy.prop] = this.sortBy.dir;
    return filter;
  }

  /** 切換分頁時指定執行的函式 (in-table)
   * @param event 由 in-table 回傳的分頁資訊
   */
  pageChange(event: any) {
    localStorage.setItem('intable-order-historyList-table-pageSize', JSON.stringify({
      itemsPerPage: event.itemsPerPage,
    }));
    this.getOrderHistoryList();
  }

  /** 點擊標題進行排序指定執行的函式 (in-table)
   * @param event 由 in-table 回傳的排序資訊
  */
  sort(event: any) {
    this.getOrderHistoryList();
  }

  /** 修訂紀錄 form reset */
  reset() {
    this.historyForm.reset();
    this.getOrderHistoryList();
  }
}
