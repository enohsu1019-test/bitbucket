import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Commodity } from 'src/app/core/models/commodity';
import { DataService } from 'src/app/core/services/data.service';
import { CommodityShopService } from '../commodity-shop.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  commodityId: string = '';
  commodity: Commodity = new Commodity();

  /** 圖片網址前綴 */
  apiUrl: any;

  /** 目前的使用者 */
  get currentUserValue() {
    return this.authService.currentUserValue;
  }

  constructor(
    private route: ActivatedRoute,
    private apiService: CommodityShopService,
    private data: DataService,
    private authService: AuthService,
  ) {
    this.apiUrl = environment['apiUrl'] + '/' + environment['gateway'].product.slice(0, -1);
  }

  ngOnInit(): void {
    this.commodityId = this.route.snapshot.params['product'];
    this.getCommodity();
  }

  /** API: 取得單一商品內容 */
  getCommodity() {
    // 檢查是否有登入，有登入正常流程，沒登入走雲市集訪客流程
    const getProduct = this.currentUserValue && this.currentUserValue.accessToken ?
                       this.apiService.getProduct(this.commodityId) :
                       this.apiService.getcloudMarketProduct(this.commodityId);
    getProduct.subscribe({
      next: (res) => {
        console.log('[commodity] getProduct done: ', res);
        if (res && res.info && res.info.success && res.data) {
          this.commodity = res.data;
          this.data.setIdLabel('products', res.data.productId, res.data.productName);
          this.commodity.defaultImage = res.data.defaultImage ? this.apiUrl + res.data.defaultImage : '';
        };
      },
      error: (err) => {
        console.error('[commodity] getProduct fail: ', err);
      }
    });
  }

}
