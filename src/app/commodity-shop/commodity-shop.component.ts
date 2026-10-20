import { Component, OnInit } from '@angular/core';
import { CommodityService } from '../commodity/commodity.service';
import { CartInfo, Commodity, CommodityCart } from '../core/models/commodity';
import { Comparator, Filter, Sort } from '../core/models/filter';
import { PageConfig } from '../core/models/page';
import { AlertService } from '../core/services/alert.service';
import { DataService } from '../core/services/data.service';
import { CommodityShopService } from './commodity-shop.service';
import { environment } from 'src/environments/environment';
import { Permission } from '../core/models/permission';
import { PermissionService } from '../core/services/permission.service';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/users';
import _ from 'lodash';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-commodity-shop',
  templateUrl: './commodity-shop.component.html',
  styleUrls: ['./commodity-shop.component.scss']
})
export class CommodityShopComponent implements OnInit {

  /** 目前登入的使用者資訊 */
  currentUser: User | null;
  currentUserRoleId?: string;
  /** 是否為訪客 */
  isGuest = false;

  keyword: string = '';

  /** 輪播 banner 列表 */
  bannerList: Commodity[] = [];
  /** 商品列表 */
  commodityList: Commodity[] = [];

  /** product 權限 */
  productPermission: { [key: string]: Permission } = {};

  /** 圖片網址前綴 */
  apiUrl: any;

  ui = {
    isBannerLoading: false,
    isProductLoading: false,
    hasMoreData: false,
    isCategoryLoading: false
  }

  /** 商品分類列表(原始資料) */
  oriCategoryList: {id: string, name: string, brandId: string, brandName: string}[] = [];
  /** 商品分類下拉選單列表 */
  categoryList: {
    view: {id: string, itemName: string}[],
    select: {id: string, itemName: string}[]
  } = {
    view: [],
    select: [],
  };

  /** 下拉選單基礎設定 */
  settings = {
    text: this.translate.instant('please select'),
    selectAllText: this.translate.instant('select all'),
    unSelectAllText: this.translate.instant('unselect all'),
    enableSearchFilter: true,
    singleSelection: false,
    badgeShowLimit: 1,
    maxHeight: 250,
    position: 'bottom',
    autoPosition: false,
    lazyLoading: false,
    classes: 'dropdown-icon dropdown-position',
  };

  /** 設定分頁參數 */
  pageConfig = new PageConfig();
  bannerPageSize = 5;
  productPageSize = 8;

  /** 設定排序參數 */
  sortBy = {
    prop: 'startDate',
    dir: Sort.desc,
  };

  /** 目前的使用者 */
  get currentUserValue() {
    return this.authService.currentUserValue;
  }

  constructor(
    public permission: PermissionService,
    private alert: AlertService,
    private apiService: CommodityShopService,
    private data: DataService,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
  ) {
    this.apiUrl = environment['apiUrl'] + '/' + environment['gateway'].product.slice(0, -1);
    this.currentUser = this.authService.currentUserValue;
    this.currentUserRoleId = this.authService.currentUserValue?.role?.id;
  }

  ngOnInit(): void {
    // get rule first
    this.productPermission = this.permission.getPermission('product-v1');
    console.log(this.productPermission);
    // 是否為訪客
    if (!(this.currentUserValue && this.currentUserValue.accessToken)) {
      this.isGuest = true;
    }

    this.commodityList = [];
    this.getCategory();
    // this.getCommodityList('init');
    // this.getBannerList();
  }

  /** 取得商品分類列表 */
  getCategory() {
    this.ui.isCategoryLoading = true;
    // 檢查是否有登入，有登入正常流程，沒登入走雲市集訪客流程
    const getCategoryList = this.currentUserValue && this.currentUserValue.accessToken ?
                             this.apiService.getCategoryList() :
                             this.apiService.getCloudCategoryList();
    getCategoryList.subscribe({
      next: (res) => {
        if (res && res.info && res.info.success && res.data) {
          this.oriCategoryList = res.data;
          this.oriCategoryList.forEach(item => {
            const data = {
              id: item.id,
              itemName: item.name
            }
            this.categoryList.view.push(data);
          });
          // 去除重複
          this.categoryList.view = [...new Map(this.categoryList.view.map(item => [item['itemName'], item])).values()];

          /*
          // 只需要名稱
          let dropdownName: string[] = [];
          res.data.forEach((item: any) => {
            dropdownName.push(item.name);
          });
          // 去除重複
          dropdownName = _.uniq(dropdownName);
          // 寫入下拉選單
          dropdownName.forEach((item: any) => {
            const data = {
              id: item,
              itemName: item
            }
            this.categoryList.view.push(data);
          });
          this.categoryList.view = _.cloneDeep(this.categoryList.view);
          */
          this.categoryList.select = _.cloneDeep(this.categoryList.view);

          this.getCommodityList('init');
          this.getBannerList();
        }
        this.ui.isCategoryLoading = false;
      },
      error: (err) => {
        this.categoryList.view = [];
        this.alert.errorAlert('[get category list error]： ' + err);
        this.ui.isCategoryLoading = false;
      },
    });
  }

  openFilter() {
    //
  }

  closeFilter() {
    this.getCommodityList('init');
  }

  /** API: 取得輪播 banner 列表 */
  getBannerList() {
    this.ui.isBannerLoading = true;
    this.bannerList = [];

    const filter = this.getFilter(this.pageConfig.currentPage, this.bannerPageSize);
    filter.and = [];
    console.log(filter);

    // 檢查是否有登入，有登入正常流程，沒登入走雲市集訪客流程
    const getProductBanner = this.currentUserValue && this.currentUserValue.accessToken ?
                             this.apiService.getProductBanner(filter) :
                             this.apiService.getcloudMarketProductBanners(filter);
    getProductBanner.subscribe({
      next: (res) => {
        console.log('[commodity] getProductList done: ', res);
        if (res && res.info && res.info.success && res.data) {
          this.bannerList = res.data;
          this.bannerList.forEach((commodity: Commodity) => {
            commodity.bannerImage = this.apiUrl + commodity.bannerImage;
          });
          console.log(this.bannerList);

          this.pageConfig.totalItems = res.page?.dataCount ?? 0;
          this.pageConfig.itemsPerPage = res.page?.pageSize ?? this.bannerPageSize;
          this.pageConfig.currentPage = res.page?.pageIndex ?? 1;

        }
        this.ui.isBannerLoading = false;
      },
      error: (err) => {
        this.alert.errorAlert('[commodity] getProductList fail: ' + err);
        console.error('[commodity] getProductList fail: ', err);
        this.ui.isBannerLoading = false;
      },
    });
  }

  /** API: 取得商品列表 */
  getCommodityList(type: 'init' | 'loadMore', event?: any) {
    if (event?.isComposing) {
      return;
    }

    if (type === 'init') {              // 避免 loadMore 時閃爍
      this.ui.isProductLoading = true;
    }

    const filter = this.getFilter(this.pageConfig.currentPage, this.productPageSize);
    console.log(filter);

    // 檢查是否有登入，有登入正常流程，沒登入走雲市集訪客流程
    const getProductList = this.currentUserValue && this.currentUserValue.accessToken ?
                           this.apiService.getProductList(filter) :
                           this.apiService.getcloudMarketProductList(filter);
    getProductList.subscribe({
      next: (res) => {
        console.log('[commodity] getProductList done: ', res);
        if (res && res.info && res.info.success && res.data) {
          const commodityList = res.data.map((commodity: Commodity) => {
            return {
              ...commodity,
              bannerImage: commodity.bannerImage ? this.apiUrl + commodity.bannerImage : '',
              defaultImage: commodity.defaultImage ? this.apiUrl + commodity.defaultImage : '',
            }
          });

          if (type === 'init') {
            this.commodityList = commodityList;
            this.commodityList.forEach((commodity: Commodity) => {
              this.data.setIdLabel('products', commodity.productId, commodity.productName);
            });

          } else {
            const moreData = commodityList;
            console.log(commodityList);
            console.log(this.commodityList);

            this.commodityList = this.commodityList.concat(moreData);
            // console.log(this.commodityList);
          }
          this.pageConfig.totalItems = res.page?.dataCount ?? 0;
          this.pageConfig.itemsPerPage = res.page?.pageSize ?? this.productPageSize;
          this.pageConfig.currentPage = res.page?.pageIndex ?? 1;

          const moreOption = this.pageConfig.totalItems - (this.pageConfig.itemsPerPage * this.pageConfig.currentPage);
          this.ui.hasMoreData = moreOption > 0;
        }
        this.ui.isProductLoading = false;
      },
      error: (err) => {
        this.alert.errorAlert('[commodity] getProductList fail: ' + err);
        console.error('[commodity] getProductList fail: ', err);
        this.ui.isProductLoading = false;
      },
    });
  }

  loadMore() {
    this.pageConfig.currentPage += 1;
    this.getCommodityList('loadMore');
  }

  /** 設定查詢條件 */
  getFilter(pageIndex: number, pageSize?: number) {
    const filter = new Filter();
    filter.pageIndex = pageIndex;

    if (pageSize !== undefined) {
      filter.pageSize = pageSize;
    }

    if (this.keyword.trim()) {
      filter.and.push({
        comparator: Comparator.like,
        field: 'tagAndProductName',
        value: this.keyword.trim()
      });
    }

    // 重複的名稱需要找相對應的id
    const data: string[] = [];
    this.categoryList.select.forEach(item => {
      const categoryId = this.oriCategoryList.filter(oriList => oriList.name === item.itemName);
      categoryId.forEach(idList => {
        data.push(idList.id);
      });
    });
    filter.and.push({
      comparator: Comparator.in,
      field: 'brandCategory',
      value: data
    });

    filter.sort = {};
    filter.sort[this.sortBy.prop] = this.sortBy.dir;
    return filter;
  }

  /** 方案購買 */
  goToCart(commodity: CommodityCart) {
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
    // 先將紀錄存到 LocalStorage
    // 是否有 localStorage 的紀錄
    const isShoppingRecord = localStorage.getItem('shoppingCart');
    // 解析 localStorage 的紀錄
    const userSoppingList: { userId: string, role: CartInfo[] }[] = isShoppingRecord ? JSON.parse(isShoppingRecord) : [];
    // 是否有這個使用者 的紀錄
    const userRecord = userSoppingList.find((item: { userId: string, role: CartInfo[] }) => item.userId === currentUserId);
    const userRecordIdx = userSoppingList.findIndex((item: { userId: string, role: CartInfo[] }) => item.userId === currentUserId);
    const getSoppingList = userRecord ? userRecord.role : [];
    // 是否有這筆 role 的紀錄
    const isRoleRecord = getSoppingList.length ? getSoppingList.find((item: CartInfo) => item.roleId === currentUserRoleId) : undefined;
    // 要存到 localStorage 的物件
    // const shoppingCartList: CartInfo[] = [];
    const shoppingCart: CartInfo = {
      roleId: currentUserRoleId ?? '',
      cartList: [],
    };
    const shoppingItem: CommodityCart = {
      productId: commodity.productId,
      productName: commodity.productName
    }
    // console.log('isShoppingRecord:', isShoppingRecord);
    // console.log('getSoppingList:', getSoppingList);
    // console.log('isRoleRecord', isRoleRecord);

    // 如果還沒有紀錄 或 這個角色還未有紀錄，新增一筆紀錄
    if (!isShoppingRecord || !isRoleRecord) {
      console.log('還沒有紀錄 或 這個角色還未有紀錄');
      const newItem = _.cloneDeep(shoppingItem);
      newItem.purchaseQuantity = 1;
      shoppingCart.cartList?.push(newItem);
      getSoppingList.push(shoppingCart);

    } else if (isRoleRecord) {    // 這個 role 有紀錄
      // 是否已有這筆商品的紀錄
      const isItemRecord = isRoleRecord.cartList?.findIndex(element => element.productId === commodity.productId);
      const itemRecord = isRoleRecord.cartList?.find(element => element.productId === commodity.productId);
      // console.log(isItemRecord);
      // console.log(itemRecord);

      if (isItemRecord === -1) {
        console.log('沒有該商品紀錄');
        const newItem = _.cloneDeep(shoppingItem);
        newItem.purchaseQuantity = 1;
        isRoleRecord.cartList?.unshift(newItem);
      } else if (isItemRecord !== undefined && isItemRecord > -1 && itemRecord) {
        console.log('已經有該商品紀錄');
        const newItem = _.cloneDeep(itemRecord);
        newItem.purchaseQuantity = newItem.purchaseQuantity ? (newItem.purchaseQuantity + 1) : 1;
        isRoleRecord.cartList?.splice(isItemRecord, 1);
        isRoleRecord.cartList?.unshift(newItem);
      }

      const roleRecord = getSoppingList.findIndex((item: CartInfo) => item.roleId === currentUserRoleId);
      getSoppingList.splice(roleRecord, 1, isRoleRecord);

      // 如果已有紀錄，先清掉舊的紀錄
      // localStorage.removeItem('shoppingCart');
    }

    const userShoppingRecord = {
      userId: currentUserId ?? '',
      role: getSoppingList
    };
    if (userRecord) {
      userSoppingList.splice(userRecordIdx, 1, userShoppingRecord);
    } else {
      userSoppingList.push(userShoppingRecord);
    }

    console.log('going to set localStorage', userSoppingList);
    localStorage.setItem('shoppingCart', JSON.stringify(userSoppingList));

    // 跳轉
    this.router.navigate(['/main/commodity-shop/cart']);
  }

}
