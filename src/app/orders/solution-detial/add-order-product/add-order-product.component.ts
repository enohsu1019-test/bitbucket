import { OptionAttribute, PageConfig } from './../../orders';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { InTableConfig } from '@sysage/in-table';
import { CommodityAttributes, FilterAttribute, FilterAttributesList, FilterOptions, OrderHeader, OrderSolution, ProductList } from '../../orders';
import { AlertService } from 'src/app/core/services/alert.service';
import { OrdersService } from '../../orders.service';
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TabDirective } from 'ngx-bootstrap/tabs';
import { Comparator, Filter, Sort } from 'src/app/core/models/filter';
import { DateTime } from "luxon";
import moment from 'moment';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-add-order-product',
  templateUrl: './add-order-product.component.html',
  styleUrls: ['./add-order-product.component.scss']
})
export class AddOrderProductComponent implements OnInit {
  @Input() orderHeader!: OrderHeader;
  @Input() brandId!: string;
  @Input() dealer!: {id: string, name: string};
  @Input() endUserName!: string;
  @Output() addEvent = new EventEmitter;

  /** Boostrap Modal */
  modalRef!: BsModalRef;

  /** 目前的使用者 */
  get currentUserValue() {
    return this.authService.currentUserValue;
  }

  get FilterOptions() {
    return FilterOptions;
  }

  constructor(
    private alert: AlertService,
    private orderAPI: OrdersService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private authService: AuthService,
  ) {
    /** in-table setting */
    this.config.sitckyElemId = 'CRMContact-header';
  }

  isLoading = false;

  /** 產品清單列表 */
  productList: ProductList[] = [];
  /** filter條件列表(原始api資料) */
  filterListOri = new FilterAttributesList;
  /** filter條件列表(條件化) */
  filterList: CommodityAttributes[] = [];
  /** 搜尋報價單號 */
  inputOrder = '';
  /** 輸入filter條件(原始確認完的) */
  filterAttributeOri: FilterAttribute[] = [];
  /** 輸入filter條件(未確認正在編輯) */
  filterAttribute: FilterAttribute[] = [];
  /** 勾選需新增的商品 */
  tick: boolean[] = [];
  /** 全選按鈕 */
  allOrNot = false;

  // 啟用日28天後日期
  luxonMaxDate = DateTime.now();
  maxDate!: Date
  // 啟用日最小日期
  minDate = new Date();

  selectList: {
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
  settings = {
    text: '請選擇',
    selectAllText: '全選',
    unSelectAllText: '全部取消',
    enableSearchFilter: true,
    singleSelection: false,
    badgeShowLimit: 1,
    maxHeight: 250,
    position: 'bottom',
    autoPosition: false,
    classes: 'dropdown-icon dropdown-position',
  };

  /** 目前在哪個tab */
  tabName: string | undefined = this.translate.instant('quotation');

  /** intable設定 */
  config = new InTableConfig();
  /** 設定聯絡人分頁參數 */
  pageConfig = new PageConfig;

  ngOnInit(): void {
    this.maxDate = new Date(this.luxonMaxDate.plus({ days: 28 }).toJSDate());
    // this.search();
    // this.getProductList();
    this.getAttributesList();
  }

  /** 選擇tab */
  onSelect(data: TabDirective): void {
    this.tabName = data.heading;
    if (this.tabName === this.translate.instant('quotation')) {
      this.filterAttribute = [];
    }
    if (this.tabName === this.translate.instant('commodity attributes')) {
      this.inputOrder = '';
      // this.getAttributesList();
    }
  }

  /** 取得商品列表 */
  getProductList() {
    this.isLoading = true;
    this.productList = [];
    this.tick = [];
    this.allOrNot = false;
    const filter = this.getAttributeFilter();
    this.orderAPI.getProductList(filter).subscribe({
      next: (res) => {
        if (res && res.info && res.info.success && res.data) {
          this.productList = res.data;
          this.productList.forEach(item => {
            item.startDate = '';
            item.endDate = '';
          });
          for (let i = 0; i < this.productList.length; i++) {
            this.tick.push(false);
          }

          // 設定分頁內容
          this.pageConfig.totalItems = res.page ? res.page.dataCount : 0;
          this.pageConfig.itemsPerPage = res.page ? res.page.pageSize : 0;
          this.pageConfig.currentPage = res.page ? res.page.pageIndex : 0;
        } else {
          this.alert.errorAlert(res.info.message);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.productList = [];
        this.alert.errorAlert(err);
        this.isLoading = false;
      }
    });
  }

  /** 取得商品屬性filter列表 */
  getAttributesList() {
    // this.isLoading = true;
    this.orderAPI.getProductFilter(this.brandId).subscribe({
      next: (res) => {
        if (res && res.info && res.info.success && res.data) {
          this.filterListOri = res.data;
          this.filterListOri.basic.forEach(item => {
            this.filterList.push(item);
          });
          this.filterListOri.dynamic.forEach(item => {
            this.filterList.push(item);
          });
          this.filterListOri.price.forEach(item => {
            this.filterList.push(item);
          });
        } else {
          this.alert.errorAlert(res.info.message);
        }
        // this.isLoading = false;
      },
      error: (err) => {
        this.filterListOri = new FilterAttributesList;
        this.alert.errorAlert(err);
        // this.isLoading = false;
      }
    });
  }

  /** 搜尋 */
  search() {
    this.getProductList();
  }

  /** 重設 */
  reset() {
    this.inputOrder = '';
    this.filterAttribute = [];
    // this.getProductList();
  }

  /** 全選/取消全選 */
  sellAll() {
    this.allOrNot = !this.allOrNot;
    let data: boolean[] = [];
    this.tick.forEach(item => {
      data.push(this.allOrNot);
    });
    this.tick = data;
  }

  /** 新增搜尋條件 */
  addFilter() {
    const filterData = new FilterAttribute;
    this.filterAttributeOri.push(filterData);
    this.filterAttribute.push(filterData);
  }

  /** 編輯filter */
  editFilter(idx: number) {
    this.filterAttribute.forEach((item, itemIdx) => {
      if (itemIdx !== idx) {
        item.show = false;
        // this.filterClose('cencal', itemIdx);
      }
    });
    if (!this.filterAttribute[idx].show) {
      this.filterAttributeOri[idx] = _.cloneDeep(this.filterAttribute[idx]);
      this.filterAttribute[idx].show = true;
    }
  }

  /** 刪除搜尋條件 */
  delFilter(idx: number) {
    this.filterAttributeOri.splice(idx, 1);
    this.filterAttribute.splice(idx, 1);
  }

  /** 改變filter條件 */
  changeFilter(e: any,idx: number, type: string) {
    if (type === 'filter') {
      this.filterAttribute[idx].name = this.filterList.filter(item => item.internalVariableName === e.target.value).map(item => item.name)[0];
      this.filterAttribute[idx].options = this.filterList.filter(item => item.internalVariableName === e.target.value).map(item => item.options)[0];
      this.filterAttribute[idx].type = this.filterList.filter(item => item.internalVariableName === e.target.value).map(item => item.type)[0];
      // this.filterAttribute[idx].condition = '';
      this.filterAttribute[idx].oprator = '';
      this.selectList.view = [];
      this.selectList.select = [];
      if (this.filterAttribute[idx].type === 'BOOLEAN') {
        this.filterAttribute[idx].value = false;
      } else {
        this.filterAttribute[idx].value = '';
      }
    }
    if (type === 'operator') {
      // 有資料、無資料
      if (this.filterAttribute[idx].oprator === 'isKnown' || this.filterAttribute[idx].oprator === 'isUnknown') {
        // this.filterAttribute[idx].value = [];
        this.filterAttribute[idx].value = [null, "", []];
      }
    }
    // if (type === 'operator') {
    //   this.filterAttribute[idx].condition = '';
    // }
    // if (type === 'condition') {
    //   this.filterAttribute[idx].oprator = '';
    // }
    // this.filterAttribute[idx].value = '';
  }

  /** filter條件關閉 */
  filterClose(type: string, idx: number) {
    if (type === 'cencal') {
      this.filterAttribute[idx] = _.cloneDeep(this.filterAttributeOri[idx]);
    }
    if (type === 'add') {
      // this.filterAttribute = [];
    }
    this.filterAttribute[idx].show = false;
  }

  /** 顯示產品視窗 */
  showTemp(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-width-none',
      ignoreBackdropClick: true
    });
  }

  /** 關閉產品視窗 */
  closeModal(type: string) {
    if (type === 'add') {
      let data: ProductList[] = [];
      this.tick.forEach((tick, idx) => {
        if (tick) {
          data.push(this.productList[idx]);
        }
      });
      // PER_USAGE只能有一項(除了akamai)
      if (this.brandId !== 'a5ce669b-51ba-4698-919f-84b65bf7174e') {
        const noPerUsge = data.filter(item => item.category !== 'PER_USAGE');
        const perUsage = data.filter(item => item.category === 'PER_USAGE');
        if (perUsage.length > 1) {
          data = [];
          noPerUsge.push(perUsage[0]);
          data = _.cloneDeep(noPerUsge);
          this.alert.errorAlert(this.translate.instant('products can only have one per_usage'));
        }
      }
      // 轉換為採購單需要的格式
      data.forEach((item: any) => {
        item.name = item.productName;
        item.originalSkuName = item.originalSku;
        item.leaseModeName = item.leaseMode.name;
        // item.times = item.leaseMode.month;
        item.leaseMode = item.leaseMode.month;
        item.originalCurrency = item.currency;
        item.startDate = moment(item.startDate).format('YYYY-MM-DD');
        item.endDate = moment(item.endDate).format('YYYY-MM-DD');
      });
      this.addEvent.emit(data);
    }
    this.modalRef.hide();
    this.filterAttribute = [];
  }

  /**
   * 隱藏已選擇過的選項
   * @param idx 第幾個條件選項
   * @param opt 列表的選項
   */
  hiddenOption (idx: number, opt: string) {
    let needHide = false;
    this.filterAttribute.forEach((attrItem, attrIdx) => {
      if (attrIdx !== idx && attrItem.internalVariableName === opt) {
        needHide = true;
      }
    })
    return needHide;
  }

  /** 顯示選擇的條件名稱 */
  showFilterName(data: FilterAttribute) {
    let name = '';
    if (data.name === '') {
      name = this.translate.instant('please select');
    } else {
      // filter
      name = this.translate.instant(data.name);
      // oprator
      if (data.oprator !== '') {
        name = name + ' ' + this.translate.instant(data.oprator);
      }
      // value
      if (data.value !== '') {
        // 單選
        if (data.type === 'SINGLE_CHOICE') {
          name = name + ' ' + data.options.filter(item => item.internalVariableName === data.value).map(item => item.name);
        // 多選
        } else if (data.type === 'MULTIPLE_CHOICE') {
          let selectName: string[] = [];
          this.selectList.select.forEach(item => {
            selectName.push(item.itemName);
          })
          name = name + ' ' + selectName.join('、');
        // 密碼
        } else if (data.type === 'PASSWORD') {
          //
        // 日期
        } else if (data.type === 'DATE') {
          if (typeof data.value === 'object' && data.oprator !== 'isKnown' && data.oprator !== 'isUnknown') {
            const objData: Object = data.value;
            name = name + ' ' + moment(objData).format('YYYY-MM-DD');
          }
        } else {
          // 字串
          if (typeof data.value === 'string') {
            name = name + ' ' + this.translate.instant(data.value);
          }
          // 數字
          if (typeof data.value === 'number') {
            name = name + ' ' + this.translate.instant(data.value.toString());
          }
          // 布林
          if (typeof data.value === 'boolean') {
            name = name + ' ' + this.translate.instant(data.value ? 'yes' : 'no');
          }
        }
      }
    }
    return name;
  }

  /**
   * 轉換oprator格式
   * @param data oprator value
   */
  // toOprator(data: string | string[]) {
  //   if (typeof data === 'string') {
  //     return data;
  //   } else {
  //     return data.join('、');
  //   }
  // }

  /**
   * 轉日期格式
   * @param data 選項value
   */
  // toDate(data: string | number | boolean | string[]) {
  //   if (typeof data === 'object') {
  //     return moment(data).format('YYYY-MM-DD');
  //   } else {
  //     return data;
  //   }
  // }

  /**
   * 開啟多選單
   * @param data 選項
   */
  onOpen(data: OptionAttribute[]) {
    this.selectList.view = [];
    // this.selectList.select = [];
    data.forEach(item => {
      const options = {
        id: item.internalVariableName,
        itemName: item.name
      }
      this.selectList.view.push(options);
    });
  }

  /** 關閉多選單 */
  onClose(data: FilterAttribute) {
    let optionValue: string[] = [];
    this.selectList.select.forEach((item, idx) => {
      // if (idx !== 0) {
      //   optionValue = optionValue + ' ';
      // }
      // optionValue = optionValue + item.id;
      optionValue.push(item.id);
    });
    data.value = optionValue;
  }

  /** 組合條件filter */
  getAttributeFilter() {
    const filter = new Filter;
    if (this.orderHeader.customer.id || this.dealer.id) {
      filter.and.push({
        field: 'salesTargets.dealer',
        comparator: Comparator.in,
        value: [ this.dealer.id !== '' ? this.dealer.id : this.orderHeader.customer.id]
      });
    }
    /* if (this.orderHeader.endUser && this.orderHeader.endUser.id) {
      filter.and.push({
        field: 'salesTargets.endUser',
        comparator: Comparator.in,
        value: [this.orderHeader.endUser.id]
      });
    } */
    /* 報價單搜尋：目前無功能
    if (this.inputOrder !== '') {
      filter.and.push({
        field: '',
        comparator: Comparator.equal,
        value: this.inputOrder
      });
    } */
    // if (this.filterAttribute.length > 0) {
      this.filterAttribute.forEach(item => {
        // if (item.oprator !== '') {
        //   filter.and.push({
        //     field: item.internalVariableName,
        //     comparator: Comparator.equal,
        //     value: item.oprator
        //   });
        // }
        let comparator = Comparator.null;
        if (item.oprator !== '') {
          // let comparator = Comparator.in;
          switch (item.oprator) {
            case 'isEqualToAnyOf':
              comparator = Comparator.like;           // 包含
              break;
            case 'isNotEqualToAnyOf':
              comparator = Comparator.notIn;        // 不包含
              break;
            // case 'containsAnyOf':
            //   comparator = Comparator.like;
            //   break;
            case 'isKnown':
              comparator = Comparator.notIn;        // 有資料
              break;
            case 'isUnknown':
              comparator = Comparator.in;           // 無資料
              break;
            case 'isEqualTo':
              comparator = Comparator.equal;        // 等於
              break;
            case 'isNotEqualTo':
              comparator = Comparator.not;          // 不等於
              break;
            case 'isLessThan':
              comparator = Comparator.lesser;       // 小於
              break;
            case 'isLessThanOrEqualTo':
              comparator = Comparator.lesserEqual;  // 小於等於
              break;
            case 'isGreaterThan':
              comparator = Comparator.greater;      // 大於
              break;
            case 'isGreaterThanOrEqualTo':
              comparator = Comparator.greaterEqual; // 大於等於
              break;
            case 'isBefore':
              comparator = Comparator.lesser;  // 早於
              break;
            case 'isAfter':
              comparator = Comparator.greater; // 晚於
              break;
            // case 'isLessThanDayAgo':
            //   comparator = Comparator.between;
            //   break;
            // case 'isLessThanDayFromNow':
            //   comparator = Comparator.between;
            //   break;
            // case 'isMoreThanDayAgo':
            //   comparator = Comparator.lesser;
            //   break;
            // case 'isMoreThanDayFromNow':
            //   comparator = Comparator.greater;
            //   break;
            default:
              comparator = Comparator.null;
              break;
          }
          // 日期
          if (item.internalVariableName === 'startDate' || item.internalVariableName === 'endDate') {
            const objDate: Object = item.value;
            filter.and.push({
              field: item.internalVariableName,
              comparator: comparator,
              value: (item.oprator === 'isKnown' || item.oprator === 'isUnknown') ? item.value : moment(objDate).format('YYYY-MM-DD')
            });
          // 陣列
          } else if (item.oprator === 'isEqualToAnyOf' || item.oprator === 'isNotEqualToAnyOf') {
            if (typeof item.value === 'string') {
              let data: string[] = [];
              data = item.value.split(',');
              filter.and.push({
                field: item.internalVariableName,
                comparator: comparator,
                value: data
              });
            }
          } else {
            filter.and.push({
              field: item.internalVariableName,
              comparator: comparator,
              value: item.value
            });
          }
        } else {
          // 多選
          if(typeof item.value === 'object') {
            filter.and.push({
              field: item.internalVariableName,
              comparator: Comparator.in,
              value: item.value
            });
          // 其他
          } else {
            filter.and.push({
              field: item.internalVariableName,
              comparator: Comparator.equal,
              value: item.value
            });
          }
        }
      });
    // }
    // 檢查filter是否已經有endDate
    /* let haveEndDate = false;
    filter.and.forEach(item => {
      if (item.field === 'endDate') {
        haveEndDate = true;
      }
    });
    if (!haveEndDate) {
      const time = DateTime.now().toFormat('yyyy-LL-dd');
      filter.and.push({
        field: 'endDate',
        comparator: Comparator.greaterEqual,
        value: time,
      });
    } */
    // admin加品牌
    if (this.currentUserValue?.role?.identityType === 'SYSTEM') {
      filter.and.push({
        field: 'brandId',
        comparator: Comparator.equal,
        value: this.brandId,
      });
    }
    filter.sort['modifiedTime'] = Sort.desc;
    return filter;
  }

  /** 切換分頁 */
  pageChange(event: any) {
    if (this.pageConfig) {
      this.isLoading = true;
      this.productList = [];
      this.tick = [];
      const filter = this.getAttributeFilter();
      filter.pageSize = event.itemsPerPage;
      filter.pageIndex = event.currentPage;
      this.orderAPI.getProductList(filter).subscribe({
        next: (res) => {
          if (res && res.info && res.info.success && res.data) {
            this.productList = res.data;
            for (let i = 0; i < this.productList.length; i++) {
              this.tick.push(false);
            }

            // 設定分頁內容
            this.pageConfig.totalItems = res.page ? res.page.dataCount : 0;
            this.pageConfig.itemsPerPage = res.page ? res.page.pageSize : 0;
            this.pageConfig.currentPage = res.page ? res.page.pageIndex : 0;
          } else {
            this.alert.errorAlert(res.info.message);
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.productList = [];
          this.alert.errorAlert(err);
          this.isLoading = false;
        }
      });
    }
  }
}
