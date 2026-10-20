import { transition } from '@angular/animations';
import { Component, Inject, OnInit } from '@angular/core';
import { InTableConfig } from '@sysage/in-table';
import { AlertService } from 'src/app/core/services/alert.service';
import { PermissionService } from 'src/app/core/services/permission.service';
import { Filter } from 'src/app/core/models/filter';
import { ActivatedRoute } from '@angular/router';
import { BrandsApiService } from 'src/app/brands/brands-api.service';
import { Classification, InputClassification } from 'src/app/brands/brands';
import _ from 'lodash';
import { PageConfig } from 'src/app/core/models/page';
import { TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-classification',
  templateUrl: './classification.component.html',
  styleUrls: ['./classification.component.scss']
})
export class classificationComponent implements OnInit {

  inTableConfig = new InTableConfig;
  /** 分頁參數 */
  pageConfig = new PageConfig;

  constructor(
    private activatedRoute: ActivatedRoute,
    private brandApi: BrandsApiService,
    private alert: AlertService,
    private translate: TranslateService,
    private permission: PermissionService,
    private modalService: BsModalService,
  ) { }

  /** 品牌id */
  brandId = '';
  /** 商品分類列表(全) */
  allClassificationList: Classification[] = [];
  /** 商品分類列表 */
  classificationList: Classification[] = [];
  /** 刪除分類的id */
  delId: string = '';
  /** 要新增的商品分類 */
  inputClassification = '';

  /** loading */
  loading = false;

  // intable設定
  intableConfig = new InTableConfig();

  /** BsModal */
  modalRef!: BsModalRef;

  ngOnInit(): void {
    this.brandId = this.activatedRoute.snapshot.params['brand'];
    this.getClassificationList(10);
    this.getClassificationList(-1);
  }

  /**
   * 取得商品分類列表
   * @param size 分頁每頁數量
   */
  getClassificationList(size: number) {
    this.loading = true;
    const filter = new Filter;
    if (size === -1) {
      filter.pageSize = -1;
    }
    this.brandApi.getClassificationList(filter, this.brandId).subscribe({
      next: (res) => {
        if (res.info && res.info.success) {
          if (size === -1) {
            this.allClassificationList = res.data !== null ? res.data : [];
          } else {
            this.classificationList = res.data !== null ? res.data : [];

            // 設定分頁內容
            this.pageConfig.totalItems = res.page ? res.page.dataCount : 0;
            this.pageConfig.itemsPerPage = res.page ? res.page.pageSize : 0;
            this.pageConfig.currentPage = res.page ? res.page.pageIndex : 0;
          }
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.classificationList = [];
        this.allClassificationList = [];
        this.alert.errorAlert(err);
      }
    });
  }

  /**
   * 新增/編輯/刪除 商品分類
   * @param witch 新增 => add, 編輯 => edit, 刪除 => delete
   * @param idx 第幾筆
   */
  editClassification(witch: string, idx?: number) {
    this.loading = true;
    const data = new InputClassification;
    switch (witch) {
      case 'add':
        if (this.inputClassification === '') {
          this.alert.errorAlert(this.translate.instant('category name cannot be empty'));
          return;
        }
        const item = {
          id: '',
          name: this.inputClassification
        }
        data.updateCategory.push(item);
        this.inputClassification = '';
        break;
      case 'edit':
        if (idx!== undefined && idx >= 0) {
          const item = {
            id: this.classificationList[idx].id,
            name: this.classificationList[idx].name
          }
          data.updateCategory.push(item);
        }
        break;
      case 'delete':
        data.deleteCategory.push(this.delId);
        this.modalService.hide();
        break;
    }
    this.brandApi.editClassification(data, this.brandId).subscribe({
      next: (res) => {
        if (res.info && res.info.success) {
          this.alert.successAlert(
            this.translate.instant('classification api resoult', { type: this.translate.instant(witch), yesno: res.info.success ? this.translate.instant('succeed') : this.translate.instant('failed') })
          );
          this.getClassificationList(10);
          this.getClassificationList(-1);
        } else {
          this.alert.errorAlert(
            this.translate.instant('classification api resoult', { type: this.translate.instant(witch), yesno: res.info.success ? this.translate.instant('succeed') : this.translate.instant('failed') }) + '： '  + res.info.message
          )
          this.loading = false;
        }
      },
      error: (err) => {
        this.loading = false;
        this.alert.errorAlert(err);
      }
    });
  }

  /**
   * 分類名稱是否重複
   * @param idx 第幾筆, -1為新增檢查
   */
   checkName(idx: number) {
    let isExist = false;
    this.allClassificationList.forEach((item, itemIdx) => {
      // 新增檢查
      if (idx === -1 && item.name === this.inputClassification) {
        isExist = true;
      }
      // 編輯檢查
      if (idx !== -1 && idx !== itemIdx && item.name === this.classificationList[idx].name) {
        isExist = true;
      }
    });
    return isExist;
  }

  /**
   * 警告跳窗
   * @param template 跳窗template
   * @param idx 第幾筆
   */
   confirm(template: TemplateRef<any>, idx: number) {
    this.delId = this.classificationList[idx].id;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg',
      animated: false
    });
  }

  /** 取消跳窗 */
  hidemodal() {
    this.modalService.hide();
  }

  /** 切換分頁 */
  pageChange(event: any) {
    if (this.pageConfig) {
      this.loading = true;
      this.classificationList = [];
      const filter = new Filter();
      filter.pageSize = event.itemsPerPage;
      filter.pageIndex = event.currentPage;
      this.brandApi.getClassificationList(filter, this.brandId).subscribe({
        next: (res) => {
          if (res.info && res.info.success) {
            this.classificationList = res.data !== null ? res.data : [];

            // 設定分頁內容
            this.pageConfig.totalItems = res.page ? res.page.dataCount : 0;
            this.pageConfig.itemsPerPage = res.page ? res.page.pageSize : 0;
            this.pageConfig.currentPage = res.page ? res.page.pageIndex : 0;
          }
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.classificationList = [];
          this.alert.errorAlert(err);
        }
      });
    }
  }

}
