import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { InTableConfig, Sort } from '@sysage/in-table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { forkJoin, Observable } from 'rxjs';
import { DefaultPermissions } from 'src/app/core/models/authorization-default';
import { Comparator, Filter } from 'src/app/core/models/filter';
import { PageConfig } from 'src/app/core/models/page';
import { Permission } from 'src/app/core/models/permission';
import { ResponseData } from 'src/app/core/models/response-data';
import { User } from 'src/app/core/models/users';
import { AlertService } from 'src/app/core/services/alert.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { DataService } from 'src/app/core/services/data.service';
import { EpicModalService } from 'src/app/core/services/modal.service';
import { PermissionService } from 'src/app/core/services/permission.service';
import { UtilService } from 'src/app/core/services/util.service';
import { AuthType, CloudIdsData, Role, RuleData, CompanyData, CloudIdsInfo, BrandData, RoleForm, IdentityType, CustomerData, CustomerIdentity } from '../../core/models/authorization';
import { RightDrawerConfig } from '../authorization';
import { AuthorizationService } from '../authorization.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  @ViewChild('brandId') brandId: ElementRef | undefined;

  mode: 'add' | 'edit' = 'add';
  roleId: string = '';
  cloneId: string = '';

  role = new Role();

  authForm!: FormGroup;

  /** 目前登入的使用者資訊 */
  currentUser!: User | null;
  currentUserBrandId!: string | undefined;

  /** iam 權限 */
  iamPermission: { [key: string]: Permission } = {};
  customerPermission: { [key: string]: Permission } = {};

  /** in-table setting */
  inTableConfig = new InTableConfig();
  keyword = {
    payerId: '', cloudId: '', company: '',
  }
  filter = new Filter({ pageSize: 10 });

  tableConfigCloudId = {
    isLoading: false,
    pageConfig: new PageConfig(),
    sortBy: {
      prop: 'time',
      dir: Sort.desc,
    }
  };

  /** 權限設定分類：訂單/帳單 */
  ruleGroupIndex: number = 0;         // 當前的 group tab index
  ruleGroupName: string = '';         // 當前的 group tab name
  ruleGroupTabs: string[] = [];       // group tab list
  ruleGroupListOri: { groupName: string, group: RuleData[] }[] = [];
  ruleGroupListShow: { groupName: string, group: RuleData[] }[] = []; // 當前 group tab 裡的細項

  allCompanyOpt: CompanyData = {
    id: 'ALL', fullCh: 'All', fullEn: 'All', nickCh: 'All', nickEn: 'All'
  };

  /** 右側編輯視窗 */
  bsModalRef?: BsModalRef;

  /** cloudIds in-Table List */
  cloudIdsTableList: CloudIdsData[] = [];

  /** ------ 下拉列表 ------- */
  /** 原廠/品牌 */
  brandDDL: BrandData[] = [];
  /** 公司類型 */
  identityTypeDDL: { value: IdentityType, name: string }[] = [];
  /** 公司 */
  companyDDL: CompanyData[] = [];
  selectedCompany: CompanyData[] = [];

  modalTitle: string = '';
  modalList: { ori: RuleData[], edit: RuleData[] }
    = { ori: [], edit: [] }
  modalCloudId: CloudIdsData | null = new CloudIdsData();
  modalType: 'roleRule' | 'cloudId' | 'company' = 'roleRule';
  modalCompany: CompanyData | null = new CompanyData();

  ui = {
    isLoading: false,
    isRoleLoading: false,
    isRuleLoading: false,
    isCloudIdLoading: false,
    // isSearching: false,
    ifRoleExist: false,    // 確認角色名稱是否存在
    oriRoleName: '',       // getRole 後原始的角色名稱
    isCompanyDisable: false,
  }

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
    singleSelection: true,
    badgeShowLimit: 1,
    maxHeight: 250,
    position: 'bottom',
    autoPosition: false,
    labelKey: 'fullCh',
    classes: 'custom-dropdown dropdown-position',
    // lazyLoading: true,
    disabled: false,
    searchBy: ['fullCh'],
  };

  get AuthType() { return AuthType; }
  get f() { return this.authForm.controls }
  get IdentityType() { return IdentityType; }

  /** 顯示cloud id名稱 */
  cloudIdName = '';

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
    private fb: FormBuilder,
    private bsModal: BsModalService,
    private confirmModal: EpicModalService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private alert: AlertService,
    private apiService: AuthorizationService,
    private data: DataService,
    private authService: AuthService,
    public permission: PermissionService,
  ) {
    /** in-table setting */
    this.inTableConfig.sitckyElemId = 'page-header';

    this.authForm = this.fb.group({
      brandId: ['', Validators.required],
      identityType: ['', Validators.required],
      companyId: ['', Validators.required],
      name: [{ value: '', disabled: true }, Validators.required],
    });
  }

  ngOnInit(): void {

    // get rule first
    this.iamPermission = this.permission.getPermission('iam-v1');
    this.customerPermission = this.permission.getPermission('customer-v1');
    console.log(this.iamPermission);

    /** CloudId-inTable itemsPerPage */
    const urlRankPref = JSON.parse(localStorage.getItem('roleRule-setting-cloudId')!);
    if (urlRankPref?.itemsPerPage) {
      this.tableConfigCloudId.pageConfig.itemsPerPage = urlRankPref.itemsPerPage;
    }

    this.currentUser = this.authService.currentUserValue;
    this.currentUserBrandId = this.currentUser?.role?.brand?.id;

    if (!this.route.snapshot.params['authorization']) {
      this.mode = 'add';
      this.roleId = '';
      this.route.queryParams.subscribe((value) => {
        this.cloneId = value['cloneId'];
      });
    } else {
      this.mode = 'edit';
      this.roleId = this.route.snapshot.params['authorization'];
    }
    console.log('MODE:', this.mode);

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

    this.init();

    if (!this.f['brandId'].value || !this.f['identityType'].value) {
      this.f['companyId'].disable();
      this.ui.isCompanyDisable = true;
    }
  }

  private init() {
    const apis: Observable<ResponseData>[] = [];
    /** get 權限 tab 清單 */
    if (this.iamPermission['iam-v1.rule-group']) {
      apis.push(this.apiService.getRuleGroupList()); // get 權限 tab 清單
    }

    if (this.mode === 'add' && this.iamPermission['iam-v1.brands']) {
      apis.push(this.apiService.getBrandList());     // get 原廠 list
    }

    forkJoin(apis).subscribe({
      next: (allRes) => {
        console.log(`[authorization] init allRes = `, allRes);
        this.ui.isLoading = false;
        if (allRes.map(responseData => responseData.info.success).indexOf(false) < 0) {
          // 權限 tab 清單
          if (this.iamPermission['iam-v1.rule-group'] && this.iamPermission['iam-v1.rule-get']) {
            this.getRuleGroupList(allRes[0]);
          }

          if (this.mode === 'add') {
            // get 原廠 list
            if (this.iamPermission['iam-v1.rule-group'] && this.iamPermission['iam-v1.brands']) {
              this.getBrandList(allRes[1]); // this.brandDDL = allRes[1].data;
            } else if (!this.iamPermission['iam-v1.rule-group'] && this.iamPermission['iam-v1.brands']) {
              this.getBrandList(allRes[0]); // this.brandDDL = allRes[0].data;
            } else if (!this.iamPermission['iam-v1.rule-group'] && !this.iamPermission['iam-v1.brands']) {
              this.brandDDL = [];
            }
            this.f['brandId'].setValue(this.brandDDL[0].id);
            this.checkToGetCompanyDDL('brand');

            this.addModeAction();
          } else if (this.mode === 'edit') {
            this.editModeAction(this.roleId);
          }
        }
      },
      error: (err) => {
        this.alert.errorAlert('[authorization] init allRes fail: ' + err);
        console.error('[authorization] init allRes fail: ', err);
        this.ui.isLoading = false;
      },
    });

    if (!apis.length) {
      if (this.mode === 'add') {
        this.addModeAction();
      } else {
        this.editModeAction(this.roleId);
      }
    }

    this.inTableConfig.enableResizeColWidth = true;
    this.inTableConfig.showBorder = true;

    // 設定公司類型下拉選單
    this.setIdentityTypeDDL();
  }

  /** 新增模式下的權限檢查 */
  addModeAction() {
    let checkPermission = false;
    if (!this.iamPermission['iam-v1.brands']) {
      this.f['brandId'].disable();
      checkPermission = true;
    }
    if (!this.customerPermission['customer-v1.queryCustomers']) {
      this.f['companyId'].disable();
      this.ui.isCompanyDisable = true;
      checkPermission = true;
    }
    if (!this.iamPermission['iam-v1.checkName']) {
      this.f['name'].disable();
      checkPermission = true;
    }
    if (checkPermission) {
      this.alert.errorAlert(this.translate.instant('please enable related permission first'));
    }

    // =============== 複製 MODE ===============
    if (this.cloneId) {
      this.editModeAction(this.cloneId);
      this.authForm.enable();
    }
  }

  /** 編輯模式下的權限檢查 */
  editModeAction(roleId: string) {
    this.getRole(roleId);
    if (this.iamPermission['iam-v1.cloudIdInfo-query']) {
      this.searchCloudId();
    }
    this.authForm.disable();
    if (this.iamPermission['iam-v1.checkName']) {
      this.f['name'].enable();
    }
  }

  /** API: get role */
  getRole(roleId: string) {
    this.ui.isRoleLoading = true;
    this.ui.ifRoleExist = false;

    this.apiService.getRole(roleId).subscribe({
      next: (res) => {
        console.log('[authorization] getRole done', res);
        if (res.info.success && res?.data) {
          // this.role = res.data;
          this.getBrandList();
          this.data.setIdLabel('authorizations', res.data.id, res.data.name);

          this.f['identityType'].setValue(res.data.identityType);
          this.selectedCompany = [];

          if (this.mode === 'edit') {
            this.ui.oriRoleName = res.data.name;
            this.f['companyId'].setValue(res.data.company?.id);
            this.f['brandId'].setValue(res.data.brand?.id);
            this.f['name'].setValue(res.data.name);
            this.brandDDL = res.data.brand ? [res.data.brand] : [];
            this.companyDDL = res.data.company ? [res.data.company] : [];
            this.selectedCompany.push(res.data.company);
          } else {
            this.ui.oriRoleName = this.cloneId ? '' : res.data.name;
            this.f['name'].setValue(this.cloneId ? '' : res.data.name);

            const brandDDLIds = this.brandDDL.map(item => { return item.id });
            const companyDDLIds = this.companyDDL.map(item => { return item.id });

            // 如果 brandDDL 有包含目前的複製的 brandId
            if (brandDDLIds.includes(res.data.brand?.id)) {
              this.f['brandId'].setValue(res.data.brand?.id);
            }

            // 如果 companyDDL 有包含目前的複製的 companyId
            if (companyDDLIds.includes(res.data.company?.id)) {
              console.log(companyDDLIds);
              this.selectedCompany.push(res.data.company);
              this.f['companyId'].setValue(res.data.company?.id);
            }
          }

        }
        this.ui.isRoleLoading = false;
      },
      error: (err) => {
        console.error('[authorization] getRole fail', err);
        this.alert.errorAlert('[authorization] getRole fail' + err);
        this.ui.isRoleLoading = false;
      },
    });

  }

  /** 取得權限群組 */
  getRuleGroupList(res: ResponseData) {
    this.ruleGroupTabs = res.data;
    this.ruleGroupName = this.ruleGroupTabs[0];
    this.ruleGroupTabs.forEach((item, index) => {
      this.ruleGroupListShow.push({ groupName: item, group: [] });
      this.ruleGroupListOri.push({ groupName: item, group: [] })
      this.getRuleGroupDetail(item, index);
    });
  }

  /** API: 取得群組細項 */
  getRuleGroupDetail(groupName: string, index: number) {
    this.ui.isRuleLoading = true;
    const roleId = this.mode === 'add' ? (this.cloneId ?? '') : this.roleId;
    this.apiService.getRuleGroupDetail(groupName, roleId).subscribe({
      next: (res) => {
        console.log('[authorization] getRuleGroupDetail done: ', res);
        if (res.info.success) {
          this.ruleGroupListOri[index].group = res.data;

          // 帶入 default permission
          // set default permission disabled
          this.ruleGroupListOri[index].group.forEach(element => {
            if (DefaultPermissions.includes(element.id)) {
              if (this.mode === 'add') { element.status = 'ENABLE'; }
              element.disabled = true;
            }
          });

          this.ruleGroupListShow[index].group =
            this.ruleGroupListOri[index].group.filter((rule) => rule.status === 'ENABLE');
        }

        // if (res.info.success) {
        //   this.ruleGroupListAll = res.data;
        //   // 取回的資料跟目前暫存選取的資料比對，有的設為 ENABLE
        //   this.ruleGroupListAll.forEach((item) => {
        //     item.status = this.ruleGroupListTemp.includes(item.id) ? 'ENABLE' : 'DISABLE';
        //   })
        //   this.ruleGroupListShow[this.ruleGroupIndex].group =
        //     this.ruleGroupListAll.filter((rule) => rule.status === 'ENABLE');
        // }
        // this.ui.isSearching = false;
      },
      error: (err) => {
        this.alert.errorAlert('[authorization] getRuleGroupDetail fail: ' + err);
        console.error('[authorization] getRuleGroupDetail fail: ', err);
        this.ui.isRuleLoading = false;
      },
      complete: () => {
        this.ui.isRuleLoading = false;
      }
    });
  }

  /** API: get payerId, cloudId list */
  getCloudIdList(filter: Filter) {
    this.ui.isCloudIdLoading = true;
    this.cloudIdsTableList = [];
    const roleId = this.mode === 'add' ? (this.cloneId ?? '') : this.roleId;

    this.apiService.getCloudIdList(roleId, filter).subscribe({
      next: (res) => {
        console.log('[authorization] getCloudIdList done: ', res);
        if (res.info.success) {
          res.data.forEach((item: CloudIdsData) => {
            if (!item.company?.id) {
              item.company = this.allCompanyOpt;
            }
          })
          this.cloudIdsTableList = res.data;

          this.tableConfigCloudId.pageConfig.totalItems = res.page?.dataCount ?? 0;
          this.tableConfigCloudId.pageConfig.itemsPerPage = res.page?.pageSize ?? 10;
          this.tableConfigCloudId.pageConfig.currentPage = res.page?.pageIndex ?? 1;
        }
      },
      error: (err) => {
        this.alert.errorAlert('[authorization] getCloudIdList fail: ' + err);
        console.error('[authorization] getCloudIdList fail: ', err);
        this.ui.isCloudIdLoading = false;
      },
      complete: () => {
        this.ui.isCloudIdLoading = false;
      }
    });
    // this.keyword.payerId = '';
    // this.keyword.company = '';
    // this.keyword.cloudId = '';
  }

  /** get 原廠 list */
  getBrandList(res?: ResponseData) {
    if (this.mode === 'edit') {
      this.f['brandId'].disable();
    }
    if (res) {
      if (this.currentUserBrandId) {
        this.brandDDL = res.data.filter((brand: BrandData) => brand.id === this.currentUserBrandId)
      } else {
        this.brandDDL = res.data;
      }
    }
  }

  /** API: add role */
  addRole() {
    this.ui.isRoleLoading = true;

    // 檢查是否已經有這個 RoleName
    if (this.checkIfRoleExist()) { return; }

    // 權限設定 部分
    let roleRules: string[] = [];
    this.ruleGroupListShow.forEach((item) => {
      const list = item.group.map(group => group.id);
      roleRules = roleRules.concat(list);
    });

    // cloudId 部分
    const cloudInfos: CloudIdsInfo[] = this.cloudIdsTableList.map((item) => {
      const obj: CloudIdsInfo = {
        brandId: this.f['brandId'].value,
        payerId: item.payerId.payerId,
        companyId: item.company?.id,
        cloudIds: item.cloudIds
      };
      return obj;
    })

    const data: RoleForm = {
      brandId: this.f['brandId'].value,
      identityType: this.f['identityType'].value,
      companyId: this.f['companyId'].value,
      role: {
        name: this.f['name'].value,
        rules: roleRules,
      },
      cloudInfos: cloudInfos
    }

    // const data: Role = {
    //   brandId: '45cfa6ad63754bd3af1065e0cb162e16',
    //   identityType: this.f['identityType'].value,
    //   companyId: 'b832e2153ef143f4ae9beccb40fc05d2',
    //   role: {
    //     name: this.f['name'].value,
    //     rules: roleRules,
    //   },
    //   cloudInfos: cloudInfos
    // }

    this.apiService.addRole(data).subscribe({
      next: (res) => {
        console.log('[authorization] addRole done: ', res);
        if (res.info.success) {
          this.alert.successAlert(res.info.message);
          this.backToListView();
        }
      },
      error: (err) => {
        this.alert.errorAlert('[authorization] addRole fail: ' + err);
        console.error('[authorization] addRole fail: ', err);
        this.ui.isRoleLoading = false;
      }
    });
  }

  /** API: update role */
  updateRole() {
    this.ui.isRoleLoading = true;
    this.authForm.disable();

    // if (this.checkIfRoleExist()) { return; }

    this.apiService.updateRole(this.roleId, this.authForm.value).subscribe({
      next: (res) => {
        console.log('[authorization] updateRole done: ', res);
        if (res.info.success) {
          // this.role = res.data;
          this.ui.oriRoleName = res.data.name;
          this.ui.ifRoleExist = false;
          this.f['brandId'].setValue(res.data.brand?.id);
          this.f['identityType'].setValue(res.data.identityType);
          this.f['companyId'].setValue(res.data.company?.id);
          this.selectedCompany = [];
          this.selectedCompany.push(res.data.company);
          this.f['name'].setValue(res.data.name);
          this.alert.successAlert(res.info.message);
        }
      },
      error: (err) => {
        this.ui.isRoleLoading = false;
        this.f['name'].enable();
        this.alert.errorAlert('[authorization] updateRole fail: ' + err);
        console.error('[authorization] updateRole fail: ', err);
      },
      complete: () => {
        this.ui.isRoleLoading = false;
        this.f['name'].enable();
      }
    });
  }

  /** API: delete CloudId */
  deleteCloudIdApi(id: string) {
    this.ui.isCloudIdLoading = true;
    this.apiService.deleteCloudId(this.roleId, id).subscribe({
      next: (res) => {
        console.log('[authorization] deleteCloudIdApi done: ', res);
        this.alert.successAlert(res.info.message);
        if (res.info.success) {
          this.searchCloudId();
        }
      },
      error: (err) => {
        this.alert.errorAlert('[authorization] deleteCloudIdApi fail: ' + err);
        console.error('[authorization] deleteCloudIdApi fail: ', err);
        this.ui.isCloudIdLoading = false;
      },
      complete: () => {
        this.ui.isCloudIdLoading = false;
      }
    });
  }

  /** API: 取得公司資訊
   * filter 條件: identityType, createdUser
   * identityType: ORIGIN (原廠), DEALER (經銷商), ENDUSER (最終使用者)
   * 若身份是 admin，需多加上 createdUser 搜尋條件，且 identityType 改成 ORIGIN (原廠)
   */
  getCompanyList() {
    const filter = this.getFilter(1, -1);
    const brandId = this.f['brandId'].value;
    const identity = this.f['identityType'].value;
    const identityType = [];
    switch (identity) {
      case IdentityType.SYSTEM:
        identityType.push(CustomerIdentity.ORIGIN);
        filter.and.push({
          comparator: Comparator.in,
          field: 'brandId',
          value: ['', brandId]
        });
        break;

      case IdentityType.AGENT:
        identityType.push(CustomerIdentity.ORIGIN);
        break;

      case IdentityType.DEALER:
        identityType.push(CustomerIdentity.DEALER);
        break;

      case IdentityType.ENDUSER:
        identityType.push(CustomerIdentity.ENDUSER);
        break;
    }

    filter.and.push({
      comparator: Comparator.in,
      field: 'identityType',
      value: identityType
    });

    this.apiService.getCompanyList(filter).subscribe({
      next: (res) => {
        console.log('[authorization] getCompanyList done: ', res);
        if (res.info.success) {
          this.companyDDL = res.data.map((item: CustomerData) => {
            return {
              id: item.customerId,
              fullCh: item.customerName.fullCh,
              fullEn: item.customerName.fullEn,
              nickCh: item.customerName.nickCh,
              nickEn: item.customerName.nickEn,
              creator: item.companyName?.fullCh
            };
          });
        }
      },
      error: (err) => {
        this.alert.errorAlert('[authorization] getCompanyList fail: ' + err);
        console.error('[authorization] getCompanyList fail: ', err);
      }
    });
  }

  /** delete CloudId */
  deleteCloudId(id: string) {
    if (!this.iamPermission['iam-v1.cloudIdInfo-delete']) {
      return;
    }

    if (this.mode === 'add') {
      this.remove(id, this.cloudIdsTableList)
      //TODO: res.data.payerIdList 也要移除
      console.log(this.cloudIdsTableList);
    } else if (this.mode === 'edit') {
      this.confirmModal.confirm(
        this.translate.instant('confirm to action this item', {
          action: this.translate.instant('delete'),
          item: this.translate.instant(' Payer ID'),
        }),
        () => { this.deleteCloudIdApi(id); },
        () => { return false; }
      );
    }
  }

  /** API: 檢查是否已經有這個 RoleName
   * @param updateRole true -> 檢查完後要 call updateRole API
  */
  checkIfRoleExist(updateRole?: boolean) {
    const roleName = this.f['name'].value.trim();
    const brandId = this.f['brandId'].value;
    const companyId = this.f['companyId'].value;
    console.log('checkIfRoleExist');
    console.log('same as now: ', roleName === this.ui.oriRoleName);

    // 若跟現在一樣，則不檢查
    if (roleName === this.ui.oriRoleName) {
      this.ui.ifRoleExist = false;
      if (updateRole) { this.updateRole(); }
      return;
    }

    if (!this.f['brandId'].value || !this.f['companyId'].value || this.selectedCompany.length <= 0) {
      const msg = this.translate.instant('please select first', {
        input: this.translate.instant('origin') + this.translate.instant('or') + this.translate.instant('company')
      });
      this.alert.warningAlert(msg);
      this.f['name'].setValue('');
      return;
    }

    this.apiService.checkIamName(roleName, brandId, companyId).subscribe({
      next: (res) => {
        console.log('[authorization] checkIfRoleExist done: ', res);
        if (res.info.success) {
          this.ui.ifRoleExist = res.data;
          if (updateRole) { this.updateRole(); }
        }
      },
      error: (err) => {
        this.alert.errorAlert('[authorization] checkIfRoleExist fail: ' + err);
        console.error('[authorization] checkIfRoleExist fail: ', err);
      }
    });

    // this.ui.ifRoleExist = true;
    return this.ui.ifRoleExist;
  }

  /** 搜尋 CloudId 清單 */
  searchCloudId() {
    this.filter = this.getFilter(this.tableConfigCloudId.pageConfig.currentPage, this.tableConfigCloudId.pageConfig.itemsPerPage);

    let keywordPayerId = this.keyword.payerId;
    let keywordCloudId = this.keyword.cloudId;
    let keywordCompany = this.keyword.company;

    // filter: PayerId
    if (keywordPayerId.trim()) {
      this.filter.and.push({
        field: 'payerId',
        comparator: Comparator.like,
        value: keywordPayerId,
      });
    }

    // filter: Company
    if (keywordCompany.trim()) {
      this.filter.and.push({
        field: 'company',
        comparator: Comparator.like,
        value: keywordCompany,
      });
    }
    // filter: CloudId
    if (keywordCloudId.trim()) {
      this.filter.and.push({
        field: 'cloudId',
        comparator: Comparator.like,
        value: keywordCloudId,
      });
    }

    this.filter.sort = {};
    this.filter.sort[this.tableConfigCloudId.sortBy.prop] = this.tableConfigCloudId.sortBy.dir;

    this.getCloudIdList(this.filter);
  }

  /** 開啟右側權限設定編輯 modal (帳單權限、訂單權限、其他模組權限設定)
   * @param template
   * @param title 右側視窗標題
   * @param modalList 目前編輯中的 rule list
  */
  openRuleModal(template: any, title: string) {
    if (!this.iamPermission['iam-v1.rule-edit']) {
      return;
    }

    this.modalTitle = title;
    this.modalList = {
      ori: this.ruleGroupListOri[this.ruleGroupIndex]?.group,
      edit: this.ruleGroupListShow[this.ruleGroupIndex]?.group,
    }
    this.modalType = 'roleRule';
    this.role = {
      id: this.roleId,
      brandId: this.f['brandId'].value,
      identityType: this.f['identityType'].value,
      companyId: this.f['companyId'].value,
      name: this.f['name'].value,
    }

    const config = new RightDrawerConfig();
    this.bsModalRef = this.bsModal.show(template, config);
  }

  /** 開啟右側編輯 modal (CloudId) */
  openCloudIdModal(template: any, editItem: CloudIdsData | null) {
    if (!editItem) {  // addMode
      if (!this.iamPermission['iam-v1.cloudIdInfo-add']) {
        return;
      }
    } else {          // editMode
      if (!this.iamPermission['iam-v1.cloudIdInfo-edit']) {
        return;
      }
    }

    if (!this.f['brandId'].value || !this.f['identityType'].value || !this.f['companyId'].value) {
      // 檢查 原廠 是否已有選擇
      this.checkInputEmpty('brandId', 'origin');
      // 檢查 公司類型 是否已有選擇
      this.checkInputEmpty('identityType', 'identity type');
      // 檢查 公司 是否已有選擇
      this.checkInputEmpty('companyId', 'company');
      return;
    }
    this.role = {
      id: this.roleId,
      brandId: this.f['brandId'].value,
      identityType: this.f['identityType'].value,
      companyId: this.f['companyId'].value,
      name: this.f['name'].value,
    }

    this.modalTitle = 'CloudIdTitle';
    this.modalType = 'cloudId';
    this.modalCloudId = editItem === null ? null : editItem;

    const config = new RightDrawerConfig();
    this.bsModalRef = this.bsModal.show(template, config);
  }

  /** 選擇 cloudId 前檢查欄位是否有填寫 */
  checkInputEmpty(controlName: string, inputName: string) {
    if (!this.f[controlName].value) {
      const errorMsg = this.translate.instant('please select first', {
        input: this.translate.instant(inputName)
      });
      this.alert.errorAlert(errorMsg);
      this.f[controlName].markAsTouched();
      this.brandId?.nativeElement.scrollIntoView(false);
    }
  }

  /** 編輯公司、帳單設定、訂單設定，儲存更新後的結果
   * @param res 儲存結果
   */
  updatedResult(res: any) {
    console.log(res);

    if (this.modalType === 'roleRule') {
      if (res.info) {
        if (this.mode === 'add') {
          const list: RuleData[] = res.data;
          this.ruleGroupListOri[this.ruleGroupIndex].group = res.data;
          this.ruleGroupListShow[this.ruleGroupIndex].group = list.filter((item) => item.status === 'ENABLE');
          console.log(this.ruleGroupListShow);
        } else {
          this.getRuleGroupDetail(this.ruleGroupName, this.ruleGroupIndex);
        }
      }

      // const groupIndex = this.ruleGroupListShow.findIndex((item) => item.groupName === this.modalTitle.split('ruleGroup_')[1]);

      // // 將編輯完的資料放 ruleGroupListAll，並 filter ENABLE
      // this.ruleGroupListAll = res.data;
      // this.ruleGroupListShow[groupIndex].group = [];
      // this.ruleGroupListShow[groupIndex].group = this.ruleGroupListAll.filter((rule) => rule.status === 'ENABLE');

      // // 編輯完的資料若有在 ruleGroupListTemp
      // res.temp.add.forEach((element: RuleData) => {
      //   this.ruleGroupListTemp.push(element.id);
      // });
      // res.temp.delete.forEach((element: RuleData) => {
      //   const index = this.ruleGroupListTemp.findIndex((item) => item === element.id);
      //   this.ruleGroupListTemp.splice(index, 1);
      // });

      // this.ruleGroupListAll.forEach((rule) => {
      //   if (rule.status === 'ENABLE') {
      //     this.ruleGroupListShow[groupIndex].group.push(rule);
      //   }
      // })
    } else if (this.modalType === 'cloudId') {
      if (this.mode === 'add') {
        if (this.modalCloudId !== null) {
          this.remove(res.data.id, this.cloudIdsTableList);
        }
        this.cloudIdsTableList.unshift(res.data)
      } else { // mode = 'edit'
        if (res.info) {
          console.log('add / update done');
          this.searchCloudId();
          // if (this.modalCloudId !== null) {
          //   // this.remove(res.data.id, this.cloudIdsTableList);
          //   console.log('add / update done');
          //   this.searchCloudId();
          // }
          // this.cloudIdsTableList.unshift(res.data)
        }
      }
    }

    if (res.info) {
      this.bsModalRef?.hide();
      this.modalTitle = '';
      this.modalList.ori = [];
      this.modalList.edit = [];
    }
  }

  /** 移除 item
   * @param itemId 要被移除的 id
   * @param list 要從哪個 list 移除
   * @param newItem 要新增的 item (如果有 newItem，在刪除的 index 加入新的 item)
  */
  remove(itemId: string, list: any[], newItem?: CloudIdsData) {
    const index = list.findIndex(item => item.id === itemId);
    if (index >= 0) {
      newItem ? list.splice(index, 1, newItem) : list.splice(index, 1);
    }
  }

  getFilter(pageIndex: number, pageSize?: number) {
    const filter = new Filter();
    filter.pageIndex = pageIndex;

    if (pageSize !== undefined) {
      filter.pageSize = pageSize;
    }

    return filter;
  }

  closeModal() {
    this.bsModalRef?.hide();
  }

  /** CloudId list 重設搜尋 */
  resetCloudIdForm() {
    this.keyword.payerId = '';
    this.keyword.company = '';
    this.keyword.cloudId = '';
    this.searchCloudId();
  }

  /** 新增模式時：取消變更，返回上一頁面 */
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
        this.backToListView()
      },
      () => {
        return false;
      }
    );
  }

  /** 取消變更後返回 list */
  backToListView(): any {
    this.router.navigate(['../'], {
      relativeTo: this.route,
      state: { route: { internal: true } },
    });

    this.ui.isRoleLoading = true;
    this.ui.isRuleLoading = true;
    this.ui.isCloudIdLoading = true;
  }

  /** 切換分頁時指定執行的函式 (in-table)
   * @param event 由 in-table 回傳的分頁資訊
   */
  pageChange(event: any) {
    localStorage.setItem('roleRule-setting-cloudId', JSON.stringify({
      itemsPerPage: event.itemsPerPage,
    }));
    this.searchCloudId();
  }

  /** 點擊標題進行排序指定執行的函式 (in-table)
   * @param event 由 in-table 回傳的排序資訊
   */
  sort(event: any) {
    this.searchCloudId();
  }

  /** 切換原廠、公司類型、公司時，清空 CloudId Info Data */
  resetCloudInfo() {
    if (this.cloudIdsTableList.length) {
      this.cloudIdsTableList = [];
    };
    this.f['name'].disable();
  }

  /** 切換原廠、公司類型時，取得公司列表
   * type: brand or identity
   */
  checkToGetCompanyDDL(type: 'brand' | 'identity') {
    if (!this.f['brandId'].value || !this.f['identityType'].value) {
      return;
    }

    // 清空公司目前所選並disable
    this.f['companyId'].setValue('');
    this.f['companyId'].disable();
    this.selectedCompany = [];
    this.ui.isCompanyDisable = true;
    this.companyDDL = [];

    // 重新取得公司清單
    this.getCompanyList();
    this.f['companyId'].enable();
    this.ui.isCompanyDisable = false;

    if (type === 'brand') {
      // 清空角色
      this.f['name'].setValue('');
      this.checkIfRoleExist();
    };
  }

  /** 公司類型選單設定 */
  setIdentityTypeDDL() {
    const currentUserIdentity = this.currentUser?.role?.identityType;
    const agent = {
      value: IdentityType.AGENT,
      name: IdentityType.AGENT.toLocaleLowerCase()
    };
    const dealer = {
      value: IdentityType.DEALER,
      name: IdentityType.DEALER.toLocaleLowerCase()
    };
    const endUser = {
      value: IdentityType.ENDUSER,
      name: IdentityType.ENDUSER.toLocaleLowerCase()
    };

    switch (currentUserIdentity) {
      /** 互動 */
      case IdentityType.SYSTEM:
      case IdentityType.AGENT:
        this.identityTypeDDL.push(agent, dealer, endUser);
        break;

      /** 電子郵件 */
      case IdentityType.DEALER:
        this.identityTypeDDL.push(dealer, endUser);
        break;

      /** 簡訊 */
      case IdentityType.ENDUSER:
        this.identityTypeDDL.push(endUser);
        break;
    }
    this.route.queryParams.subscribe((value) => {
      if (value['cloneIdentityType']) {
        this.f['identityType'].setValue(value['cloneIdentityType']);
        this.getCompanyList();
      } else {
        this.f['identityType'].setValue(this.identityTypeDDL[0].value);
      }
    });
  }

  selectCompany(company: CompanyData) {
    this.f['companyId'].setValue(company.id);
    if (this.selectCompany.length > 0 && this.f['brandId'].value) {
      this.f['name'].enable();
      this.checkIfRoleExist();
    };
  }
}
