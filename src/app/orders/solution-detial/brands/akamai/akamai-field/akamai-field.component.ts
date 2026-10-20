import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { OrderSolution } from 'src/app/orders/orders';
import { OrdersService } from 'src/app/orders/orders.service';

@Component({
  selector: 'app-akamai-field',
  templateUrl: './akamai-field.component.html',
  styleUrls: ['./akamai-field.component.scss']
})
export class AkamaiFieldComponent implements OnInit, OnChanges {
  @Input() status!: string
  @Input() solutionHeaderData!: OrderSolution;
  @Output() outputSolutionData = new EventEmitter<OrderSolution>();
  @Output() outPutCustomFiledRequired = new EventEmitter<boolean>();

  constructor(
    private alert: AlertService,
    private orderAPI: OrdersService,
  ) { }

  /** 腳本資料 */
  customerFiles: {key: string, value: any}[] = [
    {
      key: 'title',
      value: ''
    }
  ];
  /** 原廠info資料 */
  originalInfoDatas: { [key: string]: any } = {
  }

  ngOnInit(): void {

    let originalArray = Object.keys(this.originalInfoDatas);
    if (!this.solutionHeaderData.solutionData) {
      this.solutionHeaderData.solutionData = {};
    }

    if (!this.solutionHeaderData.solutionData.data || !this.solutionHeaderData.solutionData.data.customerFile || this.solutionHeaderData.solutionData.data.customerFile.length === 0) {
      this.solutionHeaderData.solutionData.data = {};
    } else {
      this.customerFiles = this.solutionHeaderData.solutionData.data.customerFile;
    }

    if (!this.solutionHeaderData.originalInfo) {
      this.solutionHeaderData.originalInfo = {};
    }


    originalArray.forEach((item) => {
      if (this.solutionHeaderData.originalInfo[item]) {
        this.originalInfoDatas[item] = this.solutionHeaderData.originalInfo[item];
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['status'] && !changes['status'].firstChange)
      this.handleRequired();
  }

  // 去除cloudId 空白字元
  checkBlankCharacters() {
    // let str = this.solutionHeaderData.cloudId.trim();
    let str = this.solutionHeaderData.cloudId.replace(/\s*/g,"");
    this.solutionHeaderData.cloudId = str;
    this.outputValue();
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
    this.outputSolutionData.emit(this.solutionHeaderData);
    this.handleRequired();
  }

}
