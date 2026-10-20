import { CompanyDropdown, PayerId, PayerID } from '../../../../brands';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { InTableConfig } from '@sysage/in-table';
import _ from 'lodash';
import { BrandsApiService } from '../../../../brands-api.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { Comparator, Filter } from 'src/app/core/models/filter';
import { PermissionService } from 'src/app/core/services/permission.service';


@Component({
  selector: 'app-brands-payer-id',
  templateUrl: './brands-payer-id.component.html',
  styleUrls: ['./brands-payer-id.component.scss']
})
export class BrandsPayerIdComponent implements OnInit {

  constructor(
    private brandsAPI: BrandsApiService,
    private alert: AlertService,
    private permission: PermissionService,
  ) { }

  @Input() payerIdDatas!: PayerID[];
  @Output() outPutPayerId = new EventEmitter<PayerID[]>();
  @Output() requiredStatus = new EventEmitter<boolean>();

  // 公司下拉選單
  companyDropdown: CompanyDropdown[] = [];
  // 編輯權限
  editStatus = false;
  // intable設定
  intableConfig = new InTableConfig();

  // intable資料
  intableDatas: PayerId[] = [];

  ngOnInit(): void {
    this.getCustomerId();
  }
  ngOnChanges(): void {
    this.editStatus = this.permission.flat['brand-v1.updateBrandById'] ? true : false;
    this.intableDatas = this.handleInitialData(this.payerIdDatas);


  }

  // 新增paylerid
  addPayerId() {
    let index: PayerId[] = [];
    this.intableDatas.forEach((intableItem) => {
      index.push(intableItem);
    });
    index.push(new PayerId());
    this.intableDatas = index;
    this.handleRequired();
  }


  // 刪除payerId
  deletePayerId(index: number) {
    if(this.editStatus) {
      this.intableDatas = this.intableDatas.filter((intableItem, intableIndex) => {
        return intableIndex !== index;
      });
      this.handleRequired();
    }

  }

  // 查詢客戶資料
  getCustomerId() {
    const filter = new Filter();
    filter.and = [];

    filter.pageSize = -1;

    filter.sort = {};

    this.brandsAPI.postCustomer(filter).subscribe({
      next: (res) => {
        console.log('[brand-paylerId] getCustomerDate done', res);
        if (res.info.success && res?.data) {
          this.companyDropdown = [];
          res.data.forEach((item: any) => {
            if (item.identityType.length === 1 && item.identityType[0] === 'ENDUSER') {
              // const company = new CompanyDropdown();
              // company.customerId = item.customerId;
              // company.name = item.customerName.nickCh + '/' + (item.customerName.nickEn ? item.customerName.nickEn : '');
              // company.identityType = item.identityType;
              // this.companyDropdown.push(company);
            } else {
              if (item.identityType.length !== 0) {
                const company = new CompanyDropdown();
                company.customerId = item.customerId;
                company.name = item.customerName.nickCh + '/' + (item.customerName.nickEn ? item.customerName.nickEn : '');
                company.identityType = item.identityType;
                this.companyDropdown.push(company);
              }

            }


          });
        } else {

        }
      },
      error: (err) => {
        console.error('[brand-paylerId] getCustomerDate fail', err);
        this.alert.errorAlert('[brand-paylerId] getCustomerDate fail' + err);

      },
    });

  }
  // 初始資料處理
  handleInitialData(payerId: PayerID[]): PayerId[] {
    let result: PayerId[] = [];
    payerId.forEach((payerIdItem) => {
      result.push({
        initial: false,
        payerId: payerIdItem.payerId,
        customerId: payerIdItem.customerId,
        identityType: payerIdItem.identityType,
        nickName: payerIdItem.nickName,
        customerName: '',

      });
    });
    return result
  }
  // 處理必填狀態
  handleRequired() {
    let requiredStatus = false;

    this.intableDatas.forEach((item) => {
      if (!item.customerId || !item.payerId || !item.nickName) {
        requiredStatus = true;
      }
    });

    this.requiredStatus.emit(requiredStatus);
  }

  // 輸出paylerId
  outputData() {
    let results: PayerID[] = [];
    this.intableDatas.forEach((intalbeItem) => {
      results.push({
        customerId: intalbeItem.customerId,
        nickName: intalbeItem.nickName,
        payerId: intalbeItem.payerId,
        identityType: intalbeItem.identityType
      });
    });
    this.outPutPayerId.emit(results);
  }

}
