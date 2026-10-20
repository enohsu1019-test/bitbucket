import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { AlertService } from '../../../core/services/alert.service';
import { CostAnalysisService } from '../../cost-analysis.service';
import { ActivatedRoute, Router } from '@angular/router';

import { FormGroup, FormControl } from '@angular/forms';
import { Filter, Sort } from '../../../core/models/filter';
import { CostDetailList, PageConfig, ProjectInfo, ProjectList } from '../../cost-analysis';
import * as _ from 'lodash';
import { formatDate } from '@angular/common';
import { InTableConfig } from '@sysage/in-table';
@Component({
  selector: 'app-cost-analysis-detail',
  templateUrl: './cost-analysis-detail.component.html',
  styleUrls: ['./cost-analysis-detail.component.scss']
})
export class CostAnalysisDetailComponent implements OnInit {

  inTableConfig = new InTableConfig;

  constructor(
    private api: CostAnalysisService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(LOCALE_ID) private locale: string
  ) {
    /** 判斷route是否有傳payer資料 */
    const nav = this.router.getCurrentNavigation();
    if (nav) {
      this.payer = (nav.extras && nav.extras.state && nav.extras.state['payer']) ? nav.extras.state['payer'] : undefined;
    } else {
      this.router.navigate(['main/analysis/cost'] , { state: {route: {internal: true}}});
    }

    /** in-table setting */
    this.inTableConfig.sitckyElemId = 'page-header';
  }

  /** in-table設定 */
  pageConfig = new PageConfig;

  /** form */
  inputForm = new FormGroup({
    serverName: new FormControl(''),
  });

  /** loading */
  loading = false;
  /** save loading */
  saveLoading = false;

  /** 網址傳來的cloudId */
  cloudId = '';
  /** route帶來的payer */
  payer = '';
  /** 選擇服務列表 */
  serverList: any = [];
  /** 專案列表 */
  projectList: ProjectList[] = [];
  /** 成本分析列表 */
  costList: CostDetailList[] = [];
  /** 成本分析列表(修改後) */
  afterEditCostList: CostDetailList[] = [];
  /** "其他"Id */
  otherId = '';

  ngOnInit() {
    // 抓網址傳的cloud id
    if (this.route.snapshot.params['clouId'] && this.route.snapshot.params['clouId'] !== undefined) {
      this.cloudId = this.route.snapshot.params['clouId'];
      this.getProjectList();
      this.getServiceList();
    }
  }

  /** 取得專案列表 */
  getProjectList() {
    this.loading = true;
    this.projectList = [];
    const filter = new Filter;
    filter.pageSize = -1;
    this.api.getProjectList(filter).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.projectList = res.data !== null ? res.data : [];
        // 取得"其他"的ID
        const otherId = this.projectList.filter(list => list.name === '其他').map(x => x.id);
        this.otherId = otherId[0];
        // 移除"其他"
        this.projectList = this.projectList.filter(list => list.id !== this.otherId);
        // 取得分析列表
        this.getCostList(this.cloudId);
      }
    }, (err: any) => {
      this.projectList = [];
      this.alert.errorAlert(err);
    });
  }

  /** 取得服務名稱列表 */
  getServiceList() {
    const today = new Date();
    const filter = {
      accountIds: [this.cloudId],
      dataType: ['SERVICE'],
      startDate: formatDate(today.setDate(today.getDate() - 91), 'yyyy-MM-dd', this.locale),
      endDate: formatDate(new Date(), 'yyyy-MM-dd', this.locale),
      payerId: this.payer
    };
    this.api.postAWSFilter(filter).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.serverList = res.data.service !== null ? res.data.service : [];
      }
    }, (err: any) => {
      this.serverList = [];
      this.alert.errorAlert(err);
    });
  }

  /** 取得成本分析列表 */
  getCostList(id: string) {
    this.loading = true;
    this.costList = [];
    const filter = new Filter;
    filter.pageSize = -1;
    filter.sort['modifyDate'] = Sort.desc;
    this.api.getCostDetailList(id, filter).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.costList = res.data !== null ? res.data : [];
        // 寫入中文名稱
        this.costList.forEach(cost => {
          cost.projectInfo.forEach(info => {
            const name = this.projectList.filter(item => item.id === info.projectManagementId).map(x => x.name);
            info.name = name[0];
          });
        });
        this.afterEditCostList = _.cloneDeep(this.costList);

        // 設定分頁內容
        this.pageConfig.totalItems = res.page ? res.page.dataCount : 0;
        this.pageConfig.itemsPerPage = res.page ? res.page.pageSize : 0;
        this.pageConfig.currentPage = res.page ? res.page.pageIndex : 0;
      }
      this.loading = false;
    }, (err: any) => {
      this.loading = false;
      this.costList = [];
      this.alert.errorAlert(err);
    });
  }

  /**
   * 是否符合中英數
   * @param fornName 表單名稱
   */
   getValidator(fornName: string) {
    const control = this.inputForm.get(fornName);
    if (control && control.value) {
      return control.value.match(new RegExp('[^\u4e00-\u9fa5\\w -]+'));
    } else {
      return true;
    }
  }

  /** 新增server */
  addServer() {
    this.loading = true;
    const data: {name: string, projectInfo: {projectManagementId: string, costPercentage: number}[]} = {
      name: this.inputForm.get('serverName')?.value,
      projectInfo: [{
        projectManagementId: this.otherId,
        costPercentage: 100
      }]
    };
    this.api.addCostDetail(data, this.cloudId).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.inputForm.controls['serverName'].setValue('');
        this.getCostList(this.cloudId);
        this.alert.successAlert(res.info.message);
      }
      this.loading = false;
    }, (err: any) => {
      this.loading = false;
      this.costList = [];
      this.alert.errorAlert(err);
    });
  }

  /**
   * 開啟編輯
   * @param idx 第幾筆
   */
  showEdit(idx: number) {
    this.afterEditCostList[idx].projectInfo = this.refreshData(0, idx);
    this.costList[idx].edit = true;
  }

  /** 刪除 */
  delServer(idx: number) {
    this.api.delCostDetail(this.cloudId, this.costList[idx].id).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.getCostList(this.cloudId);
        this.alert.successAlert(res.info.message);
      }
    }, (err: any) => {
      this.costList = [];
      this.alert.errorAlert(err);
    });
  }

  /**
   * 新增專案
   * @param idx 第幾筆
   */
  addProject(idx: number) {
    const newProject: ProjectInfo = {
      costPercentage: 0,
      projectManagementId: this.projectList[0].id,
      name: this.projectList[0].name
    };
    this.afterEditCostList[idx].projectInfo.push(newProject);
  }

  /**
   * 編輯專案
   * @param idx 第幾筆
   */
  editProject(idx: number) {
    this.saveLoading = true;
    // 計算其他
    let amount = 100;
    this.afterEditCostList[idx].projectInfo.forEach(list => {
      if (list.projectManagementId !== this.otherId) {
        amount = amount - list.costPercentage;
      }
    });
    this.afterEditCostList[idx].projectInfo[0].costPercentage = amount;
    this.api.editCostDetail(this.afterEditCostList[idx], this.cloudId).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.costList[idx].projectInfo = this.refreshData(1, idx);
        this.costList[idx].edit = false;
        this.alert.successAlert(res.info.message);
      }
      this.saveLoading = false;
    }, (err: any) => {
      this.costList = [];
      this.saveLoading = false;
      this.alert.errorAlert(err);
    });
  }

  /**
   * 取得選擇後專案中文名稱
   * @param idx 第幾筆服務
   * @param x 第幾筆專案
   */
  editSelectProject(idx: number, x: number) {
    const name = this.projectList
      .filter(project => project.id === this.afterEditCostList[idx].projectInfo[x].projectManagementId)
      .map(item => item.name);
    this.afterEditCostList[idx].projectInfo[x].name = name[0];
  }

  /**
   * 刪除專案
   * @param idx 第幾筆服務
   * @param x 第幾筆專案
   */
  delProject(idx: number, x: number) {
    this.afterEditCostList[idx].projectInfo.splice(x, 1);
  }

  /** 取得未分配百分比 */
  getPercentage(idx: number) {
    let x = 100;
    this.afterEditCostList[idx].projectInfo.forEach(item => {
      if (item.projectManagementId !== this.otherId) {
        x = x - item.costPercentage;
      }
    });
    return x;
  }

  /**
   * 重新讀取array資料
   * @param witch 需要讀取哪個資料, 0:原始資料, 1:修改資料
   * @param idx 第幾筆
   */
  refreshData(witch: number, idx: number) {
    let copyData: ProjectInfo[] = [];
    if (witch === 0) {
      copyData = _.cloneDeep(this.costList[idx].projectInfo);
    } else {
      copyData = _.cloneDeep(this.afterEditCostList[idx].projectInfo);
    }
    return copyData;
  }

}
