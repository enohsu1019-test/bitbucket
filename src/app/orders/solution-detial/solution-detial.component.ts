import { OrderHeader, PayerID, ProductSaveData, SaveOrderBody, SaveTranceNote } from './../orders';
import { Component, Input, OnInit, SimpleChanges, ViewChild, Output, EventEmitter, OnChanges } from '@angular/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { OrderSolution, OrderStatus } from '../orders';
import { OrdersService } from '../orders.service';
import { DateTime } from "luxon";
import _ from 'lodash';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';
import { catchError, map, mergeMap, Observable, of, tap } from 'rxjs';
import { Comparator, Filter } from 'src/app/core/models/filter';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/core/services/api.service';
import { environment } from 'src/environments/environment';
import { EpicModalService } from 'src/app/core/services/modal.service';
import { OrderProductListComponent } from './order-product-list/order-product-list.component';
import { PermissionService } from 'src/app/core/services/permission.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { AwsProductComponent } from './brands/aws/aws-product/aws-product.component';
import { MicrosoftProductComponent } from './brands/microsoft/microsoft-product/microsoft-product.component';
import { AkamaiProductComponent } from './brands/akamai/akamai-product/akamai-product.component';
import { GoogleProductComponent } from './brands/google/google-product/google-product.component';
import { CiscoProductComponent } from './brands/cisco/cisco-product/cisco-product.component';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-solution-detial',
  templateUrl: './solution-detial.component.html',
  styleUrls: ['./solution-detial.component.scss']
})
export class SolutionDetialComponent implements OnInit, OnChanges {
  @Input() status!: string;
  @Input() solutionHeaderData!: OrderSolution;
  @Input() orderHeader!: OrderHeader;
  @Input() orderId!: string;
  @Input() mode!: string;
  @Input() customerId!: string;
  @Input() solutionIndex!: number;
  @Input() solutionName!: string;
  @Input() salesModel!: string;
  @Input() headerForm!: FormGroup;
  @Input() dealer!: {id: string, name: string};
  @Input() endUserName!: string;
  @Output() required: EventEmitter<{ index: number, required: boolean }> = new EventEmitter();
  @ViewChild('endDateDropdown') endDateDropdown!: BsDropdownDirective;
  @ViewChild(GoogleProductComponent)
  private googleProductComponent!: GoogleProductComponent;
  @ViewChild(MicrosoftProductComponent)
  private microsoftProductComponent!: MicrosoftProductComponent;
  @ViewChild(AwsProductComponent)
  private awsProductComponent!: AwsProductComponent;
  @ViewChild(CiscoProductComponent)
  private ciscoProductComponent!: CiscoProductComponent;
  @ViewChild(AkamaiProductComponent)
  private akamaiProductComponent!: AkamaiProductComponent;
  @ViewChild(OrderProductListComponent)
  private orderProductComponent!: OrderProductListComponent;
  constructor(
    private alert: AlertService,
    private orderAPI: OrdersService,
    private translate: TranslateService,
    private api: ApiService,
    private modal: EpicModalService,
    private permission: PermissionService,
    private authService: AuthService
  ) {
  }
  panelOpenState = false;
  // 預繳資料
  advancePaymentsIntable: { amount: string, remittanceDate: string }[] = [];

  isEndDateInitialized = false;
  /** end date 是否為自定義日期，而非下拉選項中的指定日期 */
  isEndDateCustomized!: boolean;
  /** end date 選擇到的下拉日期選項，若是自定義，則為 undefined */
  endDateSelected: any = null;
  // 無結束日期狀態
  notEndDataStatus: any = null;
  /** end date 下拉日期選項 */
  endDurations = [
    {
      value: 0,
      unit: 'not end date',
      checked: true,
    },
    {
      value: 6,
      unit: 'months',
      checked: false,
    },
    {
      value: 12,
      unit: 'months',
      checked: false,
    },
    {
      value: 18,
      unit: 'months',
      checked: false,
    },
    {
      value: 24,
      unit: 'months',
      checked: false,
    },
  ];

  contractStatusDropdown: { name: string, value: string, isSales: boolean  }[] = [
    {
      value: OrderStatus.not,
      name: OrderStatus.not,
      isSales: false
    },
    {
      value: OrderStatus.using,
      name: OrderStatus.using,
      isSales: true
    },

    {
      value: OrderStatus.void,
      name: OrderStatus.void,
      isSales: true
    },
    {
      value: OrderStatus.suspension,
      name: OrderStatus.suspension,
      isSales: true
    }
  ];
  /**聯絡人HeadType */
  contactPersonInput!: string;

  contactPersonLoading = false
  // 幣別
  currencyTypeDropdown: { name: string, value: string }[] = [
    {
      name: 'TWD',
      value: 'TWD'
    },
    {
      name: 'USD',
      value: 'USD'
    }
  ]

  // 原廠合約編號
  contractIds: string[] = [];
  // 原廠合約編號input
  contractIdInput = '';
  // 原廠合約編號tableIdnex
  contractIdsTalbleKey: string[] = ['itemIndex', 'contractid', 'option'];

  defaultDataFileName!: string;
  // 結束日期
  endate = '';

  buttonStatus = false;

  // 匯率類型下拉選單
  exchangeRateTypeDropdown: { name: string, value: string }[] = [
    // {
    //   name: 'BKTW',
    //   value: 'BKTW'
    // },
    {
      name: 'CUSTOM',
      value: 'CUSTOM'
    },
    {
      name: 'CUSTOMS_LATE_OF_MONTH',
      value: 'CUSTOMS_LATE_OF_MONTH'
    },
    {
      name: 'CUSTOMS_EARLY_OF_MONTH',
      value: 'CUSTOMS_EARLY_OF_MONTH'
    }
  ];

  newAttachmentFiles: any[] = []; // 其他附件
  attachmentFiles: any[] = []; // 其他附件

  payerIdDropdown: { name: string, value: string }[] = [];

  readonly attachmentAccepts = '.xls, .xlsx, .doc, .docx, .ppt, .pptx, .pdf, .png, .jpg, .jpeg, .gif, .tsv';


  // 每個方案required狀態
  requiredStatus = false;

  // 方案下拉選單
  solutionDropdown: { name: string, value: string }[] = [];
  // 負責業務下拉選單
  salesDropdown: { name: string, value: string }[] = [];
  // 負責業務輸入狀態
  salesSearch = false

  ui = {
    isLoading: false,
    isFilesLoading: false
  };

  // 是否為業務身份
  isSales = false;



  // 將 input 傳入的 solutionHeaderData copy 一份
  originSolutionData!: OrderSolution;

  ngOnInit(): void {
    this.isSales = this.permission.flat['iam-v1.sales'] ? true : false;
    this.getSolutionLIstApi(this.solutionHeaderData.brand.id);



    this.handleRequired();
    this.getSalseList();


    if (this.solutionHeaderData.solutionId) {
      if (this.solutionHeaderData.id)
        this.getFiles();
      this.endate = this.solutionHeaderData.endDate ? this.solutionHeaderData.endDate : '';
    }
    // 合約其實日設定

    const endDate = DateTime.fromISO(this.solutionHeaderData.endDate);
    this.updateEndDateDurationStatus(endDate.toJSDate());

    this.getEndDateSelected();

    this.originSolutionData = _.cloneDeep(this.solutionHeaderData);
  }
  ngOnChanges(changes: SimpleChanges): void {
    let salesIndex = this.solutionHeaderData.sales;

    // this.getEndDateSelected();

    this.solutionHeaderData.solutionName = this.solutionName;

    this.contactPersonInput = salesIndex.employeeId ? salesIndex.email
      + salesIndex.name + '(' + salesIndex.employeeId + ')'
      : salesIndex.email + salesIndex.name;


  }


  //最終使用者自動輸入客戶端
  autoInputEndUser(e: TypeaheadMatch) {
    this.contactPersonInput = e.item.employeeId ? e.item.email + e.item.name + '(' + e.item.employeeId + ')' : e.item.email + e.item.name;
    this.solutionHeaderData.sales.id = e.item.id;
  }

  //  儲存方案ＡＰＩ
  // addSolution() {
  //   this.ui.isLoading = true;
  //   let saveSolution: SaveOrderBody = this.saveHandleBody(this.solutionHeaderData);
  //   this.orderAPI.postAddSolution(saveSolution, this.orderId).subscribe({
  //     next: (res) => {
  //       console.log('[order-detail] addSaveSolution done', res);
  //       if (res.info.success && res?.data) {
  //         this.alert.successAlert('新增方案成功');

  //         if(this.solutionHeaderData.brand.id === '7f1924cd-851b-4d6f-b6eb-2c24f0d77357') {
  //           this.microsoftProductComponent.createMicorosftProduct();
  //         }

  //         this.ui.isLoading = false;
  //       } else {
  //         this.ui.isLoading = false;
  //         this.alert.errorAlert(res.info.message);
  //       }
  //     },
  //     error: (err) => {
  //       console.error('[order-detail]  addSaveSolution fail', err);
  //       this.alert.errorAlert('[order-detail]  addSaveSolution fail' + err);
  //       this.ui.isLoading = false;

  //     },
  //   });
  // }

  /** 刪除原廠合約編號 */
  removeContractId(index: number) {
    let result: string[] = [];
    this.solutionHeaderData.contractIds.forEach((item) => {
      result.push(item);
    });
    result.splice(index, 1);
    this.solutionHeaderData.contractIds = result;
  }

  /** 增加原廠合約編號 */
  addContractId() {
    let result = [];
    this.solutionHeaderData.contractIds.forEach((item) => {
      result.push(item);
    });
    result.push(this.contractIdInput)
    this.solutionHeaderData.contractIds = result
    // 清除輸入欄位
    this.contractIdInput = '';
  }
  // 新增預繳項目
  addAdvancePaymentItem() {
    this.advancePaymentsIntable.push({ amount: '', remittanceDate: '' })
  }

  /**負責業務輸入ＡＰＩ */
  autoInputSaleTypeHead(): Observable<any> {
    return (new Observable<any>((observer: any) => {
      observer.next(this.contactPersonInput);
    })).pipe(
      mergeMap((token: string) => {
        if (token.length < 2) {
          this.salesSearch = false;
          return [];
        }
        this.salesSearch = false;



        const filter = new Filter();
        if (token) {
          filter.and.push({
            field: 'name',
            comparator: Comparator.like,
            value: token,
          });

          filter.and.push({
            field: 'brand',
            comparator: Comparator.equal,
            value: this.solutionHeaderData.brand.id,
          });


          if (!this.permission.flat['layout.iam.adminInput']) {
            let customerId = this.authService.currentUserValue?.role?.company.id

            filter.and.push({
              field: 'company',
              comparator: Comparator.equal,
              value: customerId,
            });
          }
        }

        return this.orderAPI.postSales(filter).pipe(
          map((res: any) => {
            if (res && res.data.length >= 1) {
              let datas: any[] = [];
              res.data.forEach((dataItem: any) => {
                datas.push(dataItem);
                this.salesSearch = false;
              });
              return datas;
            } else {
              let sales = this.solutionHeaderData.sales;
              this.salesSearch = false;
              sales.email = '';
              sales.employeeId = '';
              sales.id = '';
              sales.name = '';
              return []
            }


          }),
          catchError(err => {
            this.alert.errorAlert(err);
            let sales = this.solutionHeaderData.sales;
            this.salesSearch = false;
            sales.email = '';
            sales.employeeId = '';
            sales.id = '';
            sales.name = '';
            return [];
          }),
        );
      }),
    );

  }

  /**
   * end date 自定義日期
   * @param date 選擇到的日期
   */
  customizeEndDate(date: Date) {

    console.log(
      '[order-setting] customizeEndDate...',
      date,
      this.isEndDateInitialized,
    );

    // this.endDurations.forEach((duration, idx) => {
    //   this.endDurations[idx].checked = false;
    // });
    let endDate1 = DateTime.fromJSDate(date).toFormat('yyyy-LL-dd');
    this.endate = endDate1;
    this.solutionHeaderData.endDate = endDate1;
    this.updateEndDateDurationStatus(date);
    this.getEndDateSelected();
    if (this.endDateDropdown && this.isEndDateInitialized) {
      this.endDateDropdown.hide();
    }
    if (this.buttonStatus) {
      if (!this.isEndDateInitialized) {
        this.isEndDateInitialized = true;

      }
    }
    this.buttonStatus = true;
  }

  /**
   * 計算 start date 加上指定月份後，所得到的 end date
   * @param addMonths 指定 start date 往後加上多少月份
   */
  calculateEndDate(addMonths: number, index: number) {
    if (!this.solutionHeaderData.startDate) {
      return;
    }
    const endDate = DateTime.fromISO(this.solutionHeaderData.startDate)
      .plus({ months: addMonths })
      .plus({ days: -1 });

    if (addMonths === 0) {

      this.solutionHeaderData.endDate = '2099-12-31';
    } else {
      this.solutionHeaderData.endDate = endDate.toFormat('yyyy-LL-dd');

    }
    // this.endDurations.forEach((duration, idx) => {
    //   this.endDurations[idx].checked = false;
    // });

    // this.endDurations[index].checked = true;
    this.updateEndDateDurationStatus(endDate.toJSDate());
    this.getEndDateSelected();
    if (this.endDateDropdown) {
      this.endDateDropdown.hide();
    }
  }


  convertToString(event: any) {
    this.solutionHeaderData.startDate = DateTime.fromJSDate(event).toFormat('yyyy-LL-dd');
  }

  convertToDate(date: string, forceDayOne: boolean = false): Date {
    const d = new Date(date);
    if (forceDayOne) {
      d.setDate(1);
    }
    return d;
  }

  /** [typeahead] 客戶是否正在載入 */
  changeCustomerLoading(e: boolean): void {
    this.contactPersonLoading = e;
  }

  // 自定義欄位必填狀態
  customFieldsRequire(event: boolean) {
    this.solutionHeaderData.customFieldRequired = event;

    this.handleRequired();
  }

  /**
   * 刪除 server 端檔案
   * @param event Mouse event
   * @param index 檔案清單中的項目 index
   * @param type 上傳的檔案種類 (目錄)，ex: data, attachment
   */
  deleteFile(event: MouseEvent, index: number) {
    let files: any[] = [];
    files = this.attachmentFiles;

    this.modal.confirm(
      this.translate.instant('Confirm to delete this file?') +
      '\n\n' +
      files[index].filename,
      () => {
        // this.ui.isFileDeleting[files[index].id] = true;

        this.orderAPI.deleteOrderFile(this.orderId, files[index].id, this.solutionHeaderData.id).subscribe({
          next: (res) => {
            console.log('[order-setting] deleteFile done', res);
            // this.ui.isFileDeleting[files[index].id] = false;
            if (res.info && res.info.success) {
              this.alert.successAlert(
                this.translate.instant('Item has been deleted successfully!'),
              );
              setTimeout(() => {
                this.getFiles();
              }, 500);
            } else {
              const msg = this.api.parseError(res);
              this.alert.errorAlert(msg);
            }
          },
          error: (err) => {
            console.error('[order-setting] deleteFile fail', err);
            // this.ui.isFileDeleting[files[index].id] = false;
            const msg = this.api.parseError(err);
            this.alert.errorAlert(msg);
          },
        });


      },
    );

    event.stopPropagation();
  }



  /**
   * 刪除 local 端選擇即將上傳的檔案
   * @param event Mouse event
   * @param index 檔案清單中的項目 index
   * @param type 上傳的檔案種類 (目錄)，ex: data, attachment
   */
  deleteNewFile(event: MouseEvent, index: number) {
    this.newAttachmentFiles.splice(index, 1);
    event.stopPropagation();
  }
  // 刪除預繳資料
  deleteAdvancePayments(index: number) {
    this.advancePaymentsIntable.splice(index, 1);
  }


  /** 取得檔案路徑 */
  getFilePath(fileId: string) {
    return environment['apiUrl'] + this.orderAPI.getOrderFilePath(this.orderId, fileId, this.solutionHeaderData.id);
  }



  // 取得品牌
  getBrandApi(brandId: string) {

    this.orderAPI.getBrand(brandId).subscribe({
      next: (res) => {
        console.log('[orders] getBrand done', res);
        if (res.info.success && res?.data) {

          this.payerIdDropdown = [];
          res.data.payers.forEach((payerId: PayerID) => {
            this.payerIdDropdown.push({ name: payerId.nickName ? payerId.nickName : payerId.payerId, value: payerId.payerId });
          })
        } else {

        }
      },
      error: (err) => {
        console.error('[orders] getBrand fail', err);
        this.alert.errorAlert('[orders] getBrand fail' + err);

      },
    });
  }

  getSalseList() {
    this.salesSearch = true;
    const filter = new Filter();


    filter.and.push({
      field: 'brand',
      comparator: Comparator.equal,
      value: this.solutionHeaderData.brand.id,
    });


    if (!this.permission.flat['layout.iam.adminInput']) {
      let customerId = this.authService.currentUserValue?.role?.company.id

      filter.and.push({
        field: 'company',
        comparator: Comparator.equal,
        value: customerId,
      });
    }
    filter.pageSize = -1;

    this.orderAPI.postSales(filter).subscribe({
      next: (res) => {
        console.log('[orders] getSalse done', res);
        if (res.info.success && res?.data) {
          this.salesDropdown = [];
          res.data.forEach((item: any) => {
            let data: { name: string, value: string } = { name: '', value: '' };
            data.value = item.id;
            data.name = item.name ? item.name + (item.employeeId ? '(' + item.employeeId + ')' : '') : item.email;
            this.salesDropdown.push(data)
          });
          this.salesSearch = false;
        } else {
          this.salesSearch = false;
        }
      },
      error: (err) => {
        this.salesSearch = false;
        console.error('[orders] getSalse fail', err);
        this.alert.errorAlert('[orders] getSalse fail' + err);

      },
    });
  }

  // 取得方案
  getSolutionLIstApi(brandId: string) {
    this.orderAPI.getSolutionList(brandId).subscribe({
      next: (res) => {
        console.log('[order] getSolution done', res);
        if (res.info.success && res?.data) {

          res.data.forEach((brand: any) => {
            this.solutionDropdown.push({ name: brand.name, value: brand.solutionId });
          })
        }
      },
      error: (err) => {
        console.error('[order]  getSolution fail', err);
        this.alert.errorAlert('[order]  getSolution fail' + err);

      },
    });

  }

  getFileFolder() {
    return 'attachment';
  }

  /**
   * 取得 end date 被選擇到的下拉日期選項
   */
  getEndDateSelected() {
    if(this.solutionHeaderData.endDate === '2099-12-31') {
      this.endDateSelected = {
        checked: true,
        unit: 'not end date',
        value: 0
      }
    } else {
      this.endDateSelected = _.find(this.endDurations, ['checked', true]);
    }
  }

  /** 取得檔案 */
  getFiles() {
    this.attachmentFiles = [];
    // const folder = this.getFileFolder(type);attachment]
    const folder = 'attachment';
    this.ui.isFilesLoading = true;

    this.orderAPI.getOrderFileList(this.orderId, folder, this.solutionHeaderData.id).subscribe({
      next: (res) => {
        console.log('[order] getSolution done', res);
        if (res.info.success && res?.data) {
          this.attachmentFiles = res.data;
        }
      },
      error: (err) => {
        console.error('[order-setting] getFiles fail', err);
        this.ui.isFilesLoading = false;

      },
    });
  }

  brandIsMicrosoft() {
    return this.solutionHeaderData.brand.name === 'Microsoft';
  }

  // 處理必填欄位狀態
  handleRequired() {
    let index = this.solutionHeaderData;
    index.requiredStatus = false;
    if (this.status !== 'DRAFT') {
      if (!index.billingContactEmail || !index.erpNumber || !index.solutionId || !index.startDate || !index.timeInterval || !index.paymentDate || index.productsRequired
        || (this.brandIsMicrosoft() ? (!!index.payerId && !index.cloudId) : !index.cloudId) || !index.sales.id || index.customFieldRequired) {
        index.requiredStatus = true;
      }
    }
    this.required.emit({ index: this.solutionIndex, required: index.requiredStatus });
  }

  isValidFile(fileName: string) {
    let accepts = '';
    accepts = this.attachmentAccepts;
    const allows = accepts.replace(/ /g, '').split(',');
    const extDot = fileName.lastIndexOf('.');
    const ext = fileName.substring(extDot, fileName.length).toLowerCase();
    if (allows.includes(ext)) {
      return true;
    } else {
      return false;
    }
  }
  // 產品列表欄位必填狀態
  productRequire(event: boolean) {
    this.solutionHeaderData.productsRequired = event;

    this.handleRequired();
  }

  /**
   * 選擇要上傳的檔案
   * @param event 選擇檔案的 event
   * @param type 上傳的檔案種類 (目錄)，ex: data, attachment
   */
  selectFileToUpload(event: any) {
    const fileList: FileList = event.target.files;

    if (!fileList) {
      return;
    }

    const files = [];

    for (let i = 0; i < fileList.length; i++) {
      const item = fileList.item(i);
      console.log(fileList, item, this.isValidFile(item ? item.name : ''));
      if (!this.isValidFile(item ? item.name : '')) {
        this.alert.errorAlert(
          this.translate.instant('The extension of file "{{file}}" is not supported!', { file: item ? item.name : '' })
        );
        continue;
      }

      this.newAttachmentFiles.push(item);
      files.push(item);
    }



    if (files.length) {
      console.log('[order-setting] selectFileToUpload > uploadFilesTask...', files);

      this.uploadFilesTask(files, undefined).subscribe({
        next: (res) => {
          console.log('[order-setting] selectFileToUpload > uploadFilesTask done', res);
          setTimeout(() => {
            this.getFiles();
          }, 500);
        },
        error: (err) => {
          console.error('[order-setting] selectFileToUpload > uploadFilesTask fail', err);
        },
      });
    }
  }

  onValueChange(value: Date, isOrder: boolean = false): void {
    if (!isOrder) {
      value.setDate(1);
    }
    if (this.endDateSelected?.value) {
      value.setHours(12);
      value.setMinutes(0);
      value.setSeconds(0);
    }

  }
  // 處理儲存solution格式
  saveHandleBody(solution: OrderSolution): SaveOrderBody {
    let productResult: ProductSaveData
    if (this.solutionHeaderData.brand.id === '7f1924cd-851b-4d6f-b6eb-2c24f0d77357') {
      productResult = this.microsoftProductComponent.saveProduct();
    } else if (this.solutionHeaderData.brand.id === 'e936c95b-4295-432e-af0e-d6ecfb9d8368') {
      productResult = this.awsProductComponent.saveProduct();
    } else if (this.solutionHeaderData.brand.id === 'ed933ca8-1b44-4e58-9dfb-77d731b935c3') {
      productResult = this.googleProductComponent.saveProduct();
    } else if (this.solutionHeaderData.brand.id === '6e420d8e-b898-48ab-be82-ba148870609d') {
      productResult = this.ciscoProductComponent.saveProduct();
    } else if (this.solutionHeaderData.brand.id === 'a5ce669b-51ba-4698-919f-84b65bf7174e') {
      productResult = this.akamaiProductComponent.saveProduct();
    } else {
      productResult = this.orderProductComponent.saveProduct();
    }

    let result = new SaveOrderBody();
    result.originalStatus = solution.originalStatus;
    result.name = solution.solutionName;
    result.cloudId = solution.cloudId;
    result.brandId = solution.brand.id;
    result.quotationId = solution.quotationId;
    result.payerId = solution.payerId;
    result.id = solution.id;
    result.solutionId = solution.solutionId;
    result.erpNumber = solution.erpNumber;
    result.contractIds = solution.contractIds;
    result.startDate = solution.startDate;
    result.originalInfo = solution.originalInfo;
    result.solutionData = solution.solutionData;
    result.endDate = solution.endDate ? solution.endDate : '';
    result.exchangeRateType = solution.exchangeRateType;
    result.exchangeRate = solution.exchangeRate;
    result.paymentDate = solution.paymentDate;
    result.timeInterval = solution.timeInterval;
    result.salesId = solution.sales ? solution.sales.id : '';
    result.billingContactEmail = solution.billingContactEmail;
    result.status = solution.status;
    result.currencyType = solution.currencyType;
    result.products = productResult.productSave;
    result.deleteProductIds = productResult.deleteProductIds;
    result.tranceNote = this.checkUpdateData();
    return result;
  }
  // 傳遞微軟自定義欄位到父元件
  setFileMicrosoftData(microsoft: OrderSolution) {
    // this.solutionHeaderData.cloudId = microsoft.cloudId;
  }
  // 傳遞aws自定義欄位到父元件
  setFileAWSData(aws: OrderSolution) {
    // this.solutionHeaderData.cloudId = aws.cloudId;
    // this.solutionHeaderData.originalInfo = aws.originalInfo;

    // this.solutionHeaderData.solutionData = aws.solutionData;
  }

  //  更新方案ＡＰＩ
  // updateSolution() {
  //   this.ui.isLoading = true;
  //   let saveSolution: SaveOrderBody = this.saveHandleBody(this.solutionHeaderData);
  //   this.orderAPI.putAddSolution(saveSolution, this.orderId, this.solutionHeaderData.id).subscribe({
  //     next: (res) => {
  //       console.log('[order-detail] updateSolution done', res);
  //       if (res.info.success && res?.data) {
  //         this.solutionHeaderData.id = res.data.id;
  //         this.ui.isLoading = false;
  //         location.reload();
  //         this.alert.successAlert('更新方案成功');


  //       } else {
  //         this.alert.errorAlert(res.info.message);
  //         this.ui.isLoading = false;
  //       }
  //     },
  //     error: (err) => {
  //       console.error('[order-detail]  updateSolution fail', err);
  //       this.alert.errorAlert('[order-detail]  updateSolution fail' + err);
  //       this.ui.isLoading = false;
  //     },
  //   });
  // }


  /**
   * 更新 end date 下拉選項的狀態（是否有被勾選）
   */
  updateEndDateDurationStatus(end: Date) {
    this.endDurations.forEach((duration, idx) => {
      this.endDurations[idx].checked = false;
    });
    let endDate1 = DateTime.fromJSDate(end).toFormat('yyyy-LL-dd');
    if (end) {
      for (let i = 0; i < this.endDurations.length; i++) {
        const endDate = DateTime.fromISO(this.solutionHeaderData.startDate)
          .plus({ months: this.endDurations[i].value })
          .plus({ days: -1 })
          .toFormat('yyyy-LL-dd');
        if (endDate1 === endDate) {

          this.endDurations[i].checked = true;

          return;
        }
      }
    } else {

      this.endDurations[0].checked = true;
    }
    return;
  }


  /**
   * 新增檔案的 Observable
   * @param type 上傳的檔案種類 (目錄)，ex: data, attachment
   * @param files 上傳的檔案列表
   */
  uploadFilesTask(files: any[], neFileNames?: string[]): Observable<any> {
    // const folder = this.getFileFolder(type);attachment
    const folder = 'attachment';

    this.orderAPI.getOrderFileList(this.orderId, folder, this.solutionHeaderData.id).subscribe({
      next: (res) => {
        console.log('[order] getSolution done', res);
        if (res.info.success && res?.data) {
          this.attachmentFiles = res.data;
        }
      },
      error: (err) => {
        console.error('[order-setting] getFiles fail', err);
        this.ui.isFilesLoading = false;

      },
    });

    // to be fixed for attachment
    return this.orderAPI
      .uploadOrderFiles(this.orderId, files, folder, this.solutionHeaderData.id, neFileNames)
      .pipe(
        tap((res: { [key: string]: any }) => {
          console.log('[order-setting] uploadFiles done', res);
          if (res['info'] && res['info'].success) {
            this.alert.successAlert(
              // res['info'].message
              this.translate.instant('{{item}} been {{act}} successfully!', {
                item: this.translate.instant('data file'),
                act: this.translate.instant('imported')
              }),
            );
          } else {
            const msg = this.api.parseError(res);
            this.alert.errorAlert(msg);
          }
        }),
        catchError((err: any) => {
          console.error('[order-setting] uploadFiles fail', err);
          const msg = this.api.parseError(err);
          this.alert.errorAlert(msg);
          return of(msg);
        }),
      );
  }

  /** 比對子單單身欄位修改，加入儲存的 traceNote */
  checkUpdateData(): SaveTranceNote[] {
    const tranceNoteList: SaveTranceNote[] = [];
    const getItem = (id: string, list: Array<any>) => list.find(item => item.value === id);

    // payerId
    if (this.solutionHeaderData.payerId !== this.originSolutionData.payerId) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.orderDetailId = this.solutionHeaderData.id;
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'payerId';
      saveTranceNote.oldData = this.originSolutionData.payerId;
      saveTranceNote.newData = this.solutionHeaderData.payerId;
      saveTranceNote.message = 'payerId';
      tranceNoteList.push(saveTranceNote);
    }

    // 商機編號
    if (this.solutionHeaderData.quotationId !== this.originSolutionData.quotationId) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.orderDetailId = this.solutionHeaderData.id;
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'quotationId';
      saveTranceNote.oldData = this.originSolutionData.quotationId;
      saveTranceNote.newData = this.solutionHeaderData.quotationId;
      saveTranceNote.message = this.translate.instant('opportunity number');
      tranceNoteList.push(saveTranceNote);
    }

    // 負責業務
    if (this.solutionHeaderData.sales.id !== this.originSolutionData.sales.id) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.orderDetailId = this.solutionHeaderData.id;
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'salesId';
      saveTranceNote.oldData = this.originSolutionData.sales.name;
      saveTranceNote.newData = getItem(this.solutionHeaderData.sales.id, this.salesDropdown)?.name;
      saveTranceNote.message = this.translate.instant('responsible for business');
      tranceNoteList.push(saveTranceNote);
    }

    // 合約狀態
    if (this.solutionHeaderData.status !== this.originSolutionData.status) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.orderDetailId = this.solutionHeaderData.id;
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'status';
      saveTranceNote.oldData = getItem(this.originSolutionData.status, this.contractStatusDropdown)?.name;
      saveTranceNote.newData = getItem(this.solutionHeaderData.status, this.contractStatusDropdown)?.name;
      saveTranceNote.message = this.translate.instant('contract status');
      tranceNoteList.push(saveTranceNote);
    }

    // 帳單聯絡人eamil
    if (this.solutionHeaderData.billingContactEmail !== this.originSolutionData.billingContactEmail) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.orderDetailId = this.solutionHeaderData.id;
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'billingContactEmail';
      saveTranceNote.oldData = this.originSolutionData.billingContactEmail;
      saveTranceNote.newData = this.solutionHeaderData.billingContactEmail;
      saveTranceNote.message = this.translate.instant('billing Contact') + 'Email';
      tranceNoteList.push(saveTranceNote);
    }

    // 建單者
    if (this.solutionHeaderData.creator.name !== this.originSolutionData.creator.name) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.orderDetailId = this.solutionHeaderData.id;
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'creatorName';
      saveTranceNote.oldData = this.originSolutionData.creator.name;
      saveTranceNote.newData = this.solutionHeaderData.creator.name;
      saveTranceNote.message = this.translate.instant('order creator');
      tranceNoteList.push(saveTranceNote);
    }

    // cloudId
    if (this.solutionHeaderData.cloudId !== this.originSolutionData.cloudId) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.orderDetailId = this.solutionHeaderData.id;
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'cloudId';
      saveTranceNote.oldData = this.originSolutionData.cloudId;
      saveTranceNote.newData = this.solutionHeaderData.cloudId;
      saveTranceNote.message = 'cloudId';
      tranceNoteList.push(saveTranceNote);
    }

    // ERP 料號
    if (this.solutionHeaderData.erpNumber !== this.originSolutionData.erpNumber) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.orderDetailId = this.solutionHeaderData.id;
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'erpNumber';
      saveTranceNote.oldData = this.originSolutionData.erpNumber;
      saveTranceNote.newData = this.solutionHeaderData.erpNumber;
      saveTranceNote.message = this.translate.instant('erp serial number');
      tranceNoteList.push(saveTranceNote);
    }

    // 方案
    if (this.solutionHeaderData.solutionId !== this.originSolutionData.solutionId) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.orderDetailId = this.solutionHeaderData.id;
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'solutionId';
      saveTranceNote.oldData = getItem(this.originSolutionData.solutionId, this.solutionDropdown)?.name;
      saveTranceNote.newData = getItem(this.solutionHeaderData.solutionId, this.solutionDropdown)?.name;
      saveTranceNote.message = this.translate.instant('solution');
      tranceNoteList.push(saveTranceNote);
    }

    // 合約起始日
    if (this.solutionHeaderData.startDate !== this.originSolutionData.startDate) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.orderDetailId = this.solutionHeaderData.id;
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'startDate';
      saveTranceNote.oldData = this.originSolutionData.startDate;
      saveTranceNote.newData = this.solutionHeaderData.startDate;
      saveTranceNote.message = this.translate.instant('contract start date');
      tranceNoteList.push(saveTranceNote);
    }

    // 合約結束日期
    if (this.solutionHeaderData.endDate !== this.originSolutionData.endDate) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.orderDetailId = this.solutionHeaderData.id;
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'endDate';
      saveTranceNote.oldData = this.originSolutionData.endDate;
      saveTranceNote.newData = this.solutionHeaderData.endDate;
      saveTranceNote.message = this.translate.instant('contract end date');
      tranceNoteList.push(saveTranceNote);
    }

    // 出帳幣別
    if (this.solutionHeaderData.currencyType !== this.originSolutionData.currencyType) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.orderDetailId = this.solutionHeaderData.id;
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'currencyType';
      saveTranceNote.oldData = getItem(this.originSolutionData.currencyType, this.currencyTypeDropdown)?.name;
      saveTranceNote.newData = getItem(this.solutionHeaderData.currencyType, this.currencyTypeDropdown)?.name;
      saveTranceNote.message = this.translate.instant('currency type');
      tranceNoteList.push(saveTranceNote);
    }

    // 匯率類型
    if (this.solutionHeaderData.exchangeRateType !== this.originSolutionData.exchangeRateType) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.orderDetailId = this.solutionHeaderData.id;
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'exchangeRateType';
      saveTranceNote.oldData = getItem(this.originSolutionData.exchangeRateType, this.exchangeRateTypeDropdown)?.name;
      saveTranceNote.newData = getItem(this.solutionHeaderData.exchangeRateType, this.exchangeRateTypeDropdown)?.name;
      saveTranceNote.message = this.translate.instant('exchange rate type');
      tranceNoteList.push(saveTranceNote);
    }

    // 自訂匯率
    if (this.solutionHeaderData.exchangeRate !== this.originSolutionData.exchangeRate) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.orderDetailId = this.solutionHeaderData.id;
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'exchangeRate';
      saveTranceNote.oldData = this.originSolutionData.exchangeRate;
      saveTranceNote.newData = Number(this.solutionHeaderData.exchangeRate);
      saveTranceNote.message = this.translate.instant('custom exchange rate');
      tranceNoteList.push(saveTranceNote);
    }

    // 付費日
    if (this.solutionHeaderData.paymentDate !== this.originSolutionData.paymentDate) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.orderDetailId = this.solutionHeaderData.id;
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'paymentDate';
      saveTranceNote.oldData = this.originSolutionData.paymentDate;
      saveTranceNote.newData = Number(this.solutionHeaderData.paymentDate);
      saveTranceNote.message = this.translate.instant('pay day');
      tranceNoteList.push(saveTranceNote);
    }

    // 付費間隔
    if (this.solutionHeaderData.timeInterval !== this.originSolutionData.timeInterval) {
      const saveTranceNote = new SaveTranceNote();
      saveTranceNote.orderDetailId = this.solutionHeaderData.id;
      saveTranceNote.type = 'UPDATE';
      saveTranceNote.field = 'timeInterval';
      saveTranceNote.oldData = this.originSolutionData.timeInterval;
      saveTranceNote.newData = Number(this.solutionHeaderData.timeInterval);
      saveTranceNote.message = this.translate.instant('payment interval');
      tranceNoteList.push(saveTranceNote);
    }

    // =========== 商品列表 ============
    // oriData: solutionHeaderData
    // newData: newProductList
    // const productUpdateList = this.productComponent.checkUpdateProduct();
    // if (productUpdateList && productUpdateList.length > 0) {
    //   productUpdateList.forEach(product => {
    //     const saveTranceNote = new SaveTranceNote();
    //     saveTranceNote.orderDetailId = this.solutionHeaderData.id;
    //     saveTranceNote.type = 'UPDATE';
    //     saveTranceNote.field = 'products';
    //     saveTranceNote.oldData = product.record.oldData;
    //     saveTranceNote.newData = product.record.newData;
    //     saveTranceNote.message = this.translate.instant('order product list') + '：' + product.originalSku;
    //     tranceNoteList.push(saveTranceNote);
    //   })
    // }

    return tranceNoteList;
  }

  placeAnOrder() {
    if(this.solutionHeaderData.brand.id === '7f1924cd-851b-4d6f-b6eb-2c24f0d77357') {
      this.microsoftProductComponent.createMicorosftProduct();
    }

  }


}
