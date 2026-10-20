import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CartOrderDetail, ShoppingCarOrder } from '../core/models/commodity';
import { Filter } from '../core/models/filter';
import { RequestData } from '../core/models/request-data';
import { ResponseData } from '../core/models/response-data';
import { ApiService } from '../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class CommodityShopService {
  gateway: any;

  /** 模組共用變數 表單驗證 */
  public cartFromChecking = new BehaviorSubject<boolean>(false);

  constructor(private api: ApiService) {
    this.gateway = environment['gateway'];
  }

  /** 更新模組共用變數 表單驗證 */
  updateCheckingStatus(checking: boolean): void {
    this.cartFromChecking.next(checking);
  }

  /** 取得商品搜尋列表 (商店) */
  getProductList(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.product + 'storeProducts', new RequestData(filter));
  }

  /** 取得商品 Banner 圖片 (商店)(隨機產生五個) */
  getProductBanner(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.product + 'banners', new RequestData(filter));
  }

  /** 取得單一商品 (商店) */
  getProduct(id: string): Observable<ResponseData> {
    return this.api.get(this.gateway.product + 'storeProduct/' + id);
  }

  /** 取得商品分類列表(訪客) */
  getCloudCategoryList(): Observable<ResponseData> {
    return this.api.get(this.gateway.product + 'cloudMarketProducts/category');
  }

  /** 取得商品分類列表(登入) */
  getCategoryList(): Observable<ResponseData> {
    return this.api.get(this.gateway.product + 'storeProducts/category');
  }

  //////////////////////////
  //                      //
  //       下訂商品        //
  //                      //
  //////////////////////////

  /** 送出訂單前 新增下單庫存記錄 */
  sendOrder(data: CartOrderDetail) {
    return this.api.post(this.gateway.product + 'shoppingCartDetail', new RequestData(data));
  }

  /** 購買商品轉訂單 */
  sendShoppingCartOrder(data: ShoppingCarOrder) {
    return this.api.post(this.gateway.order + 'order/shoppingCar', new RequestData(data));
  }


  //////////////////////////
  //                      //
  //    商品購買填寫資料     //
  //                      //
  //////////////////////////

  /** 取得特定客戶資訊(客戶地址) */
  getCustomer(id: string): Observable<ResponseData> {
    return this.api.get(this.gateway.customer + 'customer/' + id);
  }

  /** 取得最終使用者 */
  getEndUserList(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.customer + 'customers', new RequestData(filter));
  }

  /** 取得連絡人資訊 */
  getContact(filter: Filter, id: string): Observable<ResponseData> {
    return this.api.post(this.gateway.customer + `customer/${id}/contacts`, new RequestData(filter));
  }

  /** 取得指定業務 */
  getSalesList(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.user + `user/sales`, new RequestData(filter));
  }


  //////////////////////////
  //                      //
  //        商品訂單       //
  //                      //
  //////////////////////////

  /** 查詢購買紀錄清單 */
  getShoppingOrderList(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.product + `shoppingCartDetails`, new RequestData(filter));
  }

  /** 查詢單一購買紀錄 */
  getShoppingOrderDetail(id: string): Observable<ResponseData> {
    return this.api.get(this.gateway.product + `shoppingCartDetail/${id}`);
  }


  //////////////////////////
  //                      //
  //        雲市集         //
  //                      //
  //////////////////////////

  /** 查詢雲市集banner */
  getcloudMarketProductBanners(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.product + 'cloudMarketProducts/banners', new RequestData(filter));
  }

  /** 查詢雲市集商品列表 */
  getcloudMarketProductList(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.product + 'cloudMarketProducts', new RequestData(filter));
  }

  /** 查詢雲市集指定商品 */
  getcloudMarketProduct(id: string): Observable<ResponseData> {
    return this.api.get(this.gateway.product + 'cloudMarketProduct/' + id);
  }

  /** 下載清單 */
  downloadList(data: any): Observable<ResponseData> {
    return this.api.postDownload(this.gateway.product + 'shoppingCartDetail/exportExcel', new RequestData(data));
  }

}
