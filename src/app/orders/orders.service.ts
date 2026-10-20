import { Injectable } from '@angular/core';
import { Observable, filter } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Filter } from '../core/models/filter';
import { RequestData } from '../core/models/request-data';
import { ResponseData } from '../core/models/response-data';
import { ApiService } from '../core/services/api.service';
import { CreateMicrosoftProduct, RegisterData } from './orders';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  gateway: any;
  brand = 'brand-v1/';
  order = 'order-v1/';
  customer = 'customer-v1/';
  constructor(
    private api: ApiService
  ) {
    this.gateway = environment['gateway'];
    // this.gateway = 'brand-v1/';

  }


  /**--------------------brand------------------  */
  /** 搜尋品牌 */
  getBrandList(filterData: any): Observable<ResponseData> {
    return this.api.post(this.gateway.brand + 'brands', new RequestData(filterData));
  }
  /** 搜尋單一品牌 */
  getBrand(brandId: string): Observable<ResponseData> {
    return this.api.get(this.gateway.brand + 'brand/' + brandId);
  }

  /**--------------------solution------------------  */
  /** 搜尋方案列表 */
  getSolutionList(brandId: string): Observable<ResponseData> {
    return this.api.get(this.gateway.brand + 'brand/' + brandId + '/solutions');
  }
  // 取得共同欄位API
  getSolutionCommonField(brandId: string, solution: string): Observable<ResponseData> {
    return this.api.get(this.gateway.brand + 'brand/' + brandId + '/solution/' + solution + '/commonFields' );
  }
  // 取得特殊欄位API
  getSolutionspecialFields(brandId: string, solution: string): Observable<ResponseData> {
    return this.api.get(this.gateway.brand + 'brand/' + brandId + '/solution/' + solution + '/specialFields' );
  }


  /**--------------------order------------------  */
  /** 搜尋訂單列表 */
  getOrderList(filterData: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.order + 'orders', new RequestData(filterData));
  }
  /** 搜尋訂單 */
  getOrder(orderId: string): Observable<ResponseData> {
    return this.api.get(this.gateway.order + 'orders/' + orderId);
  }
  // 搜尋業務
  postSales(filterData:Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.user + 'user/sales', new RequestData(filterData));
  }
  // 新增訂單
  postOrder(data: any): Observable<ResponseData> {
    return this.api.post(this.gateway.order + 'order', new RequestData(data));
  }
  /** 新增訂單單身 */
  postAddSolution(data: any, orderId: string, ): Observable<ResponseData> {
    return this.api.post(this.gateway.order + 'orders/' + orderId + '/orderDetail', new RequestData(data));
  }
  // PUT /order-v1/orders/{orderId}
  /** 更新訂單單身 */
  putAddSolution(data: any, orderId: string, orderDetailId: string): Observable<ResponseData> {
    return this.api.put(this.gateway.order + 'orders/' + orderId + '/orderDetails/' + orderDetailId, new RequestData(data));
  }

  /** 更新訂單單頭 */
  putAddOrderHeader(data: any, orderId: string): Observable<ResponseData> {
    return this.api.put(this.gateway.order + 'orders/' + orderId, new RequestData(data));
  }

  /** 搜尋修訂紀錄 */
  postOrderHistory(data: any, orderId: string): Observable<ResponseData> {
    return this.api.post(this.gateway.order + `orders/${orderId}/history`, new RequestData(data));
  }

  /** 複製訂單 */
  copyOrder(orderId: string): Observable<ResponseData> {
    return this.api.get(this.gateway.order + 'orders/' + orderId + '/copy');
  }

  /**
   * 檢查cloud id是否存在
   * @param data cloud id
   */
  checkCloudId(data: {"cloudId": string}): Observable<ResponseData> {
    return this.api.post(this.gateway.order + 'orders/checkCloudId', new RequestData(data));
  }

  /**
   * 創建微軟
   * @param data 申請資料
   * @param orderDetailId 子單id
   */
  registerMicrosoftDomain(data: RegisterData, orderDetailId: string): Observable<ResponseData> {
    return this.api.post(this.gateway.order + orderDetailId + '/microsoft/customer', new RequestData(data));
  }

  /** 微軟原廠客戶是否在列表中 */
  getMicrosoftCustomerList(orderDetailId: string, cloudId: string): Observable<ResponseData> {
    return this.api.get(this.gateway.order + orderDetailId + '/Microsoft/customer?cloudId=' + cloudId);
  }

  /** 寄送微軟原廠邀請信 */
  getsSendCustomerEmail(orderDetailId: string, mpnId: string): Observable<ResponseData> {
    return this.api.get(this.gateway.order + orderDetailId + '/Microsoft/invitationLetter?mpnId=' + mpnId);
  }

  /** 確認客戶是否接受原廠合約 */
  getscheckMicrosoftCustomer(orderDetailId: string, cloudId: string): Observable<ResponseData> {
    return this.api.get(this.gateway.order + orderDetailId + '/Microsoft/checkMCA?cloudId=' + cloudId);
  }

  // ------------------------------------product--------------------------------------

  /** 微軟下單product下單 */
  postCreateMicorosftProduct(data: CreateMicrosoftProduct, orderDetailId: string): Observable<ResponseData> {
    return this.api.post(this.gateway.order + orderDetailId + '/Micorosft/order', new RequestData(data));
  }


  /**--------------------公司------------------  */
  /** 搜尋公司 */
  postCustomer(filterData: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.customer + 'customers', new RequestData(filterData));
  }

  /** 搜尋公司 */
  getCustomer(customerId: string): Observable<ResponseData> {
    return this.api.get(this.gateway.customer + 'customer/' + customerId);
  }
  /** 取得夥伴ＩＤ  */
  getgetPartnerId(customerId: string, filterData: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.customer + 'customer/' + customerId + '/partnerId' , new RequestData(filterData));
  }


  /**--------------------聯絡人------------------  */
  /** 搜尋聯絡人 */
  postContactPerson(customerId: string, filterData: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.customer + 'customer/' + customerId + '/contacts', new RequestData(filterData));
  }

  // ------- 訂單內的數據檔案 (xlsx) -------

  // getOrderFileList(orderId: string, folder: string = '/input'): Observable<ResponseData> {
  //   return this.api.get(this.gateway.billing + 'order/' + orderId + '/files?path=' + this.getSolutionFileFolder(folder));
  // }/files?path=/attachment

  getOrderFileList(orderId: string, folder: string = '/input', orderDetailId: string): Observable<ResponseData> {
    return this.api.get(this.gateway.order  + 'orders/' + orderId + '/orderDetails/' + orderDetailId + '/files?path=' +this.getSolutionFileFolder(folder) + ',/attachment');
  }

  getOrderFilePath(orderId: string, fileId: string , orderDetailId: string) {
    return this.gateway.order + 'orders/' + orderId + '/orderDetails/' + orderDetailId+ '/file?id=' + fileId;
  }
  getOrderFile(orderId: string, fileId: string, orderDetailId: string): Observable<ResponseData> {
    return this.api.get(this.getOrderFilePath(orderId, fileId, orderDetailId));
  }

  deleteOrderFile(orderId: string, fileId: string, orderDetailId: string): Observable<ResponseData> {
    return this.api.delete(this.getOrderFilePath(orderId, fileId, orderDetailId));
  }
  // POST /order-v1/orders/{orderId}/orderDetails/{orderDetailId}/files?path=/attachment
  uploadOrderFiles(orderId: string, files: File[], folder: string = '/input' , orderDetailId: string, newFileNames?: string[]): Observable<ResponseData> {
    const file: File = files[0];
    const formData: FormData = new FormData();
    // const name = newFileNames[0] ? newFileNames : file.name;
    formData.append('path', this.getSolutionFileFolder(folder));
    formData.append('files', file, file.name);
    // formData.append('path', this.getSolutionFileFolder(folder));
    // files.forEach((file, idx) => {
    //   formData.append('files', file, (newFileNames && newFileNames[idx]) ? newFileNames[idx] : file.name);
    // });


    return this.api.post(this.gateway.order + 'orders/' + orderId + '/orderDetails/' + orderDetailId + '/files?path=/attachment' , formData);
  }


  getSolutionFileFolder(folder: string) {
    if (folder[0] !== '/') {
      return '/' + folder;
    }
    return folder;
  }

  // ------------------------------------商品模組ＡＰＩ--------------------------------------
  /** 商品搜尋列表 */
  getProductList(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.product + 'products/orders', new RequestData(filter));
  }

  /**
   * 取得採購單商品filter
   * @param brandId 品牌id
   */
  getProductFilter(brandId: string): Observable<ResponseData> {
    return this.api.get(this.gateway.product + 'products/brands/' + brandId);
  }

  // ------------------------------------角色ＡＰＩ--------------------------------------
  /** 搜尋關聯 cloudId */
  getCloudIdList(id: string, filterData: Filter) {
    return this.api.post(this.gateway.iam + 'iam/' + id + '/cloudInfo/query', new RequestData(filterData));
  }


}
