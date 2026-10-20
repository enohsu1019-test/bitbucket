import { Comparator, Filter, Sort } from 'src/app/core/models/filter';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Brands, OrderManagement } from './brands';
import { BrandsApiService } from './brands-api.service';
import { AlertService } from '../core/services/alert.service';
import { PermissionService } from '../core/services/permission.service';
import { InTableConfig } from '@sysage/in-table';

@Component({
  selector: 'app-brands',
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.scss']
})
export class BrandsComponent {

  inTableConfig = new InTableConfig;

  constructor(
    private brandsAPI: BrandsApiService,
    private alert: AlertService,
    public permission: PermissionService,
  ) {
    /** in-table setting */
    this.inTableConfig.sitckyElemId = 'page-header';
  }

  brandDatas: Brands[] = [];


  // 搜尋表單
  filterForm = new FormGroup({
    status: new FormControl('',),
  });


  // filterStatus
  filterStatus = 1;
  // 連接
  links: string[] = [];






  // 設定分頁參數
  pageConfig = {
    boundaryLinks: false,
    totalItems: 0,
    itemsPerPage: 10,
    currentPage: 1,
    maxSize: 4,
  };

  // ui狀態
  ui = {
    isLoading: false
  }


  ngOnInit(): void {
    console.log(this.permission);
    this.getBrandListApi();
  }

  addOrderManagementName() {

  }

  // 重設搜尋狀態
  resetFilter() {
    this.filterForm.patchValue({
      status: '',
    });
    this.filterStatus = 1;

  }

  // 搜尋
  search() {

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
          let links: string[] = [];
          res.data.forEach((dataItem: Brands, itemIndex: number) => {
            links.push(dataItem.brandId + '/'+ dataItem.name);
            response.push(dataItem);
          });

          this.brandDatas = response;
          this.links = links;
          this.ui.isLoading = false;
        } else {
          this.ui.isLoading = false;
        }
      },
      error: (err) => {
        console.error('[brands] getBrandList fail', err);
        this.alert.errorAlert('[brands] getBrandList fail' + err);
        this.ui.isLoading = false;
      },
    });
  }

}
