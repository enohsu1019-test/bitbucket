
import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { InTableConfig, Sort } from '@sysage/in-table';
import { ExtraBilling, ExtraBillingSave, Invoice, InvoiceType } from 'src/app/core/models/bills';
import { Comparator, Filter } from 'src/app/core/models/filter';
import { PageConfig } from 'src/app/core/models/page';
import { DateTime } from 'luxon';
import { UtilService } from 'src/app/core/services/util.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { BillsDetailService } from './bills-detail.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import * as _ from 'lodash';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { PermissionService } from 'src/app/core/services/permission.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-bills-detail',
  templateUrl: './bills-detail.component.html',
  styleUrls: ['./bills-detail.component.scss']
})
export class BillsDetailComponent implements OnInit {
  modalRef?: BsModalRef;
  @ViewChild('anchor') anchor!: ElementRef
  orderId: string = '';
  brand = '';

  /** 發票列表 */
  invoiceList: Invoice[] = [];

  // 初次
  initial = false;

  /** 權限 */
  authority: { isSiAdmin: boolean, isSIUser: boolean } = {
    isSIUser: true,
    isSiAdmin: true
  }

  anchorStatus = false;

  /** 選取發票月份 */
  invoiceMonth!: Date;
  /** 下載發票月份 */
  invoiceYearMonth = {
    year: '',
    month: ''
  };

  // 鎖定月份
  isLockedDatas: string[] = [];
  /** 發票可選取月份範圍 */
  minInvoiceDate!: Date;
  maxInvoiceDate!: Date;
  /** 發票連結 */
  invoiceUrl = {
    PNG: '',
    PDF: ''
  };

  invoiceNumberInputs = <{ [key: string]: string }>{};
  invoiceNumberUpdating = <{ [key: string]: boolean }>{};

  ui = {
    isSearching: false,
    // isInvoicePreview: false,   // 是否要預覽
    isInvoiceLoaded: false,      // 是否已取得發票
    isInvoiceDownloading: false,  // 發票檔案下載中
    isExcelDownloading: false,    // 原廠使用量下載中
    isInvoiceLocking: <{ [key: string]: boolean }>{}, // 各個 item 有其 locking 狀態
  }

  /** in-table setting */
  inTableConfig = new InTableConfig();
  /** in-table sub setting */
  subInTableConfig = new InTableConfig;
  inTableTranslate: any; // = new InTableTranslate();


  defaultPageSize = 10;
  /** 設定分頁參數 */
  pageConfig = new PageConfig();

  filter = new Filter({
    pageSize: this.defaultPageSize
  });

  /** 設定排序參數 */
  sortBy = {
    prop: 'yearMonth',
    dir: Sort.desc,
  };

  /** 訂單資訊 */
  order = {
    header: {
      customer: {
        name: ''
      }
    },
    body: [{
      cloudId: '',
      brand: {
        name: ''
      }
    }]
  };

  /** 帳目類型選單 */
  billingType = [
    {
      value: 'DISCOUNT_NO_FEES',
      name: '優惠(不含費用)'
    },
    {
      value: 'DISCOUNT_INCLUDING_FEES',
      name: '優惠(含費用)'
    }
  ];
  // 刪除錯帳項目
  deleteExtraBillingItem = new ExtraBilling();
  // 刪除錯帳項目索引直
  deleteExtraBillingItemIndex = 0;
  invoiceItem = new Invoice();
  /** 顯示額外出帳欄位 */
  showSub = [false, false, false, false, false, false, false, false, false, false];


  // brand!: Brand;
  /** 編輯模式下的 order 為何 (從 route 取回) */
  // billId = '';
  /** 載入的 bill (從 api 取回) */
  // bill!: Bill;

  get InvoiceType() { return InvoiceType; }

  constructor(
    public util: UtilService,
    private alert: AlertService,
    private translate: TranslateService,
    private apiService: BillsDetailService,
    private router: Router,
    private permission: PermissionService,
    private route: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private modalService: BsModalService
  ) {
    /** BsModal設定 */
    /** 大視窗顯示 */
    this.modalService.config.class = 'modal-sm';
    /** 禁止點背景取消跳窗 */
    this.modalService.config.ignoreBackdropClick = true;
  }

  ngOnInit() {

    const nav = this.route.snapshot.params['bill'];
    this.orderId = nav.split('&')[0];
    this.brand = nav.split('&')[1];
    const jsonItemsPerPage = localStorage.getItem('intable-bills-table');
    if (jsonItemsPerPage) {
      this.filter.pageSize = JSON.parse(jsonItemsPerPage);
    }
    /** in-table setting */
    this.inTableConfig.sitckyElemId = 'page-header';
    // this.inTableConfig.enableResizeColWidth = true;
    this.inTableConfig.showBorder = true;
    // this.inTableConfig.showAllSubRowOnlyIfMoreThanOne = false;

    /** in-table sub setting */
    this.subInTableConfig.sitckyElemId = 'page-header';
    this.subInTableConfig.enableResizeColWidth = false;
    this.subInTableConfig.showBorder = false;
    this.subInTableConfig.showAllSubRowOnlyIfMoreThanOne = false;

    // this.getInvoiceList();
    this.search();
  }


  /** 判斷是否為 admin 權限 */
  isAdmin() {
    // TODO: return this.data.currentUserHasRole('admin');
    return true;
  }

  /** API: get Invoice 清單 */
  getInvoiceList(filter: Filter) {
    this.ui.isSearching = true;
    // const filter = this.getFilter(this.pageConfig.currentPage, this.pageConfig.itemsPerPage);
    let date: string[] = [];
    this.apiService.postInvoiceList(this.orderId, filter).subscribe({
      next: (res) => {
        console.log('[bills] getInvoiceList done: ', res);
        if (res.info && res.info.success) {
          let extraBillingIndex: ExtraBilling[] = []
          this.invoiceList = res.data.map((item: Invoice) => ({
            ...item,
            yearMonth: `${item.year}-${item.month}`,
            extraBilling: item.extraBilling? item.extraBilling: extraBillingIndex
          }));
          res.data.forEach((item: Invoice) => {
            date.push(`${item.year}-${item.month}`);
          });
        }
        // this.minInvoiceDate = DateTime.fromISO(date[date.length - 1]).toJSDate();

        if (res.page && !this.initial) {
          this.minInvoiceDate = DateTime.fromISO(date[0]).plus({ months: - res.page?.dataCount + 1 }).toJSDate();
          this.maxInvoiceDate = DateTime.fromISO(date[0]).toJSDate();
        }


        this.pageConfig.totalItems = res.page?.dataCount ?? 0;
        this.pageConfig.itemsPerPage = res.page?.pageSize ?? 10;
        this.pageConfig.currentPage = res.page?.pageIndex ?? 1;
        this.ui.isSearching = false;
      },
      error: (err) => {
        this.alert.errorAlert('[bills] getInvoiceList fail: ' + err);
        console.error('[bills] getInvoiceList fail: ', err);
        this.ui.isSearching = false;
      }
    });
  }

  /** API: get Invoice 詳細內容 */
  getInvoiceDetail(invoice: Invoice, isDownload: boolean) {
    this.ui.isInvoiceDownloading = true;
    this.ui.isInvoiceLoaded = true;


    // 從 invoiceList 找到該筆 invoice，如果已經有 screenshot，直接下載
    const idx = _.findIndex(this.invoiceList, { id: invoice.id });
    if (this.invoiceList[idx].pdfScreenshot && this.invoiceList[idx].pngScreenshot) {
      console.log('already get screenshot');

      if (!isDownload) {
        this.invoiceUrl.PNG = invoice.pngData;
        setTimeout(() => {
          this.anchorFunc();
        }, 1000);

      } else {
        // FileSaver.saveAs(invoice.pdfData, `${invoice.orderDetailId}-${invoice.yearMonth}`);
        if (invoice.info) {
          if (invoice.info.order.brand.name === 'Microsoft') {
            FileSaver.saveAs(invoice.pdfData, `${invoice.info.order.customer.name.split('/')[0]}_${invoice.info.order.cloudId.split('.onmicrosoft.com')[0]}_${invoice.info.order.brand.name}繳費通知${invoice.year}-${invoice.month}`);
          } else {
            FileSaver.saveAs(invoice.pdfData, `${invoice.info.order.customer.name.split('/')[0]}_${invoice.info.order.cloudId}_${invoice.info.order.brand.name}繳費通知${invoice.year}-${invoice.month}`);
          }
        } else {
          FileSaver.saveAs(invoice.pdfData, `${invoice.orderDetailId}-${invoice.yearMonth}`);
        }
      }




      this.ui.isInvoiceDownloading = false;
      this.ui.isInvoiceLoaded = false;
      return;
    }


    this.invoiceUrl.PNG = '';
    this.invoiceUrl.PDF = '';
    this.apiService.getInvoiceFile(this.orderId, invoice.year, invoice.month, InvoiceType.all).subscribe({
      next: (res) => {
        console.log('[bills] getInvoiceList done: ', res);
        if (res.info && res.info.success && res.data.screenshot) {


          // 更新該筆 invoice 的 pdfScreenshot
          this.invoiceList[idx].pngScreenshot = res.data.screenshot.PNG
          this.invoiceList[idx].pdfScreenshot = res.data.screenshot.PDF

          this.downloadInvoice(invoice, InvoiceType.png, this.invoiceList[idx].pngScreenshot, isDownload);
          this.downloadInvoice(invoice, InvoiceType.pdf, this.invoiceList[idx].pdfScreenshot, isDownload);
        } else {
          this.ui.isInvoiceDownloading = false;

          this.ui.isInvoiceLoaded = false;
          this.alert.errorAlert(res.info.message);
        }

      },
      error: (err) => {
        this.alert.errorAlert('[bills] getInvoiceList fail: ' + err);
        console.error('[bills] getInvoiceList fail: ', err);
        this.ui.isInvoiceDownloading = false;
        this.ui.isInvoiceLoaded = false;
      }
    });

  }

  /** API: 下載 Invoice 檔案 */
  downloadInvoice(invoice: Invoice, type: InvoiceType, screenshot: string, isDownload: boolean) {
    this.ui.isInvoiceDownloading = true;
    console.log(screenshot);
    this.apiService.getInvoiceScreenshot(screenshot).subscribe({
      next: (res) => {
        console.log('[bills] downloadInvoice done: ', res);
        if (res.blob) {
          const blob = new Blob([res.blob], { type: res.blob.type });
          if (type === InvoiceType.png && !isDownload) {
            this.ui.isInvoiceLoaded = false;
            this.invoiceUrl.PNG = URL.createObjectURL(blob);
            invoice.pngData = URL.createObjectURL(blob);
            setTimeout(() => {
              this.anchorFunc();
            }, 1000);
          } else if (type === InvoiceType.pdf) {
            invoice.pdfData = blob;
            if (isDownload) {
              if (res.filename) {
                FileSaver.saveAs(blob, decodeURIComponent(res.filename));
              } else {
                FileSaver.saveAs(blob, `${invoice.orderDetailId}-${invoice.yearMonth}`);
              }
            }

          }

          this.ui.isInvoiceDownloading = false;
          this.ui.isInvoiceLoaded = false;
        } else {
          this.alert.errorAlert(`[bills] downloadInvoice cannot get blob!`);
        }
      },
      error: (err) => {
        this.alert.errorAlert('[bills] downloadInvoice fail: ' + err);
        console.error('[bills] downloadInvoice fail: ', err);
      }
    });
  }

  /** API: 下載 Invoice 原廠使用量 */
  exportInvoiceExcel(invoice: Invoice) {
    this.ui.isExcelDownloading = true;
    this.apiService.exportInvoiceExcel(this.orderId, invoice.year, invoice.month).subscribe({
      next: (res) => {
        console.log('[bills] exportInvoiceExcel done: ', res);
        if (res.blob) {
          const blob = new Blob([res.blob], { type: res.blob.type });
          if (res.filename) {
            FileSaver.saveAs(blob, decodeURIComponent(res.filename));
          } else {
            FileSaver.saveAs(blob, `${invoice.orderDetailId}-${invoice.year}-${invoice.month}` + '.xlsx');
          }
        } else {
          this.alert.errorAlert(`[bills] exportInvoiceExcel cannot get blob!`);
        }
        this.ui.isExcelDownloading = false;
      },
      error: (err) => {
        this.alert.errorAlert('[bills] exportInvoiceExcel fail: ' + err);
        console.error('[bills] exportInvoiceExcel fail: ', err);
        this.ui.isExcelDownloading = false;
      }
    });
  }

  /** API: 下載 customer 原廠使用量 */
  exportCustomExcel(invoice: Invoice) {
    this.ui.isExcelDownloading = true;
    this.apiService.exportCustomExcel(this.orderId, invoice.year, invoice.month).subscribe({
      next: (res) => {
        if (res.blob) {
          const blob = new Blob([res.blob], { type: res.blob.type });
          if (res.filename) {
            FileSaver.saveAs(blob, decodeURIComponent(res.filename));
          } else {
            FileSaver.saveAs(blob, `${invoice.orderDetailId}-${invoice.year}-${invoice.month}` + '.xlsx');
          }
        } else {
          this.alert.errorAlert(`[bills] exportCustomExcel cannot get blob!`);
        }
        this.ui.isExcelDownloading = false;
      },
      error: (err) => {
        this.alert.errorAlert('[bills] exportCustomExcel fail: ' + err);
        console.error('[bills] exportCustomExcel fail: ', err);
        this.ui.isExcelDownloading = false;
      }
    });
  }

  /** API: 鎖定 Invoice */
  lockedInvoice(invoice: Invoice) {
    // if (invoice.locked) {
    //   return;
    // }
    this.ui.isInvoiceLocking[invoice.id] = true;

    this.apiService.lockedInvoice(this.orderId, invoice.year, invoice.month, !invoice.locked).subscribe({
      next: (res) => {
        console.log('[bills] lockedInvoice done: ', res);
        if (res.info && res.info.success) {
          this.ui.isInvoiceLocking[invoice.id] = false;
          invoice.locked = res.data.locked;
          invoice.lockDate = res.data.lockDate;
          this.alert.successAlert(
            this.translate.instant('Order: {{orderId}} Year: {{year}} Month: {{month}} is {{lock}}!', { orderId: invoice.orderId, year: invoice.year, month: invoice.month, lock: invoice.locked ? this.translate.instant('lock') : this.translate.instant('unlock')})
          );
        } else {
          this.ui.isInvoiceLocking[invoice.id] = false;
          this.alert.errorAlert(res.info.message);
        }
      },
      error: (err) => {
        console.error('[bills] lockedInvoice fail', err);
        this.ui.isInvoiceLocking[invoice.id] = false;
        this.alert.errorAlert(
          this.translate.instant('Order: {{orderId}} Year: {{year}} Month: {{month}} {{lock}} failed!', { orderId: invoice.orderId, year: invoice.year, month: invoice.month, lock: invoice.locked ? this.translate.instant('lock') : this.translate.instant('unlock') })
        );
      }
    });
  };

  /** API: 儲存發票號碼 */
  updateInvoiceNumber(invoice: Invoice, number: string) {
    this.invoiceNumberUpdating[invoice.id] = true;
    this.apiService.saveInvoiceNumber(this.orderId, invoice.year, invoice.month, number).subscribe({
      next: (res) => {
        console.log('[order-setting] updateInvoiceNumber done', res);
        this.invoiceNumberUpdating[invoice.id] = false;
        this.alert.successAlert(
          this.translate.instant('Invoice number {{number}} is updated successfully!', { number: number })
        );
        this.search();
      },
      error: (err) => {
        console.error('[order-setting] updateInvoiceNumber fail', err);
        this.invoiceNumberUpdating[invoice.id] = false;
        this.alert.errorAlert(
          this.translate.instant('Invoice number {{number}} update failed!', { number: number })
        );
      },
    });
  }

  /** API: get Invoice 詳細內容 */
  updateInvoice(invoice: Invoice, isDownload: boolean, index: number) {
    this.ui.isInvoiceDownloading = true;
    this.ui.isInvoiceLoaded = true;


    // 從 invoiceList 找到該筆 invoice，如果已經有 screenshot，直接下載
    const idx = _.findIndex(this.invoiceList, { id: invoice.id });

    this.invoiceUrl.PNG = '';
    this.invoiceUrl.PDF = '';
    this.apiService.getUpdateInvoice(this.orderId, invoice.year, invoice.month).subscribe({
      next: (res) => {
        console.log('[bills] getInvoiceList done: ', res);
        if (res.info && res.info.success && res.data.screenshot) {
          console.log('11111111111111');
          console.log(res.data);
          this.invoiceList[index].info = res.data.info;
          // 更新該筆 invoice 的 pdfScreenshot
          this.invoiceList[idx].pngScreenshot = res.data.screenshot.PNG
          this.invoiceList[idx].pdfScreenshot = res.data.screenshot.PDF

          this.downloadInvoice(invoice, InvoiceType.png, this.invoiceList[idx].pngScreenshot, isDownload);
          this.downloadInvoice(invoice, InvoiceType.pdf, this.invoiceList[idx].pdfScreenshot, isDownload);
        } else {
          this.ui.isInvoiceDownloading = false;

          this.ui.isInvoiceLoaded = false;
          this.alert.errorAlert(res.info.message);
        }

      },
      error: (err) => {
        this.alert.errorAlert('[bills] getInvoiceList fail: ' + err);
        console.error('[bills] getInvoiceList fail: ', err);
        this.ui.isInvoiceDownloading = false;
        this.ui.isInvoiceLoaded = false;
      }
    });

  }

  /** SecurityTrustUrl */
  getDomSanitizer(url: string) {
    if (!url) return null;
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  /** 選擇日期事件 */
  changeDateEvent(event: any) {
    // if (this.authority.isSiAdmin || this.authority.isSIUser) {
    //   const year = DateTime.fromJSDate(event).year;
    //   const month = ('0' + (DateTime.fromJSDate(event).month + 1)).slice(-2);
    //   const index = this.isLockedDatas.indexOf(year + '-' + month);

    //   if (index == -1) {
    //     this.alert.errorAlert('此月份尚未出帳');
    //     this.invoiceMonth = '';
    //   }
    // }
  }

  /** 設定日期格式 */
  getFormatDate(date: string): string | undefined {
    const parsedDate = DateTime.fromJSDate(new Date(date));
    console.log('parsedData', parsedDate);
    if (parsedDate && parsedDate.isValid) {
      return parsedDate.toFormat('yyyy-MM');
    } else {
      return;
    }
  }

  onImageLoad() {
    this.ui.isInvoiceDownloading = true;
  }

  onImageError() {
    this.ui.isInvoiceDownloading = false;
    this.invoiceUrl.PNG = '';
    this.alert.errorAlert(
      this.translate.instant('Fail to download file!') + ' ' +
      this.translate.instant('Please report to the administrator.'),
    );
  }

  /** 設定查詢條件 */
  getFilter(pageIndex: number, pageSize?: number) {
    const filter = new Filter();
    const str = DateTime.fromJSDate(this.invoiceMonth).toFormat('yyyy-MM').split('-');
    if (str[0] && this.invoiceMonth) {
      const year = str[0];
      const month = str[1];

      filter.and.push({
        field: 'year',
        comparator: Comparator.equal,
        value: year
      });

      filter.and.push({
        field: 'month',
        comparator: Comparator.equal,
        value: month
      });
    }

    filter.pageIndex = pageIndex;
    if (pageSize !== undefined) {
      filter.pageSize = pageSize;
    }
    // filter.pageSize = -1
    filter.sort = {};
    // filter.sort['yearMonth'] = Sort.desc;
    filter.sort[this.sortBy.prop] = this.sortBy.dir;

    this.filter = filter;

    return filter;
  }

  /** 查詢 */
  search(f?: Filter) {
    // this.pageConfig.currentPage = 1;
    const filter = f ? f : this.getFilter(this.pageConfig.currentPage, this.pageConfig.itemsPerPage);
    this.getInvoiceList(filter);
  }

  /**
   * 顯示計費時間
   * @param invoice 發票資訊
   */
  showYearMonth(invoice: Invoice) {
    let year = Number(invoice.year);
    let month = Number(invoice.month);
    if (this.brand === 'AWS' || this.brand === 'Microsoft') {
      month = month - 1;
      if (month === 0) {
        year = year - 1;
        month = 12;
      }
    }
    return year + '-' + month;
  }

  /** 切換分頁時指定執行的函式 (in-table)
   * @param event 由 in-table 回傳的分頁資訊
   */
  pageChange(event: any) {
    localStorage.setItem('intable-bills-table', JSON.stringify({
      itemsPerPage: event.itemsPerPage,
    }));
    this.showSub.forEach(item => {
      item = false;
    })
    const filter: Filter = this.getFilter(this.pageConfig.currentPage, this.pageConfig.itemsPerPage);
    this.getInvoiceList(filter);
  }
  anchorFunc() {
    this.anchor.nativeElement.scrollIntoView({
      behavior: 'smooth', block: 'start', inline: 'start'
    });
  }

  /**
   * 額外出帳按鈕 顯示/隱藏
   *
   * @param invoice invoice資料
   */
  extraBilling(invoice: Invoice) {
    invoice.extraBillingStatus = !invoice.extraBillingStatus;
    if(invoice.extraBilling.length === 0) {
      invoice.extraBillingLoadStatus = true;

      this.apiService.getExtraBilling(this.orderId, invoice.year, invoice.month).subscribe({
        next: (res) => {
          if (res.info && res.info.success ) {
            invoice.extraBilling = res.data.map((item: any, index: number) => ({
              ...item,
              modifyUserName: item.modifyUser.name,
              modifyTime:  DateTime.fromJSDate(new Date(item.modifyTime)).toFormat('yyyy-MM-dd'),
            }));
          } else {

            this.alert.errorAlert(res.info.message);
          }
        },
        error: (err) => {
          this.alert.errorAlert('[bills] getInvoiceList fail: ' + err);
        }
      });


    }

  }

  /**
   * 新增錯帳資訊
   *
   * @param idx 第幾筆
   * @param invoice invoice資料
   */
  addBilling(idx: number, invoice: Invoice) {
    let datas: ExtraBilling[] = _.cloneDeep(invoice.extraBilling);
    const data = new ExtraBilling();
    data.currencyType = invoice.info.order.currencyType
    datas.push(data)
    invoice.extraBilling = datas;
    this.extraBillingRequired(invoice.extraBilling[invoice.extraBilling.length -1]);
  }

  /**
   * 刪除錯帳資訊
   *
   * @param item 額外出帳項目
   */
  delBilling(item: ExtraBilling) {
    if(item.id) {
      item.status = true;
      this.apiService.deleteExtraBilling(this.orderId, this.invoiceItem.year, this.invoiceItem.year, item.id).subscribe({
        next: (res) => {
          console.log('[bills] lockedInvoice done: ', res);
          if (res.info && res.info.success) {
            this.alert.successAlert('刪除項目成功');
            this.invoiceItem.extraBilling = this.invoiceItem.extraBilling.filter((extraBillingItem, extraBillingIndex) => {
              return extraBillingIndex !== this.deleteExtraBillingItemIndex;
            });
            item.status = false;
          } else {
            this.alert.errorAlert(res.info.message);
            item.status = false;
          }
        },
        error: (err) => {
          item.status = false;
          this.alert.errorAlert(err);
        }
      });
    } else {
      this.invoiceItem.extraBilling = this.invoiceItem.extraBilling.filter((extraBillingItem, extraBillingIndex) => {
        return extraBillingIndex !== this.deleteExtraBillingItemIndex;
      });
      this.alert.successAlert('刪除項目成功');
    }

  }

  /**
   * 修改金額
   *
   * @param type 錯帳 or 優惠
   * @param item 錯帳項目
   */
  changeMoney(type: string, item: ExtraBilling) {
    if (type === 'amount') {
     item.amountIncludingTax = this.roundNumber(item.amount * 1.05, item.currencyType === 'TWD' ? 0: 2);

    }
    if (type === 'tax') {
      item.amount = this.roundNumber(item.amountIncludingTax / 1.05, item.currencyType === 'TWD' ? 0: 2);
    }
    this.extraBillingRequired(item);
  }


  /**
   * 檢查額外出帳必填項目
   *
   * @param item 額外出帳項目
   */
  extraBillingRequired(item: ExtraBilling) {

    let status = false;

    if(!item.amount || !item.name) {
      status = true;
    }
    item.requiredStatus = status;
  }

  /**
   * 儲存錯帳項目
   *
   * @param extraBilling 錯帳項目
   * @param invoice
   */
   saveBilling(extraBilling: ExtraBilling, invoice: Invoice) {
    extraBilling.status = true;
    let data: ExtraBillingSave = {
      name: extraBilling.name,
      type: extraBilling.type,
      amount: extraBilling.amount,
      amountIncludingTax: extraBilling.amountIncludingTax
    }
    if(!extraBilling.id) {
      this.apiService.addExtraBilling(this.orderId, invoice.year, invoice.month, data).subscribe({
        next: (res) => {
          console.log('[bills] lockedInvoice done: ', res);
          if (res.info && res.info.success) {
            this.alert.successAlert('新增項目成功');
            extraBilling.status = false;
          } else {
            this.alert.errorAlert(res.info.message);
            extraBilling.status = false;
          }
        },
        error: (err) => {
          extraBilling.status = false;
          this.alert.errorAlert(err);
        }
      });
    } else {
      this.apiService.updateExtraBilling(this.orderId, invoice.year, invoice.month, data, extraBilling.id).subscribe({
        next: (res) => {
          console.log('[bills] lockedInvoice done: ', res);
          if (res.info && res.info.success) {
            extraBilling.status = false;
            this.alert.successAlert('更新項目成功');
          } else {
            extraBilling.status = false;
            this.alert.errorAlert(res.info.message);
          }
        },
        error: (err) => {
          extraBilling.status = false;
          this.alert.errorAlert(err);
        }
      });
    }

  }


  /**
   * 四捨五入
   *
   * @param num 數值
   * @param scale 進位點
   */
  roundNumber(num: number, scale: number): number {
    if (`${num}`.indexOf('e') === -1) {
      return +(Math.round(+(num + 'e+' + scale)) + 'e-' + scale);
    } else {
      const arr = `${num}`.split('e');
      const sig = (+arr[1] + scale > 0) ? '+' : '';
      return +(Math.round(+(+arr[0] + 'e' + sig + (+arr[1] + scale))) + 'e-' + scale);
    }
  }

  // 打開對話
  openModal(template: TemplateRef<any>,item: ExtraBilling, idx: number, invoice: Invoice) {
    this.modalRef = this.modalService.show(template);
    this.invoiceItem = invoice;
    this.deleteExtraBillingItem = item;
    this.deleteExtraBillingItemIndex = idx;
  }
  // 確認對話
  confirm(): void {
    this.modalRef?.hide();
    this.delBilling(this.deleteExtraBillingItem);
  }
  // 取消對話
  decline(): void {
    this.modalRef?.hide();
  }
}

