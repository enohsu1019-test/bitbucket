import { FormGroup } from '@angular/forms';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { CartFormValue, CartInfo, CartOrderDetail, CommodityCart, PaymentMethod } from 'src/app/core/models/commodity';
import { User } from 'src/app/core/models/users';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommodityShopService } from '../commodity-shop.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { ResponseData } from 'src/app/core/models/response-data';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Comparator, Filter } from 'src/app/core/models/filter';
import { Permission } from 'src/app/core/models/permission';
import { PermissionService } from 'src/app/core/services/permission.service';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit {

  step: number = 1;

  /** product 權限 */
  productPermission: { [key: string]: Permission } = {};

  /** 子元件回傳的 form & formValue */
  cartForm: FormGroup = new FormGroup({});
  cartFormValue!: CartFormValue;

  /** 目前登入的使用者資訊 */
  currentUser: User | null;
  currentUserRoleId?: string;
  identityType!: string;
  companyId!: string;
  company!: string;
  endUserId!: string;
  /** 是否為訪客 */
  isGuest = false;

  /** 上架產品的公司 ID */
  productCompanyId: string = '';

  /** localStorage 訂單記錄 */
  // 是否有 localStorage 的紀錄
  isShoppingRecord: string | null = '';
  // 解析 localStorage 的紀錄
  userSoppingList: { userId: string, role: CartInfo[] }[] = [];
  // 是否有這個使用者 的紀錄 -> findIndex
  getSoppingList: CartInfo[] = [];
  // 是否有這筆 role 的紀錄 -> findIndex
  roleRecord: number = 0;

  /** 訂購金額 */
  orderPrice: number = 0;

  /** 儲存route傳來的交易代碼 */
  nav: string = '';

  ui = {
    isBought: false,        // 是否已完成購買
    isFormChecking: false,  // 正在檢查表單
    isOrdering: false,      // 下訂中
    isCartInvalid: false,   // 購物車資訊有誤
    isDownload: false       // 下載清單
  }

  /** 商品列表 */
  commodityList: CommodityCart[] = [];

  modalRef?: BsModalRef;

  /** 目前的使用者 */
  get currentUserValue() {
    return this.authService.currentUserValue;
  }

  constructor(
    public permission: PermissionService,
    private authService: AuthService,
    private apiService: CommodityShopService,
    private alert: AlertService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private router: Router,
  ) {
    this.currentUser = this.authService.currentUserValue;
    this.currentUserRoleId = this.authService.currentUserValue?.role?.id;
    this.identityType = this.currentUser?.role?.identityType ?? '';
    this.companyId = this.currentUser?.role?.company.id ?? '';
    this.company = this.currentUser?.role?.company.fullCh ?? '';
    this.endUserId = this.cartForm.value['enduserId'];

    /** 訂閱是否已檢查表單 */
    this.apiService.cartFromChecking.subscribe(status => {
      this.ui.isFormChecking = status;
    });

    /** 判斷route是否有傳交易代碼 */
    const nav = this.router.getCurrentNavigation();
    if (nav) {
      this.nav = (nav.extras && nav.extras.state && nav.extras.state['code']) ? nav.extras.state['code'] : undefined;
    }
  }

  ngOnInit(): void {
    // get rule first
    this.productPermission = this.permission.getPermission('product-v1');
    console.log(this.productPermission);
    // 是否為訪客
    if (!(this.currentUserValue && this.currentUserValue.accessToken)) {
      this.isGuest = true;
    }
  }

  /** API: 檢查數量 & get brandId, currency, solutionId， then 送出訂單 */
  submitOrder() {
    this.ui.isOrdering = true;

    // 先檢查是否為 經銷商 或 最終使用者
    /* if (this.identityType !== 'DEALER' && this.identityType !== 'END_USER') {
      const msg =
        this.translate.instant('identity type not dealer or enduser') +
        this.translate.instant('no access to', {
          action: this.translate.instant('submit'),
          item: this.translate.instant('this purchase order')
        });

      this.alert.errorAlert(msg);
      this.ui.isOrdering = false;
      return;
    } */

    const filter: any = this.getFilter(1, -1);
    const productList: CommodityCart[] = [];

    /** 先 get brandId, currency, solutionId */
    this.apiService.getProductList(filter).subscribe({
      next: (res) => {
        console.log('[commodity] getProductList done: ', res);
        if (res && res.info && res.info.success && res.data) {
          this.commodityList.forEach((commodity: CommodityCart) => {
            const cartListItem = res.data.find((item: CommodityCart) => item.productId === commodity.productId);
            console.log(cartListItem);

            // 比對原本 localStorage 的產品
            if (cartListItem) {
              const productDetails = {
                productId: commodity.productId,
                productSku: commodity.productSku,
                productName: commodity.productName,
                startDate: commodity.startDate,
                purchaseQuantity: commodity.purchaseQuantity,
                sellingPrice: commodity.sellingPrice ?? 0,
                // paymentMethod: commodity.paymentMethod,
                currency: cartListItem.currency,
                brandId: cartListItem.brandId,
                solutionId: cartListItem.solutionId,
                timeUnit: commodity.timeUnit,
                unit: commodity.unit,
                leaseMode: cartListItem.leaseMode.month,
                category: commodity.category
              }
              productList.push(productDetails);
            }
          });

          // 給api的值要去除openContactEmail
          const userDetailData = _.cloneDeep(this.cartFormValue);
          // 去除公司名稱與()
          userDetailData.billingAddress = userDetailData.billingAddress.split('(')[1].split(')')[0];
          userDetailData.customerAddress = userDetailData.customerAddress.split('(')[1].split(')')[0];
          // 雲市集身份不用付款方式
          if (this.currentUserValue?.role?.brand.name === '雲市集') {
            userDetailData.paymentMethod = PaymentMethod.null;
          }
          delete userDetailData.openContactEmail;

          // 準備回傳後端的 data format
          const cartDetail: CartOrderDetail = {
            productDetails: productList,
            orderAmount: this.orderPrice,     // 現在都是 TWD，沒有小數點
            tax: _.round(this.orderPrice * 0.05),
            totalAmount: this.orderPrice + _.round(this.orderPrice * 0.05),
            userDetail: userDetailData,
            openContactEmail: this.cartFormValue.openContactEmail,
            code: this.nav
          }

          console.log(cartDetail);
          this.sendOrder(cartDetail);
        }
      },
      error: (err) => {
        this.alert.errorAlert('[commodity] getProductList fail: ' + err);
        console.error('[commodity] getProductList fail: ', err);
      },
    });
  }


  /** API: 送出訂單紀錄 */
  sendOrder(cartDetail: CartOrderDetail) {
    this.apiService.sendOrder(cartDetail).subscribe({
      next: (res) => {
        if (res && res.info && res.info.success && res.data) {
          console.log('[commodity] shoppingCartDetail done: ', res);

          // this.transformToOrder(res.data);
          this.removeRolesCartRecord();

          this.ui.isBought = true;

          this.step = 4;
          this.alert.successAlert(res.info.message);
          this.modalRef?.hide();
        } else {
          this.alert.errorAlert('[commodity] shoppingCartDetail fail: ' + res.info.message);
          console.error('[commodity] shoppingCartDetail fail: ', res.info.message);
          this.step = 3;
          setTimeout(() => {
            this.modalRef?.hide();
          }, 300);
        };
        this.ui.isOrdering = false;
      },
      error: (err) => {
        this.ui.isOrdering = false;
        this.alert.errorAlert('[commodity] shoppingCartDetail fail: ' + err);
        console.error('[commodity] shoppingCartDetail fail: ', err);
        this.step = 3;
        this.modalRef?.hide();
      },
    });
  }

  /** 訂單新增成功後，要清除該筆角色的暫存清單 */
  removeRolesCartRecord() {
    // 如果有 localStorage 的紀錄
    if (this.getSoppingList) {
      console.log('有 localStorage 的紀錄');

      if (this.roleRecord !== -1) { // 如果該使用者有紀錄
        console.log('如果該使用者有紀錄 -> 更新');
        this.getSoppingList.splice(this.roleRecord, 1);
      }
    }

    console.log(this.getSoppingList);
    localStorage.setItem('shoppingCart', JSON.stringify(this.getSoppingList));
  }

  /** 換頁 */
  updateStep(type: 'prev' | 'next') {

    // 進到預覽前，須先檢查是否都有填寫欄位
    if (this.step === 2 && type === 'next') {
      this.apiService.updateCheckingStatus(true);
      if (!this.checkForm()) {
        console.log('invalid');
        return;
      }
    }

    this.step += type === 'prev' ? -1 : +1;
    if (this.step > 3) {
      this.step = 3;
    }
  }

  /** 將紀錄存到 LocalStorage */
  setListToLocalStorage() {
    let currentUserId: string | undefined = '';
    let currentUserRoleId: string | undefined = '';
    // 是否為訪客
    if (this.isGuest) {
      currentUserId = 'guest';
      currentUserRoleId = 'guest';
    } else {
      currentUserId = this.currentUser?.id;
      currentUserRoleId = this.currentUserRoleId;
    }
    // 是否有 localStorage 的紀錄
    this.isShoppingRecord = localStorage.getItem('shoppingCart');
    // 解析 localStorage 的紀錄
    this.userSoppingList = this.isShoppingRecord ? JSON.parse(this.isShoppingRecord) : [];
    // 是否有這個使用者 的紀錄
    const userRecord = this.userSoppingList.find(item => item.userId === currentUserId);
    const userRecordIdx = this.userSoppingList.findIndex((item: { userId: string, role: CartInfo[] }) => item.userId === currentUserId);
    this.getSoppingList = userRecord ? userRecord.role : [];
    // 是否有這筆 role 的紀錄
    this.roleRecord = this.getSoppingList.findIndex((item: CartInfo) => item.roleId === currentUserRoleId);

    console.log(this.isShoppingRecord);
    console.log(this.userSoppingList);
    console.log(userRecord);
    console.log(this.getSoppingList);
    console.log(this.roleRecord);

    // 要存到 localStorage 的物件
    // const shoppingCartList: CartInfo[] = [];
    const shoppingCart: CartInfo = {
      roleId: currentUserRoleId ?? '',
      cartList: this.commodityList,
    };

    // 如果有 localStorage 的紀錄
    if (this.userSoppingList) {
      console.log('有 localStorage 的紀錄');

      if (this.roleRecord !== -1) { // 如果該使用者有紀錄
        console.log('如果該使用者有紀錄 -> 更新');
        this.getSoppingList.splice(this.roleRecord, 1, shoppingCart);
      } else {                 // 如果該使用者沒紀錄
        console.log('如果該使用者沒紀錄 -> 新增');
        this.getSoppingList.push(shoppingCart)
      }
    }

    // 檢查 roleId 若為空者，刪掉
    this.getSoppingList.forEach((item, index) => {
      if (!item.roleId) {
        this.getSoppingList.splice(index, 1);
      }
    });

    const userShoppingRecord = {
      userId: currentUserId ?? '',
      role: this.getSoppingList
    };
    if (userRecord) {
      this.userSoppingList.splice(userRecordIdx, 1, userShoppingRecord);
    } else {
      this.userSoppingList.push(userShoppingRecord);
    }

    console.log(userShoppingRecord);
    localStorage.setItem('shoppingCart', JSON.stringify(this.userSoppingList));
  }

  /** 更新子元件 shopping-list 回傳的值 */
  commodityListUpdate(event: CommodityCart[]) {
    console.log('parent update event', event);
    this.commodityList = event;
    this.setListToLocalStorage();
  }

  /** 更新子元件 shopping-detail 回傳的值 */
  getFormValue(data: { form: FormGroup, formValue: CartFormValue }) {
    this.cartForm = data.form;
    this.cartFormValue = data.formValue;
  }

  /** 下載清單列表 */
  downloadList() {
    this.ui.isDownload = true;
    // 角色id or guest
    const roleItem = this.getSoppingList.filter(item => item.roleId === (this.isGuest ? 'guest' : this.currentUserRoleId));
    // 完整購物車資訊
    const cartList: CommodityCart[] = roleItem[0].cartList ?? [];
    // 商品id
    const cartIdList = cartList.map(item => item.productId);
    const filter: any = new Filter();
    filter.pageSize = -1;
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
    // 檢查是否有登入，有登入正常流程，沒登入走雲市集訪客流程
    const getProductList = this.isGuest ?
                           this.apiService.getcloudMarketProductList(filter) :
                           this.apiService.getProductList(filter);
    getProductList.subscribe({
      next: (res) => {
        if (res && res.info && res.info.success && res.data) {
          let orderAmount = 0;
          cartList.forEach(cartItem => {
            const data = res.data.filter((item: any) => item.productId === cartItem.productId);
            cartItem.currency = data[0].currency;
            cartItem.brandId = data[0].brandId;
            orderAmount = orderAmount + (cartItem.sellingPrice ?? 0) * (cartItem.purchaseQuantity ?? 0);
            cartItem.sellingPrice = cartItem.sellingPrice ?? 0;
          });
          const tax = _.round(orderAmount * 0.05);
          const totalAmount = _.round(orderAmount * 1.05);
          const data = {
            productDetails: cartList,
            orderAmount: orderAmount,
            tax: tax,
            totalAmount: totalAmount
          }
          this.apiService.downloadList(data).subscribe({
            next: (res) => {
              if (res.info && res.info.success) {
                if (res.blob) {
                  FileSaver.saveAs(res.blob, res.filename ? res.filename :  'export.xlsx');
                }
                this.ui.isDownload = false;
              } else {
                this.ui.isDownload = false;
                this.alert.errorAlert('Api.EXCEL ERROR： ' + res.info.message);
              }
            },
            error: (err) => {
              this.alert.errorAlert(err);
              this.ui.isDownload = false;
            }
          });
        } else {
          this.alert.errorAlert(res.info.message);
          this.ui.isDownload = false;
        }
      },
      error: (err) => {
        this.alert.errorAlert(err);
        this.ui.isDownload = false;
      }
    });
  }

  /** 檢查表單必填 */
  checkForm(): boolean {

    const invalidInput = new (Array)();

    const checkInput = (inputName: string, errInputName: string) => {
      if (!this.cartForm.value[inputName]) {
        if (!(inputName === 'cloudId' && this.currentUserValue?.role?.brand.name === '雲市集')) {
          invalidInput.push(this.translate.instant(errInputName));
        }
      }
    }

    checkInput('customerId', 'customer');
    checkInput('customerLocationId', 'customer address');
    checkInput('enduserId', 'enduser');
    checkInput('contactId', 'contact');
    checkInput('billingContactId', 'bill contact');
    checkInput('billingContactIdEmail', 'bill contact email');
    checkInput('salesId', 'assigned sales');
    checkInput('cloudId', 'CloudId');

    if (invalidInput.length > 0) {
      const invalidInputName = invalidInput.join('、');
      console.log('invalid input:' + invalidInputName);
      this.alert.warningAlert(
        this.translate.instant('input is required', {
          input: invalidInputName,
        }), 5000
      );
      return false;
    } else {
      return true;
    }

  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  /** 設定查詢條件 */
  getFilter(pageIndex: number, pageSize?: number) {
    const filter: any = new Filter();
    const cartIdList = this.commodityList.map((item: CommodityCart) => item.productId);

    filter.pageIndex = pageIndex;

    if (pageSize !== undefined) {
      filter.pageSize = pageSize;
    }

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

    filter.sort = {};
    console.log(filter);

    return filter;
  }


  /** API: 送出/轉換訂單 */
  // transformToOrder(resData: CartOrderDetail) {
  //   const header: ShoppingCarOrderHeader = {
  //     customer: {
  //       id: this.cartForm.value['customerId'],
  //       name: resData.userDetail.customer.name
  //     },
  //     endUser: {
  //       id: this.cartForm.value['enduserId'],
  //       // 如果 enduserId 就是本人角色的公司 id，endUserName 會是 '自用'，所以要改拿 userData 的公司
  //       name: this.cartForm.value['enduserId'] === this.companyId ? this.company : resData.userDetail.endUser.name,
  //     },
  //     customerAddress: resData.userDetail.customerAddress,
  //     customerContactId: this.cartForm.value['contactId'],
  //     billingAddress: resData.userDetail.billingAddress,
  //     billingContactId: this.cartForm.value['billingContactId'],
  //     shoppingCarId: resData.id ?? '',
  //     salesModel: this.getSalesModel(),
  //     status: DefaultOrderValue.headerStatus
  //   }

  //   const body: ShoppingCarOrderBody[] = resData.productDetails.map((item: CommodityCart) => {
  //     const bodyObj: ShoppingCarOrderBody = {
  //       brandId: item.brandId ?? '',
  //       cloudId: resData.userDetail.cloudId,
  //       solutionId: item.solutionId ?? '',
  //       solutionData: { schema: {}, data: {} },
  //       startDate: item.startDate ?? new Date(),
  //       billingContactEmail: resData.userDetail.billingContactEmail,
  //       exchangeRateType: DefaultOrderValue.exchangeRateType,
  //       status: DefaultOrderValue.bodyStatus,
  //       paymentDate: DefaultOrderValue.paymentDate,     // 付費間隔
  //       timeInterval: DefaultOrderValue.timeInterval,   // 付費日
  //       salesId: '57a61316-21bc-44ca-bf97-be18229e4c72'
  //     };
  //     return bodyObj;
  //   })

  //   const shoppingCarOrder: ShoppingCarOrder = {
  //     header: header,
  //     body: body
  //   }

  //   this.apiService.sendShoppingCartOrder(shoppingCarOrder).subscribe({
  //     next: (res) => {
  //       if (res && res.info && res.info.success && res.data) {
  //         this.ui.isBought = true;
  //         this.ui.isOrdering = true;
  //         this.step = 4;
  //         this.alert.successAlert(res.info.message);
  //         this.modalRef?.hide();
  //       }
  //     },
  //     error: (err) => {
  //       this.alert.errorAlert('[commodity] shoppingCartDetail fail: ' + err);
  //       console.error('[commodity] shoppingCartDetail fail: ', err);
  //     },
  //   });
  // }

  /** 銷售模式
   * 經銷身份(最終使用者 選 "自用") - 經銷自用：
   *   - 客戶(經銷商)：自己角色的公司
   *   - 最終使用者：null
   *
   * 經銷身份(最終使用者 選 "其他公司") - 經銷：
   *   - 客戶(經銷商)：自己角色的公司
   *   - 最終使用者：自己角色以外的公司
   *
   * 最終使用者身份(最終使用者 選 "自用") - 直銷：
   *   - 客戶(經銷商)：create 這商品的公司
   *   - 最終使用者：自己角色的公司
   */
  // getSalesModel(): OrderSalesModel | null {
  //   const selfUse = this.companyId === this.endUserId; // 選自用

  //   if (this.identityType === 'END_USER') {         // 身份 = 經銷商
  //     return OrderSalesModel.directSelling;         // -> 直銷
  //   } else if (this.identityType === 'DEALER') {    // 身份 = 最終使用者
  //     if (selfUse) {
  //       return OrderSalesModel.distributionSelfUse; // -> 經銷自用
  //     } else {
  //       return OrderSalesModel.distribution;        // -> 經銷
  //     }
  //   } else {
  //     this.alert.errorAlert('Error Sales Model');
  //     return null;
  //   }
  // }
}
