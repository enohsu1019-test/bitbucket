import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { CostAnalysisService } from '../cost-analysis.service';
import { AlertService } from 'src/app/core/services/alert.service';

import { FormGroup, FormControl } from '@angular/forms';
import { AnalysisDataInput, AnalysisDataOut, CostList, ProjectList, TagDetailList } from '../cost-analysis';
import { Filter } from '../../core/models/filter';
import { TranslateService } from '@ngx-translate/core';
import * as FileSaver from 'file-saver';
import moment from 'moment';
import { formatDate } from '@angular/common';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs';
import { Input } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
@Component({
  selector: 'app-analysis-chart',
  templateUrl: './analysis-chart.component.html',
  styleUrls: ['./analysis-chart.component.scss']
})
export class AnalysisChartComponent implements OnInit {

  /** payer id, cloud id list */
  @Input() payerCloudList!: CostList[];
  /** 去除重複payer id */
  @Input() uniqPayerId!: CostList[];
  /** cost or tag */
  @Input() type!: string;

  /** 目前的使用者 */
  get currentUserValue() {
    return this.authService.currentUserValue;
  }

  constructor(
    private api: CostAnalysisService,
    private alert: AlertService,
    private translate: TranslateService,
    private authService: AuthService,
    @Inject(LOCALE_ID) private locale: string
  ) {
    //
  }

  /** select form */
  selectForm = new FormGroup({
    payerId: new FormControl(''),
    cloudId: new FormControl(''),
  });

  /** loading */
  loading = false;
  /** download loading */
  downloadLoading = false;

  /** 成本分析圖資料 */
  costAnalysisChar = new AnalysisDataOut;
  /** 標籤分析圖資料 */
  tagAnalysisChar = new AnalysisDataOut;
  /** 專案列表 */
  projectList: ProjectList[] = [];
  /** "其他"Id */
  otherId = '';
  /** 指定的cloud id詳細資料 */
  detailData: TagDetailList[] = [];
  /** 指定的cloud id所有的服務名稱 */
  detailServiceName: string[] = [];
  /** 選擇服務列表 */
  serverList: string[] = [];
  /** 區域列表 */
  areaList: string[] = [];
  /** 標籤列表 */
  tagList: any[] = [];
  /** 標籤索引列表 */
  tagKeyList: string[] = [];
  /** cloud id */
  cloudId: CostList[] = [];
  /** 選擇條件 */
  chartFilter: {service: {id: string, itemName: string}[],
                area: {id: string, itemName: string}[],
                project: {id: string, itemName: string}[]} = {
    service: [],
    area: [],
    project: [],
  };
  /** 右側選項顯示列表 */
  chartFilterList: {service: {id: string, itemName: string}[],
                    area: {id: string, itemName: string}[],
                    project: {id: string, itemName: string}[]} = {
    service: [],
    area: [],
    project: [],
  };
  /** 下拉選單基礎設定 */
  filterConfig = {
    text: this.translate.instant('please select'),
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
    classes: 'dropdown-icon dropdown-position',
  };

  // 日期選擇器範圍資料
  pickerRangeDates: (Date | undefined)[] | undefined = [];
  // 開始日期
  startDate = moment().day(-14).format('YYYY-MM-DD');
  // 結束日期
  endDate = moment().format('YYYY-MM-DD');
  // 日期選擇器最大日期
  maxDate = new Date(moment().add(12, 'M').format('YYYY-MM-DD'));
  // 日期選擇器最小日期
  minDate = new Date(moment().subtract(12, 'M').format('YYYY-MM-DD'));
  // 儀表板資料
  dashboardDatasets: any[] = [];
  // dashboard日期
  dashboardDate: string[] = [];
  // 儀表板資料選項
  options = {};

  ngOnInit() {
    this.pickerRangeDates = [new Date(this.startDate), new Date(this.endDate)];
    this.getProjectList();
    this.getdashboard();
  }

  /** 取得專案列表 */
  getProjectList() {
    this.projectList = [];
    const filter = new Filter;
    filter.pageSize = -1;
    this.api.getProjectList(filter).subscribe({
      next: (res: any) => {
        if (res.info && res.info.success) {
          this.projectList = res.data !== null ? res.data : [];
          // 取得"其他"的ID
          const otherId = this.projectList.filter(list => list.name === '其他').map(x => x.id);
          this.otherId = otherId[0];
        }
      }, error: (err: any) => {
        this.projectList = [];
        this.alert.errorAlert(err);
      }
    });
  }

  /** 取得filter列表 */
  getFilterList() {
    this.loading = true;
    this.chartFilterList.area = [];
    this.chartFilterList.project = [];
    this.chartFilterList.service = [];
    this.chartFilter.area = [];
    this.chartFilter.project = [];
    this.chartFilter.service = [];
    const today = new Date();
    const filter = {
      accountIds: [this.selectForm.get('cloudId')?.value],
      dataType: ['SERVICE', 'REGION', 'TAG'],
      startDate: formatDate(today.setDate(today.getDate() - 30), 'yyyy-MM-dd', this.locale),
      endDate: formatDate(new Date(), 'yyyy-MM-dd', this.locale),
      payerId: this.selectForm.get('payerId')?.value
    };
    const serverAreaList = this.api.postAWSFilter(filter);
    const projectFilter = new Filter;
    projectFilter.pageSize = -1;
    const projectList = this.type === 'cost' ? this.api.getCostDetailList(this.selectForm.get('cloudId')?.value, projectFilter)
                                             : this.api.getTagDetailList(this.selectForm.get('cloudId')?.value, projectFilter);
    forkJoin([serverAreaList, projectList]).subscribe({
      next: (res: any) => {
        // 服務區域名稱列表
        if (res[0].info && res[0].info.success) {
          this.serverList = res[0].data.service !== null ? res[0].data.service : [];
          this.areaList = res[0].data.region !== null ? res[0].data.region : [];
          this.tagList = res[0].data.tag !== null ? res[0].data.tag : [];
          this.serverList.forEach(item => {
            const data = {
              id: item,
              itemName: item
            };
            this.chartFilterList.service.push(data);
          });
          this.areaList.forEach(item => {
            const data = {
              id: item,
              itemName: item
            };
            this.chartFilterList.area.push(data);
          });
          this.tagKeyList = _.keys(this.tagList);
        } else {
          this.alert.errorAlert(res[0].info.message);
        }

        // 專案名稱列表
        if (res[1].info && res[1].info.success) {
          this.detailData = res[1].data !== null ? res[1].data : [];
          let projectData: string[] = [];
          this.detailData.forEach(item => {
            item.comFromTagId = [];
            item.projectInfo.forEach(name => {
              projectData.push(name.projectManagementId);
            });
            this.detailServiceName.push(item.name);
            // 找出所有的專案id
            item.projectInfo.forEach(tagId => {
              if (tagId.projectManagementId !== this.otherId) {
                item.comFromTagId.push(tagId.projectManagementId);
              }
            });
          });
          // 去除重複
          projectData = _.uniq(projectData);
          this.detailServiceName = _.uniq(this.detailServiceName);
          projectData.forEach(item => {
            const array = this.projectList.filter(filterItem => filterItem.id === item);
            const data = {
              id: array[0].id,
              itemName: array[0].name
            };
            this.chartFilterList.project.push(data);
          });
          this.chartFilterList = _.cloneDeep(this.chartFilterList);
        } else {
          this.alert.errorAlert(res[1].info.message);
        }
        this.loading = false;
      }, error: (err: any) => {
        this.loading = false;
        this.serverList = [];
        this.areaList = [];
        this.projectList = [];
        this.alert.errorAlert(err);
      }
    });
  }

  /** 儀表板資料 */
  getdashboard() {
    // 上方標題
    const chartTitle: string[] = [];
    chartTitle.push(this.chartFilter.project.length <= 1 ? this.translate.instant('single project cost') : this.translate.instant('multi project cost'));
    // 上方標題總金額
    let chartTotal = 0;
    // cost or tag 金額加總
    const analysisData = this.type === 'cost' ? this.costAnalysisChar : this.tagAnalysisChar;
    analysisData.total.forEach(item => {
      chartTotal += item.amount;
    });
    // 四捨五入
    chartTotal = Math.round(chartTotal * 1000) / 1000;
    chartTitle.push('總金額：' + chartTotal);
    const options = {
      plugins: {
        title: {
          display: true,
          text: chartTitle,
        },
        tooltip: {
          callbacks: {
            title: function (tooltipItems: any, data: any) {
              let total = 0;
              tooltipItems.forEach((tooltipItem: any) => {
                  total += tooltipItem.dataset.data[tooltipItem.parsed.x];
              });
              return tooltipItems[0].label + ' 總金額: $' + Math.round(total * 1000) / 1000;
            },
          }
        },
      },
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true
        },
      },
      responsive: true,
    };
    this.options = options;
  }

  /** 生成隨機顏色 */
  getRandomColor() {
    let color: number[] = [];
    for (let i = 0; i < 3; i++) {
      color.push(Math.floor(Math.random() * 256));
    }
    return 'rgba(' + color[0].toString() + ',' + color[1].toString() + ',' + color[2].toString() + ',1)';
  }

  /** 更新統計圖 */
  getChart() {
    this.loading = true;
    this.getdashboard();
    this.dashboardDate = [];
    this.dashboardDatasets = [];
    // 單專案
    if (this.chartFilter.project.length === 1) {

      // x軸，每日日期
      let dateCount = 0;
      do {
        this.dashboardDate.push(moment(this.pickerRangeDates ? this.pickerRangeDates[0] : '').add(dateCount, 'd').format('YYYY-MM-DD'));
        dateCount++;
      } while (moment(this.pickerRangeDates ? this.pickerRangeDates[0] : '').add(dateCount, 'd').format('YYYY-MM-DD') !== moment(this.pickerRangeDates ? this.pickerRangeDates[1] : '').format('YYYY-MM-DD'));
      this.dashboardDate.push(moment(this.pickerRangeDates ? this.pickerRangeDates[1] : '').format('YYYY-MM-DD'));

      // =======(成本)=======
      if (this.costAnalysisChar.details[0].name !== '') {
        // 日期分組
        const group = _.groupBy(this.costAnalysisChar.details, (item) => {
          return item.date;
        });
        const groupKey: any = _.keys(group);

        this.costAnalysisChar.total.forEach(total => {
          // 金額總和
          const amount: number[] = [];
          for (let i = 0; i < groupKey.length; i++) {
            let itemAmount = 0;
            group[groupKey[i]].forEach(item => {
              if (item.name === total.name) {
                itemAmount = itemAmount + item.amount;
              }
            });
            amount.push(itemAmount);
          }

          // 服務名稱
          const serviceName: string[] = [];
          serviceName.push(total.service);

          const color = this.getRandomColor();
          const labData = {
            backgroundColor: color,
            borderColor: 'rgba(255,99,132,1)',
            data: amount,
            hoverBackgroundColor: color,
            hoverBorderColor: color,
            label: serviceName ? serviceName : ''
          };
          this.dashboardDatasets.push(labData);
        });
      }
      // =======(成本end)=======

      // =======(標籤)=======
      if (this.tagAnalysisChar.details[0].name !== '') {
        // 日期分組
        const group = _.groupBy(this.tagAnalysisChar.details, (item) => {
          return item.date;
        });
        const groupKey = _.keys(group);

        // 標籤分組
        const subGroup = _.groupBy(this.tagAnalysisChar.total, (item) => {
          return item.tag;
        });
        const subGroupKey = _.keys(subGroup);

        subGroupKey.forEach(key => {
          // 金額總和
          const amount = [];
          for (let i = 0; i < groupKey.length; i++) {
            let itemAmount = 0;
            group[groupKey[i]].forEach(item => {
              if (item.tag === key) {
                itemAmount = itemAmount + item.amount;
              }
            });
            amount.push(itemAmount);
          }
          // 服務名稱
          const serviceName = [];
          serviceName.push(key);

          const color = this.getRandomColor();
          const labData = {
            backgroundColor: color,
            borderColor: 'rgba(255,99,132,1)',
            data: amount,
            hoverBackgroundColor: color,
            hoverBorderColor: color,
            label: serviceName ? serviceName : ''
          };
          this.dashboardDatasets.push(labData);
        });
      }
      // =======(標籤end)=======

    // 多專案
    } else {
      // x軸，專案名稱
      this.chartFilter.project.forEach(projectName => {
        this.dashboardDate.push(projectName.itemName);
      });

      // =======(成本)=======
      if (this.costAnalysisChar.details[0].name !== '') {
        // service分組
        let serviceNameList: string[] = [];
        this.costAnalysisChar.total.forEach(item => {
          serviceNameList.push(item.service);
        });
        serviceNameList = _.uniq(serviceNameList);

        serviceNameList.forEach(list => {
          // 金額總和
          const amount: number[] = [];
          this.chartFilter.project.forEach(projectName => {
            let total = 0;
            this.costAnalysisChar.total.forEach(item => {
              if (item.name === projectName.itemName && item.service === list) {
                total = total + item.amount;
              }
            });
            amount.push(total);
          });

          // 服務名稱
          const serviceName: string[] = [];
          serviceName.push(list);

          const color = this.getRandomColor();
          const labData = {
            backgroundColor: color,
            borderColor: 'rgba(255,99,132,1)',
            data: amount,
            hoverBackgroundColor: color,
            hoverBorderColor: color,
            label: serviceName ? serviceName : ''
          };
          this.dashboardDatasets.push(labData);
        });
      }
      // =======(成本end)=======

      // =======(標籤)=======
      if (this.tagAnalysisChar.details[0].name !== '') {
        // 專案分組
        const projectGroup = _.groupBy(this.tagAnalysisChar.total, (item) => {
          return item.name;
        });
        const projectGroupKey = _.keys(projectGroup);
        // 標籤分組
        const tagGroup = _.groupBy(this.tagAnalysisChar.total, (item) => {
          return item.tag;
        });
        const tagGroupKey = _.keys(tagGroup);

        tagGroupKey.forEach(key => {
          // 金額總和
          const amount = [];
          for (let i = 0; i < projectGroupKey.length; i++) {
            let itemAmount = 0;
            projectGroup[projectGroupKey[i]].forEach(item => {
              if (item.tag === key) {
                itemAmount = itemAmount + item.amount;
              }
            });
            amount.push(itemAmount);
          }

          // 標籤名稱
          const tagName: string[] = [];
          tagName.push(key);

          const color = this.getRandomColor();
          const labData = {
            backgroundColor: color,
            borderColor: 'rgba(255,99,132,1)',
            data: amount,
            hoverBackgroundColor: color,
            hoverBorderColor: color,
            label: tagName ? tagName : ''
          };
          this.dashboardDatasets.push(labData);
        });
      }
      // =======(標籤end)=======
    }
    this.loading = false;
  }

  /**
   * 取得統計圖資料
   * @param step 0: chart, 1: download excel
   */
  getChartData(step: number) {
    this.loading = true;
    const filterData: {service: string[], area: string[], projectId: string[], projectName: string[] } = {
      service: [],
      area: [],
      projectId: [],
      projectName: []
    };
    this.chartFilter.service.forEach(item => {
      filterData.service.push(item.itemName);
    });
    this.chartFilter.area.forEach(item => {
      filterData.area.push(item.itemName);
    });
    this.chartFilter.project.forEach(item => {
      filterData.projectId.push(item.id);
      filterData.projectName.push(item.itemName);
    });
    // 選擇的服務條件去找出資料庫有的服務資料
    const filterServiceName = this.chartFilter.service.filter(item => this.detailServiceName.includes(item.itemName)).map(x => x.itemName);
    // 所屬服務的標籤名稱
    const serviceNameToTagName = this.detailData.filter(item => filterServiceName.includes(item.name));
    // 過濾使用者有選擇的專案
    const filterServiceNameToTagName: TagDetailList[] = [];
    serviceNameToTagName.forEach(item => {
      filterData.projectId.forEach(id => {
        const match = item.projectInfo.filter(info => info.projectManagementId === id);
        if (match.length !== 0) {
          filterServiceNameToTagName.push(item);
        }
      });
    });
    // 找出tag所屬的名稱
    let tagName: string[] = [];
    filterServiceNameToTagName.forEach(item => {
      let found = false;
      this.tagKeyList.forEach((key: any) => {
        if (!found) {
          this.tagList[key].forEach((name: string) => {
            if (name === item.tag) {
              tagName.push(key + ':' + item.tag);
              found = true;
            }
          });
        }
      });
    });
    tagName = _.uniq(tagName);
    const data: AnalysisDataInput = {
      accountIds: [this.selectForm.get('cloudId')?.value],
      service: filterData.service,
      region: filterData.area,
      tag: tagName ? tagName : [],
      recordType: ['Usage'],
      groupBy: 'SERVICE',
      granularity: 'DAILY',
      project: filterData.projectId,
      startDate: moment(this.pickerRangeDates ? this.pickerRangeDates[0] : '').format('YYYY-MM-DD'),
      endDate: moment(this.pickerRangeDates ? this.pickerRangeDates[1] : '').format('YYYY-MM-DD'),
      payerId: this.selectForm.get('payerId')?.value
    };
    if (step === 0) {
      const analysisData = this.type === 'cost' ? this.api.getCostAnalysis(data) : this.api.getTagAnalysis(data);
      analysisData.subscribe({
        next: (res: any) => {
          // 成本分析
          if (this.type === 'cost' && res.info && res.info.success) {
            this.costAnalysisChar = res.data !== null ? res.data : [];
          }
          // 標籤分析
          if (this.type === 'tag' && res.info && res.info.success) {
            this.tagAnalysisChar = res.data !== null ? res.data : [];
          }
          this.getChart();
          this.loading = false;
        }, error: (err: any) => {
          this.loading = false;
          this.costAnalysisChar = new AnalysisDataOut;
          this.tagAnalysisChar = new AnalysisDataOut;
          this.alert.errorAlert(err);
        }
      });
    } else {
      this.loading = false;
      this.api.costAnalysisExplorerExcel(data, this.selectForm.get('cloudId')?.value).subscribe({
        next:(downloadRes: any) => {
          if (downloadRes.info && downloadRes.info.success) {
            if (downloadRes.blob) {
              FileSaver.saveAs(downloadRes.blob, downloadRes.filename ? downloadRes.filename :  'export.xlsx');
            }
            this.downloadLoading = false;
          } else {
            this.downloadLoading = false;
            this.alert.errorAlert('Api.EXCEL ERROR： ' + downloadRes.info.message);
          }
        }, error:(err: any) => {
          this.downloadLoading = false;
          this.alert.errorAlert('Api.EXCEL ERROR： ' + err.message);
        }
      });
    }
  }

  /** 下載excel */
  excelDownLoad() {
    this.downloadLoading = true;
    if (this.selectForm.get('cloudId')?.value &&
        this.chartFilter.area.length !== 0 &&
        this.chartFilter.project.length !== 0 &&
        this.chartFilter.service.length !== 0) {
      this.getChartData(1);
    } else {
      this.alert.errorAlert(this.translate.instant('please select full conditions'));
      this.downloadLoading = false;
    }
  }

  /** 選擇不同的payer id */
  payerChange() {
    this.selectForm.controls['cloudId'].setValue('');
    this.chartFilterList.area = [];
    this.chartFilterList.project = [];
    this.chartFilterList.service = [];
    this.chartFilter.area = [];
    this.chartFilter.project = [];
    this.chartFilter.service = [];
    this.cloudId = this.payerCloudList.filter(item => item.payer === this.selectForm.get('payerId')?.value);
  }

  /** 開啟服務列表 */
  /* serviceOpen() {
    this.chartFilterList.service = [];
    this.detailData.forEach(item => {
      const data = {
        id: item.name,
        itemName: item.name
      };
      this.chartFilterList.service.push(data);
    });
  } */

  /** 重置選單列表 */
  resetList() {
    this.chartFilter.area = [];
    this.chartFilter.project = [];
    this.chartFilter.service = [];
    this.chartFilterList.area = [];
    this.chartFilterList.project = [];
    this.chartFilterList.service = [];
  }

}
