import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { InTableConfig } from '@sysage/in-table';
import _ from 'lodash';
import moment from 'moment';
import { Comparator, Filter, Sort } from 'src/app/core/models/filter';
import { PageConfig } from 'src/app/core/models/page';
import { AlertService } from 'src/app/core/services/alert.service';
import { PostingService } from '../posting.service';
import { Brands, PostingList, PutFormat } from '../postion';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import FileSaver from 'file-saver';
import { PermissionService } from 'src/app/core/services/permission.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { BsDatepickerConfig, BsDatepickerViewMode } from 'ngx-bootstrap/datepicker';
import brandJson from '../brandSetting.json';
@Component({
  selector: 'app-posting-storage',
  templateUrl: './posting-storage.component.html',
  styleUrls: ['./posting-storage.component.scss']
})
export class PostingStorageComponent implements OnInit {

  constructor(
    private alert: AlertService,
    private postingAPI: PostingService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private permission: PermissionService,
    private authService: AuthService
  ) {
    /** BsModal設定 */
    /** 大視窗顯示 */
    this.modalService.config.class = 'modal-xl';
  }

  /**過帳入庫狀態是否全部打開或關閉*/
  allCheckStatus = false;

  /**過帳入庫狀態是否有單筆*/
  singleCheckStatus = false;

  // 品牌ID
  brandId = ''
  // 品牌設定
  brandSetting: { [name: string]: { brandId: string, name: string, cloudIdTile: string, billingPeriodSet: number, searchBillingPeriodSet: number } } = brandJson.brandSet;


  // 品牌下拉選單
  brandDropdownDatas: Brands[] = [];
  billableBsConfig?: Partial<BsDatepickerConfig>;


  /** 出帳狀態 */
  billingStatus: { id: string, itemName: string }[] = [
    {
      // 已過帳
      id: 'BILLED',
      itemName: this.translate.instant('BILLED')
    },
    {
      // 未過帳
      id: 'NOT_BILLED',
      itemName: this.translate.instant('NOT_BILLED')
    },
    {
      // 錯誤
      id: 'FAIL',
      itemName: this.translate.instant('FAIL')
    },
  ];
  // 出帳選項單選 single OR 多選 multiple
  billingMode = 'single';



  /** in-table setting */
  inTableConfig = new InTableConfig;

  /** in-table 資料 */
  inTableDatas: PostingList[] = [];

  /** 設定聯絡人分頁參數 */
  pageConfig = new PageConfig;

  // 項目資料
  checkItem = {
    id: '',
    cloudId: '',
    customer: '',
    date: '',
    postingStatus: '',
    modifyTime: '',
    message: '',
    name: ''
  }
  // 是否為管理員
  isAdmin = false


  /** BsModal */
  modalRef!: BsModalRef;
  // 日期選擇器選擇月份
  minMode: BsDatepickerViewMode = 'month';

  // 表單
  postingForm = new FormGroup({
    brandId: new FormControl(''),
    cloudId: new FormControl(''),
    postingStatus: new FormControl(''),

  });


  /** 出帳期間 */
  pickerPostingDates: (Date | undefined)[] | undefined = [];
  /** 計費期間 */
  pickerbillableDates: (Date | undefined)[] | undefined = [];
  // 過帳原始資料列表
  postingLists: PostingList[] = [];

  postingBsConfig?: Partial<BsDatepickerConfig>;



  // api控制狀態
  ui = {
    isLoading: false,
    saveLoad: false,
  }

  ngOnInit(): void {
    this.isAdmin = this.permission.flat['layout.iam.adminInput'] ? true : false;
    if (this.isAdmin) {
      this.getBrand();
      this.brandId = "e936c95b-4295-432e-af0e-d6ecfb9d8368";
    } else {
      if (this.authService.currentUserValue?.role?.brand.id)
        this.brandId = this.authService.currentUserValue?.role?.brand.id

    }

    this.postingBsConfig = Object.assign({}, {
      minMode: this.minMode
    });

    this.postingBsConfig.selectWeekDateRange = true;
    this.billableBsConfig = Object.assign({}, {
      minMode: this.minMode
    });this.billableBsConfig.selectWeekDateRange = true;

    // this.search();
  }

  /** 單筆出帳設定 */
  billingSetting(template: TemplateRef<any>, posting: PostingList | undefined, type: string) {
    this.billingMode = type;
    if (type === 'single' && posting) {
      this.checkItem.id = posting.id;
      this.checkItem.cloudId = posting.cloudId;
      this.checkItem.customer = posting.customer;
      this.checkItem.date = posting.lockInvoiceDate;
      this.checkItem.postingStatus = posting.postingStatus;
      this.checkItem.modifyTime = posting.modifyTime;
      this.checkItem.name = posting.modifyUser.name;
      this.checkItem.message = posting.message;
    } else {
      this.checkItem.message = '';
      this.checkItem.postingStatus = '';
    }

    this.modalRef = this.modalService.show(template);
  }

  billingCancel() {
    this.modalService.hide();
  }

  /** 點擊起始/結束日期 */
  checkDate(event: any, name: string) {
    const date = Date.parse(event);
    if (isNaN(date)) {
      (<FormControl>this.postingForm.get(name)).setValue('');
    }
  }


  // 複選單所有狀態
  checkAllStatusItem() {
    this.allCheckStatus = true;
    this.singleCheckStatus = false;
    this.postingLists.forEach((item) => {
      if (!item.checkStatus) {
        this.allCheckStatus = false;
      } else {
        this.singleCheckStatus = true;
      }

    });
  }

  // 更新已儲存畫面資料
  changeSaveView(data: PutFormat) {
    this.postingLists.forEach((item) => [
      data.id.forEach((idItem) => {
        if (item.id === idItem) {
          item.postingStatus = data.postingStatus;
          item.message = data.message;
        }
      })
    ]);
  }

  // 下載過帳excle
  downLoadPostingExcel() {
    let datas: string[] = [];
    this.postingLists.forEach((item) => {
      if (item.checkStatus)
        datas.push(item.invoiceId);
    });
    this.postingAPI.downLoadPostingExcel(datas).subscribe({
      next: (downloadRes: any) => {
        if (downloadRes.info && downloadRes.info.success) {
          if (downloadRes.blob) {
            FileSaver.saveAs(downloadRes.blob, downloadRes.filename ? downloadRes.filename + '.xlsx' : 'export.xlsx');
          }

        } else {

          this.alert.errorAlert(downloadRes.info.message);
        }
      }, error: (err: any) => {

        this.alert.errorAlert(err.message);
      }
    });
  }




  /** 重設搜尋選項 */
  filterReset() {
    this.postingForm.patchValue({
      clouId: '',
      postingStatus: ''
    });
    this.pickerPostingDates = [];
    this.pickerbillableDates = [];
    this.search();
  }
  // 取得品牌
  getBrand() {
    let filter = new Filter();
    filter.pageSize = 10;
    filter.pageIndex = 1;
    filter.sort = { modifyDate: Sort.desc };
    filter.and = [];
    this.postingAPI.getBrandList(filter).subscribe({
      next: (res) => {

        if (res.info.success && res?.data) {
          this.brandDropdownDatas = res.data;
        } else {
          this.alert.errorAlert(res.info.message);
        }
      },
      error: (err) => {
        this.alert.errorAlert('[order-detail] getBrandList fail' + err);

      },
    });
  }


  /** 設定查詢條件 */
  getFilter() {
    const filter = new Filter;
    if (this.postingForm) {
      // 品牌
      if (this.brandId) {
        filter.and.push({
          field: 'brandId',
          comparator: Comparator.equal,
          value: this.brandId,
        });
      }



      // Cloud ID
      if (this.postingForm.value.cloudId) {
        filter.and.push({
          field: 'cloudId',
          comparator: Comparator.equal,
          value: this.postingForm.value.cloudId,
        });
      }

      // 出帳狀態
      if (this.postingForm.value.postingStatus) {
        filter.and.push({
          field: 'postingStatus',
          comparator: Comparator.equal,
          value: this.postingForm.value.postingStatus,
        });
      }

      // 出帳日期範圍
      if (this.pickerPostingDates && this.pickerPostingDates?.length !== 0) {
        const date = [moment(this.pickerPostingDates[0]).format('YYYY-MM-DD'), moment(this.pickerPostingDates[1]).endOf('month').format('YYYY-MM-DD')];
        filter.and.push({
          field: 'lockStartDate',
          comparator: Comparator.greaterEqual,
          value: date[0],
        });

        filter.and.push({
          field: 'lockEndDate',
          comparator: Comparator.lesserEqual,
          value: date[1],
        });
      }

      // 計費期間日期範圍
      if (this.pickerbillableDates && this.pickerbillableDates?.length !== 0) {
        console.log(this.pickerbillableDates);
        const date = [moment(this.pickerbillableDates[0]).format('YYYY-MM-DD'), moment(this.pickerbillableDates[1]).add(this.brandSetting[this.brandId].searchBillingPeriodSet, 'month').endOf('month').format('YYYY-MM-DD')];
        filter.and.push({
          field: 'invoiceStartDate',
          comparator: Comparator.greaterEqual,
          value: date[0],
        });

        filter.and.push({
          field: 'invoiceEndDate',
          comparator: Comparator.lesserEqual,
          value: date[1],
        });
      }

    }
    // filter.sort['updateTime'] = Sort.desc;
    return filter;
  }



  /** 取得過帳列表 */
  getPostringList(filter: Filter) {
    filter.pageSize = -1;
    this.postingLists = [];
    this.inTableDatas = [];
    this.ui.isLoading = true;
    this.postingAPI.postingList(filter).subscribe({
      next: (res) => {
        if (res.info.success && res?.data) {
          res.data.forEach((item: PostingList) => {
            let customerIndex = item.customer.split('/');
            let billingPeriodIndex = item.invoiceId.split('-');
            let postringIndex = item;
            postringIndex.customer = customerIndex[0];
            postringIndex.billingPeriod = billingPeriodIndex[1] + '-' + moment(billingPeriodIndex[2]).add(this.brandSetting[item.brandId].billingPeriodSet, 'month').format('MM');
            this.postingLists.push(postringIndex);
          })

          this.setIntableTableData();
        } else {
          this.ui.isLoading = false;
          this.alert.errorAlert(res.info.message);
        }
      },
      error: (err) => {
        this.alert.errorAlert('[posting]  postPostingList fail' + err);
        this.ui.isLoading = false;
      },
    });
  }

  // 處理已選複選匡項目
  handleAllPostingItem() {
    this.ui.saveLoad = true;
    let data = new PutFormat();
    data.message = this.checkItem.message;
    data.postingStatus = this.checkItem.postingStatus;

    this.postingLists.forEach((item) => {
      if (item.checkStatus)
        data.id.push(item.id);
    });
    this.savePostingItem(data);
  }
  // 處理已選項目
  handleSinglePostingItem() {
    this.ui.saveLoad = true;
    let data = new PutFormat();
    data.id.push(this.checkItem.id);
    data.message = this.checkItem.message;
    data.postingStatus = this.checkItem.postingStatus;
    this.savePostingItem(data)
  }

  // 處理計費期間月份
  hangleBillingPeriod(date: string, brand: string): string {
    let result = date;
    // aws && 微軟計費期間月份都須減一
    if (brand === 'e936c95b-4295-432e-af0e-d6ecfb9d8368' || brand === '7f1924cd-851b-4d6f-b6eb-2c24f0d77357') {
      result = moment(date).add(-1, 'month').format('MM');
    }
    return result;
  }


  /** 搜尋 */
  search() {
    const filter = this.getFilter();
    this.getPostringList(filter);
  }
  // 停止點擊div其他事件
  stopListRoute(event: any) {
    event.stopPropagation();
    return false;
  }

  // 設定check狀態
  setCheckStatus(item: PostingList) {
    item.checkStatus = !item.checkStatus;
    this.checkAllStatusItem();
  }

  // 設定所有複選匡狀態
  setAllbutton() {
    if (!this.allCheckStatus) {
      this.postingLists.forEach((item) => {
        item.checkStatus = true;
      });
    } else {
      this.postingLists.forEach((item) => {
        item.checkStatus = false;
      });
    }

    this.checkAllStatusItem();
  }


  /**設定intable資料 */
  setIntableTableData() {
    this.inTableDatas = [];
    if (this.postingLists.length !== 0) {
      this.pageConfig.totalItems = this.postingLists.length
      this.pageConfig.itemsPerPage = this.pageConfig.itemsPerPage;

      const minData = (this.pageConfig.currentPage * this.pageConfig.itemsPerPage) - this.pageConfig.itemsPerPage + 1;
      const maxData = (this.pageConfig.currentPage * this.pageConfig.itemsPerPage);

      this.postingLists.forEach((postingItem, postingIndex) => {
        const num = postingIndex + 1;

        if (num >= minData && num <= maxData) {
          this.inTableDatas.push(postingItem);
        }
      });
    }
    this.ui.isLoading = false;
  }


  // 更新過帳項目資訊
  savePostingItem(data: PutFormat) {
    this.postingAPI.putPosting(data).subscribe({
      next: (res) => {
        if (res.info.success && res?.data) {
          this.alert.successAlert('更新過帳成功');
          this.changeSaveView(data);
          this.modalService.hide();
          this.ui.saveLoad = false;
        } else {
          this.alert.errorAlert(res.info.message);
          this.ui.saveLoad = false;
        }
      },
      error: (err) => {
        this.alert.errorAlert('[postring-detail]  updatePostring fail' + err);
        this.ui.saveLoad = false;
      },
    });
  }


  test() {
    return 'e936c95b-4295-432e-af0e-d6ecfb9d8368'
  }

}
