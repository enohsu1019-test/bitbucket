import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InTableConfig } from '@sysage/in-table';
import { Dealer } from 'src/app/brands/brands';
import { BrandsApiService } from 'src/app/brands/brands-api.service';
import { Filter } from 'src/app/core/models/filter';
import { AlertService } from 'src/app/core/services/alert.service';
import { PermissionService } from 'src/app/core/services/permission.service';

@Component({
  selector: 'app-dealer-products',
  templateUrl: './dealer-products.component.html',
  styleUrls: ['./dealer-products.component.scss']
})
export class DealerProductsComponent implements OnInit{


  constructor(
    private brandsAPI: BrandsApiService,
    private alert: AlertService,
    private permission: PermissionService,
    private activatedRoute: ActivatedRoute,
  ) { }
  // 品牌ID
  brandId = '';
  // intable設定
  intableConfig = new InTableConfig();

  // intable資料
  intableDatas: Dealer[] = [];

  ui = {
    isLoading: false
  }
  ngOnInit(): void {
    this.brandId = this.activatedRoute.snapshot.params['brand'];
    this.getDealer();
  }



  //取得授權經銷商列表
  getDealer() {
    this.ui.isLoading = true;
    const filter = new Filter();
    filter.and = [];

    filter.pageSize = 10;

    filter.sort = {};
    this.brandsAPI.getDealer(filter,this.brandId).subscribe({
      next: (res) => {
        console.log('[dealer] getDealer done', res);
        if (res.info.success && res?.data) {
          this.intableDatas = res.data;
          this.ui.isLoading = false;
        } else {

        }
      },
      error: (err) => {
        this.ui.isLoading = false;
        console.error('[dealer] getDealer fail', err);
        this.alert.errorAlert('[dealer] ggetDealer fail' + err);

      },
    });

  }

}
