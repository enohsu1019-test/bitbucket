import { AttributeOptions } from './../../../brands';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import _ from 'lodash';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CommodityAttribute, CommodityAttributeType } from 'src/app/brands/brands';
import { BrandsApiService } from 'src/app/brands/brands-api.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { PermissionService } from 'src/app/core/services/permission.service';
import { Comparator, Filter, Sort } from 'src/app/core/models/filter';
import { TranslateService } from '@ngx-translate/core';
import { Permission } from 'src/app/core/models/permission';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-attribute',
  templateUrl: './attribute.component.html',
  styleUrls: ['./attribute.component.scss']
})
export class AttributeComponent implements OnInit{
  /** 欄位型態 */
  get AttributeType() { return CommodityAttributeType; }

  get f() { return this.attributeForm.controls }

  constructor(
    private brandsAPI: BrandsApiService,
    private alert: AlertService,
    private permission: PermissionService,
    private modalService: BsModalService,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private fb: FormBuilder,
  ) {
    /** 欄位初始設定 */
    this.attributeForm = this.fb.group({
      // 欄位標題名稱
      title: ['', Validators.required],
      // 欄位標題內部變數
      variable: ['', Validators.required],
      // 敘述
      describe: [''],
      // 欄位類型
      dataType: ['', Validators.required],
    });
  }

  /** 品牌id */
  brandId = '';
  /** 屬性列表 */
  attributeList: CommodityAttribute[] = [];
  /** 編輯屬性 */
  attribute = new CommodityAttribute;
  /** 資料格式列表 */
  formatList: {name: string, value: string}[] = [];
  /** 編輯權限 */
  attributePermission: { [key: string]: Permission } = {};

  /** 輸入欄位 */
  attributeForm!: FormGroup;

  ui = {
    // 列表
    isListLoading: false,
    // 單一商品
    isInfoLoading: false,
    // 儲存中
    isSaving: false,
    // 第幾步
    step: 1,
  };

  /** BsModal */
  modalRef!: BsModalRef;

  ngOnInit(): void {
    this.attributePermission = this.permission.getPermission('brand-v1');
    this.brandId = this.activatedRoute.snapshot.params['brand']
    this.getAttributeList();
    this.getFormatList();
  }

  /** 取得商品屬性列表 */
  getAttributeList() {
    this.ui.isListLoading = true;
    this.attributeList = [];
    const filter = new Filter;
    filter.and.push({
      field: 'groupType',
      comparator: Comparator.equal,
      value: 'DYNAMIC'
    });
    filter.sort['modifiedTime'] = Sort.desc;
    this.brandsAPI.getCommodityAttributeList(filter, this.brandId).subscribe({
      next: (res) => {
        if (res && res.info && res.info.success && res.data) {
          this.attributeList = res.data;
        } else {
          this.alert.errorAlert(res.info.message);
        }
        this.ui.isListLoading = false;
      },
      error: (err) => {
        this.attributeList = [];
        this.alert.errorAlert(err);
        this.ui.isListLoading = false;
      }
    });
  }

  /**
   * 取得單一商品屬性
   * @param idx 第幾項
  */
  getAttribute(idx: number) {
    this.ui.isInfoLoading = true;
    this.attribute = new CommodityAttribute;
    this.brandsAPI.getCommodityAttribute(this.attributeList[idx].id, this.brandId).subscribe({
      next: (res) => {
        if (res && res.info && res.info.success && res.data) {
          this.attribute = res.data;
          this.updateFormValue();
        } else {
          this.alert.errorAlert(res.info.message);
        }
        this.ui.isInfoLoading = false;
      },
      error: (err) => {
        this.alert.errorAlert(err);
        this.ui.isInfoLoading = false;
      }
    });
  }

  /** 取得欄位類型列表 */
  getFormatList() {
    this.formatList = Object.keys(CommodityAttributeType).map((name) => {
      return {
        name,
        value: CommodityAttributeType[name as keyof typeof CommodityAttributeType],
      };
    });
  }

  /** 載入form資料 */
  importFormValue() {
    this.f['variable'].enable();
    this.attribute.name = this.attributeForm.value.title;
    this.attribute.internalVariableName = this.attributeForm.value.variable;
    this.attribute.description = this.attributeForm.value.describe;
    this.attribute.type = this.attributeForm.value.dataType;
    // 載入完資料需檢查內部變數是否要disable
    if (this.attribute.id !== '') {
      this.f['variable'].disable();
    }
  }

  /** 更新 formValue */
  updateFormValue() {
    this.attributeForm.patchValue({
      title: this.attribute.name,
      variable: this.attribute.internalVariableName,
      describe: this.attribute.description,
      dataType: this.attribute.type,
    });
    // 有id需要disable欄位標題內部變數，無則enable欄位
    if (this.attribute.id !== '') {
      this.f['variable'].disable();
    } else {
      this.f['variable'].enable();
    }
  }

  /** 新增/編輯屬性資料 */
  submitData(e: any) {
    this.importFormValue();
    // 檢查欄位
    const check = this.checkDisabled();
    // 有問題回報有問題欄位
    if (check.disabled) {
      this.alert.warningAlert(
        this.translate.instant('input is required', {
          input: check.info,
        })
      );
    // 沒問題才能新增/編輯
    } else {
      // 有商品id => 編輯, 無商品id => 新增
      this.ui.isInfoLoading = true;
      const callAPI = this.attribute.id ?
                      this.brandsAPI.editCommodityAttribute(this.attribute, this.attribute.id, this.brandId) :
                      this.brandsAPI.addCommodityAttribute(this.attribute, this.brandId);
      callAPI.subscribe({
        next: (res) => {
          if (res && res.info && res.info.success && res.data) {
            this.alert.successAlert(res.info.message);
            this.getAttributeList();
            this.closeBsModal();
          } else {
            this.alert.errorAlert(res.info.message);
          }
          this.ui.isInfoLoading = false;
        },
        error: (err) => {
          this.alert.errorAlert(err);
          this.ui.isInfoLoading = false;
        }
      });
    }
  }

  /**
   * 變更必填/隱藏
   * @param idx 第幾項
   * @param type required or hidden
  */
  changeCheckbox(idx: number, type: string) {
    if (type === 'hidden') {
      this.attributeList[idx].required = false;
    }
    this.attribute = _.cloneDeep(this.attributeList[idx]);
    this.updateFormValue();
    this.submitData('');
  }

  /** 改變欄位類型 */
  changeType() {
    this.attribute.options = [];
    this.importFormValue();
    if (this.attributeForm.value.dataType === CommodityAttributeType.single ||
        this.attributeForm.value.dataType === CommodityAttributeType.multiple) {
      const data = new AttributeOptions;
      this.attribute.options.push(data);
    }
  }

  /** 更新單多選選項 index */
  updateOptionOrder() {
    this.attribute.options.forEach((item, idx) => {
      item.index = idx;
    });
  }

  /** 單多選 順序改變 */
  onOptionOrderChange(event: CdkDragDrop<any>) {
    moveItemInArray(this.attribute.options, event.previousIndex, event.currentIndex);
    this.updateOptionOrder();
  }

  /** 新增多選欄位 */
  addOption() {
    const data = new AttributeOptions;
    this.attribute.options.push(data);
  }

  /**
   * 刪除選項
   * @param idx 第幾項
  */
  removeOption(idx: number) {
    this.attribute.options.splice(idx, 1);
    this.updateOptionOrder();
  }

  /**
   * 顯示屬性編輯跳窗
   * @param template 跳窗template
   * @param idx 1.有idx => 編輯 ， 2.無idx => 新增
  */
  showModal(template: TemplateRef<any>, idx?: number) {
    this.attribute = new CommodityAttribute;
    this.updateFormValue();
    // 編輯
    if (idx !== undefined) {
      this.getAttribute(idx);
    }
    this.ui.step = 1;
    const config = {
      ignoreBackdropClick: true,
      class: 'right-drawer',
      animated: false,
    };
    this.modalRef = this.modalService.show(template, config);
  }

  /** 關閉屬性編輯跳窗 */
  closeBsModal() {
    this.modalService.hide();
  }

  /** 欄位檢查 */
  checkDisabled() {
    const checkBack: {disabled: boolean, info: string} = {
      disabled: false,
      info: ''
    };
    const invalidInput: string[] = [];
    const checkInput = (isValid: boolean, inputName: string) => {
      if (isValid) {
        invalidInput.push(this.translate.instant(inputName));
      }
    };
    checkInput(!this.attribute.name, 'field title');
    checkInput(!this.attribute.internalVariableName, 'title internal variable');
    checkInput(!this.attribute.type, 'data format');

    if (this.attribute.type) {
      let checkTitle = false;
      let checkVariable = false;
      this.attribute.options.forEach(item => {
        if (!item.name) {
          checkTitle = true;
        }
        if (!item.internalVariableName) {
          checkVariable = true;
        }
      });
      checkInput(checkTitle, 'title name');
      checkInput(checkVariable, 'internal variable');
    }

    if (invalidInput.length > 0) {
      const invalidInputName = invalidInput.join('、');
      checkBack.disabled = true;
      checkBack.info = invalidInputName;
    }
    return checkBack;
  }

}
