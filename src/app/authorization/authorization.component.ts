import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { InTableConfig, Sort } from '@sysage/in-table';
import { EpicModalService } from '../core/services/modal.service';
import { UtilService } from '../core/services/util.service';
import { BrandData, identityTypeList, RoleResp } from '../core/models/authorization';
import { Comparator, Filter } from '../core/models/filter';
import { AuthorizationService } from './authorization.service';
import { AlertService } from '../core/services/alert.service';
import { PageConfig } from '../core/models/page';
import { DataService } from '../core/services/data.service';
import { PermissionService } from '../core/services/permission.service';
import { Permission } from '../core/models/permission';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-authorization',
  templateUrl: './authorization.component.html',
  styleUrls: ['./authorization.component.scss']
})
export class AuthorizationComponent implements OnInit {

  authSearchForm!: FormGroup;

  roleList: RoleResp[] = [];

  /** iam 權限 */
  iamPermission: { [key: string]: Permission } = {};

  /** ------ 下拉列表 ------- */
  /** 原廠/品牌 */
  brandDDL: BrandData[] = [];
  /** 公司類型 */
  identityTypeDDL = identityTypeList;
  /** 公司 */
  // customerDDL: { id: string, name: string }[] = [];

  ui = {
    isSearching: false
  }

  /** in-table setting */
  inTableConfig = new InTableConfig();
  inTableTranslate: any; // = new InTableTranslate();

  defaultPageSize = 10;
  /** 設定分頁參數 */
  pageConfig = new PageConfig();

  filter = new Filter({
    pageSize: this.defaultPageSize
  });

  /** 設定排序參數 */
  sortBy = {
    prop: 'time',
    dir: Sort.desc,
  };

  get f() { return this.authSearchForm.controls }

  constructor(
    public util: UtilService,
    public permission: PermissionService,
    private fb: FormBuilder,
    private confirmModal: EpicModalService,
    private translate: TranslateService,
    private authService: AuthorizationService,
    private alert: AlertService,
    private data: DataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.initSearchForm();
  }

  ngOnInit(): void {
    // get rule first
    this.iamPermission = this.permission.getPermission('iam-v1');
    console.log(this.iamPermission);

    const pref = JSON.parse(localStorage.getItem('authorization-list-table')!);
    if (pref?.itemsPerPage) {
      this.filter.pageSize = pref.itemsPerPage;
      this.pageConfig.itemsPerPage = pref.itemsPerPage;
    }
    this.init();
  }

  initSearchForm() {
    this.authSearchForm = this.fb.group({
      brandName: [''],
      identityType: [''],
      name: [''],
      customer: [''],
      serialNumber: [''],
    });
  }

  private init() {
    /** in-table setting */
    this.inTableConfig.sitckyElemId = 'page-header';
    this.inTableConfig.enableResizeColWidth = true;
    this.inTableConfig.showBorder = true;
    this.inTableConfig.showAllSubRowOnlyIfMoreThanOne = false;
    this.inTableTranslate = {
      'no data found': this.translate.instant('no data found'),
      'items per page': this.translate.instant('no data found'),
    };

    this.filter.sort = {};
    this.filter.sort[this.sortBy.prop] = this.sortBy.dir;

    this.getBrandList();

    if (this.iamPermission['iam-v1.iam-query']) {
      this.getRoleList();
    };
  }

  /** API: 取得原廠清單 */
  getBrandList() {
    this.f['brandName'].disable();

    this.authService.getBrandList().subscribe({
      next: (res) => {
        console.log('[authorization] getBrandList done: ', res);
        if (res.info.success && res?.data) {
          this.brandDDL = res.data;
        }
        this.f['brandName'].enable();
      },
      error: (err) => {
        this.alert.errorAlert('[authorization] getBrandList fail: ' + err);
        console.error('[authorization] getBrandList fail: ', err);
        this.f['brandName'].enable();
      },
    });
  }

  /** API: 搜尋角色權限 */
  getRoleList() {
    this.ui.isSearching = true;
    this.authSearchForm.disable();
    this.roleList = [];

    this.filter = this.getFilter(this.pageConfig.currentPage, this.pageConfig.itemsPerPage);

    this.authService.getRoleList(this.filter).subscribe({
      next: (res) => {
        console.log('[authorization] getRoleList done: ', res);
        this.roleList = res.data;

        if (res.info.success && res?.data) {
          res.data.forEach((role: RoleResp) => this.data.setIdLabel('authorizations', role.id, role.name));
        }
        this.pageConfig.totalItems = res.page?.dataCount ?? 0;
        this.pageConfig.itemsPerPage = res.page?.pageSize ?? 10;
        this.pageConfig.currentPage = res.page?.pageIndex ?? 1;

        this.ui.isSearching = false;
        this.authSearchForm.enable();
      },
      error: (err) => {
        this.alert.errorAlert('[authorization] getRoleList fail: ' + err);
        console.error('[authorization] getRoleList fail: ', err);
        this.ui.isSearching = false;
        this.authSearchForm.enable();
      },
    });
    // this.reset();
  }

  /** API: 刪除角色權限 */
  deleteRole(id: string, roleName: string) {
    this.confirmModal.confirm(
      this.translate.instant('confirm to action this item', {
        action: this.translate.instant('delete'),
        item: this.translate.instant('role authorization') + ': ' + roleName,
      }),
      () => {
        this.authService.deleteRole(id).subscribe({
          next: (res) => {
            this.alert.successAlert(res.info.message);
            this.ui.isSearching = false;
            this.getRoleList();
          },
          error: (err) => {
            this.alert.errorAlert('[authorization] deleteRole fail: ' + err);
            console.error('[authorization] deleteRole fail: ', err);
            this.ui.isSearching = false;
          },
        });
      },
      () => {
        return false;
      }
    );
  }

  /** 複製權限 */
  cloneRole(roleId: string, roleIdentityType: string) {
    this.router.navigate(['add'], {
      relativeTo: this.activatedRoute,
      queryParams: { cloneId: roleId, cloneIdentityType: roleIdentityType }
    });
  }

  /** 設定查詢條件 */
  getFilter(pageIndex: number, pageSize?: number) {
    const filter = new Filter();
    filter.pageIndex = pageIndex;

    if (pageSize !== undefined) {
      filter.pageSize = pageSize;
    }

    const setField = (input: string, field: string, comparator: Comparator) => {
      if (this.f[input].value ? this.f[input].value.trim() : '') {
        filter.and.push({
          comparator: comparator,
          field: field,
          value: this.f[input].value.trim()
        });
      }
    }

    setField('brandName', 'brand.name', Comparator.like);
    setField('identityType', 'identityType', Comparator.equal);
    setField('name', 'name', Comparator.like);
    setField('customer', 'customer', Comparator.like);
    setField('serialNumber', 'customer.serialNumber', Comparator.like);

    filter.sort = {};
    filter.sort[this.sortBy.prop] = this.sortBy.dir;
    return filter;
  }

  /** 清除表單 */
  reset() {
    this.initSearchForm();
  }

  /** 切換分頁時指定執行的函式 (in-table)
   * @param event 由 in-table 回傳的分頁資訊
   */
  pageChange(event: any) {
    localStorage.setItem('authorization-list-table', JSON.stringify({
      itemsPerPage: event.itemsPerPage,
    }));
    this.getRoleList();
  }

  /** 點擊標題進行排序指定執行的函式 (in-table)
   * @param event 由 in-table 回傳的排序資訊
  */
  sort(event: any) {
    this.getRoleList();
  }
}
