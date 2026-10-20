import { CommodityShopService } from './../commodity-shop.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CartFormValue, CommodityCart } from 'src/app/core/models/commodity';
import { DataService } from 'src/app/core/services/data.service';

@Component({
  selector: 'app-order-list-detail',
  templateUrl: './order-list-detail.component.html',
  styleUrls: ['./order-list-detail.component.scss']
})
export class OrderListDetailComponent implements OnInit {

  orderId: string = '';
  orderDetail: CartFormValue = new CartFormValue();
  orderList: CommodityCart[] = [];
  orderPriceDetail!: { orderPrice: number, orderTax: number, orderTotal: number };

  ui = {
    isLoading: false
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: CommodityShopService,
    private data: DataService
  ) { }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.params['cartOrder'];
    console.log(this.orderId);

    this.getOrderDetail();
  }

  /** API: 取得單一購買記錄 */
  getOrderDetail() {
    this.ui.isLoading = true;
    this.apiService.getShoppingOrderDetail(this.orderId).subscribe({
      next: (res) => {
        console.log('[order-list-detail] getOrderDetail done: ', res);
        if (res && res.info && res.info.success && res.data) {
          this.data.setIdLabel('cartOrders', res.data.id, res.data.orderId);

          this.orderDetail = res.data.userDetail;
          this.orderList = res.data.productDetails;
          this.orderPriceDetail = {
            orderPrice: res.data.orderAmount,
            orderTax: res.data.tax,
            orderTotal: res.data.totalAmount,
          }
        };
        this.ui.isLoading = false;
      },
      error: (err) => {
        console.error('[order-list-detail] getOrderDetail fail: ', err);
        this.ui.isLoading = false;
      }
    });
  }


}
