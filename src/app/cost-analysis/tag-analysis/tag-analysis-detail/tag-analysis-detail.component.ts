import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { AlertService } from '../../../core/services/alert.service';
import { CostAnalysisService } from '../../cost-analysis.service';
import { ActivatedRoute, Router } from '@angular/router';

import { FormGroup, FormControl } from '@angular/forms';
import { Filter, Sort } from '../../../core/models/filter';
import { PageConfig, ProjectInfo, ProjectList, TagDetailList } from '../../cost-analysis';
import * as _ from 'lodash';
import { formatDate } from '@angular/common';
import moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { InTableConfig } from '@sysage/in-table';
@Component({
  selector: 'app-tag-analysis-detail',
  templateUrl: './tag-analysis-detail.component.html',
  styleUrls: ['./tag-analysis-detail.component.scss']
})
export class TagAnalysisDetailComponent implements OnInit {

  inTableConfig = new InTableConfig;

  constructor(
    private api: CostAnalysisService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    @Inject(LOCALE_ID) private locale: string
  ) {
    /** 判斷route是否有傳payer資料 */
    const nav = this.router.getCurrentNavigation();
    if (nav) {
      this.payer = (nav.extras && nav.extras.state && nav.extras.state['payer']) ? nav.extras.state['payer'] : undefined;
    } else {
      this.router.navigate(['main/analysis/tag'] , { state: {route: {internal: true}}});
    }

    /** in-table setting */
    this.inTableConfig.sitckyElemId = 'page-header';
  }

  /** form */
  inputForm = new FormGroup({
    tagName: new FormControl(''),
  });

  /** in-table設定 */
  pageConfig = new PageConfig;

  /** loading */
  loading = false;
  /** list loading */
  listLoading = false;
  /** save loading */
  saveLoading = false;

  /** 網址傳來的cloudId */
  cloudId = '';
  /** route帶來的payer */
  payer = '';
  /** 選擇標籤列表 */
  tagList: string[] = [];
  /** 選擇服務列表 */
  serverList: string[] = [];
  /** 專案列表 */
  projectList: ProjectList[] = [];
  /** 標籤分析列表 */
  detailList: TagDetailList[] = [];
  /** 成本分析列表(修改後) */
  afterEditTagList: {item: TagDetailList[]}[] = [];
  // 用標籤分組
  tagGroup: {item: TagDetailList[], modifyDate: string}[] = [];
  // 分組後的標籤名稱
  groupKeys: string[] = [];
  /** "其他"Id */
  otherId = '';
  /** 下拉選單列表(全) */
  allServiceList: {id: string, itemName: string}[] = [];
  /** 下拉選單列表(顯示) */
  showServiceList: {id: string, itemName: string}[] = [];
  /** 使用者選擇的下拉選單 */
  userSelectList: {id: string, itemName: string}[] = [];
  /** 下拉選單基礎設定 */
  filterConfig = {
    text: this.translate.instant('please select service name'),
    selectAllText: this.translate.instant('select all'),
    unSelectAllText: this.translate.instant('unselect all'),
    filterSelectAllText: this.translate.instant('select all filtered results'),
    filterUnSelectAllText: this.translate.instant('unselect all filtered results'),
    enableSearchFilter: true,
    singleSelection: false,
    badgeShowLimit: 1,
    maxHeight: 250,
    position: 'bottom',
    autoPosition: false,
    lazyLoading: false,
    noDataLabel: this.translate.instant('no data found'),
    classes: 'multiselect-width dropdown-icon dropdown-position'
  };

  ngOnInit() {
    // 抓網址傳的cloud id
    if (this.route.snapshot.params['clouId'] && this.route.snapshot.params['clouId'] !== undefined) {
      this.cloudId = this.route.snapshot.params['clouId'];
      this.getProjectList();
      this.getServiceTagList();
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
        this.getDetailList(this.cloudId);

      }
    }, (err: any) => {
      this.projectList = [];
      this.alert.errorAlert(err);
    });
  }

  /** 取得服務和標籤名稱列表 */
  getServiceTagList() {
    this.listLoading = true;
    const today = new Date();
    // 取得服務，tag名稱
    const filter = {
      accountIds: [this.cloudId],
      dataType: ['SERVICE', 'TAG'],
      startDate: formatDate(today.setDate(today.getDate() - 91), 'yyyy-MM-dd', this.locale),
      endDate: formatDate(new Date(), 'yyyy-MM-dd', this.locale),
      payerId: this.payer
    };
    this.api.postAWSFilter(filter).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.serverList = res.data.service !== null ? res.data.service : [];
        this.serverList.forEach(item => {
          const data = {
            id: item,
            itemName: item
          };
          this.allServiceList.push(data);
        });
        this.allServiceList = _.cloneDeep(this.allServiceList);
        const tag: string[] = res.data.tag !== null ? res.data.tag : [];
        const tagKey = _.keys(tag);
        tagKey.forEach((item: any) => {
          res.data.tag[item].forEach((tagName: string) => {
            if (tagName !== '') {
              this.tagList.push(tagName);
            }
          });
        });
      }
      this.listLoading = false;
    }, (err: any) => {
      this.serverList = [];
      this.tagList = [];
      this.listLoading = false;
      this.alert.errorAlert(err);
    });
  }

  /** 取得成本分析列表 */
  getDetailList(id: string) {
    this.loading = true;
    this.detailList = [];
    this.tagGroup = [];
    const filter = new Filter;
    filter.pageSize = -1;
    filter.sort['modifyDate'] = Sort.desc;
    this.api.getTagDetailList(id, filter).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.detailList = res.data !== null ? res.data : [];
        this.detailList = _.orderBy(this.detailList, 'tag', 'asc');
        // 寫入中文名稱
        this.detailList.forEach(tag => {
          tag.projectInfo.forEach(info => {
            const name = this.projectList.filter(item => item.id === info.projectManagementId).map(x => x.name);
            info.name = name[0];
          });
        });

        // tag分組
        const productGroups = _.groupBy(this.detailList, (item) => {
          return item.tag;
        });
        // 找出tag名稱
        this.groupKeys = _.keys(productGroups);
        this.groupKeys.forEach((tagName, idx) => {
          const itemDefault: {item: TagDetailList[], modifyDate: string} = {
            item: [],
            modifyDate: ''
          };
          this.tagGroup.push(itemDefault);
          productGroups[tagName].forEach(item => {
            this.tagGroup[idx].item.push(item);
            if (!this.tagGroup[idx].modifyDate) {
              this.tagGroup[idx].modifyDate = moment(item.modifyDate).format('yyyy-MM-DD HH-mm-ss');
            }
          });
        });
        this.tagGroup = _.orderBy(this.tagGroup, 'modifyDate', 'desc');
        const copyData = _.cloneDeep(this.tagGroup);
        this.tagGroup = copyData;

        this.afterEditTagList = _.cloneDeep(this.tagGroup);
      }
      this.loading = false;
    }, (err: any) => {
      this.loading = false;
      this.detailList = [];
      // this.tagGroup = [];
      this.alert.errorAlert(err);
    });
  }

  /** 取得所選擇tag的service列表 */
  getServiceList() {
    this.listLoading = true;
    const selectTagList = this.detailList.filter(x => x.tag === this.inputForm.get('tagName')?.value);
    this.showServiceList = _.cloneDeep(this.allServiceList);
    selectTagList.forEach(list => {
      this.showServiceList = this.showServiceList.filter(x => x.itemName !== list.name);
    });
    this.listLoading = false;
  }

  /** 重置service列表 */
  resetList() {
    this.showServiceList = [];
  }

  /** 檢查是否有選擇 */
  checkInput() {
    let disable = false;
    if (this.inputForm.get('tagName')?.value === '') {
      disable = true;
    }
    if (this.userSelectList.length === 0) {
      disable = true;
    }
    return disable;
  }

  /**
   * 是否符合中英數
   * @param fornName 表單名稱
   */
  /* getValidator(fornName: string) {
    const control = this.inputForm.get(fornName);
    if (control && control.value) {
      return control.value.match(new RegExp('[^\u4e00-\u9fa5\\w -]+'));
    } else {
      return true;
    }
  } */

  /** 新增tag */
  addTag() {
    this.loading = true;
    this.tagGroup = [];
    const data: {name: string, tag: string, projectInfo: {projectManagementId: string, costPercentage: number}[]}[] = [];
    this.userSelectList.forEach(list => {
      const item: {name: string, tag: string, projectInfo: {projectManagementId: string, costPercentage: number}[]} = {
        name: list.itemName,
        tag: this.inputForm.get('tagName')?.value,
        projectInfo: [{
          projectManagementId: this.otherId,
          costPercentage: 100
        }]
      };
      data.push(item);
    });
    this.api.addTagDetail(data, this.cloudId).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.alert.successAlert(res.info.message);
        this.inputForm.controls['tagName'].setValue('');
        this.userSelectList = [];
        this.getDetailList(this.cloudId);
      }
      // this.loading = false;
    }, (err: any) => {
      this.loading = false;
      this.detailList = [];
      this.alert.errorAlert(err);
    });
  }

  /**
   * 開啟編輯
   * @param idx 第幾筆主項
   * @param x 第幾筆分項
   */
  showEdit(idx: number, x: number) {
    this.afterEditTagList[idx].item[x].projectInfo = this.refreshData(0, idx, x);
    this.tagGroup[idx].item[x].edit = true;
  }

  /**
   * 刪除
   * @param idx 第幾筆主項
   * @param x 第幾筆分項
   */
  delTag(idx: number, x: number) {
    this.api.delTagDetail(this.cloudId, this.tagGroup[idx].item[x].id).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.getDetailList(this.cloudId);
        this.alert.successAlert(res.info.message);
      }
    }, (err: any) => {
      this.detailList = [];
      this.alert.errorAlert(err);
    });
  }

  /**
   * 新增專案
   * @param idx 第幾筆主項
   * @param x 第幾筆分項
   */
  addProject(idx: number, x: number) {
    const newProject: ProjectInfo = {
      costPercentage: 0,
      projectManagementId: this.projectList[0].id,
      name: this.projectList[0].name
    };
    this.afterEditTagList[idx].item[x].projectInfo.push(newProject);
  }

  /**
   * 編輯專案
   * @param idx 第幾筆主項
   * @param x 第幾筆分項
   */
  editProject(idx: number, x: number) {
    this.saveLoading = true;
    // 計算其他
    let amount = 100;
    this.afterEditTagList[idx].item[x].projectInfo.forEach(list => {
      if (list.projectManagementId !== this.otherId) {
        amount = amount - list.costPercentage;
      }
    });
    this.afterEditTagList[idx].item[x].projectInfo[0].costPercentage = amount;
    this.api.editTagDetail(this.afterEditTagList[idx].item[x], this.cloudId).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.tagGroup[idx].item[x].projectInfo = this.refreshData(1, idx, x);
        this.tagGroup[idx].item[x].edit = false;
        this.alert.successAlert(res.info.message);
      }
      this.saveLoading = false;
    }, (err: any) => {
      this.detailList = [];
      this.saveLoading = false;
      this.alert.errorAlert(err);
    });
  }

  /**
   * 取得選擇後專案中文名稱
   * @param rowIdx 第幾筆主項
   * @param listIdx 分項第幾筆專案
   * @param x 第幾筆分項
   */
  editSelectProject(rowIdx: number, listIdx: number, x: number) {
    const name = this.projectList
      .filter(project => project.id === this.afterEditTagList[rowIdx].item[x].projectInfo[listIdx].projectManagementId)
      .map(item => item.name);
    this.afterEditTagList[rowIdx].item[x].projectInfo[listIdx].name = name[0];
  }

  /**
   * 刪除專案
   * @param rowIdx 第幾筆主項
   * @param listIdx 分項第幾筆專案
   * @param x 第幾筆分項
   */
  delProject(rowIndex: number, listIdx: number, x: number) {
    this.afterEditTagList[rowIndex].item[x].projectInfo.splice(listIdx, 1);
  }

  /**
   * 取得未分配百分比
   * @param idx 第幾筆主項
   * @param x 第幾筆分項
   */
  getPercentage(idx: number, x: number) {
    let per = 100;
    this.afterEditTagList[idx].item[x].projectInfo.forEach(item => {
      if (item.projectManagementId !== this.otherId) {
        per = per - item.costPercentage;
      }
    });
    return per;
  }

  /**
   * 重新讀取array資料
   * @param witch 需要讀取哪個資料, 0:原始資料, 1:修改資料
   * @param idx 第幾筆主項
   * @param x 第幾筆分項
   */
  refreshData(witch: number, idx: number, x: number) {
    let copyData: ProjectInfo[] = [];
    if (witch === 0) {
      copyData = _.cloneDeep(this.tagGroup[idx].item[x].projectInfo);
    } else {
      copyData = _.cloneDeep(this.afterEditTagList[idx].item[x].projectInfo);
    }
    return copyData;
  }

  stopListRoute(event: any) {
    event.stopPropagation();
    return false;
  }

  /**
   * in-table 標籤名稱
   * @param idx 第幾筆
   */
  getTagName(idx: number) {
    return this.tagGroup[idx].item[0].tag;
  }

  openFilter() {
    // console.log(this.userSelectList);
  }

  closeFilter() {
    // console.log(this.userSelectList);
  }

}
