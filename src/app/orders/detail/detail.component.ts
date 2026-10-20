import { PermissionService } from 'src/app/core/services/permission.service';
import { Component, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { catchError, combineLatest, map, mergeMap, Observable, of } from 'rxjs';
import { Comparator, Filter, Sort } from 'src/app/core/models/filter';
import { AlertService } from 'src/app/core/services/alert.service';
import { Brands, ContactPerson, Customer, OrderHeader, OrderSolution, SaveOrder, SaveOrderBody, SaveOrderHeader, SaveTranceNote } from '../orders';
import { OrdersService } from '../orders.service';
import { SolutionDetialComponent } from '../solution-detial/solution-detial.component';
import { TranslateService } from '@ngx-translate/core';
import { ResponseData } from 'src/app/core/models/response-data';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { InTableConfig } from '@sysage/in-table';
import { BillsListService } from 'src/app/share/components/bills-list/bills-list.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  @ViewChild(SolutionDetialComponent)
  private timerComponent!: SolutionDetialComponent;


  @ViewChildren(SolutionDetialComponent)
  private timerComponents!: QueryList<SolutionDetialComponent>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private alert: AlertService,
    private orderAPI: OrdersService,
    private permission: PermissionService,
    private route: Router,
    private translate: TranslateService,
    private modalService: BsModalService,
    private billsListService: BillsListService,
  ) {
  }
  approvalStatusDropdown: { name: string, value: string, addMode: boolean, isSales: boolean, approvalStatus: boolean }[] = [
    {
      name: 'DRAFT',
      value: 'DRAFT',
      addMode: true,
      isSales: false,
      approvalStatus: false,
    },
    {
      name: 'REVIEW',
      value: 'REVIEW',
      addMode: true,
      isSales: false,
      approvalStatus: false,
    },
    {
      name: 'APPROVAL',
      value: 'APPROVAL',
      addMode: false,
      isSales: true,
      approvalStatus: false
    },

    {
      name: 'REJECT',
      value: 'REJECT',
      addMode: false,
      isSales: true,
      approvalStatus: false
    },
    {
      name: 'FAIL',
      value: 'FAIL',
      addMode: true,
      isSales: true,
      approvalStatus: false
    }
  ];
  // 品牌id
  brandId = ''

  // 下拉選單數值
  brandDropdownValue = '';

  // 品牌下拉選單
  brandDropdownDatas: Brands[] = [];
  // 客戶地址下拉選單
  customerAddressDropdown: { name: string, value: string }[] = [];

  // 帳單地址下拉選單
  billingAddressingDropdown: { name: string, value: string }[] = [];
  // 帳單聯絡人
  billingContactPersonDropdown: { name: string, value: string }[] = [];


  customerSelected!: string;
  customersLoading!: boolean;

  /** 客戶id與名稱 */
  customerInfo = {
    id: '',
    name: ''
  };
  /** 最終使用者 */
  endUserName = '';

  // 聯絡人
  contactPersonDropdown: { name: string, value: string }[] = [];

  endUserSelected!: string;
  endUserLoading!: boolean;

  // 是否為業務身份
  isSales = false;
  // 模式
  mode = '';

  panelIndex = 0;

  // intable設定
  intableConfig = new InTableConfig();

  // 訂單id
  orderID = '';

  // 訂單表單
  orderForm = new FormGroup({
    customerName: new FormControl('', Validators.required),
    customerAddress: new FormControl('', Validators.required),
    customerSerial: new FormControl(''),
    orderId: new FormControl(''),
    status: new FormControl('DRAFT'),
    endUser: new FormControl(''),
    contactPerson: new FormControl('', Validators.required),
    billingContact: new FormControl('', Validators.required),
    billingAddress: new FormControl('', Validators.required),
    salesModel: new FormControl('DIRECT_SELLING'),
    orderErpNumber: new FormControl('', [Validators.required, Validators.pattern('^312[0-9]{2}([1-9ABC])[0-9]{4}$')]),
    quotationId: new FormControl(''),
    erpCustomerNumber: new FormControl('', Validators.required),
    partnerId: new FormControl(''),
  });

  orderHeader = new OrderHeader(); //剛讀取，未修改的單頭資料
  newOrderHeader = new SaveOrderHeader(); //修改後要儲存的資料
  /** 原始訂單狀態 */
  oriStatus = '';

  // 方案列表
  orderSolutionList: OrderSolution[] = [];

  // 方案下拉選單
  solutionDropdown: { name: string, value: string }[] = [];

  // 方案必填狀態
  solutionRequired = false;

  solutionId = '';

  // 搜尋文字狀態
  search = false;
  // 銷售模式下拉選單
  salesModelDripdown: { name: string, value: string }[] = [
    {
      name: 'DIRECT_SELLING',
      value: 'DIRECT_SELLING'
    },
    {
      name: 'DISTRIBUTION',
      value: 'DISTRIBUTION'
    },
    {
      name: 'DISTRIBUTOR_SELF_USE',
      value: 'DISTRIBUTOR_SELF_USE'
    },
    {
      name: 'SELF_USE',
      value: 'SELF_USE'

    }
  ];


  // ui狀態
  ui = {
    isLoading: false,
    isLoadOrder: false,
    isLoadCustomer: false,
    isEndUser: false,
    isSaveOrder: false
  }

  /** BsModal */
  modalRef!: BsModalRef;

  ngOnInit(): void {
    this.isSales = this.permission.flat['iam-v1.sales'] ? true : false;
    if (this.activatedRoute.snapshot.params['order']) {
      this.orderID = this.activatedRoute.snapshot.params['order'];
      // 把order id存到service裡
      this.billsListService.data.next(this.orderID);
      this.getOrder();

      this.mode = 'edit';
    } else {
      this.mode = 'add';
      this.statusChange();
      this.orderHeader.status = this.orderForm.get('status')?.value;
    }
    this.validateAllFormFields(this.orderForm);
    this.getBrand();
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
  }

  addSolution() {
    let solutionIndex = new OrderSolution();
    solutionIndex.brand.id = this.brandId;
    solutionIndex.solutionId = this.solutionId;
    this.orderSolutionList.push(solutionIndex);
    this.panelIndex = this.orderSolutionList.length - 1;
  }

  // 公司自動輸入客戶
  autoInputCustomer(e: TypeaheadMatch) {
    if (!e.item.notValue) {
      // this.newOrderHeader.customer.serialNumber = e.item.serialNumber;
      if (this.newOrderHeader.customer) {
        this.newOrderHeader.customer.id = e.item.customerId;
        this.newOrderHeader.customer.name = e.item.customerName.fullCh + '/' + e.item.customerName.fullEn;
      }
      this.newOrderHeader.customer.serialNumber = e.item.serialNumber;
      this.customerSelected = e.item.customerName.fullCh + '/' + e.item.customerName.fullEn;
      this.orderForm.controls['customerName'].setValue(`${e.item.customerName.fullCh} / ${e.item.customerName.fullEn} `);
      this.orderForm.controls['customerSerial'].setValue(e.item.serialNumber);
      this.customerAddressDropdown = [];
      this.billingAddressingDropdown = [];
      this.billingContactPersonDropdown = [];
      this.contactPersonDropdown = [];
      this.customerInfo.id = e.item.customerId;
      this.customerInfo.name = e.item.customerName.fullCh;
      this.getCustomerIdDate(e.item.customerId, 'customer');
      if (this.newOrderHeader.endUser && this.newOrderHeader.endUser.id) {
        this.getCustomerIdDate(this.newOrderHeader.endUser.id, 'endUser');
      }

    } else {
      this.customerSelected = '';
    }

  }

  //最終使用者自動輸入客戶端
  autoInputEndUser(e: TypeaheadMatch) {
    if (!e.item.notValue) {
      this.newOrderHeader.endUser = {
        id: e.item.customerId,
        name: e.item.customerName.fullCh + '/' + e.item.customerName.fullEn,
        serialNumber: e.item.serialNumber
      };

      this.orderForm.controls['endUser'].setValue(`${e.item.customerName.fullCh} / ${e.item.customerName.fullEn} `);
      this.endUserSelected = e.item.customerName.fullCh + '/' + e.item.customerName.fullEn;
      this.customerAddressDropdown = [];
      this.billingAddressingDropdown = [];
      this.billingContactPersonDropdown = [];
      this.contactPersonDropdown = [];
      this.endUserName = e.item.customerName.fullCh;
      this.getCustomerIdDate(e.item.customerId, 'endUser');
      this.getCustomerIdDate(this.newOrderHeader.customer.id, 'customer');
    } else {
      this.endUserSelected = '';
    }

  }

  // 改變品牌
  changeBrand() {
    this.orderSolutionList = [];
    this.solutionDropdown = [];
    this.solutionId = '';
    this.getSolutionLIstApi(this.brandId);
  }



  /** [typeahead] 客戶是否正在載入 */
  changeCustomerLoading(e: boolean): void {
    this.customersLoading = e;
  }

  /** [typeahead] 最終使用者是否正在載入 */
  changeEnduserLoading(e: boolean): void {
    this.endUserLoading = e;
  }

  // 編輯方案name
  changeSolutionName(changeName: OrderSolution, e: any) {
    changeName.nameEditStatus = !changeName.nameEditStatus;
    e.stopPropagation();
  }
  // 銷售模式
  changeSalesMode() {
    if (this.orderForm.value.status !== 'DRAFT') {
      this.orderForm.controls['orderErpNumber'].setValidators([Validators.required]);
      this.orderForm.controls['orderErpNumber'].updateValueAndValidity();
    }

    if (this.orderForm.value.salesModel === 'DISTRIBUTION') {
      if (this.orderForm.value.status !== 'DRAFT') {
        this.orderForm.controls['endUser'].setValidators([Validators.required]);
        this.orderForm.controls['endUser'].updateValueAndValidity();
      }

      if (this.orderHeader.endUser && this.orderHeader.endUser.id) {
      }
    } else if (this.orderForm.value.salesModel === 'self use') {
      this.orderForm.controls['orderErpNumber'].setValidators(null);
      this.orderForm.controls['orderErpNumber'].updateValueAndValidity();

    } else {


    }

  }

  copySolution(item: OrderSolution ) {
    let copyData = _.cloneDeep(item);
    copyData.id = '';
    copyData.cloudId = '';
    copyData.originalInfo = {};
    copyData.solutionData = {};
    copyData.initial = true;
    copyData.originalStatus = false;
    copyData.products.forEach( item =>{
      item.id = '';
    })
    this.orderSolutionList.push(copyData);
    this.panelIndex = this.orderSolutionList.length - 1;
  }

  // 刪除方案
  deleteSolution(index: number, e: any) {
    this.orderSolutionList.splice(index, 1);

    if (this.orderSolutionList.length === 0) {
      this.solutionRequired = false;
    } else {
      this.timerComponents.forEach(item => item.handleRequired());
    }
  }

  /**客戶輸入ＡＰＩ */
  getCustomerFullTypeHead(): Observable<any> {
    return (new Observable<any>((observer: any) => {
      observer.next(this.customerSelected);
    })).pipe(
      mergeMap((token: string) => {
        if (token.length < 2) {
          this.ui.isLoadCustomer = false;
          return [];
        }
        this.ui.isLoadCustomer = true;
        const filter = new Filter();
        if (token) {
          filter.and.push({
            field: 'customerName',
            comparator: Comparator.like,
            value: token,
          });
        }

        return this.orderAPI.postCustomer(filter).pipe(
          map((res: any) => {
            if (res && res.data.length >= 1) {
              let datas: any[] = [];
              res.data.forEach((dataItem: any) => {
                datas.push(dataItem);
                this.ui.isLoadCustomer = false;
              });
              datas.push({ notValue: true });
              return datas;
            } else {
              this.ui.isLoadCustomer = false;
              let datas = { notValue: true }
              return [datas];
            }


          }),
          catchError(err => {
            this.alert.errorAlert(err);
            this.ui.isLoadCustomer = false;
            let datas = { notValue: true }
            return [datas];
          }),
        );
      }),
    );
  }


  // 取得品牌
  getBrand() {
    // this.ui.isLoading = true;
    let filter = new Filter();
    filter.pageSize = 10;
    filter.pageIndex = 1;
    filter.sort = { modifyDate: Sort.desc };
    filter.and = [];
    this.orderAPI.getBrandList(filter).subscribe({
      next: (res) => {
        console.log('[order-detail] getBrandList done', res);
        if (res.info.success && res?.data) {
          this.brandDropdownDatas = res.data;
          if (this.orderSolutionList.length === 0)
            this.brandId = res.data[0].brandId;
          this.getSolutionLIstApi(this.brandId);
          this.ui.isLoading = false;

        } else {
          this.ui.isLoading = false;
        }
      },
      error: (err) => {
        console.error('[order-detail] getBrandList fail', err);
        this.alert.errorAlert('[order-detail] getBrandList fail' + err);
        this.ui.isLoading = false;
      },
    });
  }

  // 取得方案
  getSolutionLIstApi(brandId: string) {
    this.orderAPI.getSolutionList(brandId).subscribe({
      next: (res) => {
        console.log('[order] getSolution done', res);
        if (res.info.success && res?.data) {
          this.solutionDropdown = [];
          res.data.forEach((brand: any) => {
            this.solutionDropdown.push({ name: brand.name, value: brand.solutionId });
          });
          this.solutionId = res.data[0].solutionId;
        }
      },
      error: (err) => {
        console.error('[order]  getSolution fail', err);
        this.alert.errorAlert('[order]  getSolution fail' + err);

      },
    });

  }

  // 取得聯絡人資料
  getContactPersonDate(customerId: string, customerName: string) {

    let filter = new Filter();
    this.orderAPI.postContactPerson(customerId, filter).subscribe({
      next: (res) => {
        console.log('[order-detail] getContactPersonDate done', res);
        if (res.info.success && res?.data) {
          const contactPersonIndex: ContactPerson[] = res.data;
          contactPersonIndex.forEach((contactItem) => {
            let nameIndex = customerName + '/' + (contactItem.chineseName ? contactItem.chineseName : contactItem.englishName);
            this.billingContactPersonDropdown.push({ name: nameIndex, value: contactItem.contactId });
            this.contactPersonDropdown.push({ name: nameIndex, value: contactItem.contactId });
          });
          // this.orderForm.controls['contactPerson'].setValue(this.contactPersonDropdown[0]?.value);
          // this.orderForm.controls['billingContact'].setValue(this.billingContactPersonDropdown[0]?.value);

          this.ui.isLoading = false;
        } else {
          this.ui.isLoading = false;
        }
      },
      error: (err) => {
        console.error('[order-detail]  getContactPersonDate fail', err);
        this.alert.errorAlert('[order-detail]  getContactPersonDate fail' + err);
        this.ui.isLoading = false;
      },
    });
  }
  // 取得客戶資料
  getCustomerIdDate(customerId: string, customerType: string) {
    this.orderAPI.getCustomer(customerId).subscribe({
      next: (res) => {
        console.log('[order-detail] getCustomerIdDate done', res);
        if (res.info.success && res?.data) {
          const customerIndex: Customer = res.data;



          customerIndex.location.forEach((locationItem) => {
            let nameIndex = customerIndex.customerName.nickCh + '/' + locationItem.address;
            this.customerAddressDropdown.push({ name: nameIndex, value: locationItem.address });
            // this.orderForm.controls['customerAddress'].setValue(this.customerAddressDropdown[0]?.value);
            this.billingAddressingDropdown.push({ name: nameIndex, value: locationItem.address });
            // this.orderForm.controls['billingAddress'].setValue(this.billingAddressingDropdown[0]?.value);
          });
          if (customerType === 'customer') {
            this.newOrderHeader.customer.serialNumber = customerIndex.serialNumber;
          } else {
            if (this.newOrderHeader.endUser)
              this.newOrderHeader.endUser.serialNumber = customerIndex.serialNumber;
          }

          this.getContactPersonDate(customerId, customerIndex.customerName.nickCh);
          this.ui.isLoading = false;
        } else {
          this.ui.isLoading = false;
        }
      },
      error: (err) => {
        console.error('[order-detail]  getCustomerIdDate fail', err);
        this.alert.errorAlert('[order-detail]  getCustomerIdDate fail' + err);
        this.ui.isLoading = false;
      },
    });
  }

  /**最終使用者輸入ＡＰＩ */
  getEnbuserFullTypeHead(): Observable<any> {
    return (new Observable<any>((observer: any) => {
      observer.next(this.endUserSelected);
    })).pipe(
      mergeMap((token: string) => {
        this.ui.isEndUser = true;
        if (token.length < 2) {
          this.ui.isEndUser = false;
          return [];
        }

        const filter = new Filter();
        if (token) {
          filter.and.push({
            field: 'customerName',
            comparator: Comparator.like,
            value: token,
          });
        }

        return this.orderAPI.postCustomer(filter).pipe(
          map((res: any) => {
            if (res && res.data.length >= 1) {
              let datas: any[] = [];
              res.data.forEach((dataItem: any) => {
                datas.push(dataItem);
                this.ui.isEndUser = false;
              });
              datas.push({ notValue: true });
              return datas;
            } else {
              this.ui.isEndUser = false;
              let datas = { notValue: true }
              return [datas];
            }


          }),
          catchError(err => {
            this.alert.errorAlert(err);
            let datas = { notValue: true }
            this.ui.isEndUser = false
            return [datas];
          }),
        );
      }),
    );
  }

  // 取得訂單列表
  getOrder() {
    this.ui.isLoadOrder = true;

    this.orderAPI.getOrder(this.orderID).subscribe({
      next: (res) => {
        console.log('[order-detail] getSolution done', res);
        if (res.info.success && res?.data) {
          this.orderHeader = res.data.header as OrderHeader;
          this.newOrderHeader.customer = _.cloneDeep(this.orderHeader.customer);

          if (this.orderHeader.endUser) {
            this.newOrderHeader.endUser = _.cloneDeep(this.orderHeader.endUser);
          }

          const headerIndex = this.orderHeader;
          this.oriStatus = this.orderHeader.status;

          const contact = {
            chineseName: '',
            englishName: '',
            id: '',
            status: '',
            email: ''
          };

          const customer = {
            id: '',
            name: '',
            serialNumber: ''
          };
          headerIndex.billingContact = headerIndex.billingContact ? headerIndex.billingContact : contact;
          headerIndex.customerContact = headerIndex.customerContact ? headerIndex.customerContact : contact;
          headerIndex.customer = headerIndex.customer ? headerIndex.customer : customer;
          headerIndex.endUser = headerIndex.endUser ? headerIndex.endUser : customer;


          this.orderSolutionList = res.data.body as OrderSolution[];

          const bodyIndex = this.orderSolutionList;
          const sales = {
            email: '',
            employeeId: '',
            id: '',
            name: '',
          }
          bodyIndex.forEach((orderItem) => {
            orderItem.endDate = orderItem.endDate ? DateTime.fromISO(orderItem.endDate).toFormat('yyyy-LL-dd') : '';
            orderItem.sales = orderItem.sales ? orderItem.sales : sales
            orderItem.nameEditStatus = false;
            orderItem.initial = false;
            if (!orderItem.exchangeRate) {
              orderItem.exchangeRate = 1;
            }
            if (!orderItem.endDate) {
              orderItem.endDate === '';
            }
          });



          this.customerSelected = headerIndex.customer.name;
          this.endUserSelected = headerIndex.endUser.name;
          this.brandId = bodyIndex.length > 0 ? bodyIndex[0].brand.id : '';
          this.orderForm.patchValue({
            orderId: headerIndex.id,
            orderErpNumber: headerIndex.orderErpNumber,
            customerName: headerIndex.customer.name,
            customerAddress: headerIndex.customerAddress,
            status: headerIndex.status,
            endUser: headerIndex.endUser.id,
            contactPerson: headerIndex.customerContact.id,
            billingContact: headerIndex.billingContact.id,
            billingAddress: headerIndex.billingAddress,
            salesModel: headerIndex.salesModel,
            quotationId: headerIndex.quotationId,
            erpCustomerNumber: headerIndex.erpCustomerNumber
          }, {
            emitEvent: false
          });

          this.getSolutionLIstApi(this.brandId);

          this.customerAddressDropdown = [];
          this.billingAddressingDropdown = [];
          this.billingContactPersonDropdown = [];
          this.contactPersonDropdown = [];
          if (headerIndex.customer.id) {
            this.getCustomerIdDate(headerIndex.customer.id, 'customer');

          }
          if (headerIndex.endUser?.id) {
            this.getCustomerIdDate(headerIndex.endUser.id, 'endUser');
          }
          this.statusChange();
          this.ui.isLoadOrder = false;
        } else {
          this.ui.isLoadOrder = false;
          console.error('[order-detail]  getOrder fail');
          this.alert.errorAlert(res.info.message);
        }
      },
      error: (err) => {
        console.error('[order-detail]  getOrder fail', err);
        this.alert.errorAlert('[order-detail]  getOrder fail' + err);
        this.ui.isLoadOrder = false;
      },
    });
  }

  // 處理方案必填狀態
  handleSolutionRequired(data: any) {
    this.solutionRequired = false
    this.orderSolutionList[data.index].requiredStatus = data.required;
    this.orderSolutionList.forEach((item) => {
      if (item.requiredStatus) {
        this.solutionRequired = true
      }
    });
  }


  // 新增訂單
  addOrder() {
    this.ui.isSaveOrder = true;
    let addOrder = new SaveOrder();
    addOrder.header.customerAddress = this.orderForm.value.customerAddress;
    addOrder.header.customerContactId = this.orderForm.value.contactPerson;
    addOrder.header.billingAddress = this.orderForm.value.billingAddress;
    addOrder.header.billingContactId = this.orderForm.value.billingContact;
    addOrder.header.orderErpNumber = this.orderForm.value.orderErpNumber;
    addOrder.header.quotationId = this.orderForm.value.quotationId;
    addOrder.header.erpCustomerNumber = this.orderForm.value.erpCustomerNumber;
    if (addOrder.header.customer && this.newOrderHeader.customer) {
      addOrder.header.customer.name = this.newOrderHeader.customer.name;
      addOrder.header.customer.id = this.newOrderHeader.customer.id

      addOrder.header.customer.serialNumber = this.newOrderHeader.customer.serialNumber;
    }

    if (this.newOrderHeader.endUser) {
      addOrder.header.endUser = {
        id: this.newOrderHeader.endUser.id,
        name: this.newOrderHeader.endUser.name,
        serialNumber: this.newOrderHeader.endUser.serialNumber
      };
    }
    addOrder.header.salesModel = this.orderForm.get('salesModel')?.value;
    addOrder.header.status = this.orderForm.get('status')?.value;

    this.timerComponents.forEach((item, index) => {
      addOrder.body.push(item.saveHandleBody(this.orderSolutionList[index]));

    });
    this.addSaveHeader(addOrder);

  }

  addSaveHeader(addOrder: SaveOrder) {
    this.orderAPI.postOrder(addOrder).subscribe({
      next: (res) => {
        console.log('[order-detail] addOrder done', res);
        if (res.info.success && res?.data) {
          this.orderSolutionList.forEach((solutionBodyItem) => {
            this.timerComponent.placeAnOrder();
          });
          this.alert.successAlert('新增訂單成功');
          this.route.navigate(['main/orders']);
        } else {
          this.alert.errorAlert('[order-detail]  addOrder fail');
          this.ui.isSaveOrder = false;
        }
      },
      error: (err) => {
        console.error('[order-detail]  addOrder fail', err);
        this.alert.errorAlert('[order-detail]  addOrder fail' + err);
        this.ui.isSaveOrder = false;
      },
    });

  }


  /** 更新訂單單頭
   * filed for 後端紀錄 mapping
   * message for 前端顯示＋搜尋修改欄位
   */
  saveOrderHeader() {
    this.ui.isSaveOrder = true;
    this.modalService.hide();
    let updateHeader = new SaveOrderHeader();

    const getItem = (id: string, list: Array<any>) => list.find(item => item.value === id);

    // ERP 訂單編號
    updateHeader.orderErpNumber = this.orderForm.value.orderErpNumber;
    if (updateHeader.orderErpNumber !== this.orderHeader.orderErpNumber) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'orderErpNumber';
      saveTranceNote.oldData = this.orderHeader.orderErpNumber;
      saveTranceNote.newData = updateHeader.orderErpNumber;
      saveTranceNote.message = '312 ' + this.translate.instant('no.');
      updateHeader.tranceNote.push(saveTranceNote);
    }

    // 客戶地址
    updateHeader.customerAddress = this.orderForm.value.customerAddress;
    if (updateHeader.customerAddress !== this.orderHeader.customerAddress) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'customerAddress';
      saveTranceNote.oldData = this.orderHeader.customerAddress;
      saveTranceNote.newData = updateHeader.customerAddress;
      saveTranceNote.message = this.translate.instant('customer address');
      updateHeader.tranceNote.push(saveTranceNote);
    }

    // 聯絡人
    updateHeader.customerContactId = this.orderForm.value.contactPerson;
    if (this.orderHeader.customerContact && updateHeader.customerContactId && updateHeader.customerContactId !== this.orderHeader.customerContact.id) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'customerContactId';
      saveTranceNote.oldData = this.orderHeader.customerContact.chineseName;
      saveTranceNote.newData = getItem(updateHeader.customerContactId, this.contactPersonDropdown)?.chineseName;
      saveTranceNote.message = this.translate.instant('contact person');
      updateHeader.tranceNote.push(saveTranceNote);
    }

    // 帳單地扯
    updateHeader.billingAddress = this.orderForm.value.billingAddress;
    if (updateHeader.billingAddress && updateHeader.billingAddress !== this.orderHeader.billingAddress) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'billingAddress';
      saveTranceNote.oldData = this.orderHeader.billingAddress;
      saveTranceNote.newData = getItem(updateHeader.billingAddress, this.customerAddressDropdown)?.name;
      saveTranceNote.message = this.translate.instant('billing address');
      updateHeader.tranceNote.push(saveTranceNote);
    }

    // 帳單聯絡人
    updateHeader.billingContactId = this.orderForm.value.billingContact;
    if (updateHeader.billingContactId && updateHeader.billingContactId !== this.orderHeader.billingContact.id) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'billingContactId';
      saveTranceNote.oldData = this.orderHeader.billingContact.chineseName;
      saveTranceNote.newData = getItem(updateHeader.billingContactId, this.contactPersonDropdown)?.chineseName;
      saveTranceNote.message = this.translate.instant('billing Contact');
      updateHeader.tranceNote.push(saveTranceNote);
    }

    // 客戶
    if (updateHeader.customer && this.newOrderHeader.customer && this.orderHeader.customer) {
      updateHeader.customer.name = this.newOrderHeader.customer.name;
      updateHeader.customer.id = this.newOrderHeader.customer.id;
      updateHeader.customer.serialNumber = this.newOrderHeader.customer.serialNumber;
      if (updateHeader.customer.id !== this.orderHeader.customer.id) {
        const saveTranceNote = new SaveTranceNote();
        saveTranceNote.type = 'UPDATE';
        saveTranceNote.field = 'customer';
        saveTranceNote.oldData = this.orderHeader.customer.name;
        saveTranceNote.newData = updateHeader.customer.name;
        saveTranceNote.message = this.translate.instant('customer');
        updateHeader.tranceNote.push(saveTranceNote);
      }
    }


    // 商機編號
    updateHeader.quotationId = this.orderForm.value.quotationId;
    if (updateHeader.quotationId !== this.orderHeader.quotationId) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'quotationId';
      saveTranceNote.oldData = this.orderHeader.quotationId;
      saveTranceNote.newData = updateHeader.quotationId;
      saveTranceNote.message = this.translate.instant('quotationId');
      updateHeader.tranceNote.push(saveTranceNote);
    }


    // 客戶編號
    updateHeader.erpCustomerNumber = this.orderForm.value.erpCustomerNumber;
    if (updateHeader.erpCustomerNumber !== this.orderHeader.erpCustomerNumber) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'erpCustomerNumber';
      saveTranceNote.oldData = this.orderHeader.erpCustomerNumber;
      saveTranceNote.newData = updateHeader.erpCustomerNumber;
      saveTranceNote.message = this.translate.instant('erpCustomerNumber');
      updateHeader.tranceNote.push(saveTranceNote);
    }

    // 最終使用者
    if (this.newOrderHeader.endUser) {
      updateHeader.endUser = {
        id: this.newOrderHeader.endUser.id,
        name: this.newOrderHeader.endUser.name,
        serialNumber: this.newOrderHeader.endUser.serialNumber
      };
    }
    if (updateHeader.endUser?.id !== this.orderHeader.endUser?.id) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'endUser';
      saveTranceNote.oldData = this.orderHeader.endUser?.name;
      saveTranceNote.newData = updateHeader.endUser?.name;
      saveTranceNote.message = this.translate.instant('endUser');
      updateHeader.tranceNote.push(saveTranceNote);
    }



    // 銷售模式
    updateHeader.salesModel = this.orderForm.get('salesModel')?.value;
    if (updateHeader.salesModel !== this.orderHeader.salesModel) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'salesModel';
      saveTranceNote.oldData = this.orderHeader.salesModel
      saveTranceNote.newData = getItem(updateHeader.salesModel, this.salesModelDripdown)?.name;
      saveTranceNote.message = this.translate.instant('sales model');
      updateHeader.tranceNote.push(saveTranceNote);
    }

    // 訂單狀態
    updateHeader.status = this.orderForm.get('status')?.value;
    if (updateHeader.status !== this.orderHeader.status) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'status';
      saveTranceNote.oldData = getItem(this.orderHeader.status, this.approvalStatusDropdown)?.name;
      saveTranceNote.newData = getItem(updateHeader.status, this.approvalStatusDropdown)?.name;
      saveTranceNote.message = this.translate.instant('status');
      updateHeader.tranceNote.push(saveTranceNote);
    }

    this.orderAPI.putAddOrderHeader(updateHeader, this.orderID).subscribe({
      next: (res) => {
        console.log('[order-detail] updateOrderHeader done', res);
        if (res.info.success && res?.data) {
          // this.alert.successAlert('更新訂單單頭成功');
          // this.route.navigate(['main/orders']);
          this.saveSolution();
        } else {
          this.alert.errorAlert('[order-detail]  updateOrderHeader fail');
          this.ui.isSaveOrder = false;
        }
      },
      error: (err) => {
        console.error('[order-detail]  updateOrderHeader fail', err);
        this.alert.errorAlert('[order-detail]  updateOrderHeader fail' + err);
        this.ui.isSaveOrder = false;
      },
    });
  }
  /** 更新子單單身
   * 新增子單
   */
  saveSolution() {
    let updateSolutions: Observable<any>[] = [];
    this.timerComponents.forEach((item, index) => {
      let solutionIndex = new SaveOrderBody();
      solutionIndex = item.saveHandleBody(this.orderSolutionList[index]);
      if (solutionIndex.id) {
        updateSolutions.push(this.orderAPI.putAddSolution(solutionIndex, this.orderID, this.orderSolutionList[index].id));
      } else {
        updateSolutions.push(this.orderAPI.postAddSolution(solutionIndex, this.orderID))
      }
    });



    const subscription = combineLatest(updateSolutions).subscribe({
      next: (res: ResponseData[]) => {
        res.forEach((resItem) => {
          if (resItem.info.success && resItem?.data) {
            this.alert.successAlert(resItem.info.message);

            this.orderSolutionList.forEach((solutionBodyItem) => {
              this.timerComponent.placeAnOrder();
            });

            this.route.navigate(['main/orders']);

          } else {
            this.alert.errorAlert(resItem.info.message);
            this.ui.isSaveOrder = false;
          }
        })
      },
      error: (err) => {
        console.error('[order-detail]  updateOrderHeader fail', err);
        this.alert.errorAlert('[order-detail]  updateOrderHeader fail' + err);
        this.ui.isSaveOrder = false;
      },
    });
  }
  // 採購單單頭狀態
  statusChange() {
    if (this.orderForm.value.status === 'DRAFT') {
      this.orderForm.controls['customerName'].setValidators(null);
      this.orderForm.controls['customerAddress'].setValidators(null);
      this.orderForm.controls['contactPerson'].setValidators(null);
      this.orderForm.controls['billingContact'].setValidators(null);
      this.orderForm.controls['billingAddress'].setValidators(null);
      this.orderForm.controls['orderErpNumber'].setValidators(null);
      this.orderForm.controls['endUser'].setValidators(null);
      this.orderForm.controls['erpCustomerNumber'].setValidators(null);

    } else {
      this.orderForm.controls['customerName'].setValidators(Validators.required);
      this.orderForm.controls['customerAddress'].setValidators(Validators.required);
      this.orderForm.controls['contactPerson'].setValidators(Validators.required);
      this.orderForm.controls['billingContact'].setValidators(Validators.required);
      this.orderForm.controls['billingAddress'].setValidators(Validators.required);
      this.orderForm.controls['orderErpNumber'].setValidators([Validators.required, Validators.pattern('^312[0-9]{2}([1-9ABC])[0-9]{4}$')]);
      if (this.orderForm.value.salesModel === 'DISTRIBUTION') {
        this.orderForm.controls['endUser'].setValidators([Validators.required]);
      }

      this.orderForm.controls['erpCustomerNumber'].setValidators(Validators.required);

    }

    this.orderForm.controls['customerName'].updateValueAndValidity();
    this.orderForm.controls['customerAddress'].updateValueAndValidity();
    this.orderForm.controls['contactPerson'].updateValueAndValidity();
    this.orderForm.controls['billingContact'].updateValueAndValidity();
    this.orderForm.controls['billingAddress'].updateValueAndValidity();
    this.orderForm.controls['orderErpNumber'].updateValueAndValidity();
    this.orderForm.controls['endUser'].updateValueAndValidity();
    this.orderForm.controls['erpCustomerNumber'].updateValueAndValidity();



    if (this.orderSolutionList.length >= 1) {
      this.timerComponents.forEach(item => item.handleRequired());
    }
  }

  /** 跳轉至客戶模組 */
  toContact(e: any) {
    window.open('main/customers/add', '_blank');

  }

  /**
   * 顯示聯絡人名稱
   * @param value 聯絡人id
   */
  contactName(value: string) {
    let showName = this.contactPersonDropdown.filter(item => item.value === value).map(item => item.name);
    return showName;
  }

  /**
   * 顯示方案名稱
   * @param value 方案id
   */
  solutionName(value: string) {
    let showName = this.solutionDropdown.filter(item => item.value === value).map(item => item.name);
    return showName;
  }

  /**
   * 顯示訂單資料跳窗
   * @param template 顯示訂單資料跳窗template
   */
  reviewOrder(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-full',
      ignoreBackdropClick: true
    });
  }

  /**
   * 確認送出跳窗
   * @param template 確認送出跳窗template
   */
  confirm(template: TemplateRef<any>) {
    this.modalService.hide();
    setTimeout(() => {
      this.modalRef = this.modalService.show(template, {
        class: 'modal-lg',
        ignoreBackdropClick: true
      });
    }, 300);
  }

  /** 取消跳窗 */
  hidemodal() {
    this.modalService.hide();
  }
}
