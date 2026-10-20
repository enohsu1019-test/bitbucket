import { Component, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EmailEditorComponent } from 'angular-email-editor';
import { BrandData, CompanyData, CustomerData, CustomerIdentity, IdentityType } from 'src/app/core/models/authorization';
import { BrandDatas, BrandMapping, BillingMethodList, Commodity, CurrencyList, CurrencyType, DropDownItem, ImageType, Inventory, InventoryList, LeaseModeList, ProductCateList, SalesTarget, SalesTargetIdentity, SolutionData, CalculateMethodList, ProductCate, BillingMethod, CommodityCustomer, CommodityAttribute } from 'src/app/core/models/commodity';
import { AlertService } from 'src/app/core/services/alert.service';
import { CommodityService } from '../commodity.service';
import { forkJoin, map, Observable, startWith } from 'rxjs';
import { EpicModalService } from 'src/app/core/services/modal.service';
import { ResponseData } from 'src/app/core/models/response-data';
import { Comparator, Filter, Sort } from 'src/app/core/models/filter';
import { PageConfig } from 'src/app/core/models/page';
import { User } from 'src/app/core/models/users';
import { AuthService } from 'src/app/core/services/auth.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from 'src/environments/environment';
import { DataService } from 'src/app/core/services/data.service';
import { PermissionService } from 'src/app/core/services/permission.service';
import { Permission } from 'src/app/core/models/permission';
import { DecimalPipe } from '@angular/common';
import _ from 'lodash';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  @ViewChild(EmailEditorComponent) private emailEditor!: EmailEditorComponent; // unlayer editor

  /** 目前登入的使用者資訊 */
  currentUser!: User | null;
  currentUserIdentity!: IdentityType | undefined;
  isAdminPermission: boolean = false;
  // 是否為雲市集品牌
  isCloudRole = false;
  // 是否為Akamai品牌
  isAkamaiRole = false;

  mode: 'add' | 'edit' = 'add';

  commodityId: string = '';
  commodityForm!: FormGroup;

  /** product 權限 */
  productPermission: { [key: string]: Permission } = {};

  /** 下拉選單列表 - 原廠料號 */
  brandMappingList: string[] = [] // CRM Mapping Table
  originalSkuDDL: BrandData[] = []; //  { [key: string]: any }
  selectedSku: BrandData[] = [];
  /** 手動輸入 - 原廠料號 */
  inputSku = '';

  /** 下拉選單列表 - 計價類別 (原為 商品類別) */
  productCateList = ProductCateList;
  /** 下拉選單列表 - 出帳幣別 */
  currencyDDL = CurrencyList;
  /** 下拉選單列表 - 庫存 */
  inventoryDDL = InventoryList;
  /** 下拉選單列表 - 租約方式 */
  leaseModeDDL = LeaseModeList;
  /** 下拉選單列表 - 計算方式 */
  calculateMethodDDL = CalculateMethodList;
  /** 下拉選單列表 - 計費方式 */
  billingMethodDDL = BillingMethodList;

  /** 下拉選單列表 - 銷售對象 */
  salesTargetAll: DropDownItem[] = [];     // 所有清單
  salesTargetDealer: DropDownItem[] = [];  // 所有經銷商清單
  salesTargetEnduser: DropDownItem[] = []; // 所有非經銷商清單
  dealerSelected: DropDownItem[] = [];     // 已被選取的清單
  endUserSelected: DropDownItem[] = [];    // 已被選取的清單
  isAllDealer = false;                     // 全選經銷商
  isAllEndUser = false;                    // 全選非經銷商
  // targetSelected: string[] = [];        // 已被選取的清單
  // targetList: SalesTarget[] = [];       // 已被選取的清單
  // salesTargetList = new Map<string, SalesTarget>();

  /** 下拉選單列表 - 方案*/
  solutionDDL: SolutionData[] = [];
  /** 下拉選單列表 - 品牌 (only for admin) */
  brandsDDL: BrandDatas[] = [];
  /** 下拉選單列表 - 公司 (only for admin) */
  companyDDL: CompanyData[] = [];
  selectedCompany: CompanyData | null = null;

  /** 商品分類列表 */
  categoryList: {
    view: {
      id: string,
      itemName: string
    }[],
    select: {
      id: string,
      itemName: string
    }[]
  } = {
    view: [],
    select: []
  };

  /** 商品標籤列表 */
  tagList: string[] = [];
  /** 商品設定欄位 */
  commoditySettingField: CommodityAttribute[] = [];

  /** 價格設定 */
  currency: CurrencyType = CurrencyType.USD;
  exchange: string = '';

  /** 圖片設定 */
  bannerImgUrl: string | null | ArrayBuffer = '';
  defaultImgUrl: string | null | ArrayBuffer = '';
  bannerImgFile!: File | null;
  defaultImgFile!: File | null;
  /** 圖片網址前綴 */
  apiUrl: any;
  /** getProduct 有取得圖片 */
  bannerImgServerUrl: string = '';
  defaultImgServerUrl: string = '';
  /** banner img size */
  bannerTooBig = false;
  /** product img size */
  productTooBig = false;

  /** editor options */
  options = {
    displayMode: 'email',
    locale: 'zh-TW',
    translations: {
      'zh-TW': { 'editor.placeholder.text': '這裡沒有內容。從右側拖動內容。' },
    }
  };

  ui = {
    isLoading: false,       // 事先 get 資料
    isSaving: false,        // 儲存
    // isDealer: true,         // 是否為經銷商
    isSkuListLoading: false,// 原廠料號清單 disable
    isSpecLoading: false,   // 品名規格清單 disable
    isOriSkuInvalid: false, // 原廠料號欄位未填
    originalPrice: '',      // 暫存的下單成本
    originalCurrency: '',   // 暫存的原廠幣別
    listPrice: '',          // 暫存的原廠定價
    isCompanyInvalid: false,// 公司欄位是否正確
    isTargetInvalid: false, // 銷售對象欄位是否正確
  }

  /** 設定分頁參數 */
  defaultPageSize = 10;
  pageConfig = new PageConfig();

  filter = new Filter({
    pageSize: this.defaultPageSize
  });

  /** 設定排序參數 */
  sortBy = {
    prop: 'time',
    dir: Sort.desc,
  };

  /** angular2 下拉選單基礎設定 */
  selectSettings = {
    text: this.translate.instant('please select'),
    selectAllText: this.translate.instant('select all'),
    unSelectAllText: this.translate.instant('unselect all'),
    searchPlaceholderText: this.translate.instant('search'),
    noDataLabel: this.translate.instant('no data found'),
    addNewButtonText: this.translate.instant('add'),
    filterSelectAllText: this.translate.instant('select all filtered results'),
    filterUnSelectAllText: this.translate.instant('unselect all filtered results'),
    enableSearchFilter: true,
    singleSelection: true,
    badgeShowLimit: 1,
    maxHeight: 250,
    position: 'bottom',
    autoPosition: false,
    labelKey: 'name',
    classes: 'custom-dropdown dropdown-position',
    lazyLoading: true,
    disabled: false,
    searchBy: ['name']
  };
  targetSelectSettings = {
    text: this.translate.instant('please select'),
    selectAllText: this.translate.instant('select all'),
    unSelectAllText: this.translate.instant('unselect all'),
    searchPlaceholderText: this.translate.instant('search'),
    noDataLabel: this.translate.instant('no data found'),
    addNewButtonText: this.translate.instant('add'),
    filterSelectAllText: this.translate.instant('select all filtered results'),
    filterUnSelectAllText: this.translate.instant('unselect all filtered results'),
    enableSearchFilter: true,
    singleSelection: false,
    badgeShowLimit: 1,
    maxHeight: 250,
    position: 'bottom',
    autoPosition: false,
    labelKey: 'name',
    classes: 'custom-dropdown dropdown-position',
    lazyLoading: true,
    disabled: false,
    searchBy: ['name'],
  };

  /** 商品分類下拉選單基礎設定 */
  productSettings = {
    text: this.translate.instant('please select'),
    selectAllText: this.translate.instant('select all'),
    unSelectAllText: this.translate.instant('unselect all'),
    enableSearchFilter: true,
    singleSelection: false,
    badgeShowLimit: 1,
    maxHeight: 250,
    position: 'bottom',
    autoPosition: false,
    lazyLoading: true,
    noDataLabel: this.translate.instant('no data found'),
    classes: 'dropdown-icon',
  };

  /** 選擇條件 */
  dynamicField: {
    view: {
      id: string,
      itemName: string
    }[],
    select: {
      id: string,
      itemName: string
    }[]
  } = {
    view: [],
    select: []
  };
  /** 下拉選單基礎設定 */
  dynamicFieldConfig = {
    text: this.translate.instant('please select'),
    selectAllText: this.translate.instant('select all'),
    unSelectAllText: this.translate.instant('unselect all'),
    enableSearchFilter: true,
    singleSelection: false,
    badgeShowLimit: 1,
    maxHeight: 250,
    position: 'bottom',
    autoPosition: true,
    lazyLoading: true,
    noDataLabel: undefined,
    classes: 'dropdown-icon dropdown-position',
  };

  /** Boostrap Modal */
  modalRef!: BsModalRef;

  get f() { return this.commodityForm.controls }
  get ImageType() { return ImageType; }
  get Inventory() { return Inventory; }
  get ProductCate() { return ProductCate; }
  get BillingMethod() { return BillingMethod; }
  get SalesTargetIdentity() { return SalesTargetIdentity; }

  constructor(
    public permission: PermissionService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private alert: AlertService,
    private apiService: CommodityService,
    private ngZone: NgZone,
    private confirmModal: EpicModalService,
    private authService: AuthService,
    private modalService: BsModalService,
    private data: DataService,
    private decimalPipe: DecimalPipe,
  ) {
    // this.initForm();
    this.apiUrl = environment['apiUrl'] + '/' + environment['gateway'].product.slice(0, -1);
  }

  initForm(res?: ResponseData) {
    // TODO: 補上必填
    // productName, startDate, endDate, originalSku, currency, inventory, category,
    // leaseMode(訂閱制), unit, billingMethod(費用), calculateMethod
    // admin: brandId, customerId
    this.commodityForm = this.fb.group({
      // 原廠品牌 (admin 時才必填)
      brandId: [''],
      // 公司 (admin 時才必填)
      customerId: [{ value: '', disabled: true }],
      // 銷售對象
      salesTargets: {},
      // 商品名稱
      productName: ['', Validators.required],
      // 原廠料號
      originalSku: [{ value: '', disabled: this.ui.isSkuListLoading }, Validators.required],
      // 計價類別 (原為 商品類別)
      category: [this.productCateList[0].value, Validators.required],
      // 商品分類
      brandCategory: [[]],
      // 品名規格
      specification: { value: '', disabled: !(this.isCloudRole || this.isAkamaiRole) },
      // 販售價格 Validators.pattern(/^([1-9][0-9]*)+(.[0-9]{1,2})?$/)
      sellingPrice: ['', [Validators.min(1), Validators.pattern(/^\+?[1-9][0-9]*$/)]],
      // 下單成本 (原為 原廠價格)
      originalPrice: [''], //, disabled: true
      // 原廠幣別
      originalCurrency: { value: '', disabled: true },
      // 原廠定價 [Validators.min(1), Validators.pattern(/^([1-9][0-9]*)+(.[0-9]{1,2})?$/)]
      listPrice: [{ value: '', disabled: !(this.isCloudRole || this.isAkamaiRole) }],
      // 台幣定價
      twdListPrice: { value: '', disabled: !(this.isCloudRole || this.isAkamaiRole) },
      // 出帳幣別
      currency: [this.currencyDDL[0].value, Validators.required],
      // 庫存
      inventory: [this.inventoryDDL[0].value, Validators.required],
      // 庫存數量
      inventoryQty: [
        { value: '', disabled: (this.inventoryDDL[0].value === Inventory.available && !(this.isCloudRole || this.isAkamaiRole)) },
        [Validators.min(1), Validators.pattern(/^\+?[1-9][0-9]*$/)]],
      // 計費週期 (原為 租約方式)
      leaseMode: [this.leaseModeDDL[0].value], //, disabled: true
      // 計價單位
      unit: [{ value: '', disabled: !(this.isCloudRole || this.isAkamaiRole) }],
      // 計算方式
      calculateMethod: [this.calculateMethodDDL[0].value], //, disabled: true
      // 計費方式 (商品類別＝費用時才必填)
      billingMethod: [''],
      // 費用低消
      minimum: ['', [Validators.min(1), Validators.pattern(/^\+?[1-9][0-9]*$/)]],
      // 方案
      solutionId: ['', Validators.required],
      // 商品頁面設定
      pageSetting: {},
      // 上架日期
      startDate: ['', Validators.required],   //, disabled: true
      // 下架日期
      endDate: ['', Validators.required],      //, disabled: true
      // 商品描述
      description: [''],
      // 商品標籤
      tagList: [[]],
      // ERP 料號
      erpSku: [{ value: '', disabled: !(this.isCloudRole || this.isAkamaiRole) }],
      // 自訂欄位
      attribute: {},

      // banner 圖片網址
      bannerImage: [''],
      // 產品圖片網址
      defaultImage: [''],
      // 是否為雲市集商品
      isCloudMarketProduct: [this.isCloudRole],
    });

    // this.commodityForm = this.fb.group({
    //   brandId: [          // 原廠品牌 (admin 時才必填)
    //     (res ? res.data.brand.brandId : '')],
    //   customerId: [       // 公司     (admin 時才必填)
    //     { value: (res ? res.data.customerId : ''), disabled: true }],
    //   salesTargets: {},   // 銷售對象
    //   // productSku: '',
    //   productName:        // 商品名稱
    //     [(res ? res.data.productName : ''), Validators.required],
    //   originalSku: [      // 原廠料號
    //     { value: (res ? res.data.originalSku : ''), disabled: this.ui.isSkuListLoading },
    //     Validators.required],
    //   category: [         //商品類別
    //     (res ? res.data.category : this.productCateList[0].value),
    //     Validators.required],
    //   specification:      // 品名規格
    //     { value: (res ? res.data.specification : ''), disabled: true },
    //   sellingPrice: [     // 販售價格
    //     (res ? res.data.sellingPrice : ''),
    //     [Validators.min(1), Validators.pattern(/^([1-9][0-9]*)+(.[0-9]{1,2})?$/)]],
    //   originalPrice:      // 下單成本 (原為 原廠價格)
    //     { value: (res ? `${res.data.originalPrice} (${res.data.originalCurrency})` : ''), disabled: true },
    //   originalCurrency:   // 原廠幣別
    //     { value: (res ? res.data.originalCurrency : ''), disabled: true },
    //   listPrice: [        // 定價
    //     { value: (res ? `${res.data.listPrice} (${res.data.originalCurrency})` : ''), disabled: true },
    //     [Validators.min(1), Validators.pattern(/^([1-9][0-9]*)+(.[0-9]{1,2})?$/)]],
    //   currency: [         // 幣別
    //     (res ? res.data.currency : this.currencyDDL[0].value),
    //     Validators.required],
    //   inventory: [        // 庫存
    //     (res ? res.data.inventory : this.inventoryDDL[0].value),
    //     Validators.required],
    //   inventoryQty: [     // 庫存數量
    //     {
    //       value: (res ? res.data.inventoryQty : ''),
    //       disabled: res ? (res.data.inventory === Inventory.custom ? false : true) : true
    //     },
    //     [Validators.min(1), Validators.pattern(/^[1-9][0-9]*$/)]],
    //   leaseMode: [        // 計費週期 (原為 租約方式)
    //     (res ? res.data.leaseMode : '')],
    //   unit: [             // 計價單位
    //     { value: (res ? res.data.unit : ''), disabled: true }
    //   ],
    //   calculateMethod: [  // 計算方式
    //     (res ? res.data.calculateMethod : this.calculateMethodDDL[0].value)
    //   ],
    //   billingMethod: [    // 計費方式 (商品類別＝費用時才必填)
    //     (res ? res.data.billingMethod : '')
    //   ],
    //   solutionId: [       // 方案
    //     (res ? res.data.solution.solutionId : ''),
    //     Validators.required],
    //   pageSetting: {},    // 商品頁面設定
    //   startDate: [(res ? new Date(res.data.startDate) : ''), Validators.required], // 上架日期
    //   endDate: [(res ? new Date(res.data.endDate) : ''), Validators.required],     // 下架日期
    //   description: [(res ? res.data.description : '')],       // 商品描述
    //   tagList: [(res ? res.data.tagList : [])],               // 商品標籤

    //   bannerImage: [(res ? res.data.bannerImage : '')],      // banner 圖片網址
    //   defaultImage: [(res ? res.data.defaultImage : '')],    // 產品圖片網址
    // });

    if (this.isAdminPermission) {                                   // 如果是 admin
      this.f['brandId'].setValidators([Validators.required]);
      this.f['brandId'].updateValueAndValidity();
      this.f['customerId'].setValidators([Validators.required]);
      this.f['customerId'].updateValueAndValidity();
    }

    // this.changeInventory();
    // this.changeCategory(res?.data.leaseMode, res?.data.billingMethod);
  }

  /** 更新 formValue */
  updateFormValue(res?: ResponseData) {
    this.commodityForm.patchValue({
      brandId: res?.data.brand.id,          // 原廠品牌  (admin 時才必填)
      customerId: res?.data.customerId,     // 公司     (admin 時才必填)
      salesTargets: {},                     // 銷售對象
      productName: res?.data.productName,   // 商品名稱
      originalSku: res?.data.originalSku,   // 原廠料號
      category: res?.data.category,         // 計價類別 (原為 商品類別)
      brandCategory: res?.data.brandCategory,   // 商品分類
      specification: res?.data.specification,   // 品名規格
      sellingPrice: res?.data.sellingPrice,     // 販售價格
      originalPrice: `${res?.data.originalPrice} (${res?.data.originalCurrency})`,  // 下單成本 (原為 原廠價格)
      originalCurrency: res?.data.originalCurrency,   // 原廠幣別
      listPrice: `${res?.data.listPrice} (${res?.data.originalCurrency})`,  // 原廠定價
      twdListPrice: res?.data.twdListPrice,       // 台幣定價
      currency: res?.data.currency,               // 出帳幣別
      inventory: res?.data.inventory,             // 庫存
      inventoryQty: res?.data.inventoryQty,       // 庫存數量
      leaseMode: res?.data.leaseMode.month,       // 計費週期 (原為 租約方式)
      unit: res?.data.unit,                       // 計價單位
      calculateMethod: res?.data.calculateMethod, // 計算方式
      billingMethod: res?.data.billingMethod,     // 計費方式 (計價類別＝費用時才必填)
      minimum: res?.data.minimum,                 // 費用低消
      solutionId: res?.data.solution.solutionId,  // 方案
      erpSku: res?.data.erpSku,                   // ERP 料號
      pageSetting: {},                          // 商品頁面設定
      startDate: new Date(res?.data.startDate), // 上架日期
      endDate: new Date(res?.data.endDate),     // 下架日期
      description: res?.data.description,       // 商品描述
      tagList: res?.data.tagList,               // 商品標籤
      isCloudMarketProduct: res?.data.isCloudMarketProduct,   // 是否為雲市集商品

      bannerImage: res?.data.bannerImage,       // banner 圖片網址
      defaultImage: res?.data.defaultImage,     // 產品圖片網址
    });
    this.getBrandName(res?.data.brand.id);

    if (this.isCloudRole || this.isAkamaiRole) {
      this.inputSku = res?.data.originalSku;
    } else {
      this.selectedSku = [{ id: res?.data.originalSku, name: res?.data.originalSku }];
    }
    this.tagList = res?.data.tagList;

    this.isAllDealer = res?.data.salesTargets.dealer.find((item: string) => item === 'ALL') ? true : false;
    this.isAllEndUser = res?.data.salesTargets.endUser.find((item: string) => item === 'ALL') ? true : false;
    if (res?.data.salesTargets) {
      res.data.salesTargets.dealer.forEach((element: string) => {
        const item = this.salesTargetAll.find(ele => ele.id === element);
        if (item) {
          this.dealerSelected.push(item);
        }
      });
      res.data.salesTargets.endUser.forEach((element: string) => {
        const item = this.salesTargetAll.find(ele => ele.id === element);
        if (item) {
          this.endUserSelected.push(item);
        }
      });
    }

    // this.selectedSku = [{ id: res.data.originalSku, name: res.data.originalSku }];
    // // this.selectedCompany = this.companyDDL.find(item => item.id === res.data.customerId) ?? null;
    // this.tagList = res.data.tagList;
    // this.dealerSelected = res.data.salesTargets.dealer;
    // this.endUserSelected = res.data.salesTargets.enduser;
    // // this.ui.isDealer = res.data.salesTargets.identityType === 'DEALER';
    // // this.targetList = res.data.salesTargets.customer;
    // // this.targetSelected = res.data.salesTargets.customer.map((item: SalesTarget) => item.customerId);

    if (this.isAdminPermission) {                                   // 如果是 admin
      this.f['brandId'].setValidators([Validators.required]);
      this.f['brandId'].updateValueAndValidity();
      this.f['customerId'].setValidators([Validators.required]);
      this.f['customerId'].updateValueAndValidity();
    }

    // 動態欄位
    // 取得有值的所有動態欄位名稱
    const attKey = _.keys(res?.data.attribute);
    this.commoditySettingField.forEach(item => {
      // 找出對應的欄位
      const checkFormName = attKey.filter(key => key === item.internalVariableName);
      // 多選
      if (item.type === 'MULTIPLE_CHOICE') {
        if (checkFormName.length > 0) {
          res?.data.attribute[checkFormName[0]].forEach((attName: any) => {
            const data = {
              id: attName,
              itemName: item.options.filter(selItem => selItem.internalVariableName === attName).map(name => name.name)[0]
            }
            this.dynamicField.select.push(data);
          });
        }
        // 回寫到屬性欄位
        this.closeDynamicField(item);
      // 其他欄位
      } else {
        item.value = res?.data.attribute[checkFormName[0]] ?? item.value;
      }
    });
  }

  ngOnInit(): void {
    // get rule first
    this.productPermission = this.permission.getPermission('product-v1');
    console.log(this.productPermission);

    // add Mode / edit Mode
    if (!this.route.snapshot.params['commodity']) {
      this.mode = 'add';
      this.commodityId = '';
    } else {
      this.mode = 'edit';
      this.commodityId = this.route.snapshot.params['commodity'];
    }

    // get current user
    this.currentUser = this.authService.currentUserValue;
    this.currentUserIdentity = this.currentUser?.role?.identityType;
    this.isCloudRole = this.currentUser?.role?.brand.id === '290ebb3e-ad5d-42e1-8b02-836de25b0807' ? true : false;
    this.isAkamaiRole = this.currentUser?.role?.brand.id === 'a5ce669b-51ba-4698-919f-84b65bf7174e' ? true : false;

    // isAdmin
    this.isAdminPermission = !!this.permission.flat['layout.iam.adminInput'];

    // 初始化
    this.initForm();
    this.init();

  }

  private init() {
    // this.commodityForm.disable();
    this.ui.isLoading = true;
    const apis: Observable<ResponseData>[] = [];
    const targetListFilter = this.getTargetListFilter();
    const brandListFilter = this.getFilter(1, -1);
    const attributeFilter = this.getAttributeFilter();
    const brandId = this.currentUser?.role?.brand?.id ?? '';
    const companyId = this.currentUser?.role?.company?.id ?? '';
    const classificationFilter = new Filter();
    classificationFilter.pageSize = -1;

    /**
     * 不管哪個身份，都須先取得 API
     *    1. 即時匯率
     *
     * 如果是 admin:
     *    1. 銷售對象
     *    2. 品牌 (get brandId)
     *    3.  -> 公司 (by brandId, get companyId)
     *    4.  -> -> 原廠料號 (by brandId & companyId)
     *    5.  -> 方案 (by brandId)
     *
     * 如果不是 admin，登入者有 brandId & companyId:
     *    1. 原廠料號 (by brandId & companyId)
     *    2. 方案 (by brandId)
     */

    // apis.push(this.apiService.getSalesTargets(targetListFilter));   // 取得銷售對象下拉選單列表
    apis.push(this.apiService.getExchangeRate());                   // 取得即時匯率
    apis.push(this.apiService.getSalesTargets(targetListFilter));   // 取得銷售對象下拉選單列表
    apis.push(this.apiService.getProductAttributes(brandId, attributeFilter));   // 取得商品欄位列表

    if (this.isAdminPermission) {                                   // 如果是 admin
      apis.push(this.apiService.getBrandList(brandListFilter));     // 取得品牌下拉選單列表
    } else {
      apis.push(this.apiService.getBrandMappingList(brandId, companyId)); // 取得 CRM Mapping Table
      apis.push(this.apiService.getSolutionList(brandId));          // 取得方案下拉選單列表
      apis.push(this.apiService.getClassificationList(classificationFilter, brandId));    // 商品分類
    }

    forkJoin(apis).subscribe({
      next: (allRes) => {
        console.log(`[commodity] init allRes = `, allRes);
        this.ui.isLoading = false;

        if (allRes.map(responseData => responseData.info.success).indexOf(false) < 0) {
          // 取得即時匯率
          const exchangeRate = allRes[0].data.detail.find((item: { currency: string, rate: number }) => item.currency === this.currency);
          this.exchange = exchangeRate.rate;

          // 取得銷售對象下拉選單列表
          this.salesTargetAll = allRes[1].data.map((item: CommodityCustomer) => {
            return { id: item.customerId, name: item.customerName?.fullCh, identityType: item.identityType };
          });
          this.salesTargetDealer = this.salesTargetAll.filter(item => item.identityType?.find(ele => ele === SalesTargetIdentity.dealer));
          this.salesTargetEnduser = this.salesTargetAll.filter(item => item.identityType?.find(ele => ele === SalesTargetIdentity.endUser));

          // 商品設定欄位
          this.commoditySettingField = allRes[2].data;
          // value欄位初始化
          this.commoditySettingField.forEach(item => {
            // 布林值
            if(item.type === 'BOOLEAN') {
              item.value = false;
            // 多選
            } else if(item.type === 'MULTIPLE_CHOICE') {
              item.value = [];
            // 數字
            } else if(item.type === 'NUMBER') {
              item.value = 0;
            } else {
              item.value = '';
            }
          });

          switch (this.isAdminPermission) {
            case true:
              // 取得品牌下拉選單列表
              this.brandsDDL = allRes[3].data;

              if (this.mode === 'add') {
                this.f['brandId'].setValue(this.brandsDDL[0]?.brandId);
                this.getBrandName(this.brandsDDL[0]?.brandId);
                this.getCompanyList();   // 先取得 品牌 -> 公司 -> 原廠料號
                this.getSolutionList();
              }

              break;
            case false:
              // 取得 CRM Mapping Table
              this.brandMappingList = allRes[3].data ? allRes[3].data?.map((item: BrandMapping) => item.crmBrandId) : [];
              this.getCrmPriceBookList();

              // 取得方案下拉選單列表
              this.solutionDDL = allRes[4].data;
              if (this.mode === 'add') {
                this.f['solutionId'].setValue(this.solutionDDL[0]?.solutionId);
              }
              break;
          }

          // 商品分類
          if (!this.isAdminPermission) {
            allRes[5].data.forEach((item: any) => {
              const data = {
                id: item.id,
                itemName: item.name
              }
              this.categoryList.view.push(data);
            });
            this.categoryList.view = _.cloneDeep(this.categoryList.view);
          }


          if (this.mode === 'add') {
            this.changeInventory();
            this.changeCategory();
          } else if (this.mode === 'edit') {
            this.getCommodity();
          }
        }

        // if (allRes.map(responseData => responseData.info.success).indexOf(false) < 0) {
        //   // this.commodityForm.enable();
        //   // 取得 CRM Mapping Table
        //   this.brandMappingList = allRes[0].data.map((item: BrandMapping) => item.crmBrandId);
        //   this.getCrmPriceBookList();

        //   // 取得銷售對象下拉選單列表
        //   this.salesTargetAll = allRes[1].data.map((item: CommodityCustomer) => {
        //     return { id: item.customerId, name: item.customerName?.fullCh, identityType: item.identityType };
        //   });
        //   this.salesTargetDealer = this.salesTargetAll.filter(item => item.identityType?.find(ele => ele === SalesTargetIdentity.dealer));
        //   this.salesTargetEnduser = this.salesTargetAll.filter(item => item.identityType?.find(ele => ele === SalesTargetIdentity.endUser));

        //   // 取得即時匯率
        //   const exchangeRate = allRes[2].data.detail.find((item: { currency: string, rate: number }) => item.currency === this.currency);
        //   this.exchange = exchangeRate.rate;

        //   // admin 取得品牌下拉選單列表
        //   if (this.isAdminPermission) {
        //     this.brandsDDL = allRes[3].data;
        //     if (this.mode === 'add') {
        //       this.f['brandId'].setValue(this.brandsDDL[0]?.brandId);
        //       this.getCompanyList();   // 先取得 品牌 -> 公司 -> 原廠料號
        //       this.getSolutionList();
        //     }
        //   } else {
        //     // 取得方案下拉選單列表
        //     this.solutionDDL = allRes[3].data;
        //     if (this.mode === 'add') {
        //       this.f['solutionId'].setValue(this.solutionDDL[0]?.solutionId);
        //     }
        //   }

        //   if (this.mode === 'add') {
        //     // this.getCompanyList();
        //     // this.getBrandMappingList();
        //     this.changeInventory();
        //     this.changeCategory();
        //   } else if (this.mode === 'edit') {
        //     this.getCommodity();
        //   }
        // }
      },
      error: (err) => {
        this.alert.errorAlert('[commodity] init allRes fail: ' + err);
        console.error('[commodity] init allRes fail: ', err);
        this.ui.isLoading = false;
      },
    });

  }

  /** API: 取得單一商品 */
  getCommodity() {
    this.apiService.getProduct(this.commodityId).subscribe({
      next: (res) => {
        console.log('[commodity] getCommodity done: ', res);
        if (res && res.info && res.info.success && res.data) {
          // this.initForm(res);
          this.updateFormValue(res);
          this.data.setIdLabel('commoditys', res.data.productId, res.data.productName);

          if (this.isAdminPermission) {
            this.getCompanyList(res);    // 先取得 公司 -> 原廠料號
          }
          this.getSolutionList();
          // this.getBrandMappingList();

          this.changeInventory();
          this.changeCategory(res?.data.leaseMode.month, res?.data.billingMethod);

          this.getClassification(res?.data);

          // 圖片
          this.bannerImgUrl = res.data.bannerImage ? this.apiUrl + res.data.bannerImage : '';
          this.defaultImgUrl = res.data.defaultImage ? this.apiUrl + res.data.defaultImage : '';
          this.bannerImgServerUrl = res.data.bannerImage ? res.data.bannerImage.split('image?id=')[1] : '';
          this.defaultImgServerUrl = res.data.defaultImage ? res.data.defaultImage.split('image?id=')[1] : '';
        }
      },
      error: (err) => {
        console.error('[commodity] getCommodity fail: ', err);
      }
    });
  }

  /** API: 取得銷售對象下拉選單列表 */
  // getSalesTargets(salesTarget: SalesTarget) {
  //   const targetListFilter = this.getTargetListFilter();
  //   this.salesTargetAll = [];

  //   this.isAllDealer = salesTarget.dealer.find(item => item === 'ALL') ? true : false;
  //   this.isAllEndUser = salesTarget.endUser.find(item => item === 'ALL') ? true : false;

  //   this.apiService.getSalesTargets(targetListFilter).subscribe({
  //     next: (res) => {
  //       console.log('[commodity] getSalesTargets done: ', res);
  //       if (res && res.info && res.info.success && res.data) {
  //         this.salesTargetAll = res.data.map((item: CommodityCustomer) => {
  //           return { id: item.customerId, name: item.customerName?.fullCh, identityType: item.identityType };
  //         });
  //         this.salesTargetDealer = this.salesTargetAll.filter(item => item.identityType?.find(ele => ele === SalesTargetIdentity.dealer));
  //         this.salesTargetEnduser = this.salesTargetAll.filter(item => item.identityType?.find(ele => ele === SalesTargetIdentity.endUser));

  //         if (salesTarget) {
  //           salesTarget.dealer.forEach(element => {
  //             const item = this.salesTargetAll.find(ele => ele.id === element);
  //             if (item) {
  //               this.dealerSelected.push(item);
  //             }
  //           });
  //           salesTarget.endUser.forEach(element => {
  //             const item = this.salesTargetAll.find(ele => ele.id === element);
  //             if (item) {
  //               this.endUserSelected.push(item);
  //             }
  //           });
  //         }
  //       }
  //     },
  //     error: (err) => {
  //       console.error('[commodity] getSalesTargets fail: ', err);
  //     }
  //   });
  // }

  /** API: 從 CRM 取得原廠料號清單 */
  getCrmPriceBookList(event?: any) {
    this.ui.isSkuListLoading = true;
    this.originalSkuDDL = [];

    const filter = this.getFilter(1, 20);
    filter.and.push({
      comparator: Comparator.in,
      field: 'manu',
      value: this.brandMappingList
    });
    if (event) {
      filter.and.push({
        comparator: Comparator.like,
        field: 'productIdentifier',
        value: event?.target?.value?.trim()
      });
    }
    console.log('getCrmPriceBookList', filter);

    this.apiService.getCrmPriceBookList(filter).subscribe({
      next: (res) => {
        console.log('[commodity] getCrmPriceBookList done: ', res);
        if (res && res.info && res.info.success) {
          this.originalSkuDDL = !res.data ? [] : Object.keys(res.data).map(item => {
            return { id: item, name: item, productName: res.data[item] };
          });
          console.log(this.originalSkuDDL);
        }
      },
      error: (err) => {
        console.error('[commodity] getCrmPriceBookList fail: ', err);
      }
    });

    this.ui.isSkuListLoading = false;
  }

  /** API: 從 CRM 取得品名規格
   * 從 CRM 帶入：
   * V  品名規格 specification
   * -  ERP料號 erpSku
   * V  計價單位 unit
   * -  計費週期 leaseMode
   * -  計算方式 calculateMethod
   * -  下單成本 originalPrice
   * V  原廠幣別 originalCurrency
   * V  定價    listPrice
   * -  上架日期 startDate
   * -  下架日期 endDate
   */
  getCrmPriceBookCompany(event: BrandData) {
    console.log(event);

    this.ui.isSpecLoading = true;

    this.f['originalSku'].setValue(this.selectedSku[0].id);
    this.f['specification'].setValue(event.productName);
    this.f['unit'].setValue('');
    this.f['originalPrice'].setValue('');
    this.f['originalCurrency'].setValue('');
    this.f['sellingPrice'].setValue('');
    this.f['listPrice'].setValue('');
    this.f['erpSku'].setValue('');
    this.f['twdListPrice'].setValue('');

    this.ui.isOriSkuInvalid = this.selectedSku.length ? false : true;

    const filter = this.getFilter(1, this.defaultPageSize);
    filter.and.push({
      comparator: Comparator.equal,
      field: 'productIdentifier',
      value: event.id
    });
    filter.and.push({
      comparator: Comparator.in,
      field: 'manu',
      value: this.brandMappingList
    });

    this.apiService.getCrmPriceBookCompany(filter).subscribe({
      next: (res) => {
        console.log('[commodity] getCrmPriceBookCompany done: ', res);
        if (res && res.info && res.info.success && res.data) {
          const product = res.data.find((item: any) => item.productIdentifier === event.id) // .unitListPriceType
          console.log(product);

          const currency = product.unitListPrice ? CurrencyType.TWD : CurrencyType.USD;
          const unitListPrice = product.unitListPrice ? this.decimalPipe.transform(product.unitListPrice, '1.0-0') : this.decimalPipe.transform(product.usdUnitListPrice, '1.0-2');
          const unitListPriceVal = `${unitListPrice} (${currency})`;
          const twdListPrice = product.unitListPrice ? unitListPrice : this.decimalPipe.transform(product.usdUnitListPrice * product.rate, '1.0-0');

          // this.f['leaseMode'].setValue(null);              // 計費週期 //FIXME:
          // this.f['calculateMethod'].setValue('');          // 計算方式 //FIXME:
          // this.f['originalPrice'].setValue('');            // 下單成本 //FIXME:
          // this.f['erpSku'].setValue('');                   // ERP料號 //FIXME:
          // this.f['startDate'].setValue(product['Valid-From Date'] ?? '1900-01-01');   // 上架日期 //FIXME:
          // this.f['endDate'].setValue(product['Valid To Date'] ?? '9999-12-31');       // 下架日期 //FIXME:

          if (unitListPrice === '0' || unitListPrice) {
            this.ui.originalPrice = unitListPriceVal;
            this.ui.listPrice = unitListPriceVal;
            this.ui.originalCurrency = currency;
            this.f['listPrice'].setValue(unitListPriceVal);     // 原廠定價
            this.f['twdListPrice'].setValue(twdListPrice);      // 台幣定價
            this.f['originalCurrency'].setValue(currency);      // 原廠幣別
            this.f['currency'].setValue(currency);              // 原廠幣別 (原標題為 出帳幣別)
            this.f['unit'].setValue(product.unit);              // 計價單位
          }
        }
      },
      error: (err) => {
        console.error('[commodity] getCrmPriceBookCompany fail: ', err);
      }
    });

    this.ui.isSpecLoading = false;
  }

  /** API: 取得公司列表 */
  getCompanyList(resData?: ResponseData) {
    const filter = this.getFilter(1, -1);
    filter.and.push({
      comparator: Comparator.in,
      field: 'brandId',
      value: ['', this.f['brandId'].value]
    });
    filter.and.push({
      comparator: Comparator.in,
      field: 'identityType',
      value: [CustomerIdentity.ORIGIN]
    });

    this.apiService.getCompanyList(filter).subscribe({
      next: (res) => {
        console.log('[commodity] getCompanyList done: ', res);
        if (res && res.info && res.info.success && res.data) {
          this.companyDDL = res.data.map((item: CustomerData) => {
            return {
              id: item.customerId,
              fullCh: item.customerName.fullCh,
              fullEn: item.customerName.fullEn,
              nickCh: item.customerName.nickCh,
              nickEn: item.customerName.nickEn,
              creator: item.companyName?.fullCh
            };
          });
          console.log(this.companyDDL);
          this.f['customerId'].enable();

          if (res.data.length) {
            this.f['customerId'].setValue(this.companyDDL[0]?.id);
            this.selectedCompany = this.companyDDL[0];
            this.getBrandMappingList();
          } else {
            this.f['customerId'].setValue('');
            this.f['customerId'].markAsTouched();
          };

          if (resData) {
            this.selectedCompany = this.companyDDL.find(item => item.id === resData.data.customerId) ?? null;
          }
        }
      },
      error: (err) => {
        console.error('[commodity] getCompanyList fail: ', err);
      }
    });
  }

  /** API: 取得原廠料號列表 */
  getSolutionList() {
    this.apiService.getSolutionList(this.f['brandId'].value).subscribe({
      next: (res) => {
        console.log('[commodity] changeBrand and get solution done: ', res);
        if (res && res.info && res.info.success && res.data) {
          this.solutionDDL = res.data;
          this.f['solutionId'].enable();

          if (res.data.length) {
            this.f['solutionId'].setValue(this.solutionDDL[0]?.solutionId);
          } else {
            this.f['solutionId'].setValue('');
            this.f['solutionId'].markAsTouched();
          };
        }
      },
      error: (err) => {
        console.error('[commodity] changeBrand and get solution fail: ', err);
        this.f['solutionId'].enable();
      }
    });
  }

  /** API: 新增商品 */
  addCommodity(commodity: Commodity) {
    this.apiService.addProduct(commodity).subscribe({
      next: (res) => {
        console.log('[commodity] addCommodity done: ', res);
        if (res.info.success) {
          this.commodityId = res.data.productId;
          if (this.bannerImgFile || this.defaultImgFile) {
            this.detectProductImg();
          } else {
            // this.alert.successAlert(res.info.message, 1500, '', this.backToListView.bind(this));
            this.alert.successAlert(res.info.message);
            this.backToListView();
          }
        } else {
          this.alert.errorAlert(res.info?.exception?.message);
          console.error('[commodity] addCommodity fail: ', res.info?.exception?.message);
        }
        this.ui.isSaving = false;
      },
      error: (err) => {
        this.alert.errorAlert(err);
        console.error('[commodity] addCommodity fail: ', err);
      }
    });
  }

  /** API: 更新商品 */
  updateCommodity(commodity: Commodity) {
    this.apiService.updateProduct(this.commodityId, commodity).subscribe({
      next: (res) => {
        console.log('[commodity] updateCommodity done: ', res);
        if (res.info.success) {

          if (this.defaultImgUrl === this.defaultImgServerUrl && this.defaultImgUrl === this.defaultImgServerUrl) {
            console.log('圖片不變～～～');
            this.alert.successAlert(res.info.message);
            this.backToListView();
            // this.alert.successAlert(res.info.message, 1500, '', this.backToListView.bind(this));
          } else {
            this.detectProductImg();
          }

        } else {
          this.alert.errorAlert(res.info.message);
          console.error('[commodity] updateCommodity fail: ', res.info.message);
        }
        this.ui.isSaving = false;
      },
      error: (err) => {
        this.alert.errorAlert(err);
        console.error('[commodity] updateCommodity fail: ', err);
        this.ui.isSaving = false;
      }
    });
  }

  /** API: 取得 BrandMappingList */
  getBrandMappingList() {
    const brandId = this.f['brandId'].value ?? '';
    const customerId = this.f['customerId'].value ?? '';
    this.apiService.getBrandMappingList(brandId, customerId).subscribe({
      next: (res) => {
        console.log('[commodity] getBrandMappingList done: ', res);
        if (res && res.info && res.info.success) {
          this.brandMappingList = res.data ? res.data.map((item: BrandMapping) => item.crmBrandId) : [];
          console.log(this.brandMappingList);
          this.getCrmPriceBookList();
        }
      },
      error: (err) => {
        console.error('[commodity] getBrandMappingList fail: ', err);
      }
    });
  }

  /** 取得商品分類 */
  getClassification(commodity?: Commodity) {
    this.categoryList.view = [];
    this.categoryList.select = [];
    const brandId = this.f['brandId'].value ?? '';
    const classificationFilter = new Filter();
    classificationFilter.pageSize = -1;
    this.apiService.getClassificationList(classificationFilter, brandId).subscribe({
      next: (res) => {
        console.log('[get classification list done]： ', res);
        if (res && res.info && res.info.success && res.data) {
          res.data.forEach((item: any) => {
            const data = {
              id: item.id,
              itemName: item.name
            }
            this.categoryList.view.push(data);
          });
          this.categoryList.view = _.cloneDeep(this.categoryList.view);
          // 寫入商品分類
          if (commodity && commodity.brandCategory) {
            commodity.brandCategory.forEach(item => {
              const filter = this.categoryList.view.filter(category => category.id === item);
              if (filter.length !== 0) {
                this.categoryList.select.push(filter[0]);
              }
            });
          }
        }
      },
      error: (err) => {
        console.error('[get classification list fail]： ', err);
      }
    });
  }

  /** 儲存商品 */
  saveCommodity() {
    this.ui.isSaving = true;

    const dealerSelected = this.isAllDealer ? ['ALL'] : this.dealerSelected.map(item => item.id);
    const endUserSelected = this.isAllEndUser ? ['ALL'] : this.endUserSelected.map(item => item.id);
    const salesTargets: SalesTarget = { dealer: dealerSelected, endUser: endUserSelected };
    this.f['salesTargets'].setValue(salesTargets);
    this.f['tagList'].setValue(this.tagList);
    // 載入雲市集 or Akamai手動輸入值
    if (this.isCloudRole || this.isAkamaiRole)
    {
      this.f['originalSku'].setValue(this.inputSku);
    }

    this.emailEditor.editor.exportHtml((htmlData: any) => {
      this.emailEditor.editor.saveDesign((data: object) => {
        const pageSetting = { content: htmlData.html, editContent: JSON.stringify(data) };
        this.f['pageSetting'].setValue(pageSetting);

        const formValue = Object.assign({}, this.commodityForm.getRawValue());
        delete formValue.bannerImgUrl;
        delete formValue.defaultImage;
        formValue.originalPrice = Number(formValue.originalPrice?.split(' (')[0]);
        formValue.listPrice = Number(formValue.listPrice?.split(' (')[0]);
        formValue.twdListPrice = Number(formValue.twdListPrice);
        formValue.minimum = formValue.minimum === -1 ? '' : Number(formValue.minimum);
        // formValue.billingMethod = formValue.billingMethod !== '' ? formValue.billingMethod : 'NONE';
        const selectBrandCategory: string[] = [];
        this.categoryList.select.forEach(item => {
          selectBrandCategory.push(item.id);
        });
        formValue.brandCategory = selectBrandCategory;
        formValue.attribute = {};

        // 載入動態欄位
        let dynamicData: {[key: string]: any} = {};
        this.commoditySettingField.forEach(item => {
          const dataKey = item.internalVariableName;
          // 除了多選直接抓值
          if (item.type !== 'MULTIPLE_CHOICE') {
            dynamicData[dataKey] = item.value;
            formValue.attribute = dynamicData;
          // 多選需抓陣列
          } else {
            const stringData: string[] = [];
            if (item.value && item.value.constructor === Array) {
              item.value.forEach(option => {
                stringData.push(option);
              });
              dynamicData[dataKey] = stringData;
              formValue.attribute = dynamicData;
            }
          }
        });
        console.log(formValue);

        // 檢查必填欄位
        this.ngZone.run(() => {
          const isFormValid = this.checkFormValid(formValue);
          // const isFormValid = true;
          if (isFormValid) {
            if (this.mode === 'add') {
              this.addCommodity(formValue);
            } else {
              this.updateCommodity(formValue);
            }
          }
          else {
            this.ui.isSaving = false;
            return;
          }
        });
      });
    });
    // this.ui.isSaving = false;
  }

  /** 檢查必填欄位 */
  checkFormValid(commodity: Commodity): boolean {
    const invalidInput = new (Array)();

    this.validateAllFormFields(this.commodityForm);

    const checkInput = (isValid: boolean, inputName: string) => {
      if (isValid) {
        invalidInput.push(this.translate.instant(inputName));
      }
    }

    checkInput((!commodity.salesTargets?.dealer.length && !commodity.salesTargets?.endUser.length), 'sales target'); // 銷售對象
    if (this.isAdminPermission) {
      checkInput(!commodity.brandId, 'brand');              // 原廠品牌 (only admin)
      checkInput(!this.selectedCompany?.id, 'company');     // 公司 (only admin)
    }

    // checkInput(!commodity.salesTargets?.customerId.length, 'sales target'); // 銷售對象 *不檢查，若沒設定將為全部開放
    // checkInput(!commodity.sellingPrice, 'selling price');   // 販售價格
    checkInput(!commodity.productName, 'commodity name');   // 商品名稱
    if (this.isCloudRole || this.isAkamaiRole) {
      checkInput(!this.inputSku, 'brand serial number');    // 原廠料號
    } else {
      checkInput(!this.selectedSku.length, 'brand serial number');    // 原廠料號
    }
    checkInput(!commodity.category, 'commodity category');  // 計價類別
    checkInput(!commodity.currency, 'currency');            // 出帳幣別
    checkInput(!commodity.inventory, 'inventory');          // 庫存
    checkInput(!commodity.startDate, 'launched date');      // 上架日期
    checkInput(!commodity.endDate, 'discontinued date');    // 下架日期
    checkInput(!commodity.solutionId, 'solution');          // 方案
    // checkInput(!commodity.unit, 'billing unit');            // 計價單位
    checkInput(!commodity.calculateMethod, 'calculate method');   // 計算方式
    // checkInput(commodity.brandCategory?.length === 0, 'goods category');  // 商品分類

    if (commodity.category !== ProductCate.perUnit) {                // 租約方式 (計價類別＝訂閱制、費用)
      checkInput(!commodity.leaseMode, 'lease mode');
    }
    if (commodity.category === ProductCate.expense) {                 // 計費方式 (計價類別＝費用)
      checkInput(!commodity.billingMethod, 'billing methods');
    }
    if (commodity.inventory === Inventory.custom) {         // 庫存數量 (庫存＝自訂數量)
      checkInput(!commodity.inventoryQty, 'quantity of inventory');
    }

    if (invalidInput.length > 0 || this.bannerTooBig || this.productTooBig) {
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

  /** 表單驗證，若有 error 顯示紅框 */
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });

    this.ui.isOriSkuInvalid = this.selectedSku.length ? false : true;
    this.ui.isCompanyInvalid = this.selectedCompany?.id ? false : true;
    this.ui.isTargetInvalid = !this.f['salesTargets'].value.dealer?.length && !this.f['salesTargets'].value.enduser?.length;
  }

  //////////////////////////////////
  //                              //
  //          商品圖片             //
  //                              //
  //////////////////////////////////

  /** API: 判斷圖片是否需要新增修改刪除 */
  detectProductImg() {
    // 原本沒有，現在有 -> upload
    const case1 = (
      !this.bannerImgServerUrl && this.bannerImgFile ||
      !this.defaultImgServerUrl && this.defaultImgFile);

    // 原本有，現在沒有 -> delete
    const case2 = (
      this.bannerImgServerUrl && !this.bannerImgFile ||
      this.defaultImgServerUrl && !this.defaultImgFile);

    // 原本有，現在有，但兩個不一樣 -> update
    const case3 = (
      this.bannerImgServerUrl && this.bannerImgFile && this.bannerImgUrl !== this.bannerImgServerUrl ||
      this.defaultImgServerUrl && this.defaultImgFile && this.defaultImgUrl !== this.defaultImgServerUrl);

    let apis: Observable<ResponseData>[] = [];
    if (case1) {
      console.log('原本沒有，現在有 -> upload');
      apis = apis.concat(this.uploadProductImg());
    }
    if (case2) {
      console.log('原本有，現在沒有 -> delete');
      apis = apis.concat(this.deleteProductImg());
    }
    if (case3) {
      console.log('原本有，現在有，但兩個不一樣 -> update');
      apis = apis.concat(this.updateProductImg());
    }

    const successMsg = this.translate.instant(this.mode === 'add' ? 'create successfully' : 'update successfully');
    const failMsg = this.translate.instant('update fail');


    if (apis.length) {
      forkJoin(apis).subscribe({
        next: (allRes) => {
          console.log(`[commodity] callImgApis = `, allRes);
          if (allRes.map(responseData => responseData.info.success).indexOf(false) < 0) {
            // this.alert.successAlert(res.info.message, 1500, '', this.backToListView.bind(this));
            this.alert.successAlert(successMsg);
            this.backToListView();
          } else {
            this.alert.errorAlert('[commodity] callImgApis fail: ' + failMsg);
            this.ui.isSaving = false;
          }
        },
        error: (err) => {
          this.alert.errorAlert('[commodity] callImgApis fail: ' + err);
          console.error('[commodity] callImgApis fail: ', err);
          this.ui.isSaving = false;
        },
      });
    } else {
      this.alert.successAlert(successMsg);
      this.backToListView();
    }

  }

  /** API: 上傳圖片 for banner/default */
  uploadProductImg() {
    const apis: Observable<ResponseData>[] = [];
    if (!this.bannerImgServerUrl && this.bannerImgFile) {
      apis.push(this.apiService.uploadProductImg(this.commodityId, this.bannerImgFile, ImageType.banner));
    };
    if (!this.defaultImgServerUrl && this.defaultImgFile) {
      apis.push(this.apiService.uploadProductImg(this.commodityId, this.defaultImgFile, ImageType.default));
    }
    console.log('準備上傳圖片！', apis);
    return apis;
  }

  /** API: 刪除圖片 for banner/default */
  deleteProductImg() {
    const apis: Observable<ResponseData>[] = [];
    if (this.bannerImgServerUrl && !this.bannerImgUrl) {
      apis.push(this.apiService.deleteProductImg(this.commodityId, this.bannerImgServerUrl, ImageType.banner));
    };
    if (this.defaultImgServerUrl && !this.defaultImgUrl) {
      apis.push(this.apiService.deleteProductImg(this.commodityId, this.defaultImgServerUrl, ImageType.default));
    }
    console.log('準備刪除圖片！', apis);
    return apis;
  }

  /** 更新圖片 for banner/default
   * 需要先刪掉舊的，並新增新的
   */
  updateProductImg() {
    const apis: Observable<ResponseData>[] = [];

    // 如果有圖檔，且跟原本網址不一樣，要先刪掉舊的，並新增新的
    if (this.bannerImgServerUrl && this.bannerImgFile && this.bannerImgUrl !== this.bannerImgServerUrl) {
      apis.push(this.apiService.deleteProductImg(this.commodityId, this.bannerImgServerUrl, ImageType.banner));
      apis.push(this.apiService.uploadProductImg(this.commodityId, this.bannerImgFile, ImageType.banner));
    };
    if (this.defaultImgServerUrl && this.defaultImgFile && this.defaultImgUrl !== this.defaultImgServerUrl) {
      apis.push(this.apiService.deleteProductImg(this.commodityId, this.defaultImgServerUrl, ImageType.default));
      apis.push(this.apiService.uploadProductImg(this.commodityId, this.defaultImgFile, ImageType.default))
    }
    console.log('準備更新圖片！', apis);

    return apis;
  }

  /** 點選並選取圖片 */
  selectImg(event: any, type: ImageType) {
    // 檢查大小
    if (event.target.files[0].size > 2048000) {
      if (type === ImageType.banner) {
        this.bannerTooBig = true;
      } else {
        this.productTooBig = true;
      }
    } else {
      if (type === ImageType.banner) {
        this.bannerTooBig = false;
      } else {
        this.productTooBig = false;
      }
    }
    try {
      type === ImageType.banner ?
        this.bannerImgFile = event.target.files[0] as File :
        this.defaultImgFile = event.target.files[0] as File;

      if (/image\/*/.test(event.target.files[0].type)) {
        const reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);
        reader.onload = (event) => {
          if (type === ImageType.banner) {
            this.bannerImgUrl = reader.result
          } else {
            this.defaultImgUrl = reader.result;
          }
        };
      } else {
        // 請上傳圖片檔
        this.alert.warningAlert(this.translate.instant('image type only'));
        this.unselectImg(type);
      }
    } catch (err) {
      this.alert.errorAlert(err);
      this.unselectImg(type);
    }
  }

  /** 取消選取圖片 */
  unselectImg(type: ImageType) {
    type === ImageType.banner ?
      (this.bannerImgUrl = '', this.bannerImgFile = null) : // this.account.bannerUrl = null,
      (this.defaultImgUrl = '', this.defaultImgFile = null); //this.account.productUrl = null,
  }


  //////////////////////////////////
  //                              //
  //          編輯器相關            //
  //                              //
  //////////////////////////////////

  /** editor 載入
   * 圖片上傳到我們的伺服器，加 setTimeout 以確保 this.emailEditor 已 loaded
   */
  editorLoaded() {
    if (this.mode === 'edit') {
      this.apiService.getProduct(this.commodityId).subscribe({
        next: (res) => {
          console.log('[commodity] getProduct done: ', res);
          if (res && res.info && res.info.success && res.data && res.data.pageSetting.editContent) {
            const content = JSON.parse(res.data?.pageSetting?.editContent);
            this.emailEditor.loadDesign(content);
          }
        },
        error: (err) => {
          console.error('[commodity] getProduct fail: ', err);
        }
      });
    } else {
      // 預設背景白色、最大寬度
      this.emailEditor.editor.setBodyValues({
        backgroundColor: '#ffffff',
        contentWidth: "900px",
      });
    }

    setTimeout(() => {
      this.uploadEditorImg();   // upload image
      this.deleteEditorImg();   // delete image
    }, 100);
  }

  /** API: 編輯器上傳圖片 */
  uploadEditorImg() {
    this.emailEditor?.editor.registerCallback('image', (file: { attachments: any[]; }, done: (arg0: { progress: number; url?: any; }) => void) => {
      console.log('unlayer editor > image');
      this.apiService.uploadProductImg(this.commodityId, file.attachments[0], ImageType.description).subscribe({
        next: (res) => {
          console.log('[commodity] uploadProductImg done: ', res);
          if (res.info.success) {
            done({ progress: 1 });

            /** 拿到 url 以後馬上使用 httpGet 可能會出現 404 查無檔案問題，先延遲一段時間再進行 httpGet */
            setTimeout(() => {
              console.log('desc img', this.apiUrl + '/products/image?id=' + res.data[0].id);
              done({ progress: 100, url: this.apiUrl + '/products/image?id=' + res.data[0].id });
            }, 3000);
          } else {
            this.alert.errorAlert(res.info?.exception?.message);
            console.error('[commodity] uploadProductImg fail: ', res.info?.exception?.message);
            this.ui.isSaving = false;
          }
        },
        error: (err) => {
          this.alert.errorAlert(err);
          console.error('[commodity] uploadProductImg fail: ', err);
          this.ui.isSaving = false;
        }
      });
    });
  }

  /** API: 編輯器刪除圖片 */
  deleteEditorImg() {
    this.emailEditor?.editor.registerCallback("design:updated", (data: any) => {
      console.log(data);
      if (data?.item?.type == "image") {
        switch (data.type) {
          case "content:removed":
          case "content:modified":
            //the default value is "https://cdn.tools.unlayer.com/image/placeholder.png"
            console.log("here is the old url");
            console.log(data.item.values.src.url);
            const placeholderImg = 'https://cdn.tools.unlayer.com/image/placeholder.png';
            const deleteImgId = data.item.values.src.url.split(this.apiUrl + '/products/image?id=')[1];

            // 若不包含 editor 的 default placeholder img, 要刪掉資料庫圖片
            if (data.item.values.src.url.indexOf(placeholderImg) === -1) {
              this.apiService.deleteProductImg(this.commodityId, deleteImgId, ImageType.description).subscribe({
                next: (res) => {
                  if (res.info.success) {
                    console.log('[commodity] deleteProductImg done:');
                  } else {
                    console.error('[commodity] deleteProductImg fail: ', res.info?.exception?.message);
                  }
                },
                error: (err) => {
                  console.error('[commodity] deleteProductImg fail: ', err);
                }
              });
            } else {
              break
            }
            break;
          default:
            break;
        }
      }
    });
  }

  /**
   * 開啟動態欄位選單
   * @param commodityAttribute 動態欄位資訊
   */
  openDynamicField(commodityAttribute: CommodityAttribute) {
    this.dynamicField.view = [];
    commodityAttribute.options.forEach(item => {
      const data = {
        id: item.internalVariableName,
        itemName: item.name
      }
      this.dynamicField.view.push(data);
    })
  }

  /**
   * 關閉動態欄位選單
   * @param commodityAttribute 動態欄位資訊
   */
  closeDynamicField(commodityAttribute: CommodityAttribute) {
    commodityAttribute.value = [];
    this.dynamicField.select.forEach(item => {
      if (commodityAttribute.value.constructor === Array) {
        commodityAttribute.value.push(item.id);
      }
    });
  }


  //////////////////////////////////
  //                              //
  //           Filter             //
  //                              //
  //////////////////////////////////

  /** 設定查詢條件 */
  getFilter(pageIndex: number, pageSize?: number) {
    const filter = new Filter();
    filter.pageIndex = pageIndex;

    if (pageSize !== undefined) {
      filter.pageSize = pageSize;
    }

    filter.sort = {};
    filter.sort[this.sortBy.prop] = this.sortBy.dir;
    return filter;
  }

  /** 銷售對象 Filter */
  getTargetListFilter() {
    const filter = this.getFilter(1, -1);
    filter.and.push({
      comparator: Comparator.in,
      field: 'identityType',
      // value: this.ui.isDealer ? [SalesTargetIdentity.dealer] : [SalesTargetIdentity.endUser]
      value: [SalesTargetIdentity.dealer, SalesTargetIdentity.endUser]
    });

    return filter;
  }

  /** 商品設定欄位filter */
  getAttributeFilter() {
    const filter = new Filter;
    filter.and.push({
      field: 'hidden',
      comparator: Comparator.equal,
      value: false
    });
    filter.and.push({
      field: 'groupType',
      comparator: Comparator.equal,
      value: 'DYNAMIC'
    });
    return filter;
  }

  /** mappingList Filter */
  getMappingListFilter() {
    console.log('user', this.currentUser);
    const filter = this.getFilter(1, -1);
    const brandId = this.currentUser?.role?.brand?.id;
    const companyId = this.currentUser?.role?.company?.id;
    if (brandId) {
      filter.and.push({
        comparator: Comparator.equal,
        field: 'cmpBrandId',
        value: brandId
      });
    }
    if (companyId && companyId !== 'SYSTEM') {
      filter.and.push({
        comparator: Comparator.equal,
        field: 'cmpCustomerId',
        value: companyId
      });
    }

    return filter;
  }

  //////////////////////////////////
  //                              //
  //          商品 tag             //
  //                              //
  //////////////////////////////////

  /** 輸入商品 tag */
  enterTagChip(event: any, tagInput: any) {
    if (event.isComposing) {
      return;
    }
    this.tagList.push(tagInput.value);
    tagInput.value = ''
  }

  /** 移除商品 tag */
  removeTagChip(chip: string) {
    const index = this.tagList.indexOf(chip);
    if (index >= 0) {
      this.tagList.splice(index, 1);
    }
  }


  //////////////////////////////////
  //                              //
  //           others             //
  //                              //
  //////////////////////////////////

  /** 切換銷售對象是否為經銷商 */
  // changeDealerStatus() {
  //   this.ui.isDealer = !this.ui.isDealer;
  //   this.targetSelected = [];

  //   this.getSalesTargets();
  // }

  /** 點擊上架/下架日期 */
  checkDate(event: any, name: string) {
    const date = Date.parse(event);
    if (isNaN(date)) {
      (<FormControl>this.commodityForm.get(name)).setValue('');
    }
  }

  /** 新增模式時：取消變更，返回上一頁面 */
  cancel() {
    const confirmMsg = this.translate.instant('confirm to action', {
      action:
        this.translate.instant('cancel') + this.translate.instant('current edit') +
        this.translate.instant('and back to last page'),
    })
    const alertMsg = this.translate.instant('back to last page');
    this.confirmModal.confirm(confirmMsg,
      () => {
        // this.alert.successAlert(alertMsg, 1000, '', this.backToListView.bind(this));
        this.alert.successAlert(alertMsg);
        this.backToListView();
      },
      () => {
        return false;
      }
    );
  }

  /** 取消變更後返回 list */
  backToListView(): any {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  /** 打開預覽視窗 */
  openPreviewModal(template: TemplateRef<any>) {
    console.log(this.defaultImgUrl);

    this.f['defaultImage'].setValue(this.defaultImgUrl);

    this.emailEditor.editor.exportHtml((htmlData: any) => {
      this.emailEditor.editor.saveDesign((data: object) => {
        const pageSetting = { content: htmlData.html, editContent: JSON.stringify(data) };
        this.f['pageSetting'].setValue(pageSetting);
      });
    });

    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'modal-full' })
    );
  }

  /** 關閉預覽視窗 */
  closeModal() {
    this.modalRef.hide();
  }

  /** 變更商品類別
   * 計費週期 (leaseMode)
   * 下單成本 (originalPrice)
   * 原廠定價 (listPrice)
   * 計費方式 (billingMethod)
   * -------------------------------------------
   * 用量型：計費週期 X、計費方式 X  // 下單成本 X、原廠定價 X
   * 訂閱制：計費週期 O、計費方式 X  // 下單成本 O、原廠定價 O
   * 費用  ：計費週期 O、計費方式 O  // 下單成本 X、原廠定價 X
   */
  changeCategory(resLeaseMode?: string, resCalculate?: string) {
    switch (this.f['category'].value) {
      case ProductCate.perUnit: {        // 用量制
        // this.f['leaseMode'].setValue(null);
        this.f['leaseMode'].clearValidators();
        this.f['leaseMode'].updateValueAndValidity();
        // this.f['leaseMode'].disable();
        this.f['billingMethod'].setValue('NONE');
        this.f['billingMethod'].clearValidators();
        this.f['billingMethod'].updateValueAndValidity();
        if (this.isCloudRole || this.isAkamaiRole) {
          this.f['billingMethod'].enable();
        } else {
          this.f['billingMethod'].disable();
        }
        break;
      }
      case ProductCate.subscription: {    // 訂閱制
        // this.f['leaseMode'].setValue(resLeaseMode ?? this.leaseModeDDL[0].value);
        this.f['leaseMode'].setValidators([Validators.required]);
        this.f['leaseMode'].updateValueAndValidity();
        // this.f['leaseMode'].enable();
        this.f['billingMethod'].setValue('NONE');
        this.f['billingMethod'].clearValidators();
        this.f['billingMethod'].updateValueAndValidity();
        if (this.isCloudRole || this.isAkamaiRole) {
          this.f['billingMethod'].enable();
        } else {
          this.f['billingMethod'].disable();
        }
        break;
      }
      case ProductCate.expense: {         // 費用
        // this.f['leaseMode'].setValue(resLeaseMode ?? this.leaseModeDDL[0].value);
        this.f['leaseMode'].setValidators([Validators.required]);
        this.f['leaseMode'].updateValueAndValidity();
        // this.f['leaseMode'].enable();
        this.f['billingMethod'].setValue(resCalculate ?? this.billingMethodDDL[1].value);
        this.f['billingMethod'].setValidators([Validators.required]);
        this.f['billingMethod'].updateValueAndValidity();
        this.f['billingMethod'].enable();
        break;
      }
      default: {
        break;
      }
    }
  }

  /** 變更庫存 */
  changeInventory() {
    // 若庫存為"可供貨"，庫存數量
    console.log('庫存 = ', this.f['inventory'].value);
    if (this.f['inventory'].value === Inventory.available) {
      this.f['inventoryQty'].setValidators([Validators.min(1), Validators.pattern(/^[1-9][0-9]*$/)]);
      this.f['inventoryQty'].updateValueAndValidity();
      this.f['inventoryQty'].setValue('');
      if (this.isCloudRole || this.isAkamaiRole) {
        this.f['inventoryQty'].enable();
      } else {
        this.f['inventoryQty'].disable();
      }
    } else {
      this.f['inventoryQty'].setValidators([Validators.min(1), Validators.pattern(/^[1-9][0-9]*$/), Validators.required]);
      this.f['inventoryQty'].updateValueAndValidity();
      this.f['inventoryQty'].enable();
    }
  }

  /** 變更原廠/品牌 */
  changeBrand() {
    this.f['customerId'].setValue('');
    this.f['customerId'].disable();
    this.f['solutionId'].setValue('');
    this.f['solutionId'].disable();
    this.selectedCompany = null;
    this.selectedSku = [];

    // this.onSkuDeSelect();
    this.getCompanyList();
    this.getSolutionList();
    // this.getBrandMappingList();
    this.getClassification();
  }

  /** get 品牌名稱 */
  getBrandName(id: string) {
    const brand = this.brandsDDL.find(item => item.brandId === id);
    return brand?.name;
  }

  onCompanySelect(opt: CompanyData) {
    this.f['customerId'].setValue('');
    this.f['customerId'].setValue(opt.id);
    this.selectedCompany = null;
    this.selectedCompany = opt;
    if (opt) {
      this.ui.isCompanyInvalid = false;
      this.getBrandMappingList();
    }
  }

  onSkuDeSelect() {
    this.f['originalSku'].setValue('');
    this.f['specification'].setValue('');
    this.f['originalPrice'].setValue('');
    this.f['originalCurrency'].setValue('');
    this.f['sellingPrice'].setValue('');
    this.f['listPrice'].setValue('');
    this.f['twdListPrice'].setValue('');
    this.f['unit'].setValue('');
    this.f['erpSku'].setValue('');
    this.f['startDate'].setValue('');
    this.f['endDate'].setValue('');
    // this.f['sellingPrice'].markAsUntouched();
  }

  salesTargetChanged(type: SalesTargetIdentity) {
    switch (type) {
      case SalesTargetIdentity.dealer:
        this.isAllDealer = !this.isAllDealer;
        this.dealerSelected = this.isAllDealer ? [] : this.dealerSelected;
        break;
      case SalesTargetIdentity.endUser:
        this.isAllEndUser = !this.isAllEndUser;
        this.endUserSelected = this.isAllEndUser ? [] : this.endUserSelected;
        break;
    }
    if (this.isAllDealer || this.isAllEndUser) {
      this.ui.isTargetInvalid = false;
    }
  }
}
