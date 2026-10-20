import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { BreadCrumb } from '../../core/models/breadcrumb';
import { filter, distinctUntilChanged, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { LayoutItem } from '../../core/models/layout-item';
import { DataService } from 'src/app/core/services/data.service';

/**
 * 動態產生 breadcrumb
 * [ref] {@link https://medium.com/@bo.vandersteene/angular-5-breadcrumb-c225fd9df5cf|Angular 5+ breadcrumb}
 */
@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit, OnDestroy {

  /** 存放目前 route 的所有 breadcrumb */
  breadcrumbs: BreadCrumb[] = [];

  /** Build your breadcrumb starting with the root route of your current activated route */
  breadcrumbsSubscription: Subscription;

  /** 手動更改麵包屑 */
  // manuallyUpdateSubscription: Subscription;

  /** 訂閱 layout config 是否更新 */
  // layoutConfigSubscription: Subscription;

  /** 使用者模組 detail 頁面 */
  usersPage: boolean = false;

  layoutConfig: LayoutItem[];
  /**
   * 建構子
   * @param activatedRoute 路由訊息服務
   * @param router 路由服務
   * @param dataService 自定義服務
   */
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) {
    console.log('[breadcrumb] construct...');
    this.layoutConfig = this.dataService.getLayoutConfig();

    this.breadcrumbsSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      distinctUntilChanged(),
      map(event => {
        console.log('[breadcrumb] NavigationEnd!');
        return this.buildBreadCrumb(this.activatedRoute.root);
      }),
    ).subscribe(data => {
      this.breadcrumbs = data;
    });

    // this.manuallyUpdateSubscription = this.dataService.manuallyUpdateBreadcrumb.subscribe((newBreadcrumb) => {
    //   this.breadcrumbs = newBreadcrumb;
    // });

  }

  ngOnInit() {
    this.updateBreadCrumb();
  }

  ngOnDestroy() {
    this.breadcrumbsSubscription.unsubscribe();
    // this.manuallyUpdateSubscription.unsubscribe();
  }

  updateBreadCrumb() {
    console.log('[breadcrumb] updateBreadCrumb...');
    this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
    // 檢查Breadcrumbs是否被更新
    const updateBreadcrumbs = setInterval(() => {
      const change = this.buildBreadCrumb(this.activatedRoute.root);
      if (change !== this.breadcrumbs) {
        this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
        clearInterval(updateBreadcrumbs);
      }
    }, 1000);
  }

  buildBreadCrumb(route: ActivatedRoute,
    url: string = '',
    params: {} = {},
    breadcrumbs: Array<BreadCrumb> = []): Array<BreadCrumb> {

    // If no routeConfig is available we are on the root path
    let label = route.routeConfig && route.routeConfig.data ? route.routeConfig.data['breadcrumb'] : '';
    const path = route.routeConfig ? route.routeConfig.path : '';

    // In the routeConfig the complete path is not available, so we rebuild it each time
    // const nextUrl = `${url}${path}/`;
    // 改成支援動態變數網址，例如： brands/:brand/solution --> brands/vmware/solution
    let varPath;
    // console.log('[breadcrumb] path', path);
    if (route.snapshot.params && path && path[0] === ':' && (path.substr(1) in route.snapshot.params)) {
      varPath = route.snapshot.params[path.substr(1)];
      // console.log('[breadcrumb] varPath', varPath);
    } else {
      varPath = path;
    }
    const nextUrlTmp = `${url}${varPath}`;
    const nextUrl = nextUrlTmp + (nextUrlTmp.slice(-1) === '/' ? '' : '/'); // 避免缺少部分 route 段落，造成網址出現連續兩個斜線「//」，結果找不到批配
    // const item = this.dataService.getLayoutItem(this.layoutConfig, { route: nextUrl });
    // let icon = item && item[0] && item[0].icon ? item[0].icon : '';
    let icon = '';

    /** 如果 label 是變數 (::)，透過幾個方式取得 label:
     * 1. 從 layout config 中把 route 的名稱找出來 (label 已經定義在 route 裡)
     * 2. 從 resource 的 {id: label} 列表中
     * 尋找
     * 3. 就直接把變數的 id 當做 label
     */
    if (label === '::') {
      const type = path ? path.substr(1) + 's' : '';
      label = this.dataService.getLayoutItemLabel(this.layoutConfig, nextUrl) ||
        this.dataService.getIdLabel(type, varPath) ||
        varPath;

      console.log('::', type, label);

      /** 如果是使用者模組 detail 頁面，breadcrumb label 要改為 usersEmail */
      if (path === ':user') {
        this.usersPage = true;
      } else {
        this.usersPage = false;
      }
    }

    // 找不到 icon 就用最後一個 breadcrumb 的 icon
    if (!icon) {
      icon = breadcrumbs && breadcrumbs.length ? breadcrumbs[breadcrumbs.length - 1].icon || '' : '';
    }

    const breadcrumb = {
      label: label,
      url: nextUrl,
      params: route.snapshot.params,
      icon: icon
    };

    // 如果沒有 label，表示不需要加入 breadcrumb
    const newBreadcrumbs = label ? [...breadcrumbs, breadcrumb] : [...breadcrumbs];

    if (route.firstChild) {
      // If we are not on our current path yet, there will be more children to look after, to build our breadcumb
      return this.buildBreadCrumb(route.firstChild, nextUrl, route.params, newBreadcrumbs);
    }
    console.log(newBreadcrumbs);
    return newBreadcrumbs;
  }

  // getRouteLabel(route: string) {
  //   const label = this.dataService.getLayoutItemLabel(this.layoutConfig, route);
  //   // console.log('[breadcrumb] getRouteLabel', route, label);

  //   return label;
  // }

}
