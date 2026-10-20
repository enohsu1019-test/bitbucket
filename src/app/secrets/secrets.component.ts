import { Component, OnInit } from '@angular/core';
import { Brand } from './secrets';

@Component({
  selector: 'app-secrets',
  templateUrl: './secrets.component.html',
  styleUrls: ['./secrets.component.scss']
})
export class SecretsComponent  {

  constructor() { }

  // intable 品牌資料
  brandDatas: Brand[] = [
    {
      createDate: '2019-03-13T16:26:09.465+0800',
      id: '5c88bea1b632f0000148ff52',
      modifyDate: '2022-02-28T12:06:40.636+0800',
      name: 'AWS',
      serviceName: 'amazon-v2',
      status: true
    },
    {
      createDate: '2018-12-13T12:21:56.960+0800',
      id: '5c11de64414d9207296f16a5',
      modifyDate: '2022-01-21T10:19:03.395+0800',
      name: 'Akamai',
      serviceName: 'akamai-v2',
      status: true
    },
    {
      createDate: '2021-08-26T16:30:09.699+0800',
      id: '5fc60e4435bfb200015cefcf',
      modifyDate: '2022-01-21T10:18:40.757+0800',
      name: 'Cisco',
      serviceName: 'cisco-v2',
      status: true
    },
    {
      createDate: '2019-07-08T14:35:18.001+0800',
      id: '5d22e426993d260001f30a95',
      modifyDate: '2022-01-21T10:18:45.400+0800',
      name: 'Google',
      serviceName: 'google-v2',
      status: true
    },
  ];


  // 設定分頁參數
  pageConfig = {
    boundaryLinks: false,
    totalItems: 0,
    itemsPerPage: 10,
    currentPage: 1,
    maxSize: 4,
  };
  // ui狀態
  ui = {
    isLoading: false,
  }

  ngOnInit(): void {
  }
  // 改變狀態事件
  handleStatusChange() {
   console.log(this.brandDatas);
  }

  /**
   * 切換分頁時指定執行的函式 (in-table)
   * @param event 由 in-table 回傳的分頁資訊
   */
   pageChange(event: any) {
    // if (this.pageConfig) {
    //   const jsonItemsPerPage = JSON.stringify(this.pageConfig.itemsPerPage);
    //   localStorage.setItem('brand-list-itemsPerPage', jsonItemsPerPage);
    //   const filter = this.getFilter(this.pageConfig.currentPage, this.pageConfig.itemsPerPage);
    //   this.getBrands(filter);
    // }
  }

}
