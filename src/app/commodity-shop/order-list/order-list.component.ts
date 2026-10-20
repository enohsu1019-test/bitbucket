import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { InTableConfig, Sort } from '@sysage/in-table';
import { CartOrderDetail, OrderStatus, OrderStatusList } from 'src/app/core/models/commodity';
import { Comparator, Filter } from 'src/app/core/models/filter';
import { PageConfig } from 'src/app/core/models/page';
import { Permission } from 'src/app/core/models/permission';
import { AlertService } from 'src/app/core/services/alert.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { DataService } from 'src/app/core/services/data.service';
import { PermissionService } from 'src/app/core/services/permission.service';
import { UtilService } from 'src/app/core/services/util.service';
import { CommodityShopService } from '../commodity-shop.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {

  searchForm!: FormGroup;

  orderList: CartOrderDetail[] = [];

  statusDDL = OrderStatusList;

  /** product 權限 */
  productPermission: { [key: string]: Permission } = {};

  /** in-table setting */
  inTableConfig = new InTableConfig();
  defaultPageSize = 10;
  filter = new Filter({
    pageSize: this.defaultPageSize
  });

  /** 設定分頁參數 */
  pageConfig = new PageConfig();

  /** 設定排序參數 */
  sortBy = {
    prop: 'purchaseDate',
    dir: Sort.desc,
  };

  ui = {
    isSearching: false,
  }

  get f() { return this.searchForm.controls }
  get OrderStatus() { return OrderStatus }

  constructor(
    public util: UtilService,
    public permission: PermissionService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private alert: AlertService,
    private apiService: CommodityShopService,
    private authService: AuthService,
    private data: DataService
  ) {
    this.initSearchForm();
  }

  initSearchForm() {
    this.searchForm = this.fb.group({
      orderId: [''],
      status: [''],
      purchaseDate: ['']
    });
  }

  ngOnInit(): void {
    // get rule first
    this.productPermission = this.permission.getPermission('product-v1');
    console.log(this.productPermission);

    const pref = JSON.parse(localStorage.getItem('authorization-list-table')!);
    if (pref?.itemsPerPage) {
      this.filter.pageSize = pref.itemsPerPage;
      this.pageConfig.itemsPerPage = pref.itemsPerPage;
    }

    /** in-table setting */
    this.inTableConfig.sitckyElemId = 'page-header';
    this.inTableConfig.enableResizeColWidth = true;
    this.inTableConfig.showBorder = true;
    this.inTableConfig.showAllSubRowOnlyIfMoreThanOne = false;
    this.inTableConfig.rowLinkKey = this.productPermission['product-v1.queryShoppingCartDetail'] ? 'id' : '';

    this.getOrderList();
  }

  /** API: 查詢購買紀錄清單 */
  getOrderList() {
    this.ui.isSearching = true;
    this.orderList = [];
    const filter = this.getFilter(this.pageConfig.currentPage, this.pageConfig.itemsPerPage);

    this.apiService.getShoppingOrderList(filter).subscribe({
      next: (res) => {
        console.log('[commodity shop] getOrderList done: ', res);
        if (res && res.info && res.info.success && res.data) {
          this.orderList = res.data;
          res.data.forEach((order: CartOrderDetail) => this.data.setIdLabel('cartOrders', order.id ?? '', order.orderId ?? ''));
          console.log(this.orderList);

          this.pageConfig.totalItems = res.page?.dataCount ?? 0;
          this.pageConfig.itemsPerPage = res.page?.pageSize ?? 10;
          this.pageConfig.currentPage = res.page?.pageIndex ?? 1;
        }
        this.ui.isSearching = false;
      },
      error: (err) => {
        console.error('[commodity shop] getOrderList fail: ', err);
        this.ui.isSearching = false;
      }
    });
  }

  /** 設定查詢條件 */
  getFilter(pageIndex: number, pageSize?: number) {
    const filter = new Filter();
    filter.pageIndex = pageIndex;

    if (pageSize !== undefined) {
      filter.pageSize = pageSize;
    }

    if (this.f['orderId'].value ? this.f['orderId'].value.trim() : '') {
      filter.and.push({
        comparator: Comparator.like,
        field: 'orderId',
        value: this.f['orderId'].value.trim()
      });
    }
    if (this.f['status'].value ? this.f['status'].value.trim() : '') {
      filter.and.push({
        comparator: Comparator.equal,
        field: 'status',
        value: this.f['status'].value.trim()
      });
    }
    if (this.f['purchaseDate'].value) {
      filter.and.push({
        comparator: Comparator.greaterEqual,
        field: 'purchaseDate',
        value: this.f['purchaseDate'].value
      });
    }

    filter.sort = {};
    filter.sort[this.sortBy.prop] = this.sortBy.dir;
    return filter;
  }

  reset() {
    this.initSearchForm();
    this.getOrderList();
  }

  /** 切換分頁時指定執行的函式 (in-table)
   * @param event 由 in-table 回傳的分頁資訊
   */
  pageChange(event: any) {
    localStorage.setItem('intable-commodity-order-list-table-pageSize', JSON.stringify({
      itemsPerPage: event.itemsPerPage,
    }));
    this.getOrderList();
  }

  /** 點擊標題進行排序指定執行的函式 (in-table)
   * @param event 由 in-table 回傳的排序資訊
  */
  sort(event: any) {
    this.getOrderList();
  }


}
