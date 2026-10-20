import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { InTableConfig, Sort } from '@sysage/in-table';
import { forkJoin, Observable } from 'rxjs';
import { CompanyData, CustomerData, CustomerIdentity, IdentityType } from '../core/models/authorization';
import { Commodity, CommodityCustomer, DropDownItem, SalesTargetIdentity } from '../core/models/commodity';
import { Comparator, Filter } from '../core/models/filter';
import { PageConfig } from '../core/models/page';
import { ResponseData } from '../core/models/response-data';
import { User } from '../core/models/users';
import { AlertService } from '../core/services/alert.service';
import { AuthService } from '../core/services/auth.service';
import { UtilService } from '../core/services/util.service';
import { CommodityService } from './commodity.service';
import { environment } from 'src/environments/environment';
import { DataService } from '../core/services/data.service';
import { Permission } from '../core/models/permission';
import { PermissionService } from '../core/services/permission.service';
import * as _ from 'lodash';
import moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-commodity',
  templateUrl: './commodity.component.html',
  styleUrls: ['./commodity.component.scss']
})
export class CommodityComponent implements OnInit {

  /** 目前登入的使用者資訊 */
  currentUser!: User | null;
  currentUserIdentity!: IdentityType | undefined;

  /** product 權限 */
  productPermission: { [key: string]: Permission } = {};

  searchForm!: FormGroup;
  isAdminPermission: boolean = false;

  /** 商品列表 */
  commodityList: Commodity[] = [];

  /** 下拉選單列表 - 公司 */
  companyDDL: CompanyData[] = [];
  selectedCompany: CompanyData | null = null;

  /** 匯入檔案 */
  importFile: File[] = [];

  /** 下拉選單列表 - 原廠料號 */
  // originalSkuDDL: BrandData[] = [];
  // selectedSku: BrandData[] = [];
  // brandMappingList: string[] = [] // CRM Mapping Table

  /** 上下架日期設定 */
  // maxDate: Date = new Date();
  // minDate: Date = new Date();

  /** 圖片網址前綴 */
  apiUrl: any;

  ui = {
    isSearching: false,
    isSkuListLoading: false,
    // 銷售對象loading
    isLoading: false,
    // 匯入檔案loading
    isImportFile: false,
    // 銷售對象欄位是否正確
    isTargetInvalid: false,
  }

  /** in-table setting */
  inTableConfig = new InTableConfig();
  inTableTranslate: any; // = new InTableTranslate();

  defaultPageSize = 10;
  /** 設定分頁參數 */
  pageConfig = new PageConfig();

  filter = new Filter({
    pageSize: this.defaultPageSize
  });

  /** 銷售對象下拉選單基礎設定 */
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
    classes: 'custom-dropdown',
    lazyLoading: true,
    disabled: false,
    searchBy: ['name'],
  };

  /** 下拉選單列表 - 銷售對象 */
  salesTargetAll: DropDownItem[] = [];     // 所有清單
  salesTargetDealer: DropDownItem[] = [];  // 所有經銷商清單
  salesTargetEnduser: DropDownItem[] = []; // 所有非經銷商清單
  dealerSelected: DropDownItem[] = [];     // 已被選取的清單
  endUserSelected: DropDownItem[] = [];    // 已被選取的清單
  isAllDealer = false;                     // 全選經銷商
  isAllEndUser = false;                    // 全選非經銷商

  /** 設定排序參數 */
  sortBy = {
    prop: 'modifiedTime',
    dir: Sort.desc,
  };

  /** bsDaterangepicker顯示方向 */
  bsDaterangepickerPlace: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

  /** 上傳檔案類型 */
  readonly dataFileAccepts = '.xlsx, .xls';

  /** 跳出視窗 */
  bsModalRef?: BsModalRef;

  get f() { return this.searchForm.controls }
  get IdentityType() { return IdentityType }
  get SalesTargetIdentity() { return SalesTargetIdentity; }

  constructor(
    public util: UtilService,
    public permission: PermissionService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private alert: AlertService,
    private apiService: CommodityService,
    private authService: AuthService,
    private data: DataService,
    private bsModal: BsModalService,
  ) {
    this.initSearchForm();
    this.apiUrl = environment['apiUrl'] + '/' + environment['gateway'].product.slice(0, -1);
  }

  initSearchForm() {
    this.searchForm = this.fb.group({
      productId: [''],
      productName: [''],
      customerId: [''],
      availableDate: [''],
      productSku: [''],
      originalSku: [''],
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

    this.currentUser = this.authService.currentUserValue;
    this.currentUserIdentity = this.currentUser?.role?.identityType;
    this.isAdminPermission = !!this.permission.flat['layout.iam.adminInput'];
    this.bsDaterangepickerPlace = this.isAdminPermission ? 'right' : 'left';

    this.init();
  }

  private init() {
    this.ui.isSearching = true;

    /** in-table setting */
    this.inTableConfig.sitckyElemId = 'page-header';
    this.inTableConfig.enableResizeColWidth = true;
    this.inTableConfig.showBorder = true;
    this.inTableConfig.showAllSubRowOnlyIfMoreThanOne = false;
    // admin, 代理才可以上架
    this.inTableConfig.rowLinkKey = (this.productPermission['product-v1.updateProduct'] || this.productPermission['product-v1.queryProduct']) ? 'productId' : '';
    this.filter.sort = {};
    this.filter.sort[this.sortBy.prop] = this.sortBy.dir;

    /** call 表單下拉選單 API */
    const apis: Observable<ResponseData>[] = [];
    const companyListFilter = this.getCompanyListFilter();

    // apis.push(this.apiService.getBrandMappingList());   // 取得 CRM Mapping Table
    if (this.isAdminPermission) {
      apis.push(this.apiService.getCompanyList(companyListFilter));       // 取得下拉選單-公司
    } else {
      this.getCommodityList();
    }

    forkJoin(apis).subscribe({
      next: (allRes) => {
        console.log(`[authorization] init allRes = `, allRes);
        // this.ui.isSearching = false;
        if (allRes.map(responseData => responseData.info.success).indexOf(false) < 0) {
          // 取得 CRM Mapping Table
          // this.brandMappingList = allRes[0].data.map((item: BrandMapping) => item.crmBrandId);
          // console.log(this.brandMappingList);
          // this.getCrmPriceBookList();

          if (this.isAdminPermission) {
            // 要拿到角色為代理商的 data
            let companyList = allRes[0].data.map((item: CustomerData) => {
              return {
                id: item.customerId,
                fullCh: item.customerName.fullCh,
                fullEn: item.customerName.fullEn,
                nickCh: item.customerName.nickCh,
                nickEn: item.customerName.nickEn,
                creator: item.companyName?.fullCh
              };
            });
            // companyList = _.uniqBy(companyList, 'id');
            this.companyDDL = companyList;
            console.log(this.companyDDL);
          }
          this.getCommodityList();
        }
      },
      error: (err) => {
        this.alert.errorAlert('[authorization] init allRes fail: ' + err);
        console.error('[authorization] init allRes fail: ', err);
        this.ui.isSearching = false;
      },
    });

    // this.getCommodityList();
  }


  /** API: 取得商品列表 */
  getCommodityList() {
    this.searchForm.disable();
    this.commodityList = [];

    this.filter = this.getFilter(this.pageConfig.currentPage, this.pageConfig.itemsPerPage);
    console.log(this.filter);

    this.apiService.getProductList(this.filter).subscribe({
      next: (res) => {
        if (res && res.info && res.info.success && res.data) {
          console.log('[commodity] getProductList done: ', res);
          this.commodityList = res.data;
          res.data.forEach((commodity: Commodity) => this.data.setIdLabel('commoditys', commodity.productId, commodity.productName));

          this.pageConfig.totalItems = res.page?.dataCount ?? 0;
          this.pageConfig.itemsPerPage = res.page?.pageSize ?? 10;
          this.pageConfig.currentPage = res.page?.pageIndex ?? 1;
        }
        this.ui.isSearching = false;
        this.searchForm.enable();
      },
      error: (err) => {
        this.alert.errorAlert('[commodity] getProductList fail: ' + err);
        console.error('[commodity] getProductList fail: ', err);
        this.ui.isSearching = false;
        this.searchForm.enable();
      },
    });
  }

  /** 取得銷售對象 */
  getSalesTargets() {
    this.ui.isLoading = true;
    this.salesTargetDealer = [];
    this.salesTargetEnduser = [];
    const filter = new Filter();
    filter.pageSize = -1
    filter.and.push({
      comparator: Comparator.in,
      field: 'identityType',
      value: [SalesTargetIdentity.dealer, SalesTargetIdentity.endUser]
    });
    this.apiService.getSalesTargets(filter).subscribe({
      next: (res) => {
        if (res && res.info && res.info.success && res.data) {
          this.salesTargetAll = res.data.map((item: CommodityCustomer) => {
            return { id: item.customerId, name: item.customerName?.fullCh, identityType: item.identityType };
          });
          this.salesTargetDealer = this.salesTargetAll.filter(item => item.identityType?.find(ele => ele === SalesTargetIdentity.dealer));
          this.salesTargetEnduser = this.salesTargetAll.filter(item => item.identityType?.find(ele => ele === SalesTargetIdentity.endUser));
        }
        this.ui.isLoading = false;
      },
      error: (err) => {
        this.salesTargetDealer = [];
        this.salesTargetEnduser = [];
        this.alert.errorAlert(err);
        this.ui.isLoading = false;
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

    const setField = (comparator: Comparator, field: string, value: any) => {
      // if (this.f[input].value ? this.f[input].value.trim() : '') {
      filter.and.push({
        comparator: comparator,
        field: field,
        value: value
      });
      // }
    }

    if (this.f['customerId'].value ? this.f['customerId'].value.trim() : '') {
      const customerIds: string[] = [];
      customerIds.push(this.f['customerId'].value.trim())
      setField(Comparator.equal, 'customerId', this.f['customerId'].value.trim());
    }
    if (this.f['productId'].value ? this.f['productId'].value.trim() : '') {
      setField(Comparator.equal, 'productId', this.f['productId'].value.trim());
    }
    if (this.f['productName'].value ? this.f['productName'].value.trim() : '') {
      setField(Comparator.like, 'productName', this.f['productName'].value.trim());
    }
    if (this.f['productSku'].value ? this.f['productSku'].value.trim() : '') {
      setField(Comparator.equal, 'productSku', this.f['productSku'].value.trim());
    }
    /* if (this.f['availableDate'].value) {
      setField(Comparator.greaterEqual, 'startDate', this.f['availableDate'].value[0]);
    }
    if (this.f['availableDate'].value) {
      setField(Comparator.lesserEqual, 'endDate', this.f['availableDate'].value[1]);
    } */
    if (this.f['availableDate'].value) {
      const pickerRangeDates = [moment(this.f['availableDate'].value[0]).format('YYYY-MM-DD'), moment(this.f['availableDate'].value[1]).format('YYYY-MM-DD')];
      setField(Comparator.in, 'date', pickerRangeDates);
    }
    if (this.f['originalSku'].value) {
      setField(Comparator.like, 'originalSku', this.f['originalSku'].value.trim());
    }

    filter.sort = {};
    filter.sort[this.sortBy.prop] = this.sortBy.dir;
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
        field: 'crmCustomerId',
        value: companyId
      });
    }

    return filter;
  }

  /** 公司 Filter */
  getCompanyListFilter() {
    const filter = this.getFilter(1, -1);
    // 要拿到角色為代理商的 data
    // filter.and.push({
    //   comparator: Comparator.in,
    //   field: 'identityType',
    //   value: ['AGENT']       // 代理商
    // });
    // filter.and.push({ // 排除系統管理員建的公司
    //   comparator: Comparator.not,
    //   field: 'brandId',
    //   value: ''
    // });
    filter.and.push({
      comparator: Comparator.in,
      field: 'identityType',
      value: [CustomerIdentity.ORIGIN]
    });

    return filter;
  }

  /** 清除表單 */
  reset() {
    // this.selectedSku = [];
    this.initSearchForm();
    this.getCommodityList();
    this.selectedCompany = null;
  }

  /** 切換分頁時指定執行的函式 (in-table)
   * @param event 由 in-table 回傳的分頁資訊
   */
  pageChange(event: any) {
    this.ui.isSearching = true;
    localStorage.setItem('intable-commodity-list-table-pageSize', JSON.stringify({
      itemsPerPage: event.itemsPerPage,
    }));
    this.getCommodityList();
  }

  /** 點擊標題進行排序指定執行的函式 (in-table)
   * @param event 由 in-table 回傳的排序資訊
  */
  sort(event: any) {
    this.getCommodityList();
  }

  onCompanySelect(opt: CompanyData) {
    this.f['customerId'].setValue('');
    this.f['customerId'].setValue(opt.id);
    this.selectedCompany = null;
    this.selectedCompany = opt;
  }

  /** API: 從 CRM 取得原廠料號清單 */
  // getCrmPriceBookList(event?: any) {
  //   this.ui.isSkuListLoading = true;
  //   this.originalSkuDDL = [];

  //   const filter = this.getFilter(1, 100);
  //   filter.and.push({
  //     comparator: Comparator.in,
  //     field: 'manu',
  //     value: this.brandMappingList
  //   });
  //   if (event) {
  //     filter.and.push({
  //       comparator: Comparator.like,
  //       field: 'productIdentifier',
  //       value: event?.target?.value?.trim()
  //     });
  //   }
  //   filter.sort = {};

  //   this.apiService.getCrmPriceBookList(filter).subscribe({
  //     next: (res) => {
  //       console.log('[commodity] getCrmPriceBookList done: ', res);
  //       if (res && res.info && res.info.success && res.data) {
  //         this.originalSkuDDL = Object.keys(res.data).map(item => { return { id: item, name: item } });
  //         console.log(this.originalSkuDDL);
  //       }
  //     },
  //     error: (err) => {
  //       console.error('[commodity] getCrmPriceBookList fail: ', err);
  //     }
  //   });

  //   this.ui.isSkuListLoading = false;
  // }

  /** 開啟匯入檔案跳窗 */
  openModal(template: any) {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'modal-xl',
      animated: false,
      initialState: {
        backdrop: false,
        ignoreBackdropClick: true,
      }
    }
    this.bsModalRef = this.bsModal.show(template, config);
    // 只抓一次列表
    if (this.salesTargetDealer.length === 0 || this.salesTargetEnduser.length === 0) {
      this.getSalesTargets();
    }
  }

  /** 商品銷售對象勾選狀態 */
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

  /** 選擇上傳檔案 */
  uploadFile(e: any) {
    this.importFile = e.target.files;
  }

  /** 匯入資料 */
  importData() {
    this.ui.isImportFile = true;
    const dealer: string[] = [];
    const endUser: string[] = [];
    // 經銷商
    this.dealerSelected.forEach(item => {
      dealer.push(item.id);
    });
    // 非經銷商
    this.endUserSelected.forEach(item => {
      endUser.push(item.id);
    });
    /**
     * 轉字串
     * 有勾全選 => 直接給"ALL"
     * 沒勾全選 =>
     *            有選客戶 => 前後加雙引號
     *            沒選客戶 => 給空值
     */
    const stringDealer = this.isAllDealer ? '"ALL"' : (dealer.length !== 0 ? '"' + dealer.map(item => item).join('","') + '"' : '');
    const stringEndUser = this.isAllEndUser ? '"ALL"' : (endUser.length !== 0 ? '"' + endUser.map(item => item).join('","') + '"' : '');
    const data = '{"data":{"salesTargets":{"dealer":[' + stringDealer + '],"endUser":[' + stringEndUser + ']}}}';
    const formData = new FormData();
    formData.append('salesTargets', data);
    formData.append('file', this.importFile[0]);
    // console.log(this.importFile[0]);
    // console.log(data);
    this.apiService.uploadExcel(formData).subscribe({
      next: (res) => {
        if (res && res.info && res.info.success) {
          this.alert.successAlert(res.info.message);
          this.getCommodityList();
          this.importFile = [];
          this.tempHide();
        } else {
          this.alert.errorAlert('[upload excel fail]： ' + res.info.message);
        }
        this.ui.isImportFile = false;
      },
      error: (err) => {
        this.alert.errorAlert('[upload excel fail]： ' + err.info.message);
        console.error('[upload excel fail]： ', err.info);
        this.ui.isImportFile = false;
        // this.tempHide();
      },
    });
  }

  /** 關閉跳出視窗 */
  tempHide() {
    this.dealerSelected = [];
    this.endUserSelected = [];
    this.importFile = [];
    this.bsModal.hide();
  }

  /** 上傳excel按鈕檢查 */
  uploadExcelCheck() {
    if (this.ui.isImportFile){
      return true;
    }
    // 打勾跟選公司選項至少要有一個有值
    if (this.dealerSelected.length === 0 && this.endUserSelected.length === 0) {
      if (!this.isAllDealer && !this.isAllEndUser) {
        return true;
      }
    }
    if (this.importFile.length === 0) {
      return true;
    }
    return false;
  }
}
