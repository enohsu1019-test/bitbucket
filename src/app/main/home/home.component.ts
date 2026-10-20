import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { Menu, ApiMenu } from './home';
import { HomeService } from './home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private homeService: HomeService,
    private alert: AlertService,
  ) {}

  menu: Menu[] = [];

  ngOnInit() {
    this.getMenu();
  }

  /** 取得menu */
  getMenu() {
    this.homeService.getMenu().subscribe((res: any) => {
      if (res.info && res.info.success) {
        let menu: ApiMenu[] = res.data !== null ? res.data : [];
        menu = menu.filter(x => x.type === 'MENU' && x.label !== 'home');
        let needDelIdx: number[] = [];
        const subIcon: {id: string, icon: string}[] = [];
        // 檢查是否有子選項
        menu.forEach((item, idx) => {
          if (item.children.length !== 0) {
            // 記錄有子項的index
            needDelIdx.push(idx);
            // 記錄子項icon
            item.children.forEach(subItem => {
              const iconData = {
                id: subItem,
                icon: item.icon
              }
              subIcon.push(iconData);
            })
          }
        });
        // 寫入子項icon
        menu.forEach(item => {
          subIcon.forEach(subItem => {
            if (item.id === subItem.id) {
              item.icon = subItem.icon;
            }
          });
        });
        // 降冪排序需刪除的index
        needDelIdx = needDelIdx.sort(function(a, b) {
          return b - a;
        });
        // 刪除外層資料
        needDelIdx.forEach(idx => {
          menu.splice(idx, 1);
        });
        this.menu = menu;
      }
    }, (err: any) => {
      this.menu = [];
      this.alert.errorAlert(err);
    });
  }

}
