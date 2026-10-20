import { Component, OnInit } from '@angular/core';
import { CostAnalysisService } from '../cost-analysis.service';
import { AlertService } from 'src/app/core/services/alert.service';

import { PageConfig, ProjectList } from '../cost-analysis';
import { FormControl, FormGroup } from '@angular/forms';
import { Filter, Sort } from '../../core/models/filter';
import { InTableConfig } from '@sysage/in-table';
import _ from 'lodash';

@Component({
  selector: 'app-project-setting',
  templateUrl: './project-setting.component.html',
  styleUrls: ['./project-setting.component.scss']
})
export class ProjectSettingComponent implements OnInit {

  inTableConfig = new InTableConfig;

  constructor(
    private api: CostAnalysisService,
    private alert: AlertService,
  ) {
    /** in-table setting */
    this.inTableConfig.sitckyElemId = 'page-header';
  }

  /** form */
  inputForm = new FormGroup({
    projectName: new FormControl(''),
  });

  /** loading */
  loading = false;
  /** 專案loading */
  projectLoading = false;

  /** 專案列表 */
  projectList: ProjectList[] = [];
  /** 專案列表(原始資料) */
  oriProjectList: ProjectList[] = [];

  /** in-table設定 */
  pageConfig = new PageConfig;

  ngOnInit() {
    this.getList();
  }

  /** 取得列表 */
  getList() {
    this.projectLoading = true;
    this.projectList = [];
    this.oriProjectList = [];
    const filter = new Filter;
    filter.sort['modifyDate'] = Sort.desc;
    this.api.getProjectList(filter).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.projectList = res.data !== null ? res.data : [];
        this.oriProjectList = _.cloneDeep(this.projectList);
        if (this.projectList.length === 0) {
          this.addProject(0);
        }

        // 設定分頁內容
        this.pageConfig.totalItems = res.page ? res.page.dataCount : 0;
        this.pageConfig.itemsPerPage = res.page ? res.page.pageSize : 0;
        this.pageConfig.currentPage = res.page ? res.page.pageIndex : 0;
      }
      this.projectLoading = false;
    }, (err: any) => {
      this.projectLoading = false;
      this.projectList = [];
      this.oriProjectList = [];
      this.alert.errorAlert(err);
    });
  }

  /**
   * 新增
   * @param step 0 => 無"其他"專案名稱，自動新增一個"其他", 1 => 正常新增
   */
  addProject(step: number) {
    this.loading = true;
    const data: {name: string}[] = [];
    if (step === 0) {
      const name = {
        name: '其他'
      };
      data.push(name);
    } else {
      const name = {
        name: this.inputForm.get('projectName')?.value
      };
      data.push(name);
    }
    this.api.addProject(data).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.inputForm.controls['projectName'].setValue('');
        this.getList();
        this.alert.successAlert(res.info.message);
      } else {
        this.alert.errorAlert(res.info.message);
      }
      this.loading = false;
    }, (err: any) => {
      this.loading = false;
      this.projectList = [];
      this.oriProjectList = [];
      this.alert.errorAlert(err);
    });
  }

  /**
   * 儲存
   * @param idx 第幾筆
   */
  save(idx: number) {
    // loading中無法再發請求
    if (!this.loading) {
      this.loading = true;
      this.api.editProject(this.projectList[idx]).subscribe((res: any) => {
        if (res.info && res.info.success) {
          this.alert.successAlert(res.info.message);
          this.projectList[idx].edit = false;
        } else {
          this.alert.errorAlert(res.info.message);
        }
        this.loading = false;
      }, (err: any) => {
        this.loading = false;
        this.projectList = [];
        this.oriProjectList = [];
        this.alert.errorAlert(err);
      });
    }
  }

  /**
   * 取消
   * @param idx 第幾筆
   */
  cancel(idx: number) {
    this.projectList[idx].edit = false;
    this.projectList[idx].name = this.oriProjectList[idx].name;
  }

  /**
   * 編輯
   * @param idx 第幾筆
   */
  edit(idx: number) {
    this.projectList[idx].edit = true;
  }

  /**
   * 刪除
   * @param idx 第幾筆
   */
  delProject(idx: number) {
    this.api.delProject(this.projectList[idx].id).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.getList();
        this.alert.successAlert(res.info.message);
      }
    }, (err: any) => {
      this.projectList = [];
      this.oriProjectList = [];
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
      return control.value.match(new RegExp('[^\u4e00-\u9fa5\\w()]+'));
    } else {
      return true;
    }
  }

  /** 切換分頁 */
  pageChange(event: any) {
    const filter = new Filter;
    filter.pageSize = event.itemsPerPage;
    filter.pageIndex = event.currentPage;
    filter.sort['modifyDate'] = Sort.desc;
    this.projectLoading = true;
    this.projectList = [];
    this.api.getProjectList(filter).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.projectList = res.data !== null ? res.data : [];
        this.oriProjectList = _.cloneDeep(this.projectList);

        // 設定分頁內容
        this.pageConfig.totalItems = res.page ? res.page.dataCount : 0;
        this.pageConfig.itemsPerPage = res.page ? res.page.pageSize : 0;
        this.pageConfig.currentPage = res.page ? res.page.pageIndex : 0;
      }
      this.projectLoading = false;
    }, (err: any) => {
      this.projectLoading = false;
      this.projectList = [];
      this.oriProjectList = [];
      this.alert.errorAlert(err);
    });
  }

}
