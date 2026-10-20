import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { InTableConfig, Sort } from '@sysage/in-table';
import { EpicModalService } from '../core/services/modal.service';
import { UtilService } from '../core/services/util.service';
import { UserData } from '../core/models/users';
import { Comparator, Filter } from '../core/models/filter';
import { UsersService } from './users.service';
import { AlertService } from '../core/services/alert.service';
import { PageConfig } from '../core/models/page';
import { DataService } from '../core/services/data.service';
import { Permission } from '../core/models/permission';
import { PermissionService } from '../core/services/permission.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  userSearchForm!: FormGroup;

  userList: UserData[] = [];

  /** user 權限 */
  userPermission: { [key: string]: Permission } = {};

  ui = {
    isSearching: false
  }

  /** in-table setting */
  inTableConfig = new InTableConfig();
  inTableTranslate: any; // = new InTableTranslate();

  /** 設定分頁參數 */
  pageConfig = new PageConfig();

  filter = new Filter({
    pageSize: 10
  });

  /** 設定排序參數 */
  sortBy = {
    prop: 'updateTime',
    dir: Sort.desc,
  };

  get f() { return this.userSearchForm.controls }

  constructor(
    public util: UtilService,
    public permission: PermissionService,
    private fb: FormBuilder,
    private confirmModal: EpicModalService,
    private translate: TranslateService,
    private usersService: UsersService,
    private alert: AlertService,
    private data: DataService
  ) {
    this.initSearchForm();
  }

  ngOnInit(): void {
    // get rule first
    this.userPermission = this.permission.getPermission('user-v1');
    console.log(this.userPermission);

    const pref = JSON.parse(localStorage.getItem('users-list-table')!);
    if (pref?.itemsPerPage) {
      this.filter.pageSize = pref.itemsPerPage;
      this.pageConfig.itemsPerPage = pref.itemsPerPage;
    }
    this.init();
  }

  private init() {
    /** in-table setting */
    this.inTableConfig.sitckyElemId = 'page-header';
    this.inTableConfig.enableResizeColWidth = true;
    this.inTableConfig.showBorder = true;
    this.inTableConfig.showAllSubRowOnlyIfMoreThanOne = false;

    this.filter.sort = {};
    this.filter.sort[this.sortBy.prop] = this.sortBy.dir;
    const filter = this.getFilter(this.pageConfig.currentPage, this.pageConfig.itemsPerPage);
    filter.and = [];

    if (this.userPermission['user-v1.user-query']) {
      this.getUserList(filter);
    }
  }

  initSearchForm() {
    this.userSearchForm = this.fb.group({
      // account: [''],
      email: [''],
      nickName: [''],
      company: [''],
      roleName: [''],
      serialNumber: [''],
      enabled: [true]
    });
  }

  /** API: 搜尋使用者清單 */
  getUserList(filter?: Filter) {
    this.ui.isSearching = true;
    this.userSearchForm.disable();
    this.userList = [];

    const searchFilter = filter ? filter : this.getFilter(this.pageConfig.currentPage, this.pageConfig.itemsPerPage);

    this.usersService.getUserList(searchFilter).subscribe({
      next: (res) => {
        console.log('[users] getUserList done: ', res);
        this.userList = res.data;

        this.pageConfig.totalItems = res.page?.dataCount ?? 0;
        this.pageConfig.itemsPerPage = res.page?.pageSize ?? 10;
        this.pageConfig.currentPage = res.page?.pageIndex ?? 1;

        this.ui.isSearching = false;
        this.userSearchForm.enable();
      },
      error: (err) => {
        this.alert.errorAlert('[users] getUserList fail: ' + err);
        console.error('[users] getUserList fail: ', err);
        this.ui.isSearching = false;
        this.userSearchForm.enable();
      },
    });
    // this.reset();
  }

  /** API: 刪除使用者 */
  deleteUser(userId: string, roleList: { id: string, name: string }[]) {
    const roleIdList = roleList.map((role) => { return role.id });
    this.confirmModal.confirm(
      this.translate.instant('confirm to action this item', {
        action: this.translate.instant('delete'),
        item: this.translate.instant('all roles of user'),
      }),
      () => {
        this.usersService.deleteUserRole(userId, roleIdList).subscribe({
          next: (res) => {
            this.alert.successAlert(res.info.message);
            this.ui.isSearching = false;
            this.getUserList();
          },
          error: (err) => {
            this.alert.errorAlert('[authorization] deleteUser fail: ' + err);
            console.error('[authorization] deleteUser fail: ', err);
            this.ui.isSearching = false;
          },
        });
      },
      () => {
        return false;
      }
    );
  }

  /** 設定查詢條件 */
  getFilter(pageIndex: number, pageSize?: number) {
    const filter = new Filter();
    filter.pageIndex = pageIndex;

    if (pageSize !== undefined) {
      filter.pageSize = pageSize;
    }

    const setField = (field: string, comparator: Comparator) => {
      if (this.f[field].value ? this.f[field].value.trim() : '') {
        filter.and.push({
          comparator: comparator,
          field: field,
          value: this.f[field].value.trim()
        });
      }
    }

    setField('email', Comparator.like);
    setField('nickName', Comparator.like);
    setField('company', Comparator.like);
    setField('roleName', Comparator.like);
    setField('serialNumber', Comparator.equal)

    filter.and.push({
      comparator: Comparator.equal,
      field: 'enabled',
      value: this.f['enabled'].value
    });

    filter.sort = {};
    filter.sort[this.sortBy.prop] = this.sortBy.dir;

    this.filter = filter;
    return filter;
  }

  /** 清除表單 */
  reset() {
    this.initSearchForm();
    this.init();
  }

  /** 切換分頁時指定執行的函式 (in-table)
   * @param event 由 in-table 回傳的分頁資訊
   */
  pageChange(event: any) {
    localStorage.setItem('users-list-table', JSON.stringify({
      itemsPerPage: event.itemsPerPage,
    }));
    this.getUserList();
  }

  /** 點擊標題進行排序指定執行的函式 (in-table)
   * @param event 由 in-table 回傳的排序資訊
  */
  sort(event: any) {
    this.getUserList();
  }

  toUserDetail(event: any, id: string, email: string) {
    event.stopPropagation();
    event.preventDefault();
    this.data.setIdLabel('users', id, email);
  }

}
