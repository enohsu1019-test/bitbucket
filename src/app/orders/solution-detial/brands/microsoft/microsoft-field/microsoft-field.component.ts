import { Component, EventEmitter, Input, Output, OnInit, TemplateRef, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Filter } from 'src/app/core/models/filter';
import { AlertService } from 'src/app/core/services/alert.service';
import { ContactPerson, OrderHeader, OrderSolution, PartnerIdData, RegisterData } from 'src/app/orders/orders';
import { OrdersService } from 'src/app/orders/orders.service';

@Component({
  selector: 'app-microsoft-field',
  templateUrl: './microsoft-field.component.html',
  styleUrls: ['./microsoft-field.component.scss']
})
export class MicrosoftFieldComponent implements OnInit, OnChanges {
  @Input() customerId!: string;
  @Input() status!: string;
  @Input() solutionHeaderData!: OrderSolution;
  @Input() orderHeader!: OrderHeader;
  @Input() salesModel!: string;
  @Input() headerForm!: FormGroup;
  @Input() mode!: string;
  @Output() outputSolutionData = new EventEmitter<OrderSolution>();
  @Output() outPutCustomFiledRequired = new EventEmitter<boolean>();
  @ViewChild('customerEmail', { static: false }) childModal!: ModalDirective;
  constructor(
    private orderAPI: OrdersService,
    private alert: AlertService,
    private modalService: BsModalService,
  ) {
    /** BsModal設定 */
    /** 大視窗顯示 */
    this.modalService.config.class = 'modal-xl';
    /** 禁止點背景取消跳窗 */
    this.modalService.config.ignoreBackdropClick = true;
  }

  /** loading */
  loading = false;
  /** check domain loading */
  checkDomainLoading = false;

  /** cloud id是否存在 */
  cloudIdExist!: boolean;

  /** 申請步驟 */
  step = {
    // 填寫資料
    one: true,
    // 確認是否送出
    two: false,
    // 完成畫面
    three: false,
    // 錯誤
    error: false
  };
  /** 錯誤訊息 */
  errorInfo: any;

  /** 主要網域(無後綴) */
  domain = '';

  // 原廠授權狀態
  factoryAuthorizedStatus = false;

  /** 原廠授權讀取狀態 */
  checkFactoryLoading = false;

  /** 申請資料(送出) */
  registerData = new RegisterData;
  /** 申請資料(表單) */
  applicationForm = new FormGroup({
    /** 名字：中英文 */
    firstName: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z\u4e00-\u9fa5]+')]),
    /** 姓：中英文 */
    lastName: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z\u4e00-\u9fa5]+')]),
    /** 信箱：XXX@XXX.XXX */
    email: new FormControl('', [Validators.required, Validators.pattern('^[\\w\.\-]+[@][\\w\.\-]+[.][a-zA-Z]{2,4}$')]),
    /** 電話：數字 */
    phone: new FormControl('', [Validators.required, Validators.pattern('[0-9]+')]),
    /** 統一編號：8碼數字 */
    serial: new FormControl('', [Validators.required, Validators.pattern('[0-9]{8}')]),
    /** 公司法定名稱：中英文.,空白 */
    legalName: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z\u4e00-\u9fa5\\s\.\,]+')]),
    /** 網域名稱：英數_-. */
    domain: new FormControl('', [Validators.required, Validators.pattern('[\\w\.\-]+')]),
    /** 地址1：中英數_-.,空白 */
    addressOne: new FormControl('', [Validators.required, Validators.pattern('[\u4e00-\u9fa5\\w\\s\.\,\-]+')]),
    /** 地址2：中英數_-.,空白 */
    addressTwo: new FormControl('', Validators.pattern('[\u4e00-\u9fa5\\w\\s\.\,\-]+')),
    /** 國家：中英文 */
    country: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z\u4e00-\u9fa5]+')]),
    /** 鄉鎮市區：中英文 */
    city: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z\u4e00-\u9fa5]+')]),
    /** 縣市：中英文 */
    state: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z\u4e00-\u9fa5]+')]),
    /** 郵遞區號：5~6碼 */
    postalCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{5,6}')]),
    /** Microsoft 經銷商 Id */
    mpnid: new FormControl(''),
  });

  /** BsModal */
  modalRef!: BsModalRef;


  /** 原廠info資料 */
  originalInfoDatas: { [key: string]: any } = {
    'partnerId': '',
    'rootEmail': ''
  }

  /** partnerId下拉選單 */
  partnerIdDropdowns: { name: string, value: string }[] = [];

  ngOnInit(): void {
    let originalArray = Object.keys(this.originalInfoDatas);
    this.domain = this.solutionHeaderData.cloudId;

    if(!this.solutionHeaderData.originalInfo) {
      this.solutionHeaderData.originalInfo = {};
    }

    if (!this.solutionHeaderData.solutionData) {
      this.solutionHeaderData.solutionData = {};
    }

    // if(!this.solutionHeaderData.solutionData.data || !this.solutionHeaderData.solutionData.data.customerFile ||  this.solutionHeaderData.solutionData.data.customerFile.length === 0) {
    //   this.solutionHeaderData.solutionData.data = {};

    // } else {
    //   this.customerFiles = this.solutionHeaderData.solutionData.data.customerFile;
    // }

    originalArray.forEach((item) => {
      if (this.solutionHeaderData.originalInfo[item]) {
        this.originalInfoDatas[item] = this.solutionHeaderData.originalInfo[item];
      }
    });
    if (this.customerId) {
      this.getPartnerId(this.customerId);
    }
    // this.dataLoadding();
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customerId'] && !changes['customerId'].firstChange)
      this.getPartnerId(this.customerId);
    if (changes['status'] && !changes['status'].firstChange)
      this.handleRequired();

    if (changes['salesModel'] && !changes['salesModel'].firstChange)
    if(changes['salesModel'].currentValue !== 'DISTRIBUTION') {
      this.originalInfoDatas['partnerId'] = '';
      this.outputValue();
    } else {
      this.outputValue();
    }
  }

  // 去除cloudId 空白字元
  checkBlankCharacters() {
    // let str = this.solutionHeaderData.cloudId.trim();
    let str = this.domain.replace(/\s*/g,"");
    this.domain = str;
    this.outputValue();
  }

  /** 帶入資料 */
  dataLoadding(billingContact: ContactPerson[]) {
    this.applicationForm.controls['firstName'].setValue((billingContact[0] && billingContact[0].chineseName !== '') ? billingContact[0].chineseName : this.orderHeader.billingContact.chineseName);
    this.applicationForm.controls['lastName'].setValue('');
    this.applicationForm.controls['email'].setValue((billingContact[0] && billingContact[0].email !== '') ? billingContact[0].email : this.orderHeader.billingContact.email);
    this.applicationForm.controls['phone'].setValue('');
    this.applicationForm.controls['serial'].setValue(this.headerForm.get('customerSerial')?.value !== '' ? this.headerForm.get('customerSerial')?.value : this.orderHeader.customer?.serialNumber);
    this.applicationForm.controls['legalName'].setValue(this.headerForm.get('customerName')?.value !== '' ? this.headerForm.get('customerName')?.value : this.orderHeader.customer?.name.replace('/',''));
    this.applicationForm.controls['domain'].setValue(this.domain);
    this.applicationForm.controls['addressOne'].setValue(this.headerForm.get('billingAddress')?.value !== '' ? this.headerForm.get('billingAddress')?.value : this.orderHeader.customerAddress);
    this.applicationForm.controls['addressTwo'].setValue('');
    this.applicationForm.controls['country'].setValue('TW');
    this.applicationForm.controls['city'].setValue('');
    this.applicationForm.controls['state'].setValue('');
    this.applicationForm.controls['postalCode'].setValue('');
    if (this.salesModel === 'DISTRIBUTION') {
      this.applicationForm.controls['mpnid'].setValue(this.originalInfoDatas['partnerId']);
    } else {
      this.applicationForm.controls['mpnid'].setValue('');
    }
  }

  /** 檢查cloud id是否存在 */
  checkCloudId() {
    // 擋連點
    if (!this.checkDomainLoading) {
      this.checkDomainLoading = true;
      const data = {
        cloudId: this.solutionHeaderData.cloudId
      };
      this.orderAPI.checkCloudId(data).subscribe({
        next: (res) => {
          if (res.info && res.info.success) {
            const data = res.data !== null ? res.data : [];
            this.cloudIdExist = data.existsCloudId;
            if(this.cloudIdExist)
            this.getMicrosoftCustomerListAPI();
          }
          this.checkDomainLoading = false;
        },
        error: (err) => {
          console.error('[check cloud id fail]', err);
          this.checkDomainLoading = false;
        }
      });
    }
  }

  /** 註冊申請跳窗 */
  requestForm(template: TemplateRef<any>) {
    // if (this.mode === 'add') {
      let billingContact: ContactPerson[] = [];
      let filter = new Filter();
      this.orderAPI.postContactPerson(this.customerId, filter).subscribe({
        next: (res) => {
          if (res && res.data && res.info && res.info.success) {
            billingContact = res.data.filter((item: ContactPerson) => item.contactId === this.headerForm.get('billingContact')?.value);
            this.dataLoadding(billingContact);
          } else {
            this.alert.errorAlert(res.info.message);
          }
        },
        error: (err) => {
          this.alert.errorAlert(err);
        }
      });
    // } else {
    //   let data: ContactPerson[] = [];
    //   this.dataLoadding(data);
    // }
    this.modalRef = this.modalService.show(template);
  }

  /** 送出申請 */
  sendApplication() {
    this.loading = true;
    this.step.two = false;
    this.registerData.firstName = this.applicationForm.get('firstName')?.value;
    this.registerData.lastName = this.applicationForm.get('lastName')?.value;
    this.registerData.email = this.applicationForm.get('email')?.value;
    this.registerData.phoneNumber = this.applicationForm.get('phone')?.value;
    this.registerData.organizationRegistrationNumber = this.applicationForm.get('serial')?.value;
    this.registerData.companyName = this.applicationForm.get('legalName')?.value;
    this.registerData.domain = this.applicationForm.get('domain')?.value + '.onmicrosoft.com';
    this.registerData.addressLine1 = this.applicationForm.get('addressOne')?.value;
    this.registerData.addressLine2 = this.applicationForm.get('addressTwo')?.value;
    this.registerData.country = 'TW';
    this.registerData.city = this.applicationForm.get('city')?.value;
    this.registerData.state = this.applicationForm.get('state')?.value;
    this.registerData.postalCode = this.applicationForm.get('postalCode')?.value;
    this.registerData.mpnId = this.applicationForm.get('mpnid')?.value;
    this.orderAPI.registerMicrosoftDomain(this.registerData, this.solutionHeaderData.id).subscribe({
      next: (res) => {
        if (res.info && res.info.success) {
          this.step.three = true;
        } else {
          this.step.error = true;
          this.errorInfo = res.info.message;
        }
        this.loading = false;
      },
      error: (err) => {
        this.step.error = true;
        this.errorInfo = err;
        console.error('[register fail]', err);
        this.loading = false;
      }
    });
  }

  /** 取消 */
  tmpHide() {
    this.modalService.hide();
    // this.dataLoadding();
    setTimeout(() => {
      this.step.one = true;
      this.step.two = false;
      this.step.three = false;
      this.step.error = false;
    }, 300);
  }

  // 處理欄位必填狀態this.originalInfoDatas
  handleRequired() {
    let index = this.solutionHeaderData;
    let originalIndex = this.originalInfoDatas;
    let status = false;
    if (this.status !== 'DRAFT') {
      if (!index.cloudId || !originalIndex['rootEmail'] || !this.domain || !index.originalStatus) {

        status = true;
      }

      if (this.salesModel === 'DISTRIBUTION' && !originalIndex['partnerId']) {
        status = true;
      }
    }
    this.outPutCustomFiledRequired.emit(status);
  }

  // 資料傳給父元件
  outputValue() {
    this.solutionHeaderData.cloudId = this.domain;
    this.solutionHeaderData.originalInfo = this.originalInfoDatas;
    this.outputSolutionData.emit(this.solutionHeaderData);
    this.handleRequired();
  }

  /** . */
  dot() {
    return ((new Date()).getTime() / 1000) % 4;
  }


  /**取得partnerId */
  getPartnerId(customerId: string) {
    let filter = new Filter();
    this.orderAPI.getgetPartnerId(customerId, filter).subscribe({
      next: (res) => {
        if (res.info.success && res?.data) {
          this.partnerIdDropdowns = [];
          res.data.forEach((partnerId: PartnerIdData) => {
            this.partnerIdDropdowns.push({ name: partnerId.partnerId, value: partnerId.partnerId });
          })
        } else {

        }
      },
      error: (err) => {
        this.alert.errorAlert('[orders] getPartnerId fail' + err);

      },
    });
  }
  // 檢查原廠授權列表ＡＰＩ
  getMicrosoftCustomerListAPI () {
    this.checkFactoryLoading = true;
    this.orderAPI.getMicrosoftCustomerList(this.solutionHeaderData.id, this.solutionHeaderData.cloudId).subscribe({

      next: (res) => {
        if (res.info.success && res?.data) {
          if (res.data.length >= 1) {
            this.getscheckMicrosoftCustomerAPI();
          } else {
            this.childModal.show();
            this.checkFactoryLoading = false;
            this.solutionHeaderData.originalStatus = false;
            this.handleRequired();
          }
        } else {
          this.alert.errorAlert(res.info.message);
          this.checkFactoryLoading = false;
          this.solutionHeaderData.originalStatus = false;
          this.handleRequired();
        }

      },
      error: (err) => {
        this.alert.errorAlert('[orders]  getMicrosoftCustomerList' + err);
        this.solutionHeaderData.originalStatus = false;
        this.checkFactoryLoading = false;
        this.handleRequired();
      },
    });
  }
  // 寄送微軟原廠邀請信
  getsSendCustomerEmailAPI() {
    this.childModal?.hide();
    this.orderAPI.getsSendCustomerEmail(this.solutionHeaderData.id, this.salesModel === 'DISTRIBUTION' ? this.originalInfoDatas['partnerId']: '0' ).subscribe({
      next: (res) => {
        if (res.info.success && res?.data) {
          this.alert.successAlert(res.info.message);
        } else {
          this.alert.errorAlert(res.info.message);
        }
      },
      error: (err) => {
        this.alert.errorAlert('[orders]  getsSendCustomerEmail' + err);

      },
    });
  }

  // 確認客戶是否接受原廠合約
  getscheckMicrosoftCustomerAPI() {
    this.childModal?.hide();
    this.orderAPI.getscheckMicrosoftCustomer(this.solutionHeaderData.id, this.solutionHeaderData.cloudId).subscribe({
      next: (res) => {
        if (res.info.success && res?.data) {
          this.solutionHeaderData.originalStatus = res.data;
          this.checkFactoryLoading = false;
        } else {
          // this.alert.errorAlert();
          this.solutionHeaderData.originalStatus = false;
          this.checkFactoryLoading = false;
        }
        this.outputValue();
      },
      error: (err) => {
        this.alert.errorAlert('[orders]  getscheckMicrosoftCustomerAPI' + err);
        this.solutionHeaderData.originalStatus = false;
        this.checkFactoryLoading = false;
        this.outputValue();

      },
    });
  }
  // 關閉原廠授權列表視窗
  hideChildModal(): void {
    this.childModal?.hide();
  }



}
