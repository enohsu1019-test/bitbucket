import { Commodity, ImageType } from './../core/models/commodity';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiInterface } from '../core/models/apis/api-interface';
import { Filter } from '../core/models/filter';
import { RequestData } from '../core/models/request-data';
import { ResponseData } from '../core/models/response-data';
import { ApiService } from '../core/services/api.service';
import { DataService } from '../core/services/data.service';

@Injectable({
  providedIn: 'root'
})
export class CommodityService {
  gateway: any;

  constructor(
    private api: ApiService
  ) {
    this.gateway = environment['gateway'];
  }

  //////////////////////////
  //                      //
  //       CMP API        //
  //                      //
  //////////////////////////

  /** 商品搜尋列表 */
  getProductList(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.product + 'products', new RequestData(filter));
  }

  /** 取得代理商公司下拉選單列表 */
  getCompanyList(filter: Filter): Observable<ResponseData> {
    // return this.api.post(this.gateway.iam + 'iam/query', new RequestData(filter));
    return this.api.post(this.gateway.customer + 'customers', new RequestData(filter));
  }

  /** 取得銷售對象下拉選單列表 */
  getSalesTargets(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.customer + 'customers', new RequestData(filter));
  }

  /** 取得 CRM Mapping Table */
  getBrandMappingList(brandId: string, customerId: string): Observable<ResponseData> {
    return this.api.get(this.gateway.brand + `brandMappingList?brand=${brandId}&customer=${customerId}`);
  }

  /** 取得單一商品 */
  getProduct(id: string): Observable<ResponseData> {
    return this.api.get(this.gateway.product + 'product/' + id);
  }

  /** 新增商品 */
  addProduct(data: Commodity): Observable<ResponseData> {
    return this.api.post(this.gateway.product + 'product', new RequestData(data));
  }

  /** 更新商品 */
  updateProduct(id: string, data: Commodity): Observable<ResponseData> {
    return this.api.put(this.gateway.product + 'product/' + id, new RequestData(data));
  }

  /** 上傳圖片 */
  uploadProductImg(id: string, file: File, type: ImageType) {
    const formData: FormData = new FormData();
    formData.append('files', file);

    let apiUrl = type !== ImageType.description ?
      this.gateway.product + 'product/' + id + '/files?path=/' + type :
      this.gateway.product + 'products/files?path=/' + type;

    return this.api.post(apiUrl, formData);
  }

  /** 刪除圖片 */
  deleteProductImg(id: string, imgId: string, type: ImageType) {
    let apiUrl = type !== ImageType.description ?
      this.gateway.product + 'product/' + id + '/file?id=' + imgId :
      this.gateway.product + 'products/file?id=' + imgId;

    return this.api.delete(apiUrl);
  }

  /** 取得方案列表 */
  getSolutionList(brandId: string): Observable<ResponseData> {
    return this.api.get(this.gateway.brand + 'brand/' + brandId + '/solutions');
  }

  /** admin 取得品牌列表 */
  getBrandList(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.brand + 'brands', new RequestData(filter));
  }

  /** 取得匯率 */
  getExchangeRate(): Observable<ResponseData> {
    return this.api.get(this.gateway.product + 'exchangeRate');
  }

  /**
   * 取得商品分類列表
   * @param id 品牌id
   */
  getClassificationList(filter: Filter, id: string): Observable<ResponseData> {
    return this.api.post(this.gateway.brand + 'brand/' + id + '/categoryList', new RequestData(filter));
  }

  /**
   * 匯入excel
   * @param data 銷售對象跟excel檔案
   */
  uploadExcel(data: FormData): Observable<ResponseData> {
    return this.api.post(this.gateway.product + 'products/inputExcel', data);
  }

  /**
   * 取得商品欄位
   * @param id 商品id
   */
  getProductAttributes(id: string, filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.brand + 'brand/' + id + '/productAttributes', new RequestData(filter));
  }


  //////////////////////////
  //                      //
  //       CRM API        //
  //                      //
  //////////////////////////

  /** 從 CRM 取得原廠料號 */
  getCrmPriceBookList(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.product + 'crmPriceBookList', new RequestData(filter));
  }

  /** 從 CRM 取得品名規格及原廠價格 */
  getCrmPriceBookCompany(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.product + 'crmPriceBook', new RequestData(filter));
  }

}
