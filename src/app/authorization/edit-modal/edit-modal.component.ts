import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { DefaultPermissions } from 'src/app/core/models/authorization-default';
import { AlertService } from 'src/app/core/services/alert.service';
import { CloudIdInfoType, CloudIdRequest, CloudIdsData, CloudIdsInfo, CompanyData, Role, RoleResp, RuleData } from '../../core/models/authorization';
import { AuthorizationService } from '../authorization.service';

@Component({
  selector: 'app-edit-modal',
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.scss']
})
export class EditModalComponent implements OnInit {
  @Input() mode: 'add' | 'edit' = 'add';
  // @Input() roleId: string = '';
  // @Input() brandId: string = '';
  // @Input() identityTypeId: IdentityType = IdentityType.AGENT;
  @Input() role: Role = new Role();
  @Input() modalTitle: string = '';
  @Input() modalList: { ori: RuleData[], edit: RuleData[] }
    = { ori: [], edit: [] }
  @Input() modalCloudId: CloudIdsData | null = new CloudIdsData(); // 勾選的權限 list
  @Input() modalType: 'roleRule' | 'cloudId' | 'company' = 'roleRule';
  // @Input() modalCompany: CompanyData | null = new CompanyData();

  @Output() closeModal = new EventEmitter<any>();
  @Output() updatedResult = new EventEmitter<any>();

  /** 訂單/帳單權限 list */
  allList: RuleData[] = [];

  /** payerId, cloudId */
  payerIdAllList: { id: string, name: string, time?: Date }[] = [];
  cloudIdAllList: { id: string, name: string, time?: Date }[] = [];
  companyAllList: CompanyData[] = [];
  selectPayerId: { id: string, name: string, time?: Date }[] = [];
  selectCloudId: { id: string, name: string, time?: Date }[] = [];
  selectCompany: CompanyData[] = [];
  allCompanyOpt: CompanyData = {
    id: 'ALL', fullCh: 'All', fullEn: 'All', nickCh: 'All', nickEn: 'All', allName: 'All'
  };

  errMsg = '';

  ui = {
    isSaving: false,
    // isLoading: false,
    isAllCloudId: false,
    isPayerIdLoading: false,
    isCompanyLoading: false,
    isCloudIdLoading: false,
    isAllRoleRule: false,
    isLockAllRule: false
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
    labelKey: 'name',
    classes: 'custom-dropdown dropdown-position',
    // lazyLoading: true,
    disabled: false,
    searchBy: ['name']
  };
  payerIdSelectSetting = _.cloneDeep(this.selectSettings);
  companySelectSetting = _.cloneDeep(this.selectSettings);
  cloudIdSelectSetting = _.cloneDeep(this.selectSettings);

  get CloudIdInfoType() { return CloudIdInfoType; }

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private authService: AuthorizationService,
    private alert: AlertService,
  ) {
    this.companySelectSetting.labelKey = 'fullCh';
    this.companySelectSetting.searchBy = ['allName'];
    this.cloudIdSelectSetting.singleSelection = false;
  }

  ngOnInit(): void {
    this.getAllList();
    console.log('MODAL INIT, ROLE:', this.role);

    /** 編輯 cloudId 時，判斷是否有勾選 isAllCloudId */
    if (this.modalType === 'cloudId' && this.modalCloudId !== null) {
      this.ui.isAllCloudId = this.modalCloudId.cloudIds.length ? false : true;
    }
  }

  /** 根據 modalTitle 判斷要取哪個 list */
  getAllList() {
    if (this.modalType === 'roleRule') {
      const selected = this.modalList.edit.map(item => { return item.id });
      this.allList = this.modalList.ori.map(item => ({ ...item, checked: !!selected.includes(item.id) }));

      // 檢查角色權限是否有全選
      this.checkIsRoleRule();
    } else if (this.modalType === 'cloudId') {
      this.companyAllList.push(this.allCompanyOpt);
      if (this.modalCloudId !== null) {
        this.selectPayerId = [{ id: this.modalCloudId.payerId.payerId, name: (this.modalCloudId.payerId.nickName ?? this.modalCloudId.payerId.payerId) }];
        this.selectCloudId = this.modalCloudId.cloudIds.map((element) => { return { id: element, name: element } });
        this.selectCompany = [this.modalCloudId.company];
      };
      // 先取得 payerId List
      this.setCidInfoRequest(CloudIdInfoType.payerId);
      // 若是修改，也需要取得 customer, cloudId List
      if (this.modalCloudId !== null) {
        this.setCidInfoRequest(CloudIdInfoType.customer);
        this.setCidInfoRequest(CloudIdInfoType.cloudId);
      }
    }
    console.log(this.companyAllList);

  }

  /** API: getCloudIdList
   * @param type: PayerId, Company, CloudId
   */
  getCloudIdInfo(type: CloudIdInfoType, data: CloudIdRequest) {
    this.authService.getCloudIdInfo(type, data).subscribe({
      next: (res) => {
        console.log('[authorization] getCloudIdInfo done: ', res);
        // this.alert.successAlert(res.info.message);
        if (res.info.success) {
          switch (type) {
            case CloudIdInfoType.payerId:
              console.log('[authorization] getCloudIdInfo PayerId done: ', res.data);
              // const payerIdList: string[] = res.data;
              this.payerIdAllList = [];
              res.data.forEach((item: { payerId: string, nickName: string }) => {  // 避免取回 [null]
                if (item) {
                  const payerIdItem = { id: item.payerId, name: (item.nickName ?? item.payerId) };
                  this.payerIdAllList.push(payerIdItem);
                }
              });
              this.ui.isPayerIdLoading = false;
              console.log(this.payerIdAllList);
              break;

            case CloudIdInfoType.customer:
              console.log('[authorization] getCloudIdInfo Company done: ', res.data);
              // this.companyAllList = res.data;
              this.companyAllList = res.data.map((item: CompanyData) => ({ ...item, allName: item?.fullCh + item?.nickCh + item?.fullEn + item?.nickEn }));
              this.companyAllList.unshift(this.allCompanyOpt);
              this.ui.isCompanyLoading = false;
              console.log(this.companyAllList);
              console.log(this.selectCompany);

              break;

            case CloudIdInfoType.cloudId:
              console.log('[authorization] getCloudIdInfo CloudId done: ', res.data);
              const cloudIdList: string[] = res.data;
              this.cloudIdAllList = cloudIdList.map((cloudId) => { return { id: cloudId, name: cloudId } });
              this.ui.isCloudIdLoading = false;
              console.log(this.cloudIdAllList);
              break;
          }
        }
      },
      error: (err) => {
        this.alert.errorAlert('[authorization] getCloudIdInfo fail: ' + err);
        console.error('[authorization] getCloudIdInfo fail: ', err);
        this.ui.isPayerIdLoading = false;
        this.ui.isCompanyLoading = false;
        this.ui.isCloudIdLoading = false;
      },
    });

    // if (this.modalCloudId !== null) {
    //   this.selectPayerId = [{ id: this.modalCloudId.payerId.payerId, name: this.modalCloudId.payerId.nickName }];
    //   this.selectCloudId = this.modalCloudId.cloudIds.map((element) => { return { id: element, name: element } });
    //   this.selectCompany = [this.modalCloudId.company];
    //   // this.modalCloudId.cloudIds.forEach(element => {
    //   //   this.selectCloudId.push({ id: element, name: element });
    //   // });
    // }
  }

  /** API: 編輯權限 */
  updateRuleData(data: { add: string[], delete: string[] }) {
    this.authService.updateRuleGroupDetail(this.role.id, data).subscribe({
      next: (res) => {
        console.log('[authorization] updateRuleData done: ', res);
        this.alert.successAlert(res.info.message);
        if (res.info.success) {
          const modalRes = {
            info: res.info.success,
            data: this.allList,
          };
          this.updatedResult.emit(modalRes);
        }
      },
      error: (err) => {
        this.alert.errorAlert('[authorization] updateRuleData fail: ' + err);
        console.error('[authorization] updateRuleData fail: ', err);
      },
    });
  }

  /** API: 新增 cloudId */
  addCloudIdData(data: CloudIdsInfo) {
    // const result = new Subject<boolean>();
    this.authService.addCloudId(this.role.id, data).subscribe({
      next: (res) => {
        console.log('[authorization] addCloudIdData done: ', res);
        this.alert.successAlert(res.info.message);
        if (res.info.success) {
          const modalRes = {
            info: res.info.success,
            data: data
          };
          this.updatedResult.emit(modalRes);
          // result.next(true);
          // result.complete();
        }
      },
      error: (err) => {
        this.alert.errorAlert('[authorization] addCloudIdData fail: ' + err);
        console.error('[authorization] addCloudIdData fail: ', err);
        // result.next(false);
        // result.complete();
      },
    });
    // return result.asObservable();
  }

  /** API: 編輯 cloudId */
  updateCloudIdData(data: CloudIdsInfo) {
    this.authService.updateCloudId(this.role.id, data).subscribe({
      next: (res) => {
        console.log('[authorization] updateCloudIdData done: ', res);
        this.alert.successAlert(res.info.message);
        if (res.info.success) {
          const modalRes = {
            info: res.info.success,
            data: data
          };
          this.updatedResult.emit(modalRes);
        }
      },
      error: (err) => {
        this.alert.errorAlert('[authorization] updateCloudIdData fail: ' + err);
        console.error('[authorization] updateCloudIdData fail: ', err);
      },
    });
  }

  /** update */
  submit() {
    switch (this.modalType) {
      case 'roleRule':
        this.updateRule();
        break;
      case 'cloudId':
        this.updateCloudId();
        break;
      default:
        console.log(`Sorry, we are out of ${this.modalType}.`);
    }
  }

  /** 更新 權限 list */
  updateRule() {
    if (this.mode === 'add') {
      // const temp = this.ruleRequestFormat(this.allList, this.modalList.ori);
      const res = {
        info: true,
        data: this.allList,
        // temp: temp
      };
      console.log(res);
      this.updatedResult.emit(res);
    } else {
      const data = this.ruleRequestFormat(this.allList, this.modalList.ori);
      const apiData = {
        add: data.add.map((item) => { return item.id }),
        delete: data.delete.map((item) => { return item.id }),
      }
      this.updateRuleData(apiData);

      // const res = {
      //   info: true,
      //   data: this.allList
      // };
      // console.log(res);
      // this.updatedResult.emit(res);
    }
  }

  /** rule list format 成 api 需要的格式 */
  ruleRequestFormat(newList: RuleData[], oriList: RuleData[]) {
    let addList: RuleData[] = [];
    let deleteList: RuleData[] = [];

    let oriIdList: string[] = [];
    oriIdList = oriList.filter((item) => item.status === 'ENABLE').map((item) => { return item.id })
    // oriList.forEach((item) => {
    //   if (item.status === 'ENABLE') {
    //     oriIdList.push(item.id);
    //   }
    // })

    addList = newList
      .filter((item) => item.status === 'ENABLE' && !oriIdList.includes(item.id));
    // .map((item) => { return item.id });
    deleteList = newList
      .filter((item) => item.status === 'DISABLE' && oriIdList.includes(item.id));
    // .map((item) => { return item.id });

    const data = {
      add: addList,
      delete: deleteList
    };

    return data;
  }

  /** 更新 payer/cloud ID */
  updateCloudId() {

    console.log(this.selectCompany);


    // 檢查欄位是否都有勾選
    if (!this.selectPayerId.length || !this.selectCompany.length ||
      (!this.selectCloudId.length && !this.ui.isAllCloudId)) {
      let emptyField = '';
      if (!this.selectPayerId.length) {
        emptyField += 'Payer ID ';
      }
      if (!this.selectCompany.length) {
        emptyField += !emptyField ? '' : ` ${this.translate.instant('or')} `;
        emptyField += this.translate.instant('customer company');
      }
      if (!this.selectCloudId.length && !this.ui.isAllCloudId) {
        emptyField += !emptyField ? '' : ` ${this.translate.instant('or')} `;
        emptyField += ' Cloud Id ';
      }
      this.errMsg = this.translate.instant('input is required', {
        input: emptyField,
      });
      return;
    }

    // if (this.mode === 'edit' && !this.brandId) {
    //   this.errMsg = this.translate.instant('select brand first');
    //   return;
    // }

    if (this.mode === 'add') {
      let newItem = new CloudIdsData();
      newItem = {
        brandId: this.role.brandId,
        payerId: {
          payerId: this.selectPayerId[0].id,
          nickName: this.selectPayerId[0].name,
        },
        company: this.selectCompany[0],
        cloudIds: this.ui.isAllCloudId ? [] : this.selectCloudId.map((item) => { return item.id }),
        time: new Date(),
      }
      const res = {
        info: true,
        data: newItem
      };
      console.log(res);
      this.updatedResult.emit(res);

    } else {    // 編輯角色情況下，call api
      let newItem = new CloudIdsInfo();
      newItem = {
        id: '',
        brandId: this.role.brandId,
        payerId: this.selectPayerId[0].id,
        companyId: this.selectCompany[0].id,
        cloudIds: this.ui.isAllCloudId ? [] : this.selectCloudId.map((item) => { return item.id }),
        time: new Date(),
      }

      if (this.modalCloudId === null) {
        newItem.id = '';
        console.log(newItem);
        this.addCloudIdData(newItem)
      } else {
        newItem.id = this.modalCloudId.id;
        console.log(newItem);
        this.updateCloudIdData(newItem)
      }
    }

  }

  allCloudIdChanged() {
    if (this.ui.isAllCloudId) {
      this.selectCloudId = [];
    }
  }

  /** allList 比對勾選目前已有選取的 item */
  setListItem(list: { id: string, name: string }[]) {
    this.allList.forEach((item) => {
      const isFind = list.find(element => element.id === item.id);
      if (isFind) {
        item.checked = true;
      };
    })
  }

  /** 關閉 modal */
  closeBsModal() {
    this.closeModal.emit();
  }

  /** 選擇 CloudId Info Data */
  setCidInfoRequest(getType: CloudIdInfoType, type?: CloudIdInfoType) {
    let data: CloudIdRequest = {
      brand: this.role.brandId,
      identityType: this.role.identityType,
      companyId: this.role.companyId
    }
    switch (getType) {
      case CloudIdInfoType.payerId:
        this.ui.isPayerIdLoading = true;
        this.payerIdAllList = [];
        console.log('payerId', data);
        break;

      case CloudIdInfoType.customer:
        this.ui.isCompanyLoading = true;
        // this.companyAllList = [];

        // 加上條件：payerId
        data.payerId = this.selectPayerId[0]?.id;
        console.log('customer', data);
        break;

      case CloudIdInfoType.cloudId:
        this.ui.isCloudIdLoading = true;
        // this.cloudIdAllList = [];

        // 如果沒有 payerId 或 customer，先不搜尋
        if (!this.selectPayerId.length || !this.selectCompany.length) { return; }
        // 如果客戶公司為 ALL，預設 isAllCloudId 為 True
        if (type === CloudIdInfoType.customer && this.selectCompany[0]?.id.toLocaleLowerCase() === 'all') {
          console.log('customer ALL');
          this.ui.isAllCloudId = true;
        }
        // 加上條件：payerId, customerId
        data.payerId = this.selectPayerId[0]?.id;
        data.customerId = this.selectCompany[0]?.id;
        console.log('cloudId', data);
        break;
    }

    this.getCloudIdInfo(getType, data);
  }

  /** 角色權限全選/全部取消 */
  allRoleRuleChange() {
    this.ui.isAllRoleRule = !this.ui.isAllRoleRule;
    this.allList.forEach(item => {
      const isDefault = DefaultPermissions.includes(item.id);
      if (!isDefault) {
        item.checked = this.ui.isAllRoleRule;
        item.status = item.checked ? 'ENABLE' : 'DISABLE';
      }
    });
  }

  /** 鎖定/解鎖角色權限 */
  toggleLockAllRule() {
    this.ui.isLockAllRule = !this.ui.isLockAllRule;
    this.allList.forEach(item => {
      const isDefault = DefaultPermissions.includes(item.id);
      if (this.ui.isLockAllRule) {
        item.disabled = false;
      } else {
        if (isDefault) {
          item.disabled = true;
        }
      }
    });
  }

  /** 勾選角色權限 */
  checkIsRoleRule() {
    const selectItemLength = this.allList.filter(item => item.checked).length;
    this.ui.isAllRoleRule = this.allList.length === selectItemLength;
  }
}
