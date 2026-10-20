import { Injectable } from '@angular/core';
import { DataService } from '../core/services/data.service';
import { ApiService } from '../core/services/api.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ResponseData } from '../core/models/response-data';
import { Filter } from '../core/models/filter';
import { RequestData } from '../core/models/request-data';
import { AnalysisDataInput } from './cost-analysis';

@Injectable({
  providedIn: 'root'
})
export class CostAnalysisService {
  gateway: any;

  constructor(private api: ApiService,
              private data: DataService,)
  {
    this.gateway = environment['gateway'];
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

  /** payerId cloudId 關聯 */
  getUserRights(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.user + 'aliasList', new RequestData(filter));
  }

  // AWS filter資料
  postAWSFilter(data: any): Observable<ResponseData> {
    return this.api.post(this.gateway.awsCostAnalysis + 'costExplorer/AWS/filter', new RequestData(data));
  }

  /** 取得專案設定列表 */
  getProjectList(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.awsCostAnalysis + 'projectManagementList', new RequestData(filter));
  }

  /**
   * 新增專案
   * @param data 專案資料
   */
  addProject(data: any): Observable<ResponseData> {
    return this.api.post(this.gateway.awsCostAnalysis + 'projectManagement', new RequestData(data));
  }

  /**
   * 編輯專案
   * @param data 專案資料
   */
  editProject(data: any): Observable<ResponseData> {
    return this.api.put(this.gateway.awsCostAnalysis + 'projectManagement/' + data.id, new RequestData(data));
  }

  /**
   * 刪除專案
   * @param id 專案id
   */
  delProject(id: string): Observable<ResponseData> {
    return this.api.delete(this.gateway.awsCostAnalysis + 'projectManagement/' + id);
  }

  /** 取得成本分析列表 */
  getCostList(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.awsCostAnalysis + 'costAnalysisSettingList', new RequestData(filter));
  }

  /**
   * 新增成本分析Cloud ID
   * @param data Cloud ID
   */
  addCost(data: any): Observable<ResponseData> {
    return this.api.post(this.gateway.awsCostAnalysis + 'costAnalysisSetting', new RequestData(data));
  }

  /**
   * 刪除成本分析Cloud ID
   * @param id Cloud ID
   */
  delCost(id: string): Observable<ResponseData> {
    return this.api.delete(this.gateway.awsCostAnalysis + 'costAnalysisSetting/' + id);
  }

  /**
   * 取得指定成本分析詳細資料
   * @param id Cloud ID
   */
  getCostDetailList(id: string, filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.awsCostAnalysis + id + '/costAnalysisSettingByServiceList', new RequestData(filter));
  }

  /**
   * 新增指定成本分析
   * @param data 服務資料
   * @param id Cloud ID
   */
  addCostDetail(data: any, id: string): Observable<ResponseData> {
    return this.api.post(this.gateway.awsCostAnalysis + id + '/costAnalysisSettingByService', new RequestData(data));
  }

  /**
   * 編輯指定成本分析
   * @param data 服務資料
   * @param cloudId Cloud ID
   */
  editCostDetail(data: any, cloudId: string): Observable<ResponseData> {
    return this.api.put(this.gateway.awsCostAnalysis + cloudId + '/costAnalysisSettingByService/' + data.id, new RequestData(data));
  }

  /**
   * 刪除指定成本分析
   * @param cloudId Cloud ID
   * @param id Cloud ID
   */
  delCostDetail(cloudId: string, id: string): Observable<ResponseData> {
    return this.api.delete(this.gateway.awsCostAnalysis + cloudId + '/costAnalysisSettingByService/' + id);
  }

  /** 取得標籤分析列表 */
  getTagList(filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.awsCostAnalysis + 'tagSettingList', new RequestData(filter));
  }

  /**
   * 新增標籤分析Cloud ID
   * @param data Cloud ID
   */
  addTag(data: any): Observable<ResponseData> {
    return this.api.post(this.gateway.awsCostAnalysis + 'tagSetting', new RequestData(data));
  }

  /**
   * 刪除標籤分析Cloud ID
   * @param id Cloud ID
   */
  delTag(id: string): Observable<ResponseData> {
    return this.api.delete(this.gateway.awsCostAnalysis + 'tagSetting/' + id);
  }

  /**
   * 取得指定標籤分析詳細資料
   * @param id Cloud ID
   */
  getTagDetailList(id: string, filter: Filter): Observable<ResponseData> {
    return this.api.post(this.gateway.awsCostAnalysis + id + '/tagSettingDetailList', new RequestData(filter));
  }

  /**
   * 新增標籤分析
   * @param data 服務資料
   * @param id Cloud ID
   */
  addTagDetail(data: any[], id: string): Observable<ResponseData> {
    return this.api.post(this.gateway.awsCostAnalysis + id + '/tagSettingDetail', new RequestData(data));
  }

  /**
   * 編輯標籤分析
   * @param data 服務資料
   * @param cloudId Cloud ID
   */
  editTagDetail(data: any, cloudId: string): Observable<ResponseData> {
    return this.api.put(this.gateway.awsCostAnalysis + cloudId + '/tagSettingDetail/' + data.id, new RequestData(data));
  }

  /**
   * 刪除標籤分析
   * @param cloudId Cloud ID
   * @param id Cloud ID
   */
  delTagDetail(cloudId: string, id: string): Observable<ResponseData> {
    return this.api.delete(this.gateway.awsCostAnalysis + cloudId + '/tagSettingDetail/' + id);
  }

  /**
   * 取得成本分析圖
   * @param data 搜尋資料
   */
  getCostAnalysis(data: AnalysisDataInput): Observable<ResponseData> {
    return this.api.post(this.gateway.awsCostAnalysis + 'costAnalysis', new RequestData(data));
  }

  /**
   * 取得標籤分析圖
   * @param data 搜尋資料
   */
  getTagAnalysis(data: AnalysisDataInput): Observable<ResponseData> {
    return this.api.post(this.gateway.awsCostAnalysis + 'costAnalysisByTag', new RequestData(data));
  }

  /**
   * 匯出excel
   * @param data 匯出資料
   * @param cloudId cloud id
   */
  costAnalysisExplorerExcel(data: AnalysisDataInput, cloudId: string): Observable<ResponseData> {
    return this.api.postDownload(this.gateway.awsCostAnalysis + 'costAnalysis/' + cloudId + '/export', new RequestData(data));
  }

}
