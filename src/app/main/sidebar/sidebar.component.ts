import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UtilService } from '../../core/services/util.service';
import * as _ from 'lodash';
import { PermissionService } from 'src/app/core/services/permission.service';
import { SidebarService } from './sidebar.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { ApiMenu, Menu } from './sidebar';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  /** 菜單是否常開 (大尺寸: lg, xl) 或是常關 (中小尺寸: xs, sm, md) */
  @Input() normalOn!: boolean;

  /** 菜單是否開啟 (two-way binding) */
  @Input() toggled!: boolean;
  @Output() toggledChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** 記錄含有子選單的菜單選項被展開/收合的狀態 */
  collapseItems: { [key: string]: boolean } = {};

  /** 所有有通知的父層節點 */
  parentNodes: string[] = [];

  constructor(
    private router: Router,
    public util: UtilService,
    private permission: PermissionService,
    private sidebarService: SidebarService,
    private alert: AlertService,
  ) {}

  menu: Menu[] = [];

  ngOnInit() {
    this.getMenu();
  }

  /** 取得menu */
  getMenu() {
    this.sidebarService.getMenu().subscribe((res: any) => {
      if (res.info && res.info.success) {
        let menuData: ApiMenu[] = res.data !== null ? res.data : [];
        menuData = menuData.filter(x => x.type === 'MENU');
        this.menu = this.getTreeStructure(menuData);
      }
    }, (err: any) => {
      this.menu = [];
      this.alert.errorAlert(err);
    });
  }

  /**
   * 結構樹狀化
   * @param data 平面資料
   */
  getTreeStructure (data: ApiMenu[]): Menu[] {
    let needDelIdx: number[] = [];
    data.forEach((child, idx) => {
      // 如果children有存資料
      if (child.children.length !== 0) {
        const inputData: Menu[] = [];
        child.children.forEach(id => {
          // 找出相對應的ID資料
          const findData = data.filter(x => x.id === id);
          // 相對應的ID資料的index
          const delIdx = data.findIndex(x => x.id === id);
          // 如果有找到相對應的sub資料
          if (findData.length > 0 && delIdx !== -1) {
            // 記錄sub資料
            inputData.push(findData[0]);
            // 記錄index
            needDelIdx.push(delIdx);
          }
        });
        // 塞回原本的children裡
        data[idx].children = inputData;
      }
    });
    // 降冪排序需刪除的index
    needDelIdx = needDelIdx.sort(function(a, b) {
      return b - a;
    });
    // 刪除外層sub資料
    needDelIdx.forEach(idx => {
      data.splice(idx, 1);
    });
    return data;
  }

  /**
   * 控制菜單是否顯示或關閉
   * @param show 顯示/關閉菜單
   */
  toggle(show: boolean) {
    this.toggled = show;
    this.toggledChange.emit(this.toggled);
  }

  /**
   * 顯示子menu
   * @param idx 第幾個項目
   */
  subShow(idx: number) {
    this.menu[idx].subShow =!this.menu[idx].subShow;
    this.menu[idx].children.forEach(item => {
      item.subShow = !item.subShow;
    })
    // 移至該menu位置
    if (this.menu[idx].subShow) {
      const data: ScrollIntoViewOptions = {
        behavior: "smooth",
        block: "end",
        inline: "nearest"
      }
      setTimeout(() => {
        document.getElementById(this.menu[idx].id)?.scrollIntoView(data);
      }, 100);
    }
  }
}
