import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CloudIdsData } from 'src/app/core/models/authorization';
import { Filter } from 'src/app/core/models/filter';
import { AlertService } from 'src/app/core/services/alert.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrderSolution, PayerID } from 'src/app/orders/orders';
import { OrdersService } from 'src/app/orders/orders.service';
import awsJson from './awsFiled.json';

@Component({
  selector: 'app-aws-field',
  templateUrl: './aws-field.component.html',
  styleUrls: ['./aws-field.component.scss']
})
export class AwsFieldComponent implements OnInit, OnChanges {
  @Input() status!: string
  @Input() solutionHeaderData!: OrderSolution;
  @Output() outputSolutionData = new EventEmitter<OrderSolution>();
  @Output() outPutCustomFiledRequired = new EventEmitter<boolean>();

  constructor(
    private alert: AlertService,
    private orderAPI: OrdersService,
    private authService: AuthService,
    private translate: TranslateService,
  ) { }

  /** 腳本資料 */
  customerFiles: { key: string, value: any }[] = [
    {
      key: 'isInvited',
      value: false
    }
  ];

  // 費用類型顯示資料
  costTypedView: { itemName: string, id: string }[] = awsJson.costTyped;

  // 費用類型資料
  costTypedDatas: { itemName: string, id: string }[] = [];
  /** 原廠info資料 */
  originalInfoDatas: { [key: string]: any } = {
    'rootEmail': '',
    'usageType': ['Usage']
  }

  payerIdDropdown: { name: string, value: string }[] = [];

  roleId = '';

  // 下拉選單基礎設定
  settings = {
    text: this.translate.instant('all inclusive'),
    selectAllText: this.translate.instant('select all'),
    unSelectAllText: this.translate.instant('unselect all'),
    filterSelectAllText: this.translate.instant('select all filtered results'),
    filterUnSelectAllText: this.translate.instant('unselect all filtered results'),
    enableSearchFilter: true,
    singleSelection: false,
    badgeShowLimit: 1,
    maxHeight: 250,
    position: 'bottom',
    autoPosition: false,
    lazyLoading: true,
    noDataLabel: this.translate.instant('no data found'),
    disabled: false,
    classes: 'dropdown-position'
  };



  ngOnInit(): void {
    this.roleId = this.authService.currentUserValue?.roleId ?this.authService.currentUserValue?.roleId : '';
    this.setPayerId();
    this.settings.disabled = false;
    let originalArray = Object.keys(this.originalInfoDatas);
    if (!this.solutionHeaderData.solutionData) {
      this.solutionHeaderData.solutionData = {};
    }


    if (!this.solutionHeaderData.solutionData.data || !this.solutionHeaderData.solutionData.data.customerFile || this.solutionHeaderData.solutionData.data.customerFile.length === 0) {
      this.solutionHeaderData.solutionData.data = {};
    } else {
      this.customerFiles = this.solutionHeaderData.solutionData.data.customerFile;
    }

    // if(!this.solutionHeaderData.originalInfo['aws']) {
    //   this.solutionHeaderData.originalInfo['aws'] = {}
    // } else {
    //   this.originalInfoDatas = this.solutionHeaderData.originalInfo['aws'];
    // }
    if (!this.solutionHeaderData.originalInfo) {
      this.solutionHeaderData.originalInfo = {};
    }


    originalArray.forEach((item) => {
      if (this.solutionHeaderData.originalInfo[item]) {
        this.originalInfoDatas[item] = this.solutionHeaderData.originalInfo[item];
      }
    });


    if (this.originalInfoDatas['usageType']) {
      this.originalInfoDatas['usageType'].forEach((item: string) => {
        this.costTypedDatas.push({ id: item, itemName: item })
      });
    }
    // this.getBrandApi(this.solutionHeaderData.brand.id);
    this.outputValue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['status'] && !changes['status'].firstChange) {
      this.settings = {
        text: this.translate.instant('all inclusive'),
        selectAllText: this.translate.instant('select all'),
        unSelectAllText: this.translate.instant('unselect all'),
        filterSelectAllText: this.translate.instant('select all filtered results'),
        filterUnSelectAllText: this.translate.instant('unselect all filtered results'),
        enableSearchFilter: true,
        singleSelection: false,
        badgeShowLimit: 1,
        maxHeight: 250,
        position: 'bottom',
        autoPosition: false,
        lazyLoading: true,
        noDataLabel: this.translate.instant('no data found'),
        // disabled: this.status !== 'DRAFT'
        disabled: false,
        classes: 'dropdown-position'
      };
      this.handleRequired();
    }

  }
  // 去除cloudId 空白字元
  checkBlankCharacters() {
    // let str = this.solutionHeaderData.cloudId.trim();
    let str = this.solutionHeaderData.cloudId.replace(/\s*/g,"");
    this.solutionHeaderData.cloudId = str;
    this.outputValue();
  }

  // 關閉費用類型下拉選單
  closeCostTypedDropdown() {
    let str: string[] = [];
    this.costTypedDatas.forEach((item) => {
      str.push(item.id)
    });

    this.originalInfoDatas['usageType'] = str;
    this.outputValue();
  }

  // 取得品牌
  // getBrandApi(brandId: string) {
  //   this.orderAPI.getBrand(brandId).subscribe({
  //     next: (res) => {
  //       console.log('[orders] getBrand done', res);
  //       if (res.info.success && res?.data) {
  //         this.payerIdDropdown = [];
  //         res.data.payers.forEach((payerId: PayerID) => {
  //           this.payerIdDropdown.push({ name: payerId.nickName ? payerId.nickName : payerId.payerId, value: payerId.payerId });
  //         })
  //       } else {

  //       }
  //     },
  //     error: (err) => {
  //       console.error('[orders] getBrand fail', err);
  //       this.alert.errorAlert('[orders] getBrand fail' + err);

  //     },
  //   });
  // }

  // 設定payerID
  setPayerId() {
    if(this.authService.currentUserValue) {
      this.payerIdDropdown = [];
      this.authService.currentUserValue.role?.brand.payers?.forEach((payerItem) => {
        this.payerIdDropdown.push({ name: payerItem.nickName ? payerItem.nickName : payerItem.payerId, value: payerItem.payerId });
      });
    }

  }




  // 處理欄位必填狀態
  handleRequired() {
    let index = this.solutionHeaderData;
    let status = false;
    if (!index.cloudId) {
      status = true;
    }
    this.outPutCustomFiledRequired.emit(status);
  }

  // 資料傳給父元件
  outputValue() {

    this.solutionHeaderData.solutionData.data.customerFile = this.customerFiles;
    this.solutionHeaderData.originalInfo = this.originalInfoDatas;
    // this.solutionHeaderData.cloudId = this.solutionHeaderData.cloudId.trim();
    this.outputSolutionData.emit(this.solutionHeaderData);
    this.handleRequired();
  }
}
