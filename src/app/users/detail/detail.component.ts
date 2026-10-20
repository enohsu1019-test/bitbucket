import { forkJoin, Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { InTableConfig, Sort } from '@sysage/in-table';
import { AuthType, CloudIdsData, CompanyData, RoleResp, RuleData } from 'src/app/core/models/authorization';
import { Comparator, Filter } from 'src/app/core/models/filter';
import { userTypeList, UserData, AddUserData, User } from 'src/app/core/models/users';
import { AlertService } from 'src/app/core/services/alert.service';
import { EpicModalService } from 'src/app/core/services/modal.service';
import { UtilService } from 'src/app/core/services/util.service';
import { TabType } from '../users';
import { UsersService } from '../users.service';
import { ResponseData } from 'src/app/core/models/response-data';
import { PageConfig } from 'src/app/core/models/page';
import { Permission } from 'src/app/core/models/permission';
import { PermissionService } from 'src/app/core/services/permission.service';
import { AuthService } from 'src/app/core/services/auth.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  mode: 'add' | 'edit' = 'add';
  user: UserData = new UserData();
  userId: string = '';
  userCompany: CompanyData = new CompanyData();

  /** 目前登入的使用者資訊 */
  currentUser!: User | null;

  /** user 權限 */
  userPermission: { [key: string]: Permission } = {};
  /** iam 權限 */
  iamPermission: { [key: string]: Permission } = {};
  /** iam 權限 */
  customerPermission: { [key: string]: Permission } = {};

  userForm!: FormGroup;
  passwordForm!: FormGroup;

  tabType: TabType = TabType.general;

  /** 帳戶類型下拉選單 */
  userTypeDDL = userTypeList;
  roleDDL: RoleResp[] = [];
  selectRoles: RoleResp[] = [];
  jobDDL: { id: string, name: string }[] = [];
  companyDDL: CompanyData[] = [];
  selectedCompany: string = '';
  /** 使用者帳戶類型 */
  userType = '';

  /** 角色權限 Tab 資料 */
  roleList: RoleResp[] = [];
  roleId: string = '';
  role: RoleResp = new RoleResp;

  /** 顯示cloud id名稱 */
  cloudIdName = '';

  /** 新增交易代碼 */
  inputCode = '';

  /** 交易代碼列表 */
  promoCodeList: any[] = [];

  /** 權限設定分類：訂單/帳單 */
  ruleGroupIndex: number = 0;         // 當前的 group tab index
  ruleGroupName: string = '';         // 當前的 group tab name
  ruleGroupTabs: string[] = [];       // group tab list
  ruleGroupListOri: { groupName: string, group: RuleData[] }[] = [];
  ruleGroupListShow: { groupName: string, group: RuleData[] }[] = []; // 當前 group tab 裡的細項

  /** cloudIds in-Table List */
  cloudIdsTableList: CloudIdsData[] = [];

  ui = {
    isUserLoading: false,
    isPwLoading: false,
    isPersonalPage: false,  // 使用者個人頁面
    isUserExist: false,     // 使用者是否已存在
    userExistRes: '',       // 檢查使用者存在 api response
    isRoleChanging: false,    // 切換角色
    isRoleRuleLoading: false, // 角色細項 - cloudId table
    isRoleCidLoading: false,  // 角色細項 - cloudId table
    isCompanyLoading: false,  // 公司下拉選單
    isTransactionLoading: false // 新增交易代碼
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

  tableConfigCloudId = {
    isLoading: false,
    pageConfig: new PageConfig(),
    sortBy: {
      prop: 'time',
      dir: Sort.desc,
    }
  };

  /** 設定排序參數 */
  sortBy = {
    prop: 'time',
    dir: Sort.desc,
  };

  // 下拉選單基礎設定
  selectSettings = {
    text: this.translate.instant('please select'),
    selectAllText: this.translate.instant('select all'),
    unSelectAllText: this.translate.instant('unselect all'),
    searchPlaceholderText: this.translate.instant('search'),
    noDataLabel: this.translate.instant('no data found'),
    addNewButtonText: this.translate.instant('add'),
    filterSelectAllText: this.translate.instant('select all filtered results'),
    filterUnSelectAllText: this.translate.instant('unselect all filtered results'),
    enableSearchFilter: true,
    singleSelection: false,
    badgeShowLimit: 1,
    maxHeight: 250,
    position: 'bottom',
    autoPosition: false,
    labelKey: 'name',
    classes: 'custom-dropdown dropdown-position',
    lazyLoading: true,
    disabled: false,
    searchBy: ['allName']
  };
  companySelectSetting = _.cloneDeep(this.selectSettings);

  get userF() { return this.userForm.controls; }
  get f() { return this.passwordForm.controls; }
  get TabType() { return TabType; }
  get AuthType() { return AuthType; }

  /** 目前的使用者 */
  get currentUserValue() {
    return this.authService.currentUserValue;
  }

  /** 登入角色資訊 */
  get loginRole() {
    return {
      // 品牌
      brand: this.currentUserValue?.role ? this.currentUserValue?.role.brand?.name : '',
      // 公司
      company: this.currentUserValue?.role ? this.currentUserValue?.role.company.nickCh : '',
    }
  }

  constructor(
    public util: UtilService,
    public permission: PermissionService,
    public authService: AuthService,
    private fb: FormBuilder,
    private confirmModal: EpicModalService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private alert: AlertService,
    private usersService: UsersService
  ) {
    /** in-table setting */
    this.inTableConfig.sitckyElemId = 'page-header';

    this.companySelectSetting.labelKey = 'fullCh';
    this.companySelectSetting.searchBy = ['fullCh'];
    this.companySelectSetting.singleSelection = true;

    this.userForm = this.fb.group({
      company: [''],
      roleId: [[], Validators.required],
      email: ['', Validators.required],
      userType: [this.userTypeDDL[0].id],
      employeeId: [''],
      department: [''],
      job: [''],
      name: [''],
      englishName: [''],
      nickName: [''],
      telephone: [''],
      extension: [''],
      mobilePhone: [''],
      enabled: [true]
    });

    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validator: this.confirmedValidator('newPassword', 'confirmPassword')
    })
  }

  ngOnInit(): void {
    /* =====測試資料===== */
    const testData = {
      transactionCode: 'test1234',
      projectName: '提供AWS服務0001'
    }
    this.promoCodeList.push(testData);
    /* =====測試資料===== */
    // this.getPromoCodeList();

    this.currentUser = this.authService.currentUserValue;

    // get rule first
    this.userPermission = this.permission.getPermission('user-v1');
    this.iamPermission = this.permission.getPermission('iam-v1');
    this.customerPermission = this.permission.getPermission('customer-v1');
    console.log(this.userPermission);
    console.log(this.iamPermission);
    console.log(this.customerPermission);

    // 使用者個人頁面
    if (this.route.routeConfig?.path === 'personal' && !this.route.snapshot.params['user']) {
      this.mode = 'edit';
      this.ui.isPersonalPage = true;
      this.getUser();
      this.setPersonalForm();
    } // 使用者模組：新增
    else if (!this.route.snapshot.params['user']) {
      this.mode = 'add';
      this.userId = '';
      this.userF['userType'].disable();
      this.init();
    } // 使用者模組：編輯
    else {
      this.mode = 'edit';
      this.userId = this.route.snapshot.params['user'];
      this.setUserForm();
      this.init();
    }

    // 角色 table 右側視窗跳轉
    // this.inTableConfig.rowLinkKey = 'id';

    // cloud id顯示名稱
    switch (this.loginRole.brand) {
      case 'AWS':
        this.cloudIdName = 'Account ID';
        break;
      case 'Microsoft':
        this.cloudIdName = this.translate.instant('domain');
        break;
      default:
        this.cloudIdName = 'Cloud ID';
        break;
    }
  }

  private init() {
    this.ui.isUserLoading = true;

    if (this.mode === 'add') {
      this.addModeAction();
    } else {
      this.editModeAction();
    }
  }

  /** 新增模式下的權限檢查 */
  addModeAction() {
    let checkPermission = false;
    if (!this.userPermission['user-v1.checkEmailExists']) {
      this.userF['email'].disable();
      checkPermission = true;
    }
    if (!this.iamPermission['iam-v1.iam-query']) {
      this.userF['roleId'].disable();
      checkPermission = true;
    }
    if (checkPermission) {
      this.alert.errorAlert(this.translate.instant('please enable related permission first'));
    }
  }

  editModeAction() {
    const getJobPermission = this.userPermission['user-v1.getJob'];
    const getRuleGroupPermission = this.iamPermission['iam-v1.rule-group'];

    const apis: Observable<ResponseData>[] = [];

    // 下拉選單-職稱
    if (getJobPermission) {
      apis.push(this.usersService.getJobTitle());
    } else {
      this.userF['job'].disable();
    }

    // 取得權限群組
    if (getRuleGroupPermission) {
      apis.push(this.usersService.getRuleGroupList());
    }

    forkJoin(apis).subscribe({
      next: (allRes) => {
        console.log(`[user] init allRes = `, allRes);
        if (allRes.map(responseData => responseData.info.success).indexOf(false) < 0) {
          if (this.mode === 'edit') {
            // 取得職稱列表
            this.jobDDL = getJobPermission ? allRes[0].data : [];

            // 設定權限群組
            let ruleGroupList;

            // 取得權限清單
            if (!getRuleGroupPermission) {
              ruleGroupList = [];
            } else {
              ruleGroupList = getJobPermission ? allRes[1].data : allRes[0].data;
              this.getRuleGroupList(ruleGroupList);
            };
          }
        }
        this.getUser();
        this.ui.isUserLoading = false;
      },
      error: (err) => {
        this.alert.errorAlert('[user] init allRes: ' + err);
        console.error('[user] init allRes: ', err);
        this.ui.isUserLoading = false;
      }
    });
  }

  /** API: 取得角色權限列表 */
  getRoleList(filter: Filter) {
    this.ui.isUserLoading = true;
    // this.userForm.disable();
    this.roleDDL = [];

    this.usersService.getRoleList(filter).subscribe({
      next: (res) => {
        console.log('[authorization] getRoleList done: ', res);
        this.roleDDL = res.data.map((item: RoleResp) => {
          const obj = {
            id: item.id,
            brand: item.brand,
            identityType: item.identityType,
            company: item.company,
            name: `${item.brand?.name} / ${item.company?.nickCh} / ${item.name}`,
            allName: `${item.brand?.name}${item.company?.fullCh}${item.company?.nickCh}${item.company?.fullEn}${item.company?.nickEn}${item.name}`
          }
          return obj;
        });
        console.log(this.roleDDL);

        this.ui.isUserLoading = false;
      },
      error: (err) => {
        this.alert.errorAlert('[authorization] getRoleList fail: ' + err);
        console.error('[authorization] getRoleList fail: ', err);
        this.ui.isUserLoading = false;
      },
    });
  }

  /** API: get User */
  getUser() {
    this.ui.isUserLoading = true;

    const id = this.ui.isPersonalPage ? '' : this.userId;
    this.usersService.getUser(id).subscribe({
      next: (res) => {
        console.log('[user] getUser done', res);
        if (res.info.success && res?.data) {
          this.user = res.data;
          this.userCompany = res.data.company;
          this.userType = res.data.userType;
          this.setFormValue(res);
          if (this.ui.isPersonalPage && !this.userId) {
            this.userId = res.data.id;
            console.log(this.userId);
            this.init();
          } else {
            const roleList = res.data.roleList;
            if (roleList?.length) {
              if (this.ui.isPersonalPage) {
                // 取得現在登入的角色
                this.roleId = res.data.roleId;
                this.role = roleList.find((role: RoleResp) => role.id === this.roleId);
              } else {
                this.roleId = roleList[0]?.id
                this.role = roleList[0];
              }
              // 取得 cloudId 列表
              this.getCloudIdList(this.roleId);
            }

            // 取得 權限 列表
            this.ruleGroupTabs.forEach((item, index) => {
              this.getRuleGroupDetail(item, index, this.roleId);
            });
          }
        }
      },
      error: (err) => {
        console.error('[user] getUser fail', err);
        this.alert.errorAlert('[user] getUser fail' + err);
        this.ui.isUserLoading = false;
      },
      complete: () => {
        this.ui.isUserLoading = false;
      }
    });
  }

  /** API: 新增使用者 */
  createUser() {
    this.ui.isUserLoading = true;
    this.userForm.disable();

    const data: AddUserData = {
      roles: this.selectRoles.map(role => { return role.id }),
      email: this.userF['email'].value.trim(),
      userType: this.userF['userType'].value,
    }

    this.usersService.addUser(data).subscribe({
      next: (res) => {
        console.log('[user] addUser done', res);
        if (res.info.success) {
          const msg = this.translate.instant('back to last page');
          this.confirmModal.confirm(
            res.info.message,
            () => { this.backToListView(); }
          );
        } else {
          this.alert.errorAlert('[user] addUser fail' + res.info.message);
          this.ui.isUserLoading = false;
        }
      },
      error: (err) => {
        console.error('[user] addUser fail', err);
        this.alert.errorAlert('[user] addUser fail' + err);
        this.ui.isUserLoading = false;
        this.userForm.enable();
      },
      complete: () => {
        // this.ui.isUserLoading = false;
        this.userForm.enable();
      }
    });
  }

  /** API: 更新使用者 */
  saveUser() {
    this.ui.isUserLoading = true;
    const data = this.userForm.value;
    data.telephone = {
      number: this.userF['telephone'].value,
      ext: this.userF['extension'].value,
    }

    const userId = this.ui.isPersonalPage ? 'null' : this.userId;

    this.usersService.updateUser(userId, data).subscribe({
      next: (res) => {
        console.log('[authorization] getRole done', res);
        if (res.info.success && res?.data) {
          this.user = res.data;
          this.userCompany = res.data.company;
          // 若為使用者設定，需返回前頁
          if (this.ui.isPersonalPage) {
            this.alert.successAlert(res.info.message);
            this.setFormValue(res);
            this.ui.isUserLoading = false;
          } else {
            this.alert.successAlert(res.info.message);
            this.backToListView();
          }
        }
      },
      error: (err) => {
        console.error('[authorization] getRole fail', err);
        this.alert.errorAlert('[authorization] getRole fail' + err);
        this.ui.isUserLoading = false;
      }
    });
  }

  /** API: 更新密碼 */
  updatePassword() {
    this.ui.isPwLoading = true;
    const password: string = this.f['newPassword'].value;
    // 密碼格式安全檢查
    let pwdSecurity = true;
    if (!password.match(new RegExp('[a-z]')) ||
        !password.match(new RegExp('[A-Z]')) ||
        password.length < 7 ||
        password.length > 64) {
      this.alert.errorAlert(this.translate.instant('password is not safe'));
      this.ui.isPwLoading = false;
      return;
    }

    this.usersService.updatePassword(this.userId, password).subscribe({
      next: (res) => {
        console.log('[user password] updatePassword done', res);
        if (res.info.success) {
          this.alert.successAlert(res.info.message);
          this.passwordForm.reset();
        }
      },
      error: (err) => {
        console.error('[user password] updatePassword fail', err);
        this.alert.errorAlert('[user password] updatePassword fail' + err);
        this.ui.isPwLoading = false;
      },
      complete: () => {
        this.ui.isPwLoading = false;
      }
    });
  }

  /** API: 刪除使用者角色 */
  deleteRole(roleId: string) {
    // 不能刪除當前自己所使用的角色
    if (this.currentUser?.roleId === roleId) {
      this.alert.errorAlert(this.translate.instant('cannot delete current role'));
      return;
    }

    const confirmMsg = this.translate.instant('confirm to action this item', {
      action: this.translate.instant('delete'),
      item: this.translate.instant('role')
    })
    this.confirmModal.confirm(confirmMsg,
      () => {
        const data = [roleId];
        this.usersService.deleteUserRole(this.userId, data).subscribe({
          next: (res) => {
            console.log('[user] deleteRole done', res);
            if (res.info.success) {
              this.alert.successAlert(res.info.message);
              this.getUser();
            }
          },
          error: (err) => {
            console.error('[user] deleteRole fail', err);
            this.alert.errorAlert('[user] deleteRole fail' + err);
          }
        });
      },
      () => {
        return false;
      }
    );

  }

  /** API: checkUserExist */
  checkUserExist() {
    if (this.mode === 'add' && !this.iamPermission['iam-v1.iam-query']) {
      this.userF['roleId'].setValue('');
      return;
    }

    const email = this.userF['email'].value.trim();
    this.usersService.checkUserExist(email).subscribe({
      next: (res) => {
        console.log('[user] checkUserExist done', res);
        if (res.info.success) {
          this.ui.isUserExist = res.data.email;
          this.ui.userExistRes = res.info.message;

          // 設定 帳戶類型
          if (res.data.userType) {
            this.userF['userType'].disable();
            this.userF['userType'].setValue(res.data.userType);
          } else {
            // 經銷商、最終使用者新增帳戶只能選擇一班帳戶
            if ((this.currentUser && this.currentUser.role && this.currentUser.role.identityType === 'END_USER') ||
                (this.currentUser && this.currentUser.role && this.currentUser.role.identityType === 'DEALER')) {
              this.userF['userType'].disable();
            } else {
              this.userF['userType'].enable();
            }
          };

          // 設定 角色清單
          const roleFilter = this.getFilter(1, -1);
          const roleExistList = res.data.roleList;
          if (roleExistList?.length) {
            roleFilter.and.push({
              comparator: Comparator.notIn,
              field: '_id',
              value: roleExistList,
            });
            console.log(roleFilter);
          }
          this.getRoleList(roleFilter);

        };
      },
      error: (err) => {
        console.error('[user] checkUserExist fail', err);
        this.alert.errorAlert('[user] checkUserExist fail' + err);
      }
    });
  }

  /** API: 取得群組 */
  getRuleGroup() {
    this.usersService.getRuleGroupList().subscribe({
      next: (res) => {
        console.log('[authorization] getRuleGroup done: ', res);
        if (res.info.success) {
          this.getRuleGroupList(res);
        }
      },
      error: (err) => {
        this.alert.errorAlert('[authorization] getRuleGroup fail: ' + err);
        console.error('[authorization] getRuleGroup fail: ', err);
      }
    });
  }

  /** API: 取得群組細項 */
  getRuleGroupDetail(groupName: string, index: number, roleId: string) {
    this.ui.isRoleRuleLoading = true;

    this.usersService.getRuleGroupDetail(groupName, roleId).subscribe({
      next: (res) => {
        console.log('[authorization] getRuleGroupDetail done: ', res);
        if (res.info.success) {
          this.ruleGroupListOri[index].group = res.data;
          this.ruleGroupListShow[index].group =
            this.ruleGroupListOri[index].group.filter((rule) => rule.status === 'ENABLE');
        }
      },
      error: (err) => {
        this.alert.errorAlert('[authorization] getRuleGroupDetail fail: ' + err);
        console.error('[authorization] getRuleGroupDetail fail: ', err);
        this.ui.isRoleRuleLoading = false;
      },
      complete: () => {
        this.ui.isRoleRuleLoading = false;
      }
    });
  }

  /** API: get payerId, cloudId list */
  getCloudIdList(roleId: string) {
    this.ui.isRoleCidLoading = true;
    this.cloudIdsTableList = [];

    this.filter = this.getFilter(this.tableConfigCloudId.pageConfig.currentPage, this.tableConfigCloudId.pageConfig.itemsPerPage);
    this.filter.sort = {};
    this.filter.sort[this.tableConfigCloudId.sortBy.prop] = this.tableConfigCloudId.sortBy.dir;

    this.usersService.getCloudIdList(roleId, this.filter).subscribe({
      next: (res) => {
        console.log('[authorization] getCloudIdList done: ', res);
        if (res.info.success) {
          this.cloudIdsTableList = res.data;

          this.tableConfigCloudId.pageConfig.totalItems = res.page?.dataCount ?? 0;
          this.tableConfigCloudId.pageConfig.itemsPerPage = res.page?.pageSize ?? 10;
          this.tableConfigCloudId.pageConfig.currentPage = res.page?.pageIndex ?? 1;
        }
      },
      error: (err) => {
        this.alert.errorAlert('[authorization] getCloudIdList fail: ' + err);
        console.error('[authorization] getCloudIdList fail: ', err);
        this.ui.isRoleCidLoading = false;
      },
      complete: () => {
        this.ui.isRoleCidLoading = false;
      }
    });
    // this.keyword.payerId = '';
    // this.keyword.company = '';
    // this.keyword.cloudId = '';
  }

  /** 將取回的 res.data set 回欄位 */
  setFormValue(res: ResponseData) {
    this.roleList = res.data.roleList;
    // 下拉選單-公司 (所擁有角色公司選項)
    this.userF['company'].setValue(res.data.company ?? '');
    this.selectedCompany = res.data.company;
    const companyList: CompanyData[] = res.data?.roleList?.filter((item: RoleResp) => item.company.fullCh).map((item: RoleResp) => item.company) ?? [];
    this.companyDDL = _.uniqBy(companyList, 'fullCh');

    const roleIds = res.data?.roleList?.map((role: { id: string, name: string }) => { return role.id })
    this.userF['roleId'].setValue(roleIds);
    this.userF['email'].setValue(res.data.email);
    this.userF['userType'].setValue(res.data.userType);
    this.userF['employeeId'].setValue(res.data.employeeId);
    this.userF['department'].setValue(res.data.department);
    this.userF['job'].setValue(res.data.job);
    this.userF['name'].setValue(res.data.name);
    this.userF['englishName'].setValue(res.data.englishName);
    this.userF['nickName'].setValue(res.data.nickName);
    this.userF['telephone'].setValue(res.data.telephone?.number);
    this.userF['extension'].setValue(res.data.telephone?.ext);
    this.userF['mobilePhone'].setValue(res.data.mobilePhone);
    this.userF['enabled'].setValue(res.data.enabled);

    // if (res.data?.company) {
    //   this.companyDDL.push(res.data?.company);
    //   this.selectCompany.push(res.data?.company);
    // }
  }

  onCompanySelect(opt: CompanyData) {
    // console.log(item);
    // this.userCompany = item;
    // this.userF['customerId'].setValue(item?.id);
    // console.log(this.userF['customerId'].value);
    this.userF['company'].setValue('');
    this.userF['company'].setValue(opt.fullCh);
    this.selectedCompany = '';
    this.selectedCompany = opt.fullCh;
  }

  /**一般設定 欄位設定 (for 編輯mode) */
  setUserForm() {
    this.userF['email'].disable();
    this.userF['userType'].disable();
  }

  /** 使用者個人資料頁面 欄位設定 */
  setPersonalForm() {
    this.userF['email'].disable();
    this.userF['userType'].disable();

    this.userF['roleId'].clearValidators();
    this.userF['roleId'].updateValueAndValidity();

    // this.userF['employeeId'].setValidators([Validators.required]);
    // this.userF['employeeId'].updateValueAndValidity();
    this.userF['department'].setValidators([Validators.required]);
    this.userF['department'].updateValueAndValidity();
    this.userF['telephone'].setValidators([Validators.required]);
    this.userF['telephone'].updateValueAndValidity();
  }

  /** 判斷要 saveUser or updatePassword */
  save() {
    if (this.tabType === TabType.general) {
      this.mode === 'add' ? this.createUser() : this.saveUser();
    } else if (this.tabType === TabType.password) {
      this.updatePassword();
    } else {
      console.log('auth setting');
    }
  }

  /** 檢查兩次輸入的密碼是否一樣 */
  confirmedValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (matchingControl.errors && !matchingControl.errors['confirmedValidator']) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmedValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    }
  }

  /** 取消變更，返回上一頁面 */
  cancel() {
    const confirmMsg = this.translate.instant('confirm to action', {
      action:
        this.translate.instant('cancel') + this.translate.instant('current edit') +
        this.translate.instant('and back to last page'),
    })
    const alertMsg = this.translate.instant('back to last page');
    this.confirmModal.confirm(confirmMsg,
      () => {
        this.alert.successAlert(alertMsg);
        this.backToListView();
      },
      () => {
        return false;
      }
    );
  }

  /** 取消變更返回 list */
  backToListView(): any {
    this.router.navigate(['../'], {
      relativeTo: this.route,
      state: { route: { internal: true } },
    });
    if (this.ui.isUserLoading) {
      this.ui.isUserLoading = false;
    }
  }

  /** 設定查詢條件 */
  getFilter(pageIndex: number, pageSize?: number) {
    const filter = new Filter();
    filter.pageIndex = pageIndex;

    if (pageSize !== undefined) {
      filter.pageSize = pageSize;
    }

    filter.sort = {};
    filter.sort['time'] = Sort.desc;
    return filter;
  }

  getCompanyFilter(pageIndex: number, pageSize?: number, keyword?: string) {
    const filter = this.getFilter(pageIndex, pageSize);

    filter.and.push({
      comparator: Comparator.equal,
      field: 'status',
      value: 'ACTIVE'
    });

    if (keyword) {
      filter.and.push({
        comparator: Comparator.like,
        field: 'name.fullCh',
        value: keyword
      });
    }

    filter.sort = {};
    filter.sort['status'] = Sort.asc;
    filter.sort['modifiedTime'] = Sort.asc;
    return filter;
  }

  /** 切換分頁時指定執行的函式 (in-table)
   * @param event 由 in-table 回傳的分頁資訊
   */
  pageChange(event: any) {
    localStorage.setItem('personal-setting-cloudId', JSON.stringify({
      itemsPerPage: event.itemsPerPage,
    }));
  }

  /** 點擊標題進行排序指定執行的函式 (in-table)
   * @param event 由 in-table 回傳的排序資訊
   */
  sort(event: any) {
  }

  /** 角色多選單關閉時，將值更新回 userF['roleId'] */
  onClose() {
    const roleIds = this.selectRoles.map((role) => { return role.id })
    this.userF['roleId'].setValue(roleIds);
  }

  /** 取得權限群組 */
  getRuleGroupList(resData: any) {
    this.ruleGroupTabs = resData;
    this.ruleGroupName = this.ruleGroupTabs[0];
    this.ruleGroupTabs.forEach((item, index) => {
      this.ruleGroupListShow.push({ groupName: item, group: [] });
      this.ruleGroupListOri.push({ groupName: item, group: [] });
      // this.getRuleGroupDetail(item, index, this.roleId);
    });
  }

  /** 切換檢視之角色內容 */
  changeRoleView(roleId: string) {
    this.getCloudIdList(roleId);

    // 取得 權限 列表
    this.ruleGroupTabs.forEach((item, index) => {
      this.ruleGroupListShow[index].group = [];
      this.ruleGroupListOri[index].group = [];
      this.getRuleGroupDetail(item, index, roleId);
    });
  }

  /** 判斷儲存按鈕 disable 的狀態 */
  saveBtnDisable() {
    if (this.tabType === TabType.general) {   // 一般設定
      if (this.ui.isUserLoading || this.userForm.invalid) { // 如果表單 invalid
        return true;
      }
      // 如果新增模式下: 沒有 create、checkEmailExists、iam-query
      if (this.mode === 'add') {
        if (!this.userPermission['user-v1.create'] || !this.userPermission['user-v1.checkEmailExists'] || !this.iamPermission['iam-v1.iam-query']) {
          return true;
        }
      } else { // 編輯模式
        if (!this.userPermission['user-v1.update']) {
          return true;
        }
      }
    } else {  // 密碼設定
      if (this.ui.isPwLoading || this.passwordForm.invalid || !this.userPermission['user-v1.updatePassword']) {
        return true;
      }
    }
    return false;
  }

  onCompanyChange(event: any) {
    this.selectedCompany = event.target.value;
  }

  /** 取得交易代碼列表 */
  getPromoCodeList() {
    this.ui.isTransactionLoading = true;
    const filter = new Filter();
    this.usersService.getPromoCodes(filter).subscribe({
      next: (res) => {
        if (res.info && res.info.success) {
          this.promoCodeList = res.data !== null ? res.data : [];
        }
        this.ui.isTransactionLoading = false;
      },
      error: (err) => {
        this.alert.errorAlert('[getPromoCodeList fail]: ' + err);
        this.ui.isTransactionLoading = false;
      },
    });
  }

  /** 新增交易代碼 */
  addCode() {
    //
  }
}
