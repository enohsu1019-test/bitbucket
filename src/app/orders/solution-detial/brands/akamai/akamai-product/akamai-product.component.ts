import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { InTableConfig } from '@sysage/in-table';
import { OrderHeader, OrderSolution, ProductList, ProductSave, ProductSaveData } from '../../../../orders';
import { DateTime } from "luxon";
import { Observable } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Comparator, Filter } from 'src/app/core/models/filter';
import { AlertService } from 'src/app/core/services/alert.service';
import { OrdersService } from '../../../../orders.service';
import { TranslateService } from '@ngx-translate/core';
import _, { indexOf } from 'lodash';

@Component({
  selector: 'app-akamai-product',
  templateUrl: './akamai-product.component.html',
  styleUrls: ['./akamai-product.component.scss']
})
export class AkamaiProductComponent implements OnInit, OnChanges {
  @Input() status!: string;
  @Input() orderHeader!: OrderHeader;
  @Input() solutionData!: OrderSolution;
  @Input() dealer!: {id: string, name: string};
  @Input() endUserName!: string;
  @Output() productRequired: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private alert: AlertService,
    private orderAPI: OrdersService,
    private translate: TranslateService,
  ) {
    this.intableConfig.sitckyElemId = 'product';
  }


  // 費用計算方式下拉選單
  billingMethodDropdown: { name: string, value: string }[] = [
    {
      name: this.translate.instant('TOTAL_PERCENT'),  // 總和百分比
      value: 'TOTAL_PERCENT'
    },
    {
      name: this.translate.instant('FIX_COST'),  // 固定金額
      value: 'FIX_COST'
    }
  ]


  // 計算方式下拉選單
  calculationDropdown: { name: string, value: string }[] = [
    {
      name: this.translate.instant('COST_BASE'),  // 成本
      value: 'COST_BASE'
    },
    {
      name: this.translate.instant('PRICE_BASE'),  // 定價
      value: 'PRICE_BASE'
    }
  ]
  //  刪除productIds
  deleteProductIds: string[] = [];
  // 自訂欄位資料
  extra: { [key: string]: any } = {
    orderId: '',
    hiddenUsage: false
  }

  leaseModeDropdown: { name: string, value: number }[] = [
    {
      name: '月計價',
      value: 1,
    },
    {
      name: '年計價',
      value: 12
    }
  ];

  categoryDropdown: { name: string, value: string, disabled: boolean }[] = [
    {
      name: 'PER_USAGE',
      value: 'PER_USAGE',
      disabled: false
    },
    {
      name: 'SUBSCRIPTION',
      value: 'SUBSCRIPTION',
      disabled: false
    },
    {
      name: 'EXPENSE',
      value: 'EXPENSE',
      disabled: false
    },
    {
      name: 'LICENSE',
      value: 'LICENSE',
      disabled: false
    },
    {
      name: 'COMMITMENT',
      value: 'COMMITMENT',
      disabled: true
    },
    {
      name: 'COMMITMENT_OVERAGE',
      value: 'COMMITMENT_OVERAGE',
      disabled: true
    },
    {
      name: 'INCLUDED_UNITS',
      value: 'INCLUDED_UNITS',
      disabled: true
    },
    {
      name: 'QUANTITY_BASED_COMMIT',
      value: 'QUANTITY_BASED_COMMIT',
      disabled: true
    },
  ];

  // intable設定
  intableConfig = new InTableConfig();



  // intable資料
  intableDatas: ProductList[] = [];
  oriProducts: ProductList[] = [];

  usageType: string[] = [
    'originalSku',
    'orderId',
    'showName',
    'unit',
    'unitDescription',
    'tierEnd',
    'originalPrice',
    'sellingPrice',
    'minimum',
    'hidden',
  ]

  ngOnInit(): void {

    this.intableDatas = [];
    this.oriProducts = [];

    this.solutionData.products.forEach((productItem) => {
      let index = new ProductList();
      index = productItem;
      index.originalSkuName = productItem.originalSku;
      index.leaseModeName = productItem.leaseModeName;
      index.initial = false;
      index.minDate = DateTime.fromISO(productItem.startDate).toJSDate();
      if (!index.extra) {
        index.extra = this.extra;
      }
      this.intableDatas.push(index);
    });



    // 複製一份原始資料
    this.oriProducts = _.cloneDeep(this.intableDatas);

    this.handleRequired();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['status'].firstChange) {
      this.handleRequired();
    }
  }
  // 新增產品列表
  /* addProduct() {
    let data: ProductList[] = [];

    this.intableDatas.forEach((item) => {
      data.push(item);
    });
    let index = new ProductList();
    index.originalCurrency = this.solutionData.currencyType;

    index.extra = _.cloneDeep(this.extra);

    data.push(index);
    this.intableDatas = data;
    this.itemRequired(this.intableDatas[this.intableDatas.length - 1])
    this.handleRequired();

  } */

  /**
   * 新增產品列表
   * @param data 需新增的商品資料
   */
   addProduct(data: ProductList[]) {
    const copyData: ProductList[] = [];
    this.intableDatas.forEach(item => {
      copyData.push(item);
    });
    data.forEach(item => {
      item.multiplier = 1;
      item.times = 1;
      item.endDate = '';
      copyData.push(item);
    });
    copyData.forEach(item => {
      item.extra = {
        orderId: '',
        hiddenUsage: false,
        attribute: item.attribute
      }
    });
    this.intableDatas = copyData;
    this.itemRequired(this.intableDatas[this.intableDatas.length - 1])
    this.handleRequired();
  }

  /**自動輸入料號 */
  autoComFigSet(i: number): Observable<any> {
    return (new Observable<any>((observer: any) => {
      observer.next(this.intableDatas[i].originalSkuName);
    })).pipe(
      mergeMap((token: string) => {
        if (token.length < 2) {

          return [];
        }
        const filter = new Filter();
        if (token) {
          filter.and.push({
            field: 'originalSku',
            comparator: Comparator.like,
            value: token,
          });
          const time = DateTime.now().toFormat('yyyy-LL-dd');
          filter.and.push({
            field: 'endDate',
            comparator: Comparator.greaterEqual,
            value: time,
          });
        }
        this.intableDatas[i].productSku = '';
        return this.orderAPI.getProductList(filter).pipe(
          map((res: any) => {
            if (res && res.data.length >= 1) {
              let datas: any[] = [];
              res.data.forEach((dataItem: any) => {
                datas.push(dataItem);
              });
              return datas;
            } else {
              let datas = { notValue: true };
              return [datas];
            }
          }),
          catchError(err => {
            this.alert.errorAlert(err);
            let datas = { notValue: true };
            return [datas];
          }),
        );
      }),
    );
  }

  /** 搜尋產品名稱 */
  searchProductName(i: number): Observable<any> {
    return (new Observable<any>((observer: any) => {
      observer.next(this.intableDatas[i].name);
    })).pipe(
      mergeMap((token: string) => {
        if (token.length < 2) {

          return [];
        }
        const filter = new Filter();
        if (token) {
          filter.and.push({
            field: 'productName',
            comparator: Comparator.like,
            value: token,
          });
          const time = DateTime.now().toFormat('yyyy-LL-dd');
          filter.and.push({
            field: 'endDate',
            comparator: Comparator.greaterEqual,
            value: time,
          });
        }
        this.intableDatas[i].productSku = '';
        return this.orderAPI.getProductList(filter).pipe(
          map((res: any) => {
            if (res && res.data.length >= 1) {
              let datas: any[] = [];
              res.data.forEach((dataItem: any) => {
                datas.push(dataItem);
              });
              return datas;
            } else {
              let datas = { notValue: true };
              return [datas];
            }
          }),
          catchError(err => {
            this.alert.errorAlert(err);
            let datas = { notValue: true };
            return [datas];
          }),
        );
      }),
    );
  }

  // 計費方式函數
  calculationFunc(product: ProductList) {
    if (product.calculateMethod === 'COST_BASE') {
      product.sellingPrice = product.originalPrice * product.multiplier;
    } else {
      product.sellingPrice = product.listPrice * product.multiplier;
    }
    this.calculateTotal(product);
  }

  calculationAkami(product: ProductList) {
    product.twdListPrice = product.originalPrice;
    product.listPrice = product.originalPrice;
  }

  // 試算金額函數
  calculateTotal(product: ProductList) {
    product.total = product.quantity * product.times * product.sellingPrice;
  }

  // 計算結束日期
  calculateEndDate(product: ProductList) {
    let time = product.times * product.leaseMode;
    let date = DateTime.fromISO(product.startDate).plus({ months: time }).toFormat('yyyy-LL-dd');
    product.endDate = date;
  }


  // 刪除產品列表
  deleteProduct(index: number, product: ProductList) {
    let data: ProductList[] = [];
    if (product.id) {
      this.deleteProductIds.push(product.id);
    }
    this.intableDatas.splice(index, 1);
    this.intableDatas.forEach((item) => {
      data.push(item);
    });
    this.intableDatas = data;

    this.handleRequired();
  }



  // 處理起始日期事件
  handleStartDate(date: Date, index: number) {
    this.intableDatas[index].minDate = date;
    this.intableDatas[index].startDate = DateTime.fromJSDate(date).toFormat('yyyy-LL-dd');
    this.intableDatas[index].endDate = '';
    this.handleRequired();

  }

  // 處理欄位必填狀態
  handleRequired() {
    let index = this.intableDatas;
    let status = false;
    if (this.status !== 'DRAFT') {
      index.forEach((item) => {
        if (item.category === 'EXPENSE') {
          if (!item.productSku || !item.quantity || !item.times || !item.calculateMethod || !item.multiplier ||
            !item.sellingPrice || !item.startDate) {
            status = true;
          }
        }

      });
    }

    if (this.intableDatas.length === 0)
      status = true;
    this.productRequired.emit(status);
  }
  // 檢查每個項目是否有必填
  itemRequired(product: ProductList) {
    let status = false;
    if (!product.productSku || !product.quantity || !product.times || !product.calculateMethod || !product.multiplier || !product.sellingPrice || !product.startDate) {
      status = true;
    }
    return status;
  }
  // 選擇autoConfig函數
  setPoNumber(event: any, index: number) {
    let itemIndex = this.intableDatas[index];
    let eventIndex = event.item;
    if (!eventIndex.notValue) {

      if(!eventIndex.erpSku) {

        itemIndex.erpNumber = this.solutionData.erpNumber;
      } else {
        itemIndex.erpNumber = eventIndex.erpSku;
      }

      itemIndex.originalSkuName = eventIndex.originalSku;
      itemIndex.productSku = eventIndex.productSku;
      itemIndex.name = eventIndex.productName;
      itemIndex.showName = eventIndex.productName;
      itemIndex.sellingPrice = eventIndex.sellingPrice;
      itemIndex.unit = eventIndex.unit;
      itemIndex.unitDescription = eventIndex.unit;
      itemIndex.leaseMode = eventIndex.leaseMode.month;
      itemIndex.leaseModeName = eventIndex.leaseMode.name;
      itemIndex.calculateMethod = eventIndex.calculateMethod;
      itemIndex.originalSku = eventIndex.originalSku;
      itemIndex.category = eventIndex.category;
      itemIndex.listPrice = eventIndex.listPrice;
      itemIndex.originalPrice = eventIndex.originalPrice;
      itemIndex.twdListPrice = eventIndex.twdListPrice;
      if (itemIndex.category === 'PER_USAGE') {
        itemIndex.originalPrice = 1;
        itemIndex.listPrice = 1;
      } else if (itemIndex.category === 'EXPENSE') {
        itemIndex.billingMethod = 'FIX_COST';
      }
    } else {
      itemIndex.originalSkuName = '';
      itemIndex.originalSku = '';
      itemIndex.productSku = '';
      itemIndex.startDate = '';
      itemIndex.calculateMethod = '';
      itemIndex.billingMethod = '';

    }
    this.calculationFunc(itemIndex);
    this.handleRequired();
  }
  // 儲存產品列表
  saveProduct() {
    let result = new ProductSaveData();
    result.deleteProductIds = this.deleteProductIds;
    this.intableDatas.forEach((intableItem) => {
      let index = new ProductSave();
      index.productSku = intableItem.productSku;
      index.category = intableItem.category;
      index.id = intableItem.id;
      index.name = intableItem.name;
      index.unit = intableItem.unit;
      index.leaseMode = intableItem.leaseMode;
      index.leaseModeName = intableItem.leaseModeName;
      index.sellingPrice = intableItem.sellingPrice;
      index.times = intableItem.times;
      index.quantity = intableItem.quantity;
      index.multiplier = intableItem.multiplier;
      index.originalCurrency = intableItem.originalCurrency;
      index.originalPrice = intableItem.originalPrice;
      index.originalSku = intableItem.originalSku;
      index.listPrice = intableItem.listPrice;
      index.startDate = intableItem.startDate;
      index.endDate = intableItem.endDate;
      index.calculateMethod = intableItem.calculateMethod;
      index.billingMethod = intableItem.billingMethod;
      index.total = intableItem.total;
      // intableItem.erpNumber = this.solutionData.erpNumber;
      index.erpNumber = intableItem.erpNumber;
      index.minimum = intableItem.minimum;
      index.extra = intableItem.extra;
      index.showName = intableItem.showName;
      index.tierEnd = intableItem.tierEnd;
      index.unitDescription = intableItem.unitDescription;
      index.twdListPrice = intableItem.twdListPrice;
      result.productSave.push(index);
    });
    return result;
  }

  /** 比對子單單身產品列表修改，加入儲存的 traceNote */
  checkUpdateProduct() {

    let recordList: {
      originalSku: string,
      record: { oldData: { field: string, data: string }[], newData: { field: string, data: string }[] }
    }[] = [];

    const getItem = (id: string, list: Array<any>) => list.find(item => item.value === id);

    // =========== 商品列表 ============
    // 原資料：this.oriProducts
    // 新資料：this.intableDatas

    this.oriProducts.forEach(oldProd => {

      const oldData: { field: string, data: string }[] = [];
      const newData: { field: string, data: string }[] = [];
      const newProd = this.intableDatas.find(item => item.id === oldProd.id);


      if (newProd) {
        // 料號 originalSku // 但照常理，改為鎖定所以應該不會改變
        if (oldProd.originalSku !== newProd.originalSku) {
          const field = this.translate.instant('origin') + this.translate.instant('part no');
          oldData.push({ field, data: oldProd.originalSku });
          newData.push({ field, data: newProd.originalSku });
        }

        // 數量 quantity
        if (oldProd.quantity.toString() !== newProd.quantity.toString()) {
          const field = this.translate.instant('quantity');
          oldData.push({ field, data: oldProd.quantity.toString() });
          newData.push({ field, data: newProd.quantity.toString() });
        }

        // 時間 times
        if (oldProd.times.toString() !== newProd.times.toString()) {
          const field = this.translate.instant('time');
          oldData.push({ field, data: oldProd.times.toString() });
          newData.push({ field, data: newProd.times.toString() });
        }

        // 售價計算方式 calculateMethod
        if (oldProd.calculateMethod !== newProd.calculateMethod) {
          const field = this.translate.instant('price calculation method');
          oldData.push({ field, data: getItem(oldProd.calculateMethod, this.calculationDropdown)?.name });
          newData.push({ field, data: getItem(newProd.calculateMethod, this.calculationDropdown)?.name });
        }

        // 費用計費方式 billingMethod
        if (oldProd.billingMethod !== newProd.billingMethod) {
          const field = this.translate.instant('billing method');
          oldData.push({ field, data: getItem(oldProd.billingMethod, this.billingMethodDropdown)?.name });
          newData.push({ field, data: getItem(newProd.billingMethod, this.billingMethodDropdown)?.name });
        }

        // 乘數 multiplier
        if (oldProd.multiplier.toString() !== newProd.multiplier.toString()) {
          const field = this.translate.instant('billing method');
          oldData.push({ field, data: oldProd.multiplier.toString() });
          newData.push({ field, data: newProd.multiplier.toString() });
        }

        // 售價 sellingPrice
        if (oldProd.sellingPrice.toString() !== newProd.sellingPrice.toString()) {
          const field = this.translate.instant('sell');
          oldData.push({ field, data: oldProd.sellingPrice.toString() });
          newData.push({ field, data: newProd.sellingPrice.toString() });
        }

        // 最低消費 minimum
        if (oldProd.minimum.toString() !== newProd.minimum.toString()) {
          const field = this.translate.instant('minimum consumption');
          oldData.push({ field, data: oldProd.minimum.toString() });
          newData.push({ field, data: newProd.minimum.toString() });
        }

        // 啟用日 startDate
        if (oldProd.startDate !== newProd.startDate) {
          const field = this.translate.instant('enable date');
          oldData.push({ field, data: oldProd.startDate });
          newData.push({ field, data: newProd.startDate });
        }

      }

      if (oldData.length > 0 && newData.length > 0) {
        const record = { oldData: oldData, newData: newData };
        const item = { originalSku: oldProd.originalSku, record: record }
        recordList.push(item)
      }
    })

    const productUpdateRecord = recordList.length > 0 ? recordList : null
    return productUpdateRecord;
  }

  checkCanEdit() {
    if (!this.solutionData.id) {
      return true;
    }
    return true;
    return this.status === 'REJECT' || this.status === 'DRAFT';
  }

  // 處理其他項目
  checkProductType(type: string, name: string) {
    let result = false;
    let index = 0;
    let typeIndex = type === 'EXPENSE' ? 'expenseType' : 'akamaiType';
    let productTes: { [name: string]: string[] } = {
      akamaiType: [
        'originalSku',
        'orderId',
        'showName',
        'unit',
        'unitDescription',
        'leaseMode',
        'tierEnd',
        'originalPrice',
        'sellingPrice',
        'minimum',
        'hiddenUsage',
        'erpNumber'
      ],
      expenseType: [
        'originalSku',
        'showName',
        'unit',
        'unitDescription',
        'originalPrice',
        'sellingPrice',
        'leaseMode',
        'minimum',
        'quantity',
        'times',
        'calculateMethod',
        'billingMethod',
        'originalCurrency',
        'listPrice',
        'twdListPrice',
        'multiplier',
        'startDate',
        'endDate',
        'total',
        'erpNumber'
      ]
    }

    index = productTes[typeIndex].indexOf(name)
    if (index >= 0) {
      result = true;
    } else {
      result = false;
    }
    return result;
  }
}
