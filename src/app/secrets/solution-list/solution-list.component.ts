import { Component, OnInit } from '@angular/core';
import { Solution } from '../secrets';
import * as _ from 'lodash';

@Component({
  selector: 'app-solution-list',
  templateUrl: './solution-list.component.html',
  styleUrls: ['./solution-list.component.scss']
})
export class SolutionListComponent implements OnInit {

  constructor() { }



  // 設定分頁參數
  pageConfig = {
    boundaryLinks: false,
    totalItems: 0,
    itemsPerPage: 10,
    currentPage: 1,
    maxSize: 4,
  };
  // 方案資料
  solutionDatas: Solution[] = [
    {
      brandID: '5c88bea1b632f0000148ff52',
      createDate: '2019-05-21T11:56:47.014+0800',
      id: '5ce376ff15327c0001133cf7',
      modifyDate: '2019-05-21T11:56:47.014+0800',
      name: '基本計價',
      status: true
    },
    {
      brandID: '5c88bea1b632f0000148ff52',
      createDate: '2020-03-25T10:58:58.374+0800',
      id: '5e7ac8f2f2b5c600015dcbcd',
      modifyDate: '2020-03-25T11:11:13.983+0800',
      name: '基本計價v2',
      status: false
    },
  ];
  // ui狀態
  ui = {
    isLoading: false,
  }

  ngOnInit(): void {
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

  // 改變狀態事件
  handleStatusChange() {
    console.log(this.solutionDatas);
  }
  // 儲存
  save() {
    console.log('save');
  }
}
