import { Component, TemplateRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { InTableConfig } from '@sysage/in-table';
import { Filter, Comparator } from '../core/models/filter';
import { AlertService } from '../core/services/alert.service';
import { CustomersService } from './customers.service';
import { Customer, Identity, PageConfig } from './customers';
import { PermissionService } from '../core/services/permission.service';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent  {

  inTableConfig = new InTableConfig;

  /** 設定聯絡人分頁參數 */
  pageConfig = new PageConfig;

  constructor( private translate: TranslateService,
               private customersService: CustomersService,
               private alert: AlertService,
               private router: Router,
               private permissions: PermissionService,
               private modalService: BsModalService,) {

    /** in-table setting */
    this.inTableConfig.sitckyElemId = 'page-header';

  }

  filterForm = new FormGroup({
    company: new FormControl(''),
    serialNo: new FormControl(''),
    identity: new FormControl(''),
  });

  /** loading:查詢 */
  loading = false;

  /** 公司列表 */
  customerList: Customer[] = [];
  /** 身份別列表 */
  identityList: Identity[] = [];
  /** 需要刪除的客戶 */
  areYouSureToDel!: Customer;

  /** BsModal */
  modalRef!: BsModalRef;

  ngOnInit(): void {

    // 檢查是否有權限
    if (this.permissions.flat['customer-v1.queryCustomers']) {
      /** 客戶列表 */
      this.getCustomerList();

      /** 身份別列表 */
      this.identityList.push({'name': '經銷商', 'value': 'DEALER'}, {'name': '最終使用者', 'value': 'ENDUSER'}, {'name': '原廠', 'value': 'ORIGIN'});
    } else {
      this.router.navigate(['main/home'] , { state: {route: {internal: true}}});
    }
  }

  /** 取得客戶列表 */
  getCustomerList() {
    this.loading = true;
    this.customerList = [];
    const filter = this.getFilter();
    this.customersService.getCustomerList(filter).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.customerList = res.data !== null ? res.data : [];

        // 設定分頁內容
        this.pageConfig.totalItems = res.page ? res.page.dataCount : 0;
        this.pageConfig.itemsPerPage = res.page ? res.page.pageSize : 0;
        this.pageConfig.currentPage = res.page ? res.page.pageIndex : 0;
      }
      this.loading = false;
    }, (err: any) => {
      this.loading = false;
      this.customerList = [];
      this.alert.errorAlert(err);
    });
  }

  /** 刪除客戶 */
  delCustomer(customer: Customer) {
    this.loading = true;
    customer.status = 0;
    this.customersService.delCustomer(customer).subscribe((res: any) => {
      if (res.info && res.info.success) {
        this.getCustomerList();
      }
      if (res.info && !res.info.success) {
        this.alert.errorAlert(res.info.exception.message);
        this.loading = false;
      }
    }, (err: any) => {
      this.loading = false;
      this.customerList = [];
      this.alert.errorAlert(err);
    });
  }

  /**
   * 確認刪除跳窗
   * @param template 跳窗template
   * @param id 聯絡人id
   */
   openCheckModal(template: TemplateRef<any>, Customer: Customer) {
    this.areYouSureToDel = Customer;
    this.modalRef = this.modalService.show(template);
  }

  /** 設定filter */
  getFilter() {
    const filter = new Filter
    // 公司名稱
    if (this.filterForm.value.company) {
      filter.and.push({
        field: 'customerName',
        comparator: Comparator.like,
        value: this.filterForm.value.company,
      });
    }
    // 統一編號
    if (this.filterForm.value.serialNo) {
      filter.and.push({
        field: 'serialNumber',
        comparator: Comparator.like,
        value: this.filterForm.value.serialNo,
      });
    }
    // 身份別
    if (this.filterForm.value.identity) {
      const identityArray: string[] = [];
      identityArray.push(this.filterForm.value.identity);
      filter.and.push({
        field: 'identityType',
        comparator: Comparator.in,
        value: identityArray,
      });
    }
    return filter;
  }

  /** 重置搜尋 */
  reset() {
    this.filterForm.controls['company'].setValue('');
    this.filterForm.controls['serialNo'].setValue('');
    this.filterForm.controls['identity'].setValue('');
    this.getCustomerList();
  }

  /** 搜尋 */
  search() {
    this.getCustomerList();
  }

  /** 取消跳窗 */
  hidemodal() {
    this.modalService.hide();
  }

  /** 聯絡人列表切換分頁 */
  pageChange(event: any) {
    if (this.pageConfig) {
      this.loading = true;
      this.customerList = [];
      const filter = this.getFilter();
      filter.pageSize = event.itemsPerPage;
      filter.pageIndex = event.currentPage;
      this.customersService.getCustomerList(filter).subscribe((res: any) => {
        if (res.info && res.info.success) {
          this.customerList = res.data !== null ? res.data : [];

          // 設定分頁內容
          this.pageConfig.totalItems = res.page ? res.page.dataCount : 0;
          this.pageConfig.itemsPerPage = res.page ? res.page.pageSize : 0;
          this.pageConfig.currentPage = res.page ? res.page.pageIndex : 0;
        }
        this.loading = false;
      }, (err: any) => {
        this.loading = false;
        this.customerList = [];
        this.alert.errorAlert(err);
      });
    }
  }

  /** 身份別轉字串 */
  identityTypeToString(identity: string[]) {
      let nameStr = '';
      identity.forEach(name => {
      if (nameStr !== '') {
        nameStr = nameStr + ',';
      }
      nameStr = nameStr + this.translate.instant(name.toLowerCase());
    })
    return nameStr;
  }

}
