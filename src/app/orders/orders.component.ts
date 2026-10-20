import { Component, TemplateRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { InTableConfig } from '@sysage/in-table';
import { Comparator, Filter, Sort } from '../core/models/filter';
import { AlertService } from '../core/services/alert.service';
import { AuthService } from '../core/services/auth.service';
import { PermissionService } from '../core/services/permission.service';
import { Brands, Order, OrderHeader, PageConfig, SaveOrder, OrderSolution, SaveOrderBody, ProductSave } from './orders';
import { OrdersService } from './orders.service';
import moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent {

  /** in-table setting */
  inTableConfig = new InTableConfig;
  /** in-table sub setting */
  subInTableConfig = new InTableConfig;

  /** 設定聯絡人分頁參數 */
  pageConfig = new PageConfig;

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

  constructor(
    private alert: AlertService,
    private orderAPI: OrdersService,
    private permission: PermissionService,
    private authService: AuthService,
    private translate: TranslateService,
    private modalService: BsModalService
  ) {
    /** in-table setting */
    this.inTableConfig.sitckyElemId = 'page-header';
    // this.inTableConfig.enableResizeColWidth = true;
    this.inTableConfig.showBorder = true;
    this.inTableConfig.showAllSubRowOnlyIfMoreThanOne = false;

    /** in-table sub setting */
    this.subInTableConfig.sitckyElemId = 'page-header';
    this.subInTableConfig.enableResizeColWidth = false;
    this.subInTableConfig.showBorder = false;
    this.subInTableConfig.showAllSubRowOnlyIfMoreThanOne = false;
  }

  /** 訂單狀態 */
  orderStatusList: { id: string, itemName: string }[] = [
    {
      // 核准
      id: 'APPROVAL',
      itemName: this.translate.instant('APPROVAL')
    },
    {
      // 審核中
      id: 'REVIEW',
      itemName: this.translate.instant('REVIEW')
    },
    {
      // 退回
      id: 'REJECT',
      itemName: this.translate.instant('REJECT')
    },
    {
      // 草稿
      id: 'DRAFT',
      itemName: this.translate.instant('DRAFT')
    },
    {
      // 失敗
      id: 'FAIL',
      itemName: this.translate.instant('FAIL')
    }
  ];

  // 搜尋表單
  filterForm = new FormGroup({
    sales: new FormControl('',),
    order: new FormControl('',),
    dealer: new FormControl('',),
    endUser: new FormControl('',),
    clounId: new FormControl(''),
  });

  // 連接
  // links: string[] = [];
  // 訂單資料
  orderDatas: Order[] = [];

  /** 合約狀態 */
  contractStatusList: { id: string, itemName: string }[] = [
    /* {
      id: 'DRAFT',
      itemName: this.translate.instant('DRAFT')
    },
    {
      id: 'not purchased',
      itemName: this.translate.instant('not purchased')
    },
    {
      id: 'activated',
      itemName: this.translate.instant('activated')
    },
    {
      id: 'order failed',
      itemName: this.translate.instant('order failed')
    },
    {
      id: 'pause',
      itemName: this.translate.instant('pause')
    },
    {
      id: 'canceling',
      itemName: this.translate.instant('canceling')
    },
    {
      id: 'cancel failed',
      itemName: this.translate.instant('cancel failed')
    },
    {
      id: 'cancel purchase',
      itemName: this.translate.instant('cancel purchase')
    } */
    {
      // 未啟用
      id: 'NOT_ACTIVATED',
      itemName: this.translate.instant('NOT_ACTIVATED')
    },
    {
      // 使用中
      id: 'USING',
      itemName: this.translate.instant('USING')
    },
    {
      // 合約期滿
      id: 'CONTRACT_EXPIRED',
      itemName: this.translate.instant('CONTRACT_EXPIRED')
    },
    {
      // 合約終止
      id: 'CONTRACT_SUSPENSION',
      itemName: this.translate.instant('CONTRACT_SUSPENSION')
    },
    {
      // 作廢
      id: 'VOID',
      itemName: this.translate.instant('VOID')
    },
    /* {
      id: 'POC',
      itemName: this.translate.instant('POC')
    } */
  ];
  // 複製訂單ID
  codyOrderId = '';
  /** 使用者選擇條件 */
  selectStatusList: {
    contract: { id: string, itemName: string }[],
    order: { id: string, itemName: string }[]
  } = {
      contract: [],
      order: []
    };
  /** 下拉選單基礎設定 */
  setting = {
    text: this.translate.instant('please select'),
    selectAllText: this.translate.instant('select all'),
    unSelectAllText: this.translate.instant('unselect all'),
    noDataLabel	: this.translate.instant('No Data Available'),
    filterSelectAllText: this.translate.instant('select all filtered results'),
    filterUnSelectAllText: this.translate.instant('unselect all filtered results'),
    enableSearchFilter: true,
    singleSelection: false,
    badgeShowLimit: 1,
    maxHeight: 250,
    position: 'bottom',
    autoPosition: true,
    classes: 'dropdown-icon dropdown-position'
  };

  /** 日期選擇器範圍資料 */
  pickerRangeDates: (Date | undefined)[] | undefined = [];
  /** 日期選擇器最大日期 */
  maxDate = new Date(moment().add(12, 'M').format('YYYY-MM-DD'));
  /** 日期選擇器最小日期 */
  minDate = new Date(moment().subtract(12, 'M').format('YYYY-MM-DD'));

  // ui狀態
  ui = {
    isLoading: false,
    isCopyOrderStatus: false,
  }

  /** 顯示子項欄位 */
  showSub = [false, false, false, false, false, false, false, false, false, false];

  /** 顯示cloud id名稱 */
  cloudIdName = '';
  // 複製採購單確認畫面
  modalRef?: BsModalRef;


  ngOnInit(): void {
    this.selectStatusList.contract = _.cloneDeep(this.contractStatusList);
    this.selectStatusList.order = _.cloneDeep(this.orderStatusList);
    this.search();
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

  /** 取得訂單列表 */
  getOrderList(filter: Filter) {
    this.orderDatas = [];
    this.ui.isLoading = true;
    this.orderAPI.getOrderList(filter).subscribe({
      next: (res) => {
        console.log('[order] getSolution done', res);
        if (res.info.success && res?.data) {
          // this.links = [];
          // res.data.forEach((dataItem: any) => {
          //   this.links.push(dataItem.orderId);
          // });
          this.orderDatas = res.data;

          // 設定分頁內容
          this.pageConfig.totalItems = res.page ? res.page.dataCount : 0;
          this.pageConfig.itemsPerPage = res.page ? res.page.pageSize : 0;
          this.pageConfig.currentPage = res.page ? res.page.pageIndex : 0;

          this.ui.isLoading = false;
        } else {
          this.ui.isLoading = false;
        }
      },
      error: (err) => {
        console.error('[order]  getSolution fail', err);
        this.alert.errorAlert('[order]  getSolution fail' + err);
        this.ui.isLoading = false;
      },
    });
  }

  /** 搜尋 */
  search() {
    const filter = this.getFilter();
    this.getOrderList(filter);
  }

  /** 重設搜尋選項 */
  filterReset() {
    this.filterForm.patchValue({
      order: '',
      dealer: '',
      endUser: '',
      clounId: '',
      sales: ''
    });
    this.selectStatusList.contract = [];
    this.selectStatusList.order = [];
    this.selectStatusList.contract = _.cloneDeep(this.contractStatusList);
    this.selectStatusList.order = _.cloneDeep(this.orderStatusList);
    this.pickerRangeDates = [];
    this.search();
  }

  /** 設定查詢條件 */
  getFilter() {
    const filter = new Filter;
    if (this.filterForm) {
      // 負責業務
      if (this.filterForm.value.sales) {
        filter.and.push({
          field: 'sales',
          comparator: Comparator.like,
          value: this.filterForm.value.sales,
        });
      }

      // 312編號
      if (this.filterForm.value.order) {
        filter.and.push({
          field: 'orderErpNumber',
          comparator: Comparator.like,
          value: this.filterForm.value.order,
        });
      }

      // 經銷商
      if (this.filterForm.value.dealer) {
        filter.and.push({
          field: 'customer',
          comparator: Comparator.like,
          value: this.filterForm.value.dealer,
        });
      }

      // 最終使用者
      if (this.filterForm.value.endUser) {
        filter.and.push({
          field: 'endUser',
          comparator: Comparator.like,
          value: this.filterForm.value.endUser,
        });
      }

      // Cloud ID
      if (this.filterForm.value.clounId) {
        filter.and.push({
          field: 'orderDetail.cloudId',
          comparator: Comparator.like,
          value: this.filterForm.value.clounId,
        });
      }

      // 合約狀態
      if (this.selectStatusList.contract.length !== 0) {
        const data: string[] = [];
        this.selectStatusList.contract.forEach(item => {
          data.push(item.id);
        })
        filter.and.push({
          field: 'status',
          comparator: Comparator.in,
          value: data,
        });
      }

      // 訂單狀態
      if (this.selectStatusList.order.length !== 0) {
        const data: string[] = [];
        this.selectStatusList.order.forEach(item => {
          data.push(item.id);
        })
        filter.and.push({
          field: 'approvalStatus',
          comparator: Comparator.in,
          value: data,
        });
      }

      // 合約起始日
      if (this.pickerRangeDates && this.pickerRangeDates?.length !== 0) {
        const date = [moment(this.pickerRangeDates[0]).format('YYYY-MM-DD'), moment(this.pickerRangeDates[1]).format('YYYY-MM-DD')];
        filter.and.push({
          field: 'date',
          comparator: Comparator.in,
          value: date,
        });
      }

    }
    filter.sort['updateTime'] = Sort.desc;
    return filter;
  }

  /**
   * 切換分頁時指定執行的函式 (in-table)
   * @param event 由 in-table 回傳的分頁資訊
   */
  pageChange(event: any) {
    if (this.pageConfig) {
      this.ui.isLoading = true;
      const filter = this.getFilter();
      filter.pageSize = event.itemsPerPage;
      filter.pageIndex = event.currentPage;
      this.getOrderList(filter);
    }
  }

  stopListRoute(event: any) {
    event.stopPropagation();
    return false;
  }

  /** 分割/ */
  cutSlash(name: string) {
    return name.split('/')[0];
  }

  /** 單項展開/關閉 */
  showSubToggle(idx: number) {
    this.showSub[idx] = !this.showSub[idx];
  }

  /** 全展開/關閉 */
  showSubToggleAll(e: boolean[]) {
    e.forEach((all, idx) => {
      this.showSub[idx] = all;
    })
  }


  /*---------------- 採購單複製功能----------------------*/

  // 開啟複製採購單視窗
  openModal(template: TemplateRef<any>, orderId: string) {
    this.codyOrderId = orderId;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }
  // 確認複製採購單
  confirm(): void {
    // this.modalRef?.hide();
    // this.getOrder();
    this.copySave();
  }
  // 取消複製採購單
  decline(): void {
    this.modalRef?.hide();
  }

  // 取得訂單列表
  getOrder() {
    this.ui.isCopyOrderStatus = true;

    this.orderAPI.getOrder(this.codyOrderId).subscribe({
      next: (res) => {

        if (res.info.success && res?.data) {
          let orderHeader = res.data.header as OrderHeader;
          let orderSolutionList = res.data.body;
          let copyOrder = new SaveOrder();
          copyOrder.header.billingAddress = orderHeader.billingAddress;
          copyOrder.header.billingContactId = orderHeader.billingContact.id;
          copyOrder.header.customer = orderHeader.customer;
          copyOrder.header.customerAddress = orderHeader.customerAddress;
          copyOrder.header.customerContactId = orderHeader.customerContact.id;
          copyOrder.header.endUser = orderHeader.endUser;
          copyOrder.header.erpCustomerNumber = orderHeader.erpCustomerNumber;
          copyOrder.header.orderErpNumber = orderHeader.orderErpNumber;
          copyOrder.header.partnerId = orderHeader.partnerId ? orderHeader.partnerId: '';
          copyOrder.header.quotationId = orderHeader.quotationId;
          copyOrder.header.salesModel = orderHeader.salesModel;
          copyOrder.header.status = 'DRAFT';

          orderSolutionList.forEach((solutionItem: any) => {
            let saves = new SaveOrderBody();

            saves.originalStatus = solutionItem.originalStatus;
            saves.name = solutionItem.name;
            saves.cloudId = solutionItem.cloudId;
            saves.brandId = solutionItem.brand.id;
            saves.quotationId = solutionItem.quotationId ? solutionItem.quotationId : '';
            saves.payerId = solutionItem.payerId;
            saves.id = '';
            saves.solutionId = solutionItem.solutionId;
            saves.erpNumber = solutionItem.erpNumber;
            saves.contractIds = solutionItem.contractIds;
            saves.startDate = solutionItem.startDate;
            saves.originalInfo = solutionItem.originalInfo;
            saves.solutionData = solutionItem.solutionData;
            saves.endDate = solutionItem.endDate;
            saves.exchangeRateType = solutionItem.exchangeRateType;
            saves.exchangeRate = solutionItem.exchangeRate;
            saves.paymentDate = solutionItem.paymentDate;
            saves.timeInterval = solutionItem.timeInterval;
            saves.salesId = solutionItem.sales.id;
            saves.billingContactEmail = solutionItem.billingContactEmail;
            saves.status = solutionItem.status;
            saves.currencyType = solutionItem.currencyType;
            let products = solutionItem.products as ProductSave[];
            products.forEach((productItem) => {
              productItem.id = '';
              saves.products.push(productItem);
            })
            // saves.products = solutionItem.products;
            saves.deleteProductIds = [];
            saves.tranceNote = [];
            copyOrder.body.push(saves);
          })

          // this.copySave(copyOrder);
          this.ui.isCopyOrderStatus = false;
        } else {
          this.ui.isCopyOrderStatus = false;
          console.error('[order-detail]  getOrder fail');
          this.alert.errorAlert(res.info.message);
          this.modalRef?.hide();
        }
      },
      error: (err) => {

        this.alert.errorAlert('[order-detail]  getOrder fail' + err);
        this.ui.isCopyOrderStatus = false;
        this.modalRef?.hide();
      },
    });
  }



  // copySave(addOrder: SaveOrder) {
  //   this.orderAPI.postOrder(addOrder).subscribe({
  //     next: (res) => {
  //       if (res.info.success && res?.data) {
  //         this.modalRef?.hide();
  //         this.alert.successAlert('複製採購單成功');
  //         location.reload();
  //       } else {
  //         this.alert.errorAlert('[order-detail]  addOrder fail');
  //         this.modalRef?.hide();
  //         this.ui.isCopyOrderStatus = false;
  //       }
  //     },
  //     error: (err) => {

  //       this.modalRef?.hide();
  //       this.alert.errorAlert('[order-detail]  addOrder fail' + err);
  //       this.ui.isCopyOrderStatus = false;
  //     },
  //   });
  // }


  copySave() {
    this.orderAPI.copyOrder(this.codyOrderId).subscribe({
      next: (res) => {
        if (res.info.success && res?.data) {
          // this.modalRef?.hide();
          this.alert.successAlert('複製採購單成功');
          location.reload();
        } else {
          this.alert.errorAlert('[order-detail]  addOrder fail');
          this.modalRef?.hide();
          this.ui.isCopyOrderStatus = false;
        }
      },
      error: (err) => {

        this.modalRef?.hide();
        this.alert.errorAlert('[order-detail]  addOrder fail' + err);
        this.ui.isCopyOrderStatus = false;
      },
    });
  }

}
