import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { CartFormValue, CommodityContact, CommodityCustomer, CommoditySales, CustomerLocation, PaymentMethodList } from 'src/app/core/models/commodity';
import { Comparator, Filter } from 'src/app/core/models/filter';
import { ResponseData } from 'src/app/core/models/response-data';
import { User } from 'src/app/core/models/users';
import { AlertService } from 'src/app/core/services/alert.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommodityShopService } from '../../commodity-shop.service';
import * as _ from 'lodash';
import { PermissionService } from 'src/app/core/services/permission.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-shopping-detail',
  templateUrl: './shopping-detail.component.html',
  styleUrls: ['./shopping-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShoppingDetailComponent implements OnInit {
  @Input() mode: 'edit' | 'prev' | 'view' = 'edit';
  @Input() cartFormValue!: CartFormValue;
  @Output() private formGroupChange = new EventEmitter<{ form: FormGroup, formValue: CartFormValue }>();
  @Output() private formValidChange = new EventEmitter<boolean>();

  productCompanyIdVal!: string;
  @Input()
  get productCompanyId() {
    return this.productCompanyIdVal;
  }
  set productCompanyId(productCompanyIdVal: string) {
    this.productCompanyIdVal = productCompanyIdVal;
    if (this.productCompanyIdVal) {
      this.ui.isSalesValid = false;
      this.getSalesList();
    }
  }
  // stepValue: number = 1;
  // @Output() stepChange = new EventEmitter<number>();
  // @Input()
  // get step(): number {
  //   return this.stepValue;
  // }
  // set step(step: number) {
  //   this.stepValue = step;
  //   this.stepChangeCheck();
  // }

  // formCheckingValue: boolean = false;
  // @Output() formCheckingChange = new EventEmitter<boolean>();
  // @Input()
  // get formChecking(): boolean {
  //   return this.formCheckingValue;
  // }
  // set formChecking(formChecking: boolean) {
  //   this.formCheckingValue = formChecking;

  //   // 變成 true 的時候檢查欄位
  //   if (formChecking && this.mode === 'edit') {
  //     this.validateAllFormFields(this.searchForm);
  //     // Promise.resolve().then(() => {

  //     this.cdr.detectChanges();
  //     this.formCheckingValue = false;
  //     this.formCheckingChange.emit(this.formCheckingValue);
  //     // })
  //     // setTimeout(() => {
  //     // }, 500);

  //   }
  // }

  /** 下拉選單列表 - 付款方式 */
  paymentMethodList = PaymentMethodList;

  /** 表單資訊 */
  searchForm!: FormGroup;

  /** 目前登入的使用者資訊 */
  currentUser: User | null;

  /** 下拉選單列表 - 客戶地址 */
  customerAddDDL: CustomerLocation[] = [];

  /** 下拉選單列表 - 最終使用者 */
  endUserDDL: CommodityCustomer[] = [];

  /** 下拉選單列表 - 聯絡人/帳單聯絡人 */
  contactDDL: CommodityContact[] = [];

  /** 下拉選單列表 - 指定業務＋分機 */
  salesDDL: CommoditySales[] = [];
  selectedSales: CommoditySales[] = [];
  salesKeyword: string = '';

  ui = {
    isLoading: false,
    isSalesLoading: true,
    isSalesValid: false,
    isCloudRole: false,
  }

  // 下拉選單基礎設定
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
    labelKey: 'label',
    classes: 'custom-dropdown dropdown-position',
    // lazyLoading: true,
    disabled: false,
    searchBy: ['label']
  };

  get f() { return this.searchForm.controls }

  constructor(
    public permission: PermissionService,
    private fb: FormBuilder,
    private authService: AuthService,
    private apiService: CommodityShopService,
    private alert: AlertService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
  ) {
    this.initSearchForm();
    this.currentUser = this.authService.currentUserValue;

    /** 訂閱是否需要檢查表單 */
    this.apiService.cartFromChecking.subscribe(status => {
      if (status) {
        this.validateAllFormFields(this.searchForm);
      }
    });
  }

  initSearchForm() {
    this.searchForm = this.fb.group({
      customerId: ['', Validators.required],
      customerName: [{ value: '', disabled: true }, Validators.required],
      customerLocationId: ['', Validators.required],
      enduserId: ['', Validators.required],
      contactId: ['', Validators.required],
      billingContactId: ['', Validators.required],
      billingContactIdEmail: ['', Validators.required],
      billingLocationId: [''],
      salesId: ['', Validators.required],
      salesEmail: [''],
      salesExt: ['', Validators.required],
      salesName: ['', Validators.required],
      cloudId: [''],
      ciscoDid: [''],
      ciscoContactEmail: [''],
      paymentWay: ['transfer', Validators.required]
    });
  }

  ngOnInit(): void {
    this.init();

    // 編輯模式下，將 formValue 回傳父元件
    if (this.mode === 'edit') {
      this.searchForm.valueChanges.subscribe(() => {
        this.cdr.detectChanges();

        const formValue: CartFormValue = {
          customer: {
            id: this.currentUser?.role?.company?.id ?? '',
            name: this.f['customerName'].value,
          },
          customerAddress: this.getFormValue('customerLocationId'),
          endUser: {
            id: this.f['enduserId'].value,
            name: this.getFormValue('enduserId'),
          },
          customerContact: {
            id: this.f['contactId'].value,
            name: this.getFormValue('contactId'),
          },
          billingContact: {
            id: this.f['billingContactId'].value,
            name: this.getFormValue('billingContactId'),
          },
          billingAddress: this.getFormValue('billingLocationId'),
          billingContactEmail: this.f['billingContactIdEmail'].value,
          cloudId: this.f['cloudId'].value,
          salesperson: {
            id: this.f['salesId'].value,
            name: this.f['salesName'].value,
            ext: this.f['salesExt'].value,
            email: this.f['salesEmail'].value,
          },
          did: this.f['ciscoDid'].value,
          openContactEmail: this.f['ciscoContactEmail'].value,
          // paymentMethod: {
          //   value: this.f['paymentWay'].value,
          //   name: this.f['paymentWay'].value,
          // }
          paymentMethod: this.translate.instant(this.f['paymentWay'].value),

          // customerName: this.f['customerName'].value,
          // endUserName: this.getFormValue('enduserId'),
          // customerContact: this.getFormValue('contactId'),
          // billingContact: this.getFormValue('billingContactId'),
          // salesperson: this.f['salesId'].value,
          // ext: this.f['salesId'].value,
        };

        const data = {
          form: this.searchForm,
          formValue: formValue
        };
        this.formGroupChange.emit(data);
      });
    }
  }

  private init() {
    this.ui.isCloudRole = this.currentUser?.role?.brand.id === '290ebb3e-ad5d-42e1-8b02-836de25b0807' ? true : false;
    if (!this.ui.isCloudRole) {
      this.f['cloudId'].setValidators([Validators.required]);
      this.f['cloudId'].updateValueAndValidity();
    }
    if (this.mode === 'edit') {
      this.modeEditInit();
    } else if (this.mode === 'view') {
      this.modeViewInit();
    } else {
      console.log(this.cartFormValue);
    }
  }

  /** mode 模式下的 init */
  modeEditInit() {
    /** call 表單下拉選單 API */
    const apis: Observable<ResponseData>[] = [];
    const customerId = this.currentUser?.role?.company.id;
    const endUseFilter = this.getEndUserListFilter();
    const contactFilter = this.getFilter(1, -1);

    if (customerId) {
      apis.push(this.apiService.getCustomer(customerId));
      apis.push(this.apiService.getContact(contactFilter, customerId));

      if (this.permission.flat['customer-v1.queryCustomers']) {
        apis.push(this.apiService.getEndUserList(endUseFilter));
      }

      forkJoin(apis).subscribe({
        next: (allRes) => {
          console.log(`[commodity-shop-detail] init allRes = `, allRes);
          this.ui.isLoading = false;
          if (allRes.map(responseData => responseData.info.success).indexOf(true) > -1) {
            // 客戶
            this.f['customerName'].setValue(allRes[0].data?.customerName.fullCh);
            this.f['customerId'].setValue(allRes[0].data?.customerId);

            // ===== 客戶地址 ======
            this.customerAddDDL = allRes[0].data?.location;
            this.f['customerLocationId'].setValue(this.customerAddDDL[0]?.locationId);
            this.f['billingLocationId'].setValue(this.customerAddDDL[0]?.locationId);

            // ====== 聯絡人 =======
            this.contactDDL = allRes[1].data;
            this.f['contactId'].setValue(this.contactDDL[0]?.contactId);
            this.f['billingContactId'].setValue(this.contactDDL[0]?.contactId);

            // ===== 最終使用者 =====
            if (this.permission.flat['customer-v1.queryCustomers'] && allRes[2].data) {
              this.endUserDDL = allRes[2].data;
            } else { // 沒有權限或獲取失敗，選項為該角色的公司
              if (this.currentUser?.role?.company) {
                const company = {
                  customerId: this.currentUser?.role?.company.id,
                  customerName: this.currentUser?.role?.company,
                  status: 0
                }
                this.endUserDDL.push(company);
              }
            }
            // 如果最終使用者名單有自己公司，改顯示 allName
            this.endUserDDL.forEach(element => {
              if (element.customerId === this.currentUser?.role?.company.id) {
                element.customerName.allName = this.translate.instant('self use');
              }
            });
            this.f['enduserId'].setValue(this.endUserDDL[0]?.customerId);

            // ===== 設定帳單聯絡人 EMAIL =====
            this.setContactEmail();

            if (this.mode === 'prev') {
              this.searchForm.disable();
            }
          }
        },
        error: (err) => {
          this.alert.errorAlert('[commodity-shop-detail] init allRes fail: ' + err);
          console.error('[commodity-shop-detail] init allRes fail: ', err);
          this.ui.isLoading = false;
        },
      });
    } else {
      this.alert.errorAlert('[commodity-shop-detail] Did not get the companyId for user.');
    }
  }

  modeViewInit() {
    console.log(this.cartFormValue);
  }

  /** API: 取得指定業務列表 */
  getSalesList(event?: any) {
    console.log(event);
    this.ui.isSalesLoading = true;
    this.salesKeyword = event?.target?.value?.trim();
    this.salesDDL = [];
    this.selectedSales = [];

    const filter = this.getSalesListFilter();

    this.apiService.getSalesList(filter).subscribe({
      next: (res) => {
        if (res && res.info && res.info.success && res.data) {
          console.log('[commodity] getSalesList done', res);

          this.salesDDL = res.data;
          // if (this.selectedSales.length) {
          //   this.salesDDL.unshift(this.selectedSales[0]);
          // };
          this.salesDDL.forEach(item => {
            const ext = item?.telephone?.ext ? `(${item?.telephone?.ext})` : '';
            const name = (item?.name || item?.englishName || item?.nickName) ? `${item?.name ?? (item?.englishName ?? item?.nickName)}` : `${item?.email}`;
            item.label = `${name} ${ext}`;
          });
          if (res.data.length) {
            if (this.ui.isCloudRole) {
              // 雲市集預設業務 email:"debbiechang@metaage.com.tw" name:"張珮菱"
              const defaultSales = this.salesDDL.filter(item => item.id === '3f9a6526-e1a1-46e6-a13b-37252e98c37e');
              this.selectedSales.push(defaultSales[0]);
              this.onSalesSelect(defaultSales[0]);
            } else {
              // 其他品牌
              this.selectedSales.push(this.salesDDL[0]);
              this.onSalesSelect(this.salesDDL[0]);
            }
          } else {
            this.ui.isSalesValid = this.selectedSales.length ? false : true;
          }
        };
        this.ui.isSalesLoading = false;
      },
      error: (err) => {
        this.alert.errorAlert('[commodity] getSalesList fail: ' + err);
        console.error('[commodity] getSalesList fail: ', err);
        this.ui.isSalesLoading = false;
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

    filter.sort = {};
    return filter;
  }

  /** 最終使用者 Filter */
  getEndUserListFilter() {
    const filter = this.getFilter(1, -1);
    filter.and.push({
      comparator: Comparator.in,
      field: 'identityType',
      value: ['ENDUSER']
    });

    return filter;
  }

  /** 指定業務 Filter */
  getSalesListFilter() {
    const filter = this.getFilter(1, -1);
    const brandId = this.currentUser?.role?.brand.id;
    const brandName = this.currentUser?.role?.brand.name;
    const companyId = this.productCompanyId;

    if (this.salesKeyword?.trim()) {
      filter.and.push({
        comparator: Comparator.like,
        field: 'name',
        value: this.salesKeyword.trim()
      });
      //   field: 'nickName',
      //   field: 'englishName',
      //   field: 'email',
      //   field: 'employeeId',
    }

    filter.and.push({
      comparator: Comparator.equal,
      field: 'brand',
      value: brandId
    });
    if (!this.ui.isCloudRole) {
      filter.and.push({
        comparator: Comparator.equal,
        field: 'company',
        value: companyId
      });
    }

    return filter;
  }

  /** 選擇指定業務 */
  onSalesSelect(event: any) {
    console.log(event);
    this.f['salesId'].setValue(event?.id);
    this.f['salesName'].setValue(event?.name ?? '');
    this.f['salesEmail'].setValue(event?.email ?? '');
    this.f['salesExt'].setValue(event?.telephone?.ext ?? '');
  }
  onSalesDeSelect() {
    this.f['salesId'].setValue('');
    this.f['salesName'].setValue('');
    this.f['salesEmail'].setValue('');
    this.f['salesExt'].setValue('');
  }

  /** 根據 id 取回值 */
  getFormValue(formControlName: string): string {
    const id = this.searchForm.controls[formControlName].value;
    let item;

    switch (formControlName) {
      // 客戶地址
      case 'customerLocationId':
      case 'billingLocationId':
        item = this.customerAddDDL.find(element => element.locationId === id);
        const address: string = `${item?.name} (${item?.address})`;
        return address;

      // 最終使用者
      case 'enduserId':
        item = this.endUserDDL.find(element => element.customerId === id);
        return item ? (item.customerName.allName ?? item.customerName.fullCh) : '';

      // 聯絡人
      case 'contactId':
      case 'billingContactId':
        item = this.contactDDL.find(element => element.contactId === id);
        const contact: string = `${item?.chineseName ? item?.chineseName : (item?.englishName ?? '')}`
        return contact;

      default:
        console.error(`[commodity - shop - detail] WRONG formControlName!`);
        return '';

    }
  }

  /** 帳單聯絡人 EMAIL */
  setContactEmail() {
    const id = this.f['billingContactId'].value;
    const item = this.contactDDL.find(element => element.contactId === id);
    this.f['billingContactIdEmail'].setValue(item?.email);
  }

  /** 表單驗證，若有 error 顯示紅框 */
  validateAllFormFields(formGroup: FormGroup) {
    console.log('validateAllFormFields');

    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
        control.updateValueAndValidity();
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });

    this.apiService.updateCheckingStatus(false);

    this.ui.isSalesValid = this.selectedSales.length ? false : true;
  }
}
