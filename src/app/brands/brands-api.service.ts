import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseData } from '../core/models/response-data';
import { ApiService } from '../core/services/api.service';
import { RequestData } from '../core/models/request-data';
import { Filter } from '../core/models/filter';
import { environment } from 'src/environments/environment';
import { CommodityAttribute } from './brands';

@Injectable({
  providedIn: 'root'
})
export class BrandsApiService {
  gateway: any;
  customer = 'customer-v1/';
  constructor(private api: ApiService
  ) {
    this.gateway = environment['gateway'];
    // this.gateway = 'brand-v1/';
  }



  /**--------------------brand------------------  */
  /** 搜尋品牌 */
  getBrandList(filterData: any): Observable<ResponseData> {
    return this.api.post(this.gateway.brand + 'brands', new RequestData(filterData));
  }

  /** 搜尋品牌 */
  getBrand(brandId: string): Observable<ResponseData> {
    return this.api.get(this.gateway.brand + 'brand/' + brandId);
  }

  /** 新增品牌 */
  addBrand(filterData: any): Observable<ResponseData> {
    return this.api.post(this.gateway.brand + 'brand', new RequestData(filterData));
  }

  /** 更新品牌 */
  updateBrand(filterData: any, brandID: string) {
    return this.api.put(this.gateway.brand + 'brand/' + brandID, new RequestData(filterData));
  }

  /**--------------------solution------------------  */
  /** 搜尋方案列表 */
  getSolutionList(brandId: string): Observable<ResponseData> {
    return this.api.get(this.gateway.brand + 'brand/' + brandId + '/solutions');
  }

  /** 新增方案 */
  addSolution(filterData: any, brandId: string,): Observable<ResponseData> {
    return this.api.post(this.gateway.brand + 'brand/' + brandId + '/solution', new RequestData(filterData));
  }

  /** 取得單一方案 */
  getSolution(brandId: string, solutionId: string): Observable<ResponseData> {
    return this.api.get(this.gateway.brand + 'brand/' + brandId + '/solution/' + solutionId);
  }
  /** 更新方案 */
  updateSolution(filterData: any, brandID: string, solutionId: string) {
    return this.api.put(this.gateway.brand + 'brand/' + brandID + '/solution/' + solutionId, new RequestData(filterData));
  }

  /**--------------------script------------------  */


  /**
  * 從 local 端選擇檔案上傳到 server 存檔（新增檔案）
  * @param brandId 廠牌 id
  * @param solutionId 方案 id
  * @param files 選擇的檔案
  * @param [folder='/script'] 指定存檔路徑
  * @returns Observable
  */
  addSolutionFiles(brandId: string, solutionId: string, files: File[], folder: string = '/script', fileName?: string):
    Observable<ResponseData> {
    const file: File = files[0];
    const formData: FormData = new FormData();
    const name = fileName ? fileName : file.name;
    console.log('[api] addSolutionFiles name: ' + name);
    formData.append('files', file, name);
    formData.append('path', this.getSolutionFileFolder(folder));



    return this.api.post(this.gateway.brand + 'brand/' + brandId + '/solution/' + solutionId + '/files', formData);
  }
  // 取得腳本檔案列表
  getScriptList(brandId: string, solutionId: string, folder: string = '/script'): Observable<ResponseData> {
    return this.api.get(this.gateway.brand + 'brand/' + brandId + '/solution/' + solutionId + '/files?path=' + this.getSolutionFileFolder(folder));
  }

  // 刪除腳本檔案列表
  deleteScriptList(brandId: string, solutionId: string, id: string): Observable<ResponseData> {
    return this.api.delete(this.getSolutionFilePath(brandId, solutionId, id));
  }

  getSolutionFilePath(brandId: string, solutionId: string, id: string) {
    return this.gateway.brand + 'brand/' + brandId + '/solution/' + solutionId + '/file?id=' + id;
  }

  getSolutionFileFolder(folder: string) {
    if (folder[0] !== '/') {
      return '/' + folder;
    }
    return folder;
  }
  // 取得payerId 設定key
  getPayerIdSet(brandId: string, payerId: string) {
    return this.api.get(this.gateway.brand + 'brand/' + brandId + '/payers/' + payerId);
  }
  // 設定payerId 設定key
  postPayerIdSet(data: any, brandId: string, payerId: string): Observable<ResponseData> {
    return this.api.post(this.gateway.brand + 'brand/' + brandId + '/payers/' + payerId, new RequestData(data));
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


  /**--------------------授權經銷商列表------------------  */
  getDealer(filterData: Filter,borandId: string): Observable<ResponseData> {
    return this.api.post(this.gateway.brand + 'brand/' + borandId + '/dealers', new RequestData(filterData));
  }

  /**--------------------商品分類------------------------ */
  /**
   * 取得商品分類列表
   * @param id 品牌id
   */
  getClassificationList(filter: Filter, id: string): Observable<ResponseData> {
    return this.api.post(this.gateway.brand + 'brand/' + id + '/categoryList', new RequestData(filter));
  }

  /**
   * 新增/編輯/刪除 商品分類
   * @param data 更動過的分類資料
   * @param id 品牌id
   */
  editClassification(data: any, id: string): Observable<ResponseData> {
    return this.api.post(this.gateway.brand + 'brand/' + id + '/category', new RequestData(data));
  }

  /**--------------------商品屬性管理------------------  */
  /**
   * 取得商品屬性列表
   * @param borandId 品牌id
   */
  getCommodityAttributeList(filter: Filter, borandId: string): Observable<ResponseData> {
    return this.api.post(this.gateway.brand + 'brand/' + borandId + '/productAttributes', new RequestData(filter));
  }

  /**
   * 取得單一商品屬性
   * @param id 商品id
   * @param borandId 品牌id
   */
  getCommodityAttribute(id: string, borandId: string): Observable<ResponseData> {
    return this.api.get(this.gateway.brand + 'brand/' + borandId + '/productAttribute/' + id);
  }

  /**
   * 新增商品屬性
   * @param data 商品內容
   * @param borandId 品牌id
   */
  addCommodityAttribute(data: CommodityAttribute, borandId: string): Observable<ResponseData> {
    return this.api.post(this.gateway.brand + 'brand/' + borandId + '/productAttribute', new RequestData(data));
  }

  /**
   * 編輯特定商品屬性
   * @param data 商品內容
   * @param id 商品id
   * @param borandId 品牌id
   */
  editCommodityAttribute(data: CommodityAttribute, id: string, borandId: string): Observable<ResponseData> {
    return this.api.put(this.gateway.brand + 'brand/' + borandId + '/productAttribute/' + id, new RequestData(data));
  }

}
