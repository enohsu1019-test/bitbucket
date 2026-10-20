import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CartInfo, CommodityCart, PaymentMethodList, ProductCate } from 'src/app/core/models/commodity';
import { Comparator, Filter } from 'src/app/core/models/filter';
import { User } from 'src/app/core/models/users';
import { AlertService } from 'src/app/core/services/alert.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommodityShopService } from '../../commodity-shop.service';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { DateTime } from 'luxon';
import { InTableConfig } from '@sysage/in-table';
import { UtilService } from 'src/app/core/services/util.service';
import { PageConfig } from 'src/app/customers/customers';
import { PermissionService } from 'src/app/core/services/permission.service';
import { Permission } from 'src/app/core/models/permission';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss']
})
export class ShoppingListComponent implements OnInit {
  @Input() mode: 'edit' | 'prev' | 'view' = 'edit';
  @Input() orderList: CommodityCart[] = [];
  @Input() orderPriceDetail!: { orderPrice: number, orderTax: number, orderTotal: number };
  @Input() code!: string;
  @Output() commodityListUpdate = new EventEmitter<CommodityCart[]>();
  @Output() orderPriceUpdate = new EventEmitter<number>();
  @Output() productCompanyId = new EventEmitter<string>();
  @Output() invalidData = new EventEmitter<boolean>();

  /** product 權限 */
  productPermission: { [key: string]: Permission } = {};

  /** 商品列表 */
  commodityList: CommodityCart[] = [];

  /** 下拉選單列表 - 付款方式 */
  paymentMethodList = PaymentMethodList;

  /** 訂購金額 */
  orderPrice: number = 0;
  orderTax: number = 0;
  orderTotal: number = 0;

  /** 目前登入的使用者資訊 */
  currentUser: User | null;
  currentUserRoleId?: string;
  /** 是否為訪客 */
  isGuest = false;

  minDate: Date = new Date();

  /** in-table setting */
  inTableConfig = new InTableConfig();
  /** 設定分頁參數 */
  pageConfig = new PageConfig();

  ui = {
    isLoading: false,
  }

  get ProductCate() { return ProductCate; }
  /** 目前的使用者 */
  get currentUserValue() {
    return this.authService.currentUserValue;
  }

  constructor(
    public permission: PermissionService,
    public util: UtilService,
    private authService: AuthService,
    private apiService: CommodityShopService,
    private alert: AlertService,
    private translate: TranslateService,
  ) {
    this.currentUser = this.authService.currentUserValue;
    this.currentUserRoleId = this.authService.currentUserValue?.role?.id;

    /** in-table setting */
    this.inTableConfig.sitckyElemId = 'page-header';
    this.inTableConfig.enableResizeColWidth = true;
    this.inTableConfig.showBorder = true;
    this.inTableConfig.showAllSubRowOnlyIfMoreThanOne = false;
    this.inTableConfig.groupByKey = 'solutionName';
    this.inTableConfig.groupByLabel = this.translate.instant('solution');
  }

  ngOnInit(): void {
    // get permission
    this.productPermission = this.permission.getPermission('product-v1');
    // 是否為訪客
    if (!(this.currentUserValue && this.currentUserValue.accessToken)) {
      this.isGuest = true;
    }
    this.ui.isLoading = true;

    if (this.mode !== 'view') {
      this.shoppingCartInit();
    } else {
      this.shoppingOrderInit();
    }

  }

  /** 購物車狀態 */
  shoppingCartInit() {
    let currentUserId: string | undefined = '';
    let currentUserRoleId: string | undefined = '';
    // 是否為訪客
    if (this.currentUserValue && this.currentUserValue.accessToken) {
      currentUserId = this.currentUser?.id;
      currentUserRoleId = this.currentUserRoleId;
    } else {
      currentUserId = 'guest';
      currentUserRoleId = 'guest';
    }
    // 是否有 localStorage 的紀錄
    const isShoppingRecord = localStorage.getItem('shoppingCart');
    // 解析 localStorage 的紀錄
    const userSoppingList: { userId: string, role: CartInfo[] }[] = isShoppingRecord ? JSON.parse(isShoppingRecord) : [];
    // 是否有這個使用者 的紀錄
    const userRecord = userSoppingList.find((item: { userId: string, role: CartInfo[] }) => item.userId === currentUserId);
    const userRecordIdx = userSoppingList.findIndex((item: { userId: string, role: CartInfo[] }) => item.userId === currentUserId);
    const getSoppingList = userRecord ? userRecord.role : [];
    // 是否有這筆 role 的紀錄
    const isRoleRecord: CartInfo | undefined =
      getSoppingList?.length ? getSoppingList.find((item: CartInfo) => item.roleId === currentUserRoleId) : undefined;

    console.log(isShoppingRecord);
    console.log(getSoppingList);
    console.log(isRoleRecord);
    console.log(this.currentUserRoleId);

    if (isRoleRecord && isRoleRecord.cartList) {
      const cartIdList = isRoleRecord.cartList.map((item: CommodityCart) => item.productId);
      this.getCommodityList(isRoleRecord.cartList, cartIdList);
    } else {
      this.ui.isLoading = false;
    }
  }

  /** 購買清單狀態 */
  shoppingOrderInit() {
    this.commodityList = this.orderList;
    this.orderPrice = this.orderPriceDetail.orderPrice;
    this.orderTax = this.orderPriceDetail.orderTax;
    this.orderTotal = this.orderPriceDetail.orderTotal;
    this.ui.isLoading = false;
  }

  /** API: 取得商品列表 */
  getCommodityList(cartList: CommodityCart[], cartIdList: string[]) {
    this.ui.isLoading = true;
    const filter: any = this.getFilter(1, -1);
    filter.or = [];

    filter.and.push({
      comparator: Comparator.in,
      field: 'productId',
      value: cartIdList
    });
    filter.or.push({
      comparator: Comparator.greaterEqual,
      field: 'inventoryQty',
      value: 0
    });
    filter.or.push({
      comparator: Comparator.equal,
      field: 'inventoryQty',
      value: null
    });

    console.log(filter);

    // 檢查是否有登入，有登入正常流程，沒登入走雲市集訪客流程
    const getProductList = this.currentUserValue && this.currentUserValue.accessToken ?
                           this.apiService.getProductList(filter) :
                           this.apiService.getcloudMarketProductList(filter);
    getProductList.subscribe({
      next: (res) => {
        console.log('[commodity] getProductList done: ', res);
        if (res && res.info && res.info.success && res.data) {
          // 已售罄或已停賣清單
          let soldOutList = '';

          // const commodityList: CommodityCart[] = [];
          cartList.forEach((commodity: CommodityCart) => {
            const cartListItem = res.data.find((item: CommodityCart) => item.productId === commodity.productId);
            console.log(cartListItem);

            // 比對原本 localStorage 的產品
            if (cartListItem) {
              const startDate = commodity.startDate ? commodity.startDate : DateTime.fromJSDate(new Date()).toFormat('yyyy-MM-dd');
              const quantity = // 若原訂數量超過可賣庫存，改為庫存量
                commodity.purchaseQuantity ?
                  (commodity.purchaseQuantity > cartListItem.inventoryQty && cartListItem.inventoryQty) ?
                    cartListItem.inventoryQty : commodity?.purchaseQuantity
                  : 1;

              const newItem: CommodityCart = {
                productId: cartListItem.productId,
                productName: cartListItem.productName,
                startDate: startDate,
                productSku: cartListItem.productSku,
                sellingPrice: cartListItem.sellingPrice,
                purchaseQuantity: quantity,
                maxQuantity: cartListItem.inventoryQty,
                // paymentMethod: this.translate.instant(this.paymentMethodList[0].value),
                paymentMethod: this.paymentMethodList[0].value,
                solutionId: cartListItem.solutionId,
                solutionName: cartListItem.solutionName,
                customerId: cartListItem.customerId,
                timeUnit: commodity.timeUnit ?? 1,
                category: cartListItem.category,
                leaseMode: cartListItem.leaseMode.month,
                unit: cartListItem.unit,
              }
              this.commodityList.push(newItem);
            } else {   // 如果不在取回的清單內，為已售罄或已停賣
              soldOutList += `${commodity.productName}、`;
            }
          });
          console.log(this.commodityList);

          if (soldOutList !== '') {
            soldOutList = soldOutList.slice(0, -1) + ' ';
            const alertMsg =
              this.translate.instant('is out of stock or no longer be sold and remove from cart list', {
                products: soldOutList
              });
            this.alert.errorAlert(alertMsg);
          }

          // 將上架產品的公司 ID 回傳上一層
          // 目前都只會有一家公司，故先取第一筆值的 customerId
          // 需要開啟權限1.使用者模組 => 取得業務人員
          this.productCompanyId.emit(res.data[0]?.customer && res.data[0]?.customer.id ? res.data[0]?.customer.id : '');
        }
        this.passCommodityList();
        if (this.commodityList.length) {
          this.updateOrderPrice();
        }
        this.ui.isLoading = false;
      },
      error: (err) => {
        this.alert.errorAlert('[commodity] getProductList fail: ' + err);
        console.error('[commodity] getProductList fail: ', err);
        this.ui.isLoading = false;
      },
    });
  }

  /** 更新訂購金額 */
  updateOrderPrice() {
    if (this.commodityList.length) {
      const priceList = this.commodityList?.map(el => (el.sellingPrice ?? 0) * (el.purchaseQuantity ?? 0));
      this.orderPrice = priceList?.reduce((a, b) => a + b);
    };
    this.orderTax = _.round(this.orderPrice * 0.05);
    this.orderTotal = _.round(this.orderPrice * 1.05);
    this.orderPriceUpdate.emit(this.orderPrice);
  }

  /** 設定查詢條件 */
  getFilter(pageIndex: number, pageSize?: number) {
    const filter = new Filter();
    filter.pageIndex = pageIndex;

    if (pageSize !== undefined) {
      filter.pageSize = pageSize;
    }

    filter.sort = {};
    return filter;
  }

  /** 回傳 commodityList to 父元件 */
  passCommodityList() {
    let invalidData = false;
    this.commodityList.forEach(item => {
      // item.periodUnit = item.periodUnit ? Number(item.periodUnit) : ''; // 若不是訂閱制的話，給 ''
      item.purchaseQuantity = Number(item.purchaseQuantity);
      if ((item.category === ProductCate.subscription && !item.timeUnit) || !item.purchaseQuantity) {
        invalidData = true;
      } else if ((item.category === ProductCate.subscription && item.timeUnit && item.timeUnit < 1) || item.purchaseQuantity < 1) {
        invalidData = true;
      }
    });
    this.invalidData.emit(invalidData);
    this.commodityListUpdate.emit(this.commodityList);
    console.log(this.commodityList);

    this.updateOrderPrice();
  }

  /** 刪除列表 */
  deleteCommodity(productId: string) {
    if (this.mode === 'prev' || this.mode === 'view') {
      return;
    }
    const idx = this.commodityList.findIndex(item => item.productId === productId);
    this.commodityList.splice(idx, 1);
    this.productCompanyId.emit(this.commodityList[0]?.customerId);
    this.passCommodityList();
    this.updateOrderPrice();
  }

  /** 檢查最大數量 */
  quantityValidate(commodity: CommodityCart, event: any) {
    event.preventDefault();

    if (event.keyCode != 46 && event.keyCode != 8  // delete &&  backspace
    ) {
      if (commodity.purchaseQuantity && commodity.maxQuantity &&
        commodity.purchaseQuantity > commodity.maxQuantity) {
        commodity.purchaseQuantity = commodity.maxQuantity;
        // } else if (!commodity.purchaseQuantity || commodity.purchaseQuantity < 1) {
        //   commodity.purchaseQuantity = 1;
      }
      // } else if (!commodity.purchaseQuantity) {
      //   commodity.purchaseQuantity = 1;
    }
    // const msg = this.translate.instant('商品最大數量') + ": " + commodity.maxQuantity;
    // return msg;
  }

  /** 檢查數量，若數量達上限，顯示提示語 */
  checkQuantity(commodity: CommodityCart): boolean {
    if (!commodity.maxQuantity) {
      return false;
    } else if ((commodity.purchaseQuantity ?? 0) >= (commodity.maxQuantity ? commodity.maxQuantity : 0)) {
      return true;
    } else {
      return false;
    }
  }

  /** 檢查日期，若清空，顯示提示語 */
  checkDate(commodity: CommodityCart) {
    console.log(commodity.startDate);
    console.log(!commodity.startDate);
    if (!commodity.startDate) {
      commodity.startDate = DateTime.fromJSDate(this.minDate).toFormat('yyyy-MM-dd');
      this.alert.warningAlert(this.translate.instant('input required'));
    }
  }

  /**
   * 計價類別
   * @param {string} name 代號
   */
  categoryName(name: string) {
    switch(name) {
      // 用量制
      case 'PER_USAGE':
        return this.translate.instant('per unit type');
      // 訂閱制
      case 'SUBSCRIPTION':
        return this.translate.instant('subscription type');
      // 費用
      case 'EXPENSE':
        return this.translate.instant('expense');
      // 授權制
      case 'LICENSE':
        return this.translate.instant('license type');
      // 保證用量
      case 'COMMITMENT':
        return this.translate.instant('commitment');
      // 超額用量
      case 'COMMITMENT_OVERAGE':
        return this.translate.instant('commitment overage');
      // ???
      case 'INCLUDED_UNITS':
        return this.translate.instant('included units');
      // ???
      case 'QUANTITY_BASED_COMMIT':
        return this.translate.instant('quantity based commit');
    }
  }

  /**
   * 計費週期
   * @param mode 代號
   */
  leaseMode(mode: number) {
    switch(mode) {
      // 年計價
      case 12:
        return this.translate.instant('year payment');
      // 3 年計價
      case 36:
        return this.translate.instant('3 year payment');
      // 月計價
      case 1:
        return this.translate.instant('month payment');
      // 一次性計價
      case -1:
        return this.translate.instant('once payment');
    }
  }
}
