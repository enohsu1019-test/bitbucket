import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { InTableConfig, Sort } from '@sysage/in-table';
import { Bill, Brand, BillStatus } from 'src/app/core/models/bills';
import { Comparator, Filter } from 'src/app/core/models/filter';
import { PageConfig } from 'src/app/core/models/page';
import { UtilService } from 'src/app/core/services/util.service';
import { DateTime } from 'luxon';
import { BillsListService } from './bills-list.service';
import { AlertService } from 'src/app/core/services/alert.service';
import * as _ from 'lodash';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-bills-list',
  templateUrl: './bills-list.component.html',
  styleUrls: ['./bills-list.component.scss']
})
export class BillsListComponent implements OnInit {
  // @Input() orderId!: string;
  orderId!: string;

  searchForm!: FormGroup;

  /** 帳單列表 */
  billList: Bill[] = [];

  /** 品牌下拉選單列表 */
  brandList: Brand[] = [];

  /** 狀態 checkbox */
  billStatusTypes: BillStatus[] = [];
  filterBillStatus: string[] = [];

  ui = {
    isSearching: false,
  }

  /** 使用者權限資料 */
  authority: { isSiAdmin: boolean, isSiUser: boolean } = {
    isSiAdmin: false,
    isSiUser: false
  };

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
    prop: 'time',
    dir: Sort.desc,
  };

  // solutions: Solution[] = [];
  // endUsers: EndUser[] = [];
  // links: string[] = [];

  /** 顯示cloud id名稱 */
  cloudIdName = '';

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

  get f() { return this.searchForm.controls }

  constructor(
    public util: UtilService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private translate: TranslateService,
    private alert: AlertService,
    private BillsListService: BillsListService,
    private authService: AuthService,
  ) {

    // initial order status types
    this.billStatusTypes = [];
    for (const key in BillStatus) {
      if (BillStatus[key as keyof typeof BillStatus]) {
        this.billStatusTypes.push(BillStatus[key as keyof typeof BillStatus]);
      }
    }
    // 取得前一個 route 送過來的 state 是否有 billListFilter，用來初始化搜尋條件 (最後一次搜尋條件)
    // const nav = this.router.getCurrentNavigation();
    // this.filter = new Filter();
    // if (nav) {
    //   this.filter = (nav.extras && nav.extras.state && nav.extras.state['billListFilter']) ?
    //     nav.extras.state['billListFilter'] :
    //     // 檢查是否透過 browser 的 back 鍵返回 order list
    //     (nav.trigger === 'popstate' &&
    //       nav.previousNavigation && nav.previousNavigation.extras &&
    //       nav.previousNavigation.extras.state && nav.previousNavigation.extras.state['billListFilter']) ?
    //       nav.previousNavigation.extras.state['billListFilter'] : new Filter();
    // }


    // const orderId = this.router.getCurrentNavigation()?.extras?.state?.['orderId'];

    // this.initForm(this.orderId);
  }

  ngOnInit() {
    // 取得service存的 order id
    this.BillsListService.data.subscribe(data => this.orderId = data);
    this.initForm(this.orderId);
    // 讀取完後清除，不然會影響到原本帳單模組抓list的資料
    this.BillsListService.data.next('');

    // 需要檢查「siBill.xxx.xxx 與 siCustomers.xxx.xxx」權限，所以回傳全部節點權限
    //  this.permissions = this.dataService.getPermissions(
    //   this.dataService.layoutConfig
    // );

    const jsonItemsPerPage = localStorage.getItem('intable-billList-table-page');
    if (jsonItemsPerPage) {
      this.filter.pageSize = JSON.parse(jsonItemsPerPage);
    }

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
    this.init();
  }

  private init() {
    /** in-table setting */
    this.inTableConfig.sitckyElemId = 'page-header';
    this.inTableConfig.enableResizeColWidth = true;
    this.inTableConfig.showBorder = true;
    this.inTableConfig.showAllSubRowOnlyIfMoreThanOne = false;
    this.inTableConfig.rowLinkKey = 'rowLinks';

    /** 取得品牌下拉選單 */
    this.getBrandList();

    /** 取得帳單列表 */
    this.filter = this.getFilter(this.pageConfig.currentPage, this.pageConfig.itemsPerPage);
    this.filter.sort = {};
    this.filter.sort[this.sortBy.prop] = this.sortBy.dir;
    // if (this.authority.isSiAdmin || this.authority.isSiUser) {
    // for (const key in BillStatus) {
    //   if (BillStatus[key as keyof typeof BillStatus] !== 'VOID' && BillStatus[key as keyof typeof BillStatus] !== 'POC') {
    //     this.filterBillStatus.push(BillStatus[key as keyof typeof BillStatus]);
    //   }
    // }
    // this.filter.and.push({
    //   field: 'status',
    //   comparator: Comparator.in,
    //   value: this.filterBillStatus,
    // });
    // }
    this.getBillList(this.filter);
  }

  initForm(orderId?: string) {
    this.searchForm = this.fb.group({
      id: [(orderId && orderId !== '') ? orderId : ''],
      brandId: [''],
      customer: [''],
      startDate: [''],
      endDate: [''],
      clounId: [''],
      orderErpNumber:['']

    });
  }

  /** API: get 帳單 List */
  getBillList(filter: Filter) {
    this.ui.isSearching = true;
    this.searchForm.disable();
    this.billList = [];

    this.BillsListService.getBillList(this.filter).subscribe({
      next: (res) => {
        console.log('[authorization] getBillList done: ', res);
        if (res && res.info && res.info.success) {
          this.billList = res.data.map((item: Bill) => {
            const obj = {
              ...item,
              // rowLinks: (item.approvalStatus !== BillStatus.pending && item.approvalStatus !== BillStatus.reject) ? item.subOrderId : ''
              rowLinks: item.subOrderId + '&' + item.brand
            };
            return obj;
          });

          // this.billList = res.data;
          // 取得 row routerLink
          // this.links = this.billList.map(bill => {
          //   // 只有「非待審核」與「非退回」才能下載帳單
          //   if (bill.status !== BillStatus.pending && bill.status !== BillStatus.reject) {
          //     return bill.id;
          //   } else {
          //     return '';
          //   }
          // });

          // this.getEndUsers();
          this.pageConfig.totalItems = res.page?.dataCount ?? 0;
          this.pageConfig.itemsPerPage = res.page?.pageSize ?? 10;
          this.pageConfig.currentPage = res.page?.pageIndex ?? 1;

          this.ui.isSearching = false;
          this.searchForm.enable();
        }
      },
      error: (err) => {
        this.alert.errorAlert('[authorization] getBillList fail: ' + err);
        console.error('[authorization] getBillList fail: ', err);
        this.ui.isSearching = false;
        this.searchForm.enable();
      },
    });
  }

  /** API: get 品牌 List */
  getBrandList() {
    this.brandList = [];
    // this.solutions = [];

    const filter = this.getFilter(1, -1);
    filter.and.push({
      comparator: Comparator.equal,
      field: 'status',
      value: 'enable'
    });

    this.BillsListService.getBrandList(filter).subscribe({
      next: (res) => {
        console.log('[bills] getBrandList done: ', res);
        if (res && res.info && res.info.success && res.data) {
          this.brandList = res.data;
          // this.brandList.forEach(brand => this.getSolutions(brand.id));
        }
      },
      error: (err) => {
        this.alert.errorAlert('[bills] getBrandList fail: ' + err);
        console.error('[bills] getBrandList fail: ', err);
      }
    });
  }

  /** 查詢 */
  search(f?: Filter) {
    this.pageConfig.currentPage = 1;
    const filter = f ? f : this.getFilter(this.pageConfig.currentPage, this.pageConfig.itemsPerPage);
    this.getBillList(filter);
  }

  /** 清除表單 */
  reset() {
    this.initForm();
    this.filterBillStatus = [];

    this.search();
  }

  /** 設定查詢條件
   * brandId: (comparator ：EQ) 品牌
   * id (comparator ：LIKE) 品牌編號
   * orderErpNumber(comparator: ：LIKE) 312編號
   * solutionId (comparator ：EQ) 方案
   * customer (comparator ：LIKE) 公司 (中文模糊搜尋)
   * status (comparator ：EQ) 訂單狀態
   * startDate(comparator: GTE) 起始日期
   * endDate(comparator: LTE) 結束日期
   */
  getFilter(pageIndex: number, pageSize?: number) {
    const filter = new Filter();

    const setField = (input: string, field: string, comparator: Comparator) => {
      if (this.f[input].value ? this.f[input].value.trim() : '') {
        filter.and.push({
          comparator: comparator,
          field: field,
          value: this.f[input].value.trim()
        });
      }
    }
    setField('id', 'id', Comparator.like);              // 通知單編號
    setField('customer', 'customer', Comparator.like);  // 客戶
    setField('brandId', 'brandId', Comparator.equal);   // 品牌
    setField('orderErpNumber', 'orderErpNumber', Comparator.like);

    // 起始日期 & 結束日期
    if (this.f['startDate'].value) {
      filter.and.push({
        field: 'startDate',
        comparator: Comparator.greaterEqual,
        value: this.getFormatDate(this.f['startDate'].value),
      });
    }
    if (this.f['endDate'].value) {
      filter.and.push({
        field: 'endDate',
        comparator: Comparator.lesserEqual,
        value: this.getFormatDate(this.f['endDate'].value)
      });
    }



    if (this.f['clounId'].value) {
      filter.and.push({
        field: 'orderDetail.cloudId',
        comparator: Comparator.equal,
        value: this.f['clounId'].value
      });
    }
    // 訂單狀態
    if (this.filterBillStatus && this.filterBillStatus.length) {
      filter.and.push({
        field: 'status',
        comparator: Comparator.in,
        value: this.filterBillStatus,
      });
    }

    filter.pageIndex = pageIndex;
    if (pageSize !== undefined) {
      filter.pageSize = pageSize;
    }

    filter.sort = {};
    filter.sort[this.sortBy.prop] = this.sortBy.dir;

    this.filter = filter;

    return filter;
  }

  /** 設定日期格式 */
  getFormatDate(date: Date): string | undefined {
    const parsedDate = DateTime.fromJSDate(new Date(date));
    console.log('parsedData', parsedDate);
    if (parsedDate && parsedDate.isValid) {
      return parsedDate.toFormat('yyyy-MM-dd');
    } else {
      return;
    }
  }

  /** 狀態有無勾選 */
  toggleSelection(status: BillStatus) {
    const idx = this.filterBillStatus.indexOf(status);
    if (idx >= 0) {
      this.filterBillStatus.splice(idx, 1);
    } else {
      this.filterBillStatus.push(status);
    }
  }

  /** 切換分頁時指定執行的函式 (in-table)
   * @param event 由 in-table 回傳的分頁資訊
   */
  pageChange(event: any) {
    localStorage.setItem('intable-billList-table-page', JSON.stringify({
      itemsPerPage: event.itemsPerPage,
    }));
    const filter = this.getFilter(this.pageConfig.currentPage, this.pageConfig.itemsPerPage);
    this.getBillList(filter);
  }

  /** 點擊標題進行排序指定執行的函式 (in-table)
   * @param event 由 in-table 回傳的排序資訊
  */
  sort(event: any) {
    const filter = this.getFilter(this.pageConfig.currentPage, this.pageConfig.itemsPerPage);
    this.getBillList(filter);
  }

  /** 點擊起始/結束日期 */
  checkDate(event: any, name: string) {
    const date = Date.parse(event);
    if (isNaN(date)) {
      (<FormControl>this.searchForm.get(name)).setValue('');
    }
  }

  get sortListBy() {
    return this.util.sortListBy;
  }



  /** 轉中英文 */
  // getNameById(type: string, id: string) {
  //   let data;
  //   if (type === 'brand') {
  //     data = _.find(this.brandList, brand => brand.id === id);
  //     if (data) {
  //       return data.name;
  //     }
  //   } else if (type === 'solution') {
  //     data = _.find(this.solutions, solution => solution.id === id);
  //     if (data) {
  //       return data.name;
  //     }
  //   } else if (type === 'endUser') {
  //     data = _.find(this.endUsers, endUser => endUser.customerId === id);
  //     if (data) {
  //       return (data.names as any)['zh-TW'] || (data.names as any)['en'];
  //     }
  //   }
  //   return '';
  // }


  /** API: get 所有訂單中的最終用戶資料 */
  // getEndUsers() {
  //   // TODO:
  //   // if (!this.permissions['siCustomer.siCusList.endUsers']) {
  //   //   return;
  //   // }

  //   const endUserIds = this.billList.map(bill => bill.endUserId);
  //   const filter = new Filter();
  //   filter.and = [];

  //   filter.and.push({
  //     field: 'customerId',
  //     comparator: Comparator.in,
  //     value: endUserIds,
  //   });
  //   filter.fields = ['customerId', 'names'];

  //   this.BillsListService.getEndUsers(filter).subscribe({
  //     next: (res) => {
  //       console.log('[bills] getEndUsers done: ', res);
  //       if (res.info && res.info.success) {
  //         this.endUsers = res.data;
  //         // this.getCustomers();
  //       }
  //     },
  //     error: (err) => {
  //       console.error('[bills] getEndUsers fail: ', err);
  //     }
  //   });
  // }

  /** API: get 部分訂單的最終用戶沒有找到的對應客戶資訊
   * (比方：si 用戶本身也是最終用戶))，必須透過 customer api 查詢
   */
  // getCustomers() {
  //   // 找出缺少資訊的最終用戶 id
  //   const orderEndUsers = _.uniq(_.filter(this.billList, 'endUserId').map(order => order.endUserId));
  //   const endUsers = this.endUsers.map(user => user.customerId);
  //   const missedEndUsers = _.difference(orderEndUsers, endUsers);

  //   const filter = new Filter();
  //   filter.and.push({
  //     field: 'id',
  //     comparator: Comparator.in,
  //     value: missedEndUsers,
  //   });

  //   this.BillsListService.getCustomers(filter).subscribe({
  //     next: (res) => {
  //       console.log('[bills] getCustomers done: ', res);
  //       if (res && res.info && res.info.success) {
  //         this.endUsers.push(...res.data.map((user: Customer) => {
  //           return {
  //             customerId: user.id,
  //             addresses: user.addresses,
  //             names: user.names,
  //             principal: user.principal,
  //             taxNumber: user.taxNumber,
  //             updateDate: user['updateDate'],
  //           };
  //         }));
  //       }
  //     },
  //     error: (err) => {
  //       console.error('[bills] getCustomers fail: ', err);
  //     }
  //   });
  // }

  /** API: get 方案下拉資訊 */
  // getSolutions(brandId: string) {
  //   this.BillsListService.getSolutions(brandId).subscribe({
  //     next: (res) => {
  //       console.log('[bills] getSolutions done: ', res);
  //       if (res && res.info && res.info.success) {
  //         this.solutions = this.solutions.concat(res.data);
  //       }
  //     },
  //     error: (err) => {
  //       console.error('[bills] getSolutions fail: ', err);
  //     }
  //   });
  // }
}
