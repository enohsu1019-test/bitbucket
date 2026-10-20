import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PayerKeySet } from 'src/app/brands/brands';
import { BrandsApiService } from 'src/app/brands/brands-api.service';
import { AlertService } from 'src/app/core/services/alert.service';
import _ from 'lodash';
@Component({
  selector: 'app-payer-id-set-key',
  templateUrl: './payer-id-set-key.component.html',
  styleUrls: ['./payer-id-set-key.component.scss']
})
export class PayerIdSetKeyComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private brandsAPI: BrandsApiService,
    private alert: AlertService,
    private route: Router,
  ) { }

  // 品牌ID
  brandId = ''
  brandName = ''
  // 資料是否變過
  isDataChange = false;
  // payerId資料
  intableDatas: PayerKeySet[] = [];
  // 原始資料
  originalData = new PayerKeySet();


  // 設定分頁參數
  pageConfig = {
    boundaryLinks: false,
    totalItems: 0,
    itemsPerPage: 10,
    currentPage: 1,
    maxSize: 4,
  };

  payerId = '';



  // ui狀態
  ui = {
    isLoading: false,
  }

  ngOnInit(): void {
    this.payerId = this.activatedRoute.snapshot.params['id'];
    this.brandId = this.activatedRoute.snapshot.params['brand'];
    this.brandName = this.activatedRoute.snapshot.params['brand1'];
    this.getPayerIdSetApi();
  }

  getPayerIdSetApi() {
    this.brandsAPI.getPayerIdSet(this.brandId, this.payerId).subscribe({
      next: (res) => {
        console.log('[PayerIdSet] getPayerIdSet done', res);
        if (res.info.success && res?.data) {
          this.originalData = _.cloneDeep(res.data);
          this.intableDatas[0] = _.cloneDeep(res.data);

        } else {

          this.intableDatas.push(new PayerKeySet());

        }
      },
      error: (err) => {
        console.error('[PayerIdSet] getPayerIdSet fail', err);
        this.alert.errorAlert('[PayerIdSet] getPayerIdSet fail' + err);

      },
    });
  }

  handleDataChange() {
    let result = false;
    let intableIndex = this.intableDatas[0];
    if (intableIndex.key !== this.originalData.key ||
        intableIndex.value !== this.originalData.value ||
        intableIndex.accountId !== this.originalData.accountId ||
        intableIndex.dataSource !== this.originalData.dataSource ||
        intableIndex.schemaName !== this.originalData.schemaName ||
        intableIndex.openCostExportAPI !== this.originalData.openCostExportAPI) {
      result = true;
    }
    this.isDataChange = result;
  }

  addPayerIdSet() {
    const data = new PayerKeySet;
    data.id = this.intableDatas[0].id;
    data.key = this.intableDatas[0].key;
    data.value = this.intableDatas[0].value;
    data.accountId = this.intableDatas[0].accountId;
    data.dataSource = this.intableDatas[0].dataSource;
    data.schemaName = this.intableDatas[0].schemaName;
    data.openCostExportAPI = this.intableDatas[0].openCostExportAPI;

    this.brandsAPI.postPayerIdSet(data, this.brandId, this.payerId).subscribe({
      next: (res) => {
        console.log('[PayerIdSet] postPayerIdSet done', res);
        if (res.info.success && res?.data) {
          this.alert.successAlert('修改成功');
          this.route.navigate([`main/brands/${this.brandId}/${this.brandName}`]);
        } else {
          this.alert.successAlert(res.info.message);
        }
      },
      error: (err) => {
        console.error('[PayerIdSet] postPayerIdSet fail', err);
        this.alert.errorAlert('[PayerIdSet] postPayerIdSet fail' + err);
      },
    });



  }

}
