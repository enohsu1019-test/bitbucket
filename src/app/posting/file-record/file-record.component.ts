import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { InTableConfig } from '@sysage/in-table';
import FileSaver from 'file-saver';
import moment from 'moment';
import { Comparator, Filter, Sort } from 'src/app/core/models/filter';
import { PageConfig } from 'src/app/core/models/page';
import { AlertService } from 'src/app/core/services/alert.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { PermissionService } from 'src/app/core/services/permission.service';
import { PostingService } from '../posting.service';
import { Brands, FileRecordList } from '../postion';

@Component({
  selector: 'app-file-record',
  templateUrl: './file-record.component.html',
  styleUrls: ['./file-record.component.scss']
})
export class FileRecordComponent implements OnInit {

  constructor(
    private alert: AlertService,
    private postingAPI: PostingService,
    private translate: TranslateService,
    private permission: PermissionService,
    private authService: AuthService
  ) { }


  // 品牌下拉選單
  brandDropdownDatas: Brands[] = [];

  // 品牌id
  brandId = '';



  // 表單
  fileRecordForm = new FormGroup({
    outputFileName: new FormControl(''),
    operator: new FormControl(''),

  });

  // 是否為管理員
  isAdmin = false

  /** in-table setting */
  inTableConfig = new InTableConfig;

  /** in-table 資料 */
  inTableDatas: FileRecordList[] = [];

  /** 設定聯絡人分頁參數 */
  pageConfig = new PageConfig;

  /** 日期選擇器範圍資料 */
  pickerRangeDates: (Date | undefined)[] | undefined = [];


  // api控制狀態
  ui = {
    isLoading: false,
    isExcel: false,
  }


  ngOnInit(): void {
    this.isAdmin = this.permission.flat['layout.iam.adminInput'] ? true : false;
    if (this.isAdmin) {
      this.getBrand();
    } else {
      if (this.authService.currentUserValue?.role?.brand.id)
        this.brandId = this.authService.currentUserValue?.role?.brand.id
    }

    this.search();
  }


  // 下載檔案紀錄excle
  downLoadPostingExcel(fileName: string) {
    this.ui.isExcel = true;
    this.postingAPI.downLoadfileRecordExcel(fileName).subscribe({
      next: (downloadRes: any) => {
        if (downloadRes.info && downloadRes.info.success) {
          if (downloadRes.blob) {
            FileSaver.saveAs(downloadRes.blob, downloadRes.filename ? downloadRes.filename + '.xlsx' : 'export.xlsx');
          }
          this.ui.isExcel = false;
        } else {
          this.ui.isExcel = false;
          this.alert.errorAlert(downloadRes.info.message);
        }
      }, error: (err: any) => {
        this.ui.isExcel = false;
        this.alert.errorAlert(err.message);
      }
    });
  }


  /** 重設搜尋選項 */
  filterReset() {
    this.fileRecordForm.patchValue({
      clounId: '',
      postingStatus: ''
    });
    this.pickerRangeDates = [];
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
    if (this.fileRecordForm) {
      // 品牌
      if (this.brandId) {
        filter.and.push({
          field: 'brandId',
          comparator: Comparator.equal,
          value: this.brandId,
        });
      }



      // 產出檔案名稱
      if (this.fileRecordForm.value.outputFileName) {
        filter.and.push({
          field: 'fileName',
          comparator: Comparator.equal,
          value: this.fileRecordForm.value.outputFileName,
        });
      }

      // 操作人
      if (this.fileRecordForm.value.operator) {
        filter.and.push({
          field: 'userName',
          comparator: Comparator.equal,
          value: this.fileRecordForm.value.operator,
        });
      }

      // 合約起始日
      if (this.pickerRangeDates && this.pickerRangeDates?.length !== 0) {
        const date = [moment(this.pickerRangeDates[0]).format('YYYY-MM-DD'), moment(this.pickerRangeDates[1]).format('YYYY-MM-DD')];
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

  /** 取得檔案列表 */
  getFileRecordList(filter: Filter) {
    // filter.pageSize = -1;
    this.inTableDatas = [];
    this.ui.isLoading = true;
    this.postingAPI.postfileRecordList(filter).subscribe({
      next: (res) => {
        if (res.info.success && res?.data) {
          let index: FileRecordList[] = [];
          res.data.forEach((item: FileRecordList) => {
            let itemIndex = new FileRecordList();
            let userIndex = {
              id: '',
              employeeId: '',
              email: '',
              name: '',
            }
            itemIndex = item;

            itemIndex.createUser = item.createUser ? item.createUser : userIndex;

            itemIndex.createUser.name = item.createUser.name ? item.createUser.name: '';
            itemIndex.createUser.id = item.createUser.id ? item.createUser.id: '';
            itemIndex.createUser.employeeId = item.createUser.employeeId ? item.createUser.employeeId: '';
            itemIndex.createUser.email = item.createUser.email ? item.createUser.email: '';
            index.push(item);
          })
          this.inTableDatas = index;
          console.log(this.inTableDatas)
          // 設定分頁內容
          this.pageConfig.totalItems = res.page ? res.page.dataCount : 0;
          this.pageConfig.itemsPerPage = res.page ? res.page.pageSize : 0;
          this.pageConfig.currentPage = res.page ? res.page.pageIndex : 0;
          this.ui.isLoading = false;

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


  /**
   * 切換分頁時指定執行的函式 (in-table)
   * @param event 由 in-table 回傳的分頁資訊
   */
  pageChange(event: any) {
    if (this.pageConfig) {
      this.ui.isLoading = true;
      const filter = this.getFilter();
      filter.pageSize = event.itemsPerPage;
      filter.pageIndex = event.currentPage;
      this.getFileRecordList(filter);
    }
  }


  /** 搜尋 */
  search() {
    const filter = this.getFilter();
    this.getFileRecordList(filter);
  }

}
