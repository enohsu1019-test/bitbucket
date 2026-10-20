import { Component, Input, OnChanges, OnInit } from '@angular/core';
import _ from 'lodash';
import { AlertService } from 'src/app/core/services/alert.service';
import { Solution } from '../../../../brands';
import { BrandsApiService } from '../../../../brands-api.service';

@Component({
  selector: 'app-solution-list',
  templateUrl: './solution-list.component.html',
  styleUrls: ['./solution-list.component.scss']
})
export class SolutionListComponent implements OnInit,OnChanges {
  @Input() brandId!:string;
  constructor(
    private brandsAPI: BrandsApiService,
    private alert: AlertService,
  ) { }
  // 設定分頁參數
  pageConfig = {
    boundaryLinks: false,
    totalItems: 0,
    itemsPerPage: 10,
    currentPage: 1,
    maxSize: 4,
  };
  // 方案資料
  solutionDatas: Solution[] = [];
  // ui狀態
  ui = {
    isLoading: false,
  }

  ngOnInit(): void {
  }
  ngOnChanges(): void {
    this.getSolutionLIstApi();
  }

  // 新增方案
  addSolutionData() {
    let datas = _.cloneDeep(this.solutionDatas);
    let index = new Solution();
    datas.push(index);

    this.solutionDatas = datas;
  }
  // 刪除方案
  deleteSolution(index: number) {
    this.solutionDatas = this.solutionDatas.filter((item, itemIndex) => {
      return index !== itemIndex;
    });
  }

  getSolutionLIstApi() {

    this.brandsAPI.getSolutionList(this.brandId).subscribe({
      next: (res) => {
        console.log('[brands] getBrandList done', res);
        if (res.info.success && res?.data) {
          this.solutionDatas = res.data;
          this.ui.isLoading = false;
        } else {
          this.ui.isLoading = false;
        }
      },
      error: (err) => {
        console.error('[brands] getBrandList fail', err);
        this.alert.errorAlert('[brands] getBrandList fail' + err);
        this.ui.isLoading = false;
      },
    });

  }

  // 改變狀態事件
  handleStatusChange() {
    console.log(this.solutionDatas);
  }
  // 儲存
  save() {
    console.log('save');
  }
}


