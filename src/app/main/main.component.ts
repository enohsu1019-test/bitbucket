import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { LayoutService } from '../core/services/layout.service';
import { AlertService } from '../core/services/alert.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  animations: [
    trigger(
      'myAnimation',
      [
        transition(
          ':enter', [
          style({ opacity: 0 }),
          animate('500ms', style({ 'opacity': 1 }))
        ]),
        transition(
          ':leave', [
          style({ transform: 'translateX(0)', 'opacity': 1 }),
          animate('500ms', style({ 'opacity': 0 }))
        ]),
      ]
    )
  ],
})
export class MainComponent implements OnInit, OnDestroy {

  /** 菜單是否開啟 */
  sidebarToggled = false;

  /** 菜單是否常開 (大尺寸: lg, xl) 或是常關 (中小尺寸: xs, sm, md) */
  sidebarToggleNormalOn = false;

  /** 商機通知是否開啟 */
  notificationOn = false;
  notificationSubscription: Subscription = new Subscription;

  ui = {
    // isLoading: false,
    isShowScrollToTop: false,

    /** 偵測是否停止 scroll 的 timeout */
    scrollingTimeout: -1,
    isScrolling: false,
  };

  /** 目前的使用者 */
  get currentUserValue() {
    return this.authService.currentUserValue;
  }

  constructor(
    private layoutService: LayoutService,
    public alert: AlertService,
    private authService: AuthService,
  ) {
    console.log('[main] construct...');

    /** 訂閱畫面尺寸變化，以設定菜單常開/常關，以及開啟狀態 */
    this.layoutService.$breakpointsChanges.subscribe(res => {
      this.initSlidebarToggle(res.name);
    });
  }

  ngOnInit() {
    console.log('[main] init...');
    // this.idle.start();

    this.initSlidebarToggle(this.layoutService.currentBreakpoint());

    window.addEventListener('scroll', this.scrollEvent, true);
    // this.notificationSubscription = this.dataService.notificationSubject.subscribe((notificationBadges) => {

    //   for (let i = 0; i < Object.keys(notificationBadges).length; i++) {
    //     if (notificationBadges[Object.keys(notificationBadges)[i]] > 0) {
    //       this.notificationOn = true;
    //       break;
    //     }
    //   }
    // });
  }

  ngOnDestroy() {
    // this.idle.stop();
    window.removeEventListener('scroll', this.scrollEvent, true);
    this.notificationSubscription.unsubscribe();
  }

  initSlidebarToggle(bp: string) {
    this.sidebarToggled = false;
    this.sidebarToggleNormalOn = false;
  }

  scrollToTop() {
    const pageContentWrapper = document.getElementById('page-content-wrapper');
    if (pageContentWrapper) {
      pageContentWrapper.scrollTop = 0;
    }
  }

  scrollEvent = (event: any) => {
    const number = event.srcElement.scrollTop;
    if (number === 0) {
      this.ui.isShowScrollToTop = false;
    } else {
      this.ui.isShowScrollToTop = true;
    }

    this.ui.isScrolling = true;
    if (this.ui.scrollingTimeout) {
      clearTimeout(this.ui.scrollingTimeout);
    }
    this.ui.scrollingTimeout = window.setInterval(() => {
      this.ui.isScrolling = false;
    }, 2000);
  }

}
