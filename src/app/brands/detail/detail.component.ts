import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Filter, Sort } from 'src/app/core/models/filter';
import { AlertService } from 'src/app/core/services/alert.service';
import { PermissionService } from 'src/app/core/services/permission.service';
import { BrandDatas, Brands, PayerID } from '../brands';
import { BrandsApiService } from '../brands-api.service';
import {BrandsPayerIdComponent} from './subcomponent/payerId/brands-payer-id/brands-payer-id.component'

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent  {
  @ViewChild(BrandsPayerIdComponent)
  brandManagement!: BrandsPayerIdComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    private brandsAPI: BrandsApiService,
    private alert: AlertService,
    private permission: PermissionService,
  ) { }


  brandDatas = new BrandDatas();

  // 品牌下拉選單
  brandDropdownDatas: Brands[] = [];
  // 品牌名稱
  brandName = '';

  // 編輯權限
  editStatus = false;

  // 搜尋表單
  filterForm = new FormGroup({
    brand: new FormControl('ed933ca8-1b44-4e58-9dfb-77d731b935c3',),
  });

  filterStatus = 0;
  // 模式
  mode = '';

  // payerId必填狀態
  payerIdRequiredStatus = false;

  /** tab選擇事件 */
  selected = new FormControl(0);

  // ui狀態
  ui = {
    isLoading: false
  }
  ngOnInit(): void {
    this.editStatus = this.permission.flat['brand-v1.updateBrandById'] ? true : false;
    if(this.activatedRoute.snapshot.params['brand1']) {
      this.brandName = this.activatedRoute.snapshot.params['brand1'];
      this.getBrandApi(this.activatedRoute.snapshot.params['brand'])
      this.mode = 'edit';
      } else {
        this.mode = 'add';

        this.getBrandListApi();
    }

  }

  // 取得品牌ＡＰＩ
  getBrandListApi() {
    this.ui.isLoading = true;
    let filter = new Filter();
    filter.pageSize = 10;
    filter.pageIndex = 1;
    filter.sort = { modifyDate: Sort.desc };
    filter.and = [];


    this.brandsAPI.getBrandList(filter).subscribe({
      next: (res) => {
        console.log('[brands] getBrandList done', res);
        if (res.info.success && res?.data) {
          let response: Brands[] = [];
          res.data.forEach((dataItem: Brands) => {
            response.push(dataItem);
          });
          this.ui.isLoading = false;
          this.brandDropdownDatas = response;

        } else {
          this.ui.isLoading = false;
        }
      },
      error: (err) => {
        this.ui.isLoading = false;
        console.error('[brands] getBrandList fail', err);
        this.alert.errorAlert('[brands] getBrandList fail' + err);

      },
    });
  }

  // 取得品牌
  getBrandApi(brandId: string) {
    this.ui.isLoading = true;
    this.brandsAPI.getBrand(brandId).subscribe({
      next: (res) => {
        console.log('[brands] getBrand done', res);
        if (res.info.success && res?.data) {
          if(res.data.status === 'enable') {
            this.filterStatus = 1;
          } else {
            this.filterStatus = 0;
          }
          this.brandDatas = res.data;
          this.ui.isLoading = false;
        } else {
          this.ui.isLoading = false;
        }
      },
      error: (err) => {
        console.error('[brands] getBrand fail', err);
        this.alert.errorAlert('[brands] getBrand fail' + err);
        this.ui.isLoading = false;
      },
    });
  }

  handlePayerRequired(required: boolean) {
    this.payerIdRequiredStatus = required
  }


  // 儲存品牌
  saveBrandApi() {
    this.brandManagement.outputData();
    if(this.filterStatus === 1) {
      this.brandDatas.status = 'enable'
    } else {
      this.brandDatas.status = 'disable';
    }
    this.ui.isLoading = true;
    if(this.mode === 'edit') {
      this.brandsAPI.updateBrand(this.brandDatas, this.activatedRoute.snapshot.params['brand']).subscribe({
        next: (res) => {
          console.log('[brands] addBrand done', res);
          if (res.info.success && res?.data) {
            this.alert.successAlert('品牌編輯成功');
            location.reload();
            // this.brandDatas = res.data;
            this.ui.isLoading = false;
          } else {
            this.ui.isLoading = false;
            this.alert.errorAlert(res.info.exception.message);
          }
        },
        error: (err) => {
          console.error('[brands] addBrand fail', err);
          this.alert.errorAlert('[brands] addBrand fail' + err);
          this.ui.isLoading = false;
        },
      });
    } else {
      this.brandsAPI.addBrand(this.brandDatas).subscribe({
        next: (res) => {
          console.log('[brands] addBrand done', res);
          if (res.info.success && res?.data) {
            this.alert.successAlert('品牌新增成功');
            location.reload();
            // this.brandDatas = res.data;
            this.ui.isLoading = false;
          } else {
            this.ui.isLoading = false;

            this.alert.errorAlert(res.info.exception.message);
          }
        },
        error: (err) => {
          console.error('[brands] addBrand fail', err);
          this.alert.errorAlert('[brands] addBrand fail' + err);
          this.ui.isLoading = false;
        },
      });

    }

  }

  // 同步子元件payerID資料
  syncPayerId(payerId: PayerID[]) {
    this.brandDatas.payers = payerId;
  }

}
