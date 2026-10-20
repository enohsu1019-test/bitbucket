import { Component, ElementRef, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TabDirective } from 'ngx-bootstrap/tabs';
import { Customer, Contact, Industry, LocationCompany, LocationInfo, PageConfig, Company, Job, CRMContact, UploadFile, Partner } from '../customers';
import { CustomersService } from '../customers.service';
import { AlertService } from '../../core/services/alert.service';
import { BehaviorSubject, catchError, map, mergeMap, Observable, switchMap } from 'rxjs';
import { isBs3 } from 'ngx-bootstrap/utils';
import { Comparator, Filter, Sort } from 'src/app/core/models/filter';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ViewChild } from '@angular/core';
import { PermissionService } from 'src/app/core/services/permission.service';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { InTableConfig } from '@sysage/in-table';
import { AuthService } from 'src/app/core/services/auth.service';

export class TriggerImageValue {
  customerId: string = '';
  uploadId: string = '';
}

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent  {

  /** 說明圖檔 */
  @ViewChild('info') info!: ElementRef;
  /** logo圖檔 */
  @ViewChild('logo') logo!: ElementRef;

  /** 預覽上傳圖 */
  private srcTriggerImageValue: TriggerImageValue = new TriggerImageValue();
  private infoimageTriggerSrc$ = new BehaviorSubject(this.srcTriggerImageValue);
  private logoimageTriggerSrc$ = new BehaviorSubject(this.srcTriggerImageValue);
  /** info預覽圖 */
  infoImgDataUrl$ = this.infoimageTriggerSrc$.pipe(
    switchMap(triggerImageValue => {
      return this.customersService.previewUploadFile(triggerImageValue.customerId , triggerImageValue.uploadId);
    })
  );
  /** logo預覽圖 */
  logoImgDataUrl$ = this.logoimageTriggerSrc$.pipe(
    switchMap(triggerImageValue => {
      return this.customersService.previewUploadFile(triggerImageValue.customerId , triggerImageValue.uploadId);
    })
  );

  /** 目前的使用者 */
  get currentUserValue() {
    return this.authService.currentUserValue;
  }

  /** 登入角色資訊 */
  get loginRole() {
    return {
      // 品牌
      brand: this.currentUserValue?.role ? this.currentUserValue?.role.brand?.name : '',
      // 公司
      company: this.currentUserValue?.role ? this.currentUserValue?.role.company.nickCh : '',
    }
  }

  /** intable設定檔 */
  inTableConfig = {
    default: new InTableConfig,
    contact: new InTableConfig
  }

  /** 設定聯絡人分頁參數 */
  pageConfig = {
    contact: new PageConfig,
    addContact: new PageConfig
  }

  /** 查詢(顯示列表) */
  /** 中文全名 */
  searchFullCh: Observable<any>;
  /** 中文簡稱 */
  searchNickCh: Observable<any>;
  /** 英文全名 */
  searchFullEn: Observable<any>;
  /** 英文簡稱 */
  searchNickEn: Observable<any>;
  /** 統一編號 */
  searchSerialNumber: Observable<any>;

  constructor( private translate: TranslateService,
               private route: ActivatedRoute,
               private router: Router,
               private customersService: CustomersService,
               private alert: AlertService,
               private modalService: BsModalService,
               private permissions: PermissionService,
               private authService: AuthService,) {

    /** 中文全名查詢 */
    this.searchFullCh = (new Observable<any>((observer: any) => {
      // Runs on every search
      observer.next(this.inputSearch.fullCh);
    })).pipe(
      mergeMap((token: string) => {
        if (token.length < 2) {
          return this.companys = [];
        } else {
          const filter = this.getFilter(token , 'fullCh');
          return this.customersService.getCompanyList(filter).pipe(
            map((res: any) => {
              if (res && res.data) {
                this.companys = res.data;
                this.companys = this.companys.filter(company => company.customerId);
              }
              return this.companys;
            }),
            catchError(err => {
              this.alert.errorAlert(err);
              this.loading = false;
              return [];
            })
          );
        }
      }),
    );

    /** 中文簡稱查詢 */
    this.searchNickCh = (new Observable<any>((observer: any) => {
      // Runs on every search
      observer.next(this.inputSearch.nickCh);
    })).pipe(
      mergeMap((token: string) => {
        if (token.length < 2) {
          return this.companys = [];
        } else {
          const filter = this.getFilter(token , 'nickCh');
          return this.customersService.getCompanyList(filter).pipe(
            map((res: any) => {
              if (res && res.data) {
                this.companys = res.data;
                this.companys = this.companys.filter(company => company.customerId);
              }
              return this.companys;
            }),
            catchError(err => {
              this.alert.errorAlert(err);
              this.loading = false;
              return [];
            }),
          );
        }
      }),
    );

    /** 英文全名查詢 */
    this.searchFullEn = (new Observable<any>((observer: any) => {
      // Runs on every search
      observer.next(this.inputSearch.fullEn);
    })).pipe(
      mergeMap((token: string) => {
        if (token.length < 2) {
          return this.companys = [];
        } else {
          const filter = this.getFilter(token , 'fullEn');
          return this.customersService.getCompanyList(filter).pipe(
            map((res: any) => {
              if (res && res.data) {
                this.companys = res.data;
                this.companys = this.companys.filter(company => company.customerId);
              }
              return this.companys;
            }),
            catchError(err => {
              this.alert.errorAlert(err);
              this.loading = false;
              return [];
            }),
          );
        }
      }),
    );

    /** 英文簡稱查詢 */
    this.searchNickEn = (new Observable<any>((observer: any) => {
      // Runs on every search
      observer.next(this.inputSearch.nickEn);
    })).pipe(
      mergeMap((token: string) => {
        if (token.length < 2) {
          return this.companys = [];
        } else {
          const filter = this.getFilter(token , 'nickEn');
          return this.customersService.getCompanyList(filter).pipe(
            map((res: any) => {
              if (res && res.data) {
                this.companys = res.data;
                this.companys = this.companys.filter(company => company.customerId);
              }
              return this.companys;
            }),
            catchError(err => {
              this.alert.errorAlert(err);
              this.loading = false;
              return [];
            }),
          );
        }
      }),
    );

    /** 統一編號查詢 */
    this.searchSerialNumber = (new Observable<any>((observer: any) => {
      // Runs on every search
      observer.next(this.inputSearch.serial);
    })).pipe(
      mergeMap((token: string) => {
        if (token.length < 2) {
          return this.companys = [];
        } else {
          const filter = this.getFilter(token , 'serialNumber');
          return this.customersService.getCompanyList(filter).pipe(
            map((res: any) => {
              if (res && res.data) {
                this.companys = res.data;
                this.companys = this.companys.filter(company => company.customerId);
              }
              return this.companys;
            }),
            catchError(err => {
              this.alert.errorAlert(err);
              this.loading = false;
              return [];
            }),
          );
        }
      }),
    );

    /** in-table setting default */
    this.inTableConfig.default.sitckyElemId = 'page-header';
    /** in-table setting contact */
    this.inTableConfig.contact.sitckyElemId = 'CRMContact-header';

    /** BsModal設定 */
    this.modalService.config.class = 'modal-xl';

  }

  /** 上傳檔案類型 */
  readonly dataFileAccepts = '.png, .gif';

  /** loading:查詢 */
  loading = false;
  /** loading:聯絡人資料載入 */
  contactLoading = false;
  /** loading:新增跳窗 */
  addContactLoading = false;
  /** loading:partner */
  partnerLoading = false;
  /** 新增模式 */
  add = false;
  /** 查詢 */
  inputSearch = {
    fullCh: '',
    nickCh: '',
    fullEn: '',
    nickEn: '',
    serial: '',
    contact: ''
  }
  /** 公司列表 */
  companys: Company[] = [];
  /** 地址電話列表 */
  locationCompany: LocationCompany[] = [];
  /** 客戶列表 */
  customer = new Customer;
  /** 產業別列表 */
  industryList: Industry[] = [];
  /** 身份別列表 */
  identityList = '';
  /** 聯絡人列表 */
  contactList: Contact[] = [];
  /** CRM聯絡人列表 */
  CRMContactList: CRMContact[] = [];
  /** 聯絡人種類 */
  jobType: Job[] = [];
  /** 需要刪除的聯絡人id */
  delContactId = '';
  /** 客戶資料不完整 */
  customerIncomplete = false;
  /** partner列表 */
  partnerList: Partner[] = [];

  /** 選擇上傳檔案 */
  upFile: {info: any, logo: any} = {
    info: '',
    logo: ''
  };

  /** 已上傳檔案 */
  showUpFile: {info: UploadFile[], logo: UploadFile[]} = {
    info: [],
    logo: []
  }

  /** 顯示上傳圖片 */
  toggleUploadFile = {
    /** 開關 */
    info: false,
    /** 是否已讀取過 */
    infoLoadReady: false,
    /** 開關 */
    logo: false,
    /** 是否已讀取過 */
    logoLoadReady: false,
  }

  /** 顯示cloud id名稱 */
  cloudIdName = '';

  /** 目前在哪個tab */
  tabName = this.translate.instant('address phone');

  filterForm = new FormGroup({
    fullCh: new FormControl(''),
    nickCh: new FormControl(''),
    fullEn: new FormControl(''),
    nickEn: new FormControl(''),
    status: new FormControl(''),
    serialNo: new FormControl(''),
    industry: new FormControl('')
  });

  /** BsModal */
  modalRef!: BsModalRef;

  /** typeahead dropdown-menu */
  isBs3 = isBs3();

  ngOnInit(): void {

    /** 抓route傳來的customerId */
    if (this.route.snapshot.params['customerId'] && this.route.snapshot.params['customerId'] !== undefined) {
      // 新增狀態
      if (this.route.snapshot.params['customerId'] === 'add') {
        // 有無新增權限
        if (this.permissions.flat['customer-v1.addCustomer']) {
          this.add = true;
        } else {
          this.router.navigate(['main/customers'] , { state: {route: {internal: true}}});
        }
      // 查詢細節狀態
      } else {
        this.getCustomer(this.route.snapshot.params['customerId']);
      }
    } else {
      this.router.navigate(['main/customers'] , { state: {route: {internal: true}}});
    }

    /** 產業別列表 */
    this.customersService.getIndustryList().subscribe({
      next: (res: any) => {
        if (res.info && res.info.success) {
          this.industryList = res.data !== null ? res.data : [];
          this.industryList.sort(function (a, b) {
            if (a.order && b.order) {
              return a.order - b.order;
            } else {
              return 0;
            }
          });
        }
      },
      error: (err: any) => {
        this.industryList = [];
        this.alert.errorAlert(err);
      }
    });

    /** 聯絡人類別列表 */
    this.customersService.getJobList().subscribe({
      next: (res: any) => {
        if (res.info && res.info.success) {
          this.jobType = res.data !== null ? res.data : [];
        }
      },
      error: (err: any) => {
        this.jobType = [];
        this.alert.errorAlert(err);
      }
    });

    // cloud id顯示名稱
    switch (this.loginRole.brand) {
      case 'AWS':
        this.cloudIdName = 'Account ID';
        break;
      case 'Microsoft':
        this.cloudIdName = this.translate.instant('domain');
        break;
      default:
        this.cloudIdName = 'Cloud ID';
        break;
    }

  }

  /**
   * 取得公司資料
   * @param id 公司ID
   */
  getCustomer(id: string) {
    this.loading = true;
    // 讀取api
    this.customersService.getCustomer(id).subscribe({
      next: (res: any) => {
        if (res.info && res.info.success) {
          this.customer = res.data !== null ? res.data : [];
          // 載入身份別
          this.loadIdentity();
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.identityList = '';
        this.customer = new Customer;
        this.alert.errorAlert(err);
      }
    });

  }

  /**
   * 選取公司後取得聯絡資訊列表
   * @param customer 公司資料
   */
   getContact(customer: Company) {
    this.customersService.getLocationCompanyList(customer.customerId).subscribe({
      next:(res: any) => {
        if (res.info && res.info.success) {
          this.locationCompany = res.data !== null ? res.data : [];
          let arc = new LocationCompany;  // 公司資料
          let num = 0;  // 第幾筆
          // let count = false;  // 是否超過一筆
          this.locationCompany.forEach((company , idx) => {
            // 判斷總公司在第幾筆
            if (company.isCorporate) {
              arc = company;
              num = idx;
              // count = true;
            }
            // 若資料為自動匯入，將中文名稱帶入
            if (company.modifiedUser === 'admin') {
              company.modifiedUserName = '系統匯入';
            }
          });
          // 將總公司移至第一筆
          if (num !== 0 ) {
            this.locationCompany.splice(num , 1);
            this.locationCompany.unshift(arc);
          }
          this.insertData(customer);
        }
      },
      error: (err: any) => {
        this.locationCompany = [];
        this.alert.errorAlert(err);
      }
    });
  }

  // 載入身份別
  loadIdentity() {
    if (this.customer.identityType && this.customer.identityType.length > 0) {
      this.identityList = '';
      this.customer.identityType.forEach(item => {
      if (this.identityList !== '') {
        this.identityList = this.identityList + ',';
      }
      this.identityList = this.identityList + this.translate.instant(item.toLowerCase());
      });
    }
  }

  /**
   * 搜尋完後選擇公司
   * @param customer 公司資料
   */
   selectCustomer(e: TypeaheadMatch) {
     const data: Company = e.item;
    // 查詢地址電話
    this.getContact(data);
  }

  /** 寫入資料 */
  insertData(customer: Company) {
    // 檢查資料是否完整
    if (customer.name.fullCh === undefined || customer.name.fullCh === '' ||
        customer.name.fullEn === undefined || customer.name.fullEn === '' ||
        customer.name.nickCh === undefined || customer.name.nickCh === '' ||
        customer.name.nickEn === undefined || customer.name.nickEn === '' ||
        customer.identityType === undefined || customer.identityType.length === 0 ||
        customer.industryClass === undefined || customer.industryClass === '') {
      this.customerIncomplete = true;
    }
    // 載入資料
    this.customer.customerId = customer.customerId;
    this.customer.customerName = customer.name;
    this.customer.identityType = customer.identityType;
    this.customer.industryType = customer.industryClass;
    this.locationCompany.forEach(location => {
      const inputInfo = new LocationInfo;
      inputInfo.address = location.address;
      inputInfo.faxNo = location.faxNo;
      inputInfo.modifiedUser = location.modifiedUser;
      inputInfo.modifiedUserName = location.modifiedUserName;
      inputInfo.name = location.name;
      inputInfo.status = location.status;
      inputInfo.telNo = location.telNo;
      inputInfo.locationId = location.locationId;
      this.customer.location.push(inputInfo);
    });
    this.customer.serialNumber = customer.serialNumber;
    this.customer.status = customer.status;
    // 載入身份別
    this.loadIdentity();
  }

  /** 新增客戶 */
  addCustomer(customer: Customer) {
    this.loading = true;
    // 客戶資料
    const data = {
      crmCustomerId: customer.customerId,
      customerName: customer.customerName,
      location: customer.location,
      serialNumber: customer.serialNumber,
      identityType: customer.identityType,
      industryType: customer.industryType
    }
    this.customersService.addCustomer(data).subscribe({
      next: (res: any) => {
        if (res.info && res.info.success) {
          this.add = false;
          this.alert.successAlert(this.translate.instant('create successfully'));
          this.router.navigate(['../' + res.data.customerId] , { relativeTo: this.route, state: { route: { internal: true }}});
          // 更新完後刷新頁面
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
        if (res.info && !res.info.success) {
          this.alert.errorAlert(res.info.exception.message);
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.alert.errorAlert(err);
      }
    });
  }

  /**
   * 同步客戶資料
   * @param customer 客戶資料
   */
  syncCustomer(customer: Customer) {
    this.loading = true;
    this.customersService.syncCustomer(customer.customerId).subscribe({
      next: (res: any) => {
        if (res.info && res.info.success) {
          this.alert.successAlert(res.info.message);
          this.getCustomer(customer.customerId);
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.identityList = '';
        this.customer = new Customer;
        this.alert.errorAlert(err);
      }
    });
  }

  /** 取得聯絡人列表 */
  getContactList() {
    this.contactLoading = true;
    const filter = new Filter;
    this.customersService.getContactList(this.customer.customerId, filter).subscribe({
      next: (res: any) => {
        if (res.info && res.info.success) {
          this.contactList = res.data !== null ? res.data : [];

          // 設定分頁內容
          this.pageConfig.contact.totalItems = res.page ? res.page.dataCount : 0;
          this.pageConfig.contact.itemsPerPage = res.page ? res.page.pageSize : 0;
          this.pageConfig.contact.currentPage = res.page ? res.page.pageIndex : 0;
        }
        this.contactLoading = false;
      },
      error: (err: any) => {
        this.contactLoading = false;
        this.contactList = [];
        this.alert.errorAlert(err);
      }
    });
  }

  /**
   * 新增聯絡人(單筆)
   * @param contact 聯絡人資料
   */
  addContact(contact: any) {
    this.modalService.hide();
    // 聯絡人資料
    let mobile = '';
    let email = '';
    let phone = {
      etc: '',
      number: ''
    };
    contact.communications.forEach((item: any) => {
      if (item.type === 'CELL_PHONE') {
        mobile = item.value.number;
      }
      if (item.type === 'EMAIL') {
        email = item.value.mail;
      }
      if (item.type === 'TELEPHONE') {
        phone.etc = item.value.ext;
        phone.number = item.value.number;
      }
    });
    const data = {
      crmContactId: contact.contactId,
      chineseName: contact.chineseName,
      englishName: contact.englishName,
      mobile: mobile,
      email: email,
      status: 1,
      type: contact.company[0].type,
      phone: phone,
      createUser: contact.createdUser
    }
    this.customersService.addContact(data, this.customer).subscribe({
      next: (res: any) => {
        if (res.info && res.info.success) {
          this.alert.successAlert(this.translate.instant('create successfully'));
          this.getContactList();
        }
        if (res.info && !res.info.success) {
          this.alert.errorAlert(res.info.message);
        }
        this.contactLoading = false;
      },
      error: (err: any) => {
        this.contactLoading = false;
        this.alert.errorAlert(err);
      }
    });
  }

  /** 刪除聯絡人 */
  delContact() {
    this.modalService.hide();
    this.contactLoading = true;
    this.contactList = [];
    this.customersService.delContact(this.customer.customerId, this.delContactId).subscribe({
      next: (res: any) => {
        if (res.info && res.info.success) {
          this.getContactList();
        }
        this.contactLoading = false;
      },
      error: (err: any) => {
        this.contactLoading = false;
        this.alert.errorAlert(err);
      }
    });
  }

  /** 跳轉至crm */
  gotoCRM() {
    return 'https://www-pp.sysage.com.tw/main/company/' + this.customer.customerId;
  }

  /** 選擇tab */
  onSelect(data: TabDirective): void {
    this.tabName = data.heading;
    // 聯絡人
    if (data.heading === this.translate.instant('contact')) {
      if (!this.add && this.contactList.length === 0 && this.customer.customerId) {
        this.getContactList();
      }
    }
    // 出帳
    if (data.heading === this.translate.instant('billing information')) {
      this.getUpPicture('info');
      this.getUpPicture('logo');
    }

    // Partner ID
    if (data.heading === this.translate.instant('partnerId')) {
      if (!this.add && this.partnerList.length === 0 && this.customer.customerId) {
        this.getPartnerId();
      }
    }
  }

  /**
   * 產業別轉字串
   * @param id 產業別代號
   */
  industryToString(id: string) {
    let nameStr = '';
    this.industryList.forEach(name => {
      if (name.id === id) {
        nameStr = name.name;
      }
    })
    return nameStr;
  }

  /**
   * 職務轉字串
   * @param id 職務代號
   * @returns
   */
  jobToString(id: string) {
    let nameStr = '';
    this.jobType.forEach(name => {
      if (name.id === id) {
        nameStr = name.name;
      }
    })
    return nameStr;
  }

  /** 聯絡人列表切換分頁 */
  pageChange(event: any, witch: string) {
    const filter = new Filter;
    filter.pageSize = event.itemsPerPage;
    filter.pageIndex = event.currentPage;
    // 聯絡人列表
    if (witch === 'contact') {
      this.contactLoading = true;
      this.customersService.getContactList(this.customer.customerId, filter).subscribe({
        next: (res: any) => {
          if (res.info && res.info.success) {
            this.contactList = res.data !== null ? res.data : [];

            // 設定分頁內容
            this.pageConfig.contact.totalItems = res.page ? res.page.dataCount : 0;
            this.pageConfig.contact.itemsPerPage = res.page ? res.page.pageSize : 0;
            this.pageConfig.contact.currentPage = res.page ? res.page.pageIndex : 0;
          }
          this.contactLoading = false;
        },
        error: (err: any) => {
          this.contactLoading = false;
          this.contactList = [];
          this.alert.errorAlert(err);
        }
      });
    // 新增聯絡人
    } else {
      this.addContactLoading = true;
      filter.and.push({
        field: "chineseName",
        comparator: Comparator.like,
        value: this.inputSearch.contact
      });
      filter.and.push({
        field: "status",
        comparator: Comparator.equal,
        value: "ACTIVE"
      });
      filter.and.push({
        field: "company.customerId",
        comparator: Comparator.equal,
        value: this.customer.crmCustomerId
      });
      this.CRMContactList = [];
      this.customersService.getCRMContactList(this.customer.customerId, filter).subscribe({
        next: (res: any) => {
          if (res.info && res.info.success) {
            this.CRMContactList = res.data !== null ? res.data : [];

            // 設定分頁內容
            this.pageConfig.addContact.totalItems = res.page ? res.page.dataCount : 0;
            this.pageConfig.addContact.itemsPerPage = res.page ? res.page.pageSize : 0;
            this.pageConfig.addContact.currentPage = res.page ? res.page.pageIndex : 0;
          }
          this.addContactLoading = false;
        },
        error: (err: any) => {
          this.addContactLoading = false;
          this.alert.errorAlert(err);
        }
      });
    }
  }

  /** partner列表切換分頁 */
  /* partnerPageChange(event: any) {
    const filter = new Filter;
    filter.pageSize = event.itemsPerPage;
    filter.pageIndex = event.currentPage;
    this.partnerLoading = true;
    this.partnerList = [];
    this.customersService.getPartnerId(this.customer.customerId, filter).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.partnerList = res.data !== null ? res.data : [];

        // 設定分頁內容
        this.pageConfig.totalItems = res.page ? res.page.dataCount : 0;
        this.pageConfig.itemsPerPage = res.page ? res.page.pageSize : 0;
        this.pageConfig.currentPage = res.page ? res.page.pageIndex : 0;
      }
      this.partnerLoading = false;
    }, (err: any) => {
      this.partnerLoading = false;
      this.partnerList = [];
      this.alert.errorAlert(err);
    });
  } */

  /**
   * 資料查詢中
   * @param e 是否在查詢中
   */
  typeaheadLoading(e: boolean): void {
    this.loading = e;
  }

  /**
   * 新增聯絡人跳窗
   * @param template 跳窗template
   */
  openContactModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
    this.searchCRMContact();
  }

  /**
   * 確認刪除跳窗
   * @param template 跳窗template
   * @param id 聯絡人id
   */
  openCheckModal(template: TemplateRef<any>, id: string) {
    this.delContactId = id;
    this.modalRef = this.modalService.show(template);
  }

  /** 搜尋crm聯絡人列表 */
  searchCRMContact() {
    this.addContactLoading = true;
    const filter = new Filter;
    filter.and.push({
      field: "chineseName",
      comparator: Comparator.like,
      value: this.inputSearch.contact
    });
    filter.and.push({
      field: "status",
      comparator: Comparator.equal,
      value: "ACTIVE"
    });
    filter.and.push({
      field: "company.customerId",
      comparator: Comparator.equal,
      value: this.customer.crmCustomerId
    });
    this.CRMContactList = [];
    this.customersService.getCRMContactList(this.customer.customerId, filter).subscribe({
      next: (res: any) => {
        if (res.info && res.info.success) {
          this.CRMContactList = res.data !== null ? res.data : [];

          // 設定分頁內容
          this.pageConfig.addContact.totalItems = res.page ? res.page.dataCount : 0;
          this.pageConfig.addContact.itemsPerPage = res.page ? res.page.pageSize : 0;
          this.pageConfig.addContact.currentPage = res.page ? res.page.pageIndex : 0;
        }
        this.addContactLoading = false;
      },
      error: (err: any) => {
        this.addContactLoading = false;
        this.alert.errorAlert(err);
      }
    });
  }

  /**
   * 取得上傳檔案
   * @param witch info or logo
   */
  getUpPicture(witch: string) {
    this.loading = true;
    this.customersService.getUploadFile(this.customer.customerId, witch).subscribe({
      next: (res: any) => {
        if (res.info && res.info.success) {
          if (witch === 'info') {
            this.showUpFile.info = res.data !== null ? res.data : [];
            // ====api會殘留，先以此方式觀察，之後如果沒問題了可以刪除====
            this.showUpFile.info = this.showUpFile.info.filter(x => Array.from(x.filename)[0] !== '.');
            // ===================================================
            this.toggleUploadFile.info = false;
            this.toggleUploadFile.infoLoadReady = false;
          }
          if (witch === 'logo') {
            this.showUpFile.logo = res.data !== null ? res.data : [];
            // ====api會殘留，先以此方式觀察，之後如果沒問題了可以刪除====
            this.showUpFile.logo = this.showUpFile.logo.filter(x => Array.from(x.filename)[0] !== '.');
            // ===================================================
            this.toggleUploadFile.logo = false;
            this.toggleUploadFile.logoLoadReady = false
          }
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.alert.errorAlert(err);
      }
    });
  }

  /**
   * 選擇上傳檔案
   * @param witch info or logo
   * @param e 選擇檔案 event
   */
  selectPicture(witch: string, e: any) {
    if (e.target.files.length !== 0) {
      if (witch === 'info') {
        let img = new Image();
        img.src = URL.createObjectURL(e.target.files[0]);
        img.onload = () => {
          if (img.width !== 1100 || img.height !== 90) {
            this.alert.errorAlert(this.translate.instant('info size wrong'));
            this.info.nativeElement.value = '';
          } else {
            this.upFile.info = e.target.files[0];
          }
        }
      }

      if (witch === 'logo') {
        let img = new Image();
        img.src = URL.createObjectURL(e.target.files[0]);
        img.onload = () => {
          if (img.width !== 1100 || img.height !== 160) {
            this.alert.errorAlert(this.translate.instant('logo size wrong'));
            this.logo.nativeElement.value = '';
          } else {
            this.upFile.logo = e.target.files[0];
          }
        }
      }
    }
  }

  /**
   * 上傳圖檔
   * @param witch info or logo
   */
  upPicture(witch: string) {
    this.loading = true;
    // 檢查是否已有上傳過圖檔
    const data = witch === 'info' ? this.showUpFile.info : this.showUpFile.logo;
    if (data && data.length !== 0) {
      this.customersService.delUploadFile(this.customer.customerId, data[0].id).subscribe({
        next: (res: any) => {
          if (res.info && res.info.success) {
            //
          }
        },
        error: (err: any) => {
          this.alert.errorAlert(err);
        }
      });
    }
    const upFile = witch === 'info' ? this.upFile.info : this.upFile.logo;
    this.customersService.uploadFile(this.customer.customerId, upFile, witch).subscribe({
      next: (res: any) => {
        if (res.info && res.info.success) {
          this.alert.successAlert(this.translate.instant('upload success'));
          if (witch === 'info') {
            this.upFile.info = '';
            this.info.nativeElement.value = '';
          }
          if (witch === 'logo') {
            this.upFile.logo = '';
            this.logo.nativeElement.value = '';
          }
          this.getUpPicture(witch);
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.alert.errorAlert(err);
      }
    });
  }

  /**
   * 刪除圖檔
   * @param witch info or logo
   */
  delFile(witch: string) {
    this.loading = true;
    const data = witch === 'info' ? this.showUpFile.info[0] : this.showUpFile.logo[0];
    this.customersService.delUploadFile(this.customer.customerId, data.id).subscribe({
      next: (res: any) => {
        if (res.info && res.info.success) {
          this.getUpPicture(witch);
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.alert.errorAlert(err);
      }
    });
  }

  /**
   * 清除上傳檔案
   * @param witch info or logo
   */
   cancleFile(witch: string) {
    if (witch === 'info') {
      this.upFile.info = '';
      this.info.nativeElement.value = "";
    }
    if (witch === 'logo') {
      this.upFile.logo = '';
      this.logo.nativeElement.value = "";
    }
  }

  /**
   * 顯示上傳圖片
   * @param witch info or logo
   */
  previewUpload(witch: string) {
    const data = witch === 'info' ? this.showUpFile.info[0] : this.showUpFile.logo[0];
    this.srcTriggerImageValue.customerId = this.customer.customerId;
    this.srcTriggerImageValue.uploadId = data.id;
    // this.infoimageTriggerSrc$.next(this.srcTriggerImageValue);
    if (witch === 'info') {
      if (!this.toggleUploadFile.info && !this.toggleUploadFile.infoLoadReady) {
        this.infoimageTriggerSrc$.next(this.srcTriggerImageValue);
        this.toggleUploadFile.infoLoadReady = true;
      }
      this.toggleUploadFile.info = !this.toggleUploadFile.info;
    }
    if (witch === 'logo') {
      if (!this.toggleUploadFile.logo && !this.toggleUploadFile.logoLoadReady) {
        this.logoimageTriggerSrc$.next(this.srcTriggerImageValue);
        this.toggleUploadFile.logoLoadReady = true;
      }
      this.toggleUploadFile.logo = !this.toggleUploadFile.logo;
    }
  }

  /** 取得partner id */
  getPartnerId() {
    this.partnerLoading = true;
    const filter = new Filter;
    this.customersService.getPartnerId(this.customer.customerId, filter).subscribe({
      next: (res: any) => {
        if (res.info && res.info.success) {
          this.partnerList = res.data !== null ? res.data : [];
        }
        this.partnerLoading = false;
      },
      error: (err: any) => {
        this.partnerList = [];
        this.partnerLoading = false;
        this.alert.errorAlert(err);
      }
    });
  }

  /** 取消跳窗 */
  hidemodal() {
    this.modalService.hide();
  }

  /**
   * 查詢條件
   * @param searchName 輸入查詢內容
   * @param typeName 欄位
   */
   getFilter(searchName: string , typeName: string) {
    const filter = new Filter();
    if (typeName !== 'null') {
      if (typeName === 'fullCh' || typeName === 'nickCh' || typeName === 'fullEn' || typeName === 'nickEn') {
        typeName = 'name.' + typeName;
      }
      filter.and.push({
        field: typeName,
        comparator: Comparator.like,
        value: searchName
      });
    }
    if (typeName === 'null') {
      filter.and = [];
    }
    filter.and.push({
      field: 'status',
      comparator: Comparator.equal,
      value: 'ACTIVE'
    });
    filter.pageIndex = 1;
    filter.pageSize = 1000;
    filter.sort = {
      status: Sort.asc,
      modifiedTime: Sort.asc
    };
    return filter;
  }

}
