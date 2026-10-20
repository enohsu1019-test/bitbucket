import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExtraBilling, ExtraBillingSave } from 'src/app/core/models/bills';
import { Filter } from 'src/app/core/models/filter';
import { RequestData } from 'src/app/core/models/request-data';
import { ResponseData } from 'src/app/core/models/response-data';
import { ApiService } from 'src/app/core/services/api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BillsDetailService {

  constructor(private api: ApiService) { }

  ////////////////////////////////////
  //                                //
  //             帳單                //
  //                                //
  ////////////////////////////////////

  /** 搜尋帳單 */
  postInvoiceList(orderId: string, filter: Filter): Observable<ResponseData> {
    return this.api.post(environment['gateway'].invoice + 'invoice/' + orderId + '/list', new RequestData(filter));
  }

  /** 取得帳單檔案資訊 PDF、PNG */
  getInvoiceFile(orderId: string, year: string, month: string, fileType: string): Observable<ResponseData> {
    return this.api.get(environment['gateway'].invoice + `invoice/${orderId}?year=${year}&month=${month}&fileType=${fileType}`);
  }

  /** 取得帳單檔案 */
  getInvoiceScreenshot(screenshot: string) {
    return this.api.getDownload(environment['apiUrl'] + '/' + environment['gateway'].invoice + 'output' + `?id=${screenshot}`);
  }

  /** 鎖定/解鎖帳單 */
  lockedInvoice(orderId: string, year: string, month: string, lock: boolean): Observable<ResponseData> {
    return this.api.post(environment['gateway'].invoice + `invoice/${orderId}/lockedInvoice?year=${year}&month=${month}`, new RequestData(lock));
  }

  /** 儲存發票號碼 */
  saveInvoiceNumber(orderId: string, year: string, month: string, data: string): Observable<ResponseData> {
    return this.api.post(environment['gateway'].invoice + `invoice/${orderId}/invoiceNumber?year=${year}&month=${month}`, new RequestData(data));
  }

  /** 匯出原廠使用量 */
  exportInvoiceExcel(orderId: string, year: string, month: string): Observable<ResponseData> {
    return this.api.postDownload(environment['gateway'].invoice + `invoice/${orderId}/exportExcel?year=${year}&month=${month}`);
  }

  /** 匯出客戶原廠使用量 */
  exportCustomExcel(orderId: string, year: string, month: string): Observable<ResponseData> {
    return this.api.postDownload(environment['gateway'].invoice + `invoice/${orderId}/customExportExcel?year=${year}&month=${month}`);
  }

  /**
   * 取得 runInvoiceTest 的執行結果
   * @param fileId 檔案 id (runInvoiceTest 執行成功會回傳)
   */
   getInoviceOutputUrl(screenshot: string) {
    return environment['apiUrl'] + '/' + environment['gateway'].invoice + 'output' + `?id=${screenshot}`;
  }

  /** 更新帳單 */
  getUpdateInvoice(orderId: string, year: string, month: string): Observable<ResponseData> {
    return this.api.get(environment['gateway'].invoice + `invoice/${orderId}/runInvoice?year=${year}&month=${month}`);
  }

  /** 取得錯帳項目 */
  getExtraBilling(orderId: string, year: string, month: string): Observable<ResponseData> {
    return this.api.get(environment['gateway'].invoice + `invoice/${orderId}/yearMonth/${year}-${month}/extraCost`);
  }

  /** 新增錯帳項目 */
  addExtraBilling(orderId: string, year: string, month: string, data: ExtraBillingSave): Observable<ResponseData> {
    return this.api.post(environment['gateway'].invoice + `invoice/${orderId}/yearMonth/${year}-${month}/extraCost`, new RequestData(data));
  }
  /** 更新錯帳項目 */
  updateExtraBilling(orderId: string, year: string, month: string, data: ExtraBillingSave, id: string): Observable<ResponseData> {
    return this.api.put(environment['gateway'].invoice + `invoice/${orderId}/yearMonth/${year}-${month}/extraCost/${id}`, new RequestData(data));
  }

  /** 刪除錯帳項目 */
  deleteExtraBilling(orderId: string, year: string, month: string, id: string): Observable<ResponseData> {
    return this.api.delete(environment['gateway'].invoice + `invoice/${orderId}/yearMonth/${year}-${month}/extraCost/${id}`);
  }

}
