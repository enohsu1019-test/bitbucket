import { ApiInterface } from './../core/models/apis/api-interface';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { ResponseData } from '../core/models/response-data';
import { environment } from 'src/environments/environment';
import { DataService } from '../core/services/data.service';
import { Filter } from '../core/models/filter';
import { RequestData } from '../core/models/request-data';
import { Contact, Customer } from './customers';
import { map, tap } from 'rxjs/operators';
import _ from 'lodash';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  gateway: any;
  crmApi: ApiInterface;
  crmGateway: any;

  constructor(private api: ApiService,
              private data: DataService,
              private domSanitizer: DomSanitizer)
  {
    this.gateway = environment['gateway'];
    this.crmGateway = environment['crmInfo'].gateway;
    this.crmApi = this.api.otherHosts['crm'];
  }

  //////////////////////////
  //                      //
  //       Function       //
  //                      //
  //////////////////////////



  //////////////////////////
  //                      //
  //         Api          //
  //                      //
  //////////////////////////

  /** 13.查詢crm公司 */
  getCompanyList(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.customer + 'crmCustomers', new RequestData(filter));
  }

  /**
   * 14.取得CRM客戶資料-地址電話
   * @param customerId 公司ID
   */
  getLocationCompanyList(customerId: string): Observable<ResponseData> {
    return this.api.post(this.gateway.customer + 'crmCustomer/' + customerId + '/location', {});
  }

  /**
   * 15.取得CRM聯絡人資料
   * @param customerId 公司ID
   */
  getCRMContactList(customerId: string, filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.customer + 'customer/' + customerId + '/crmContacts', new RequestData(filter));
  }

  /** 1.取得客戶列表 */
  getCustomerList(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.customer + 'customers', new RequestData(filter)).pipe(
      tap((res: ResponseData) => {
        if (res.data && res.data.length) {
          res.data.forEach((customer: Customer) => this.data.setIdLabel('customerIds', customer.customerId, customer.customerName.fullCh));
        }
      })
    );
  }

  /**
   * 2.取得客戶資料 (一筆)
   * @param customerId 公司編號
   */
  getCustomer(customerId: string): Observable<ResponseData> {
    return this.api.get(this.gateway.customer + 'customer/' + customerId).pipe(
      tap((res: ResponseData) => {
        if (res.data) {
          this.data.setIdLabel('customerIds', res.data.customerId, res.data.customerName.fullCh);
        }
      })
    );
  }

  /**
   * 5.新增客戶
   * @param customer 客戶資料
   */
  addCustomer(customer: any): Observable<ResponseData> {
    return this.api.post(this.gateway.customer + 'customer', new RequestData(customer));
  }

  /**
   * 3.刪除客戶
   * @param customer 資料
   */
  delCustomer(customer: Customer): Observable<ResponseData> {
    return this.api.put(this.gateway.customer + 'customer/' + customer.customerId, new RequestData(customer));
  }

  /** 11.取得產業別列表 */
  getIndustryList(): Observable<ResponseData> {
    return this.api.get(this.gateway.customer + 'industry/list');
  }

  /** 12.取得職務列表 */
  getJobList(): Observable<ResponseData> {
    return this.api.get(this.gateway.customer + 'title/list');
  }

  /**
   * 7.取得聯絡人列表(公司底下的聯絡人)
   * @param customerId 客戶id
   */
  getContactList(customerId: string, filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.customer + 'customer/' + customerId + '/contacts', new RequestData(filter));
  }

  /**
   * 9.新增聯絡人
   * @param contact 聯絡人資料
   * @param customer 客戶資料
   */
   addContact(contact: any, customer: Customer): Observable<ResponseData> {
    return this.api.post(this.gateway.customer + 'customer/' + customer.customerId + '/contact', new RequestData(contact));
  }

  /**
   * 10.刪除聯絡人
   * @param customerId 客戶id
   * @param contactId 聯絡人id
   */
  delContact(customerId: string, contactId: string): Observable<ResponseData> {
    const data = {
      status: 0
    };
    return this.api.put(this.gateway.customer + 'customer/' + customerId + '/contact/' + contactId, new RequestData(data));
  }

  /**
   * 與crm同步客戶資料
   * @param customerId 客戶id
   */
  syncCustomer(customerId: string): Observable<ResponseData> {
    return this.api.put(this.gateway.customer + 'crmCustomer/' + customerId, {});
  }

  /**
   * 上傳說明檔案 or LOGO與公司資訊圖檔
   * @param customerId 客戶id
   * @param file 圖像檔案
   * @param name info or logo
   */
  uploadFile(customerId: string, files: File, name: string): Observable<ResponseData> {
    const formData: FormData = new FormData();
    const apiUrl = name === 'info' ? 'description' : 'logo';
    formData.append('path', '/' + apiUrl);
    formData.append('files', files, files.name);
    return this.api.post(this.gateway.customer + 'customer/' + customerId + '/files/' + apiUrl, formData);
  }

  /**
   * 取得上傳圖檔
   * @param customerId 客戶id
   * @param name info or logo
   */
  getUploadFile(customerId: string, name: string): Observable<ResponseData> {
    const apiUrl = name === 'info' ? 'description' : 'logo';
    return this.api.get(this.gateway.customer + 'customer/' + customerId + '/files?path=/' + apiUrl);
  }

  /**
   * 刪除上傳圖檔
   * @param customerId 客戶id
   * @param upLoadId 圖檔id
   * @returns
   */
  delUploadFile(customerId: string, upLoadId: string): Observable<ResponseData> {
    return this.api.delete(this.gateway.customer + 'customer/' + customerId + '/file?id=' + upLoadId);
  }

  /**
   * 預覽圖片
   * @param customerId 客戶id
   * @param upLoadId 圖檔id
   */
  previewUploadFile(customerId: string, upLoadId: string): Observable<SafeUrl> {
    return this.api.getDownload(environment['apiUrl'] + '/' + this.gateway.customer + 'customer/' + customerId + '/image?id=' + upLoadId)
    .pipe(
      map(e => this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(e.blob ?? new Blob)))
    );
  }

  /**
   * 取得partner id
   * @param customerId 客戶id
   */
  getPartnerId(customerId: string, filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.customer + 'customer/' + customerId + '/partnerId', new RequestData(filter));
  }

}
