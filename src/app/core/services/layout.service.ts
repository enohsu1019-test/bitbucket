import { Injectable } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';

import { Subject } from 'rxjs';

class BreakPoint {
  name = '';
  mediaQuery: string | string[] = '';
}

/**
 * 透過 Angular Component Dev Kit (CDK) 內建的服務來訂閱畫面變化事件
 */
@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  /** 內部管理 observer 用的 subject */
  private _$breakpointsChanges: Subject<BreakPoint> = new Subject();
  /** 可供外部 observer 訂閱的 subject (observable only，亦即外部無法使用 subject.next 進行 multicast) */
  public $breakpointsChanges = this._$breakpointsChanges.asObservable();

  private breakpoints: BreakPoint[] = [{
      name: 'xl',
      mediaQuery: '(min-width: 1200px)'
    }, {
      name: 'lg',
      mediaQuery: '(min-width: 992px) and (max-width: 1199px)'
    }, {
      name: 'md',
      mediaQuery: '(min-width: 768px) and (max-width: 991px)'
    }, {
      name: 'sm',
      mediaQuery: '(min-width: 576px) and (max-width: 767px)'
    }, {
      name: 'xs',
      mediaQuery: '(max-width: 575px)'
    }];

  constructor( private breakpointObserver: BreakpointObserver ) {
    this.breakpoints.forEach(bp => {  // 針對所有 media query 組合
      this.breakpointObserver.observe(bp.mediaQuery)  // 建立一個 observable
        .subscribe(res => {  // 並且訂閱其變化
          if (res.matches) {  // 一旦符合這次訂閱的 media query 條件
            this._$breakpointsChanges.next(bp);  // 就針對 subject 裡的所有 observer 進行 multicast (組播)
          }
        });
    });
  }

  currentBreakpoint(): string {
    for (let i = 0; i < this.breakpoints.length; i ++) {
      if (this.breakpointObserver.isMatched(this.breakpoints[i].mediaQuery)) {
        return this.breakpoints[i].name;
      }
    }

    return '';
  }

  getResponsiveStyle(config: { [key: string]: string }) {
    const breakpoint = this.currentBreakpoint();
    if (config && config.hasOwnProperty(breakpoint)) {
      return config[breakpoint];
    }
    return 'xl';
  }

}
