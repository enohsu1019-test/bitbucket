import {
  Component,
  ChangeDetectorRef,
  OnInit,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MetaService } from '../core/services/meta.service';
import { Comparator, Filter, Sort } from '../core/models/filter';
import { MatSort } from '@angular/material/sort';
import { PageConfig } from '../core/models/page';
import { AlertService } from 'src/app/core/services/alert.service';
import { UsersService } from 'src/app/users/users.service';
import moment from 'moment';
import { FormArray, FormGroup, FormBuilder } from '@angular/forms';

import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatCheckboxChange } from '@angular/material/checkbox';
@Component({
  selector: 'app-register-list',
  templateUrl: './register-list.component.html',
  styleUrls: ['./register-list.component.scss'],
})
export class RegisterListComponent implements OnInit, AfterViewInit {
  // config: any[] = [];
  tabs = ['NEW_APPLICATION', 'PROCESSED', 'REJECT'];
  currentData: any[] = [];
  submitData: any[] = [];
  // dataSource: any[] = [];
  dataSource = new MatTableDataSource<any>();
  filterData: any = [];
  tabIndex = 0;
  // config = {
  //   check: true
  // };

  form!: FormGroup;
  columnlist = [
    'check',
    'rowIndex',
    'name',
    'department',
    'job',
    'telephone',
    'ext',
    'mobilePhone',
    'email',
    'createTime',
    'role',
    'status',
  ];
  displayedColumns: any[] = this.columnlist.slice();
  roleList: any[] = [];
  currentPageIndex: number = 0;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) matSort!: MatSort;

  selection = new SelectionModel<any>(true, []);

  /** 設定分頁參數 */
  pageConfig = new PageConfig();
  defaultPageSize = -1;
  filter = new Filter({
    pageSize: this.defaultPageSize,
  });

  /** 設定排序參數 */
  sortBy = {
    prop: 'createTime',
    dir: Sort.desc,
  };

  isLoading: Boolean = false;

  constructor(
    public translate: TranslateService,
    private metaService: MetaService,
    private alert: AlertService,
    private usersService: UsersService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {}

  get dateFormArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      items: this.formBuilder.array([]),
    });

    this.getRegistrationList();
    this.getRoleList();
  }

  onUserChange(event: any, row: FormGroup) {
    if (row.value.check) {
      this.submitData.forEach((item) => {
        if (item.id === row.value.id) {
          item.roleIdList = row.value.role;
        }
      });
      // this.submitData.push({
      //   id: row.value.id,
      //   roleIdList: row.value.role || []
      // })
    }
  }

  ngAfterViewInit() {
    console.log('');
    this.dataSource.paginator = this.paginator;
    this.dataSource.paginator.pageIndex = this.currentPageIndex;
  }

  getRegistrationList() {
    this.filter = this.getFilter(this.pageConfig.currentPage, -1);

    this.metaService.getRegistrationList(this.filter).subscribe(
      (res: any) => {
        if (res.info && res.info.success) {
          // origin data
          this.currentData = res.data;
          this.onTabChange(0);
        }
      },
      (err: any) => {
        this.alert.errorAlert('[MetaMatch] register fail: ' + err);
      },
    );
  }

  getRoleList() {
    this.filter = this.getFilter(this.pageConfig.currentPage, -1);
    this.filter.sort = {};
    this.filter.sort['time'] = this.sortBy.dir;

    this.usersService.getRoleList(this.filter).subscribe({
      next: (res) => {
        this.roleList = res.data;
      },
      error: (err) => {
        this.alert.errorAlert('[authorization] getRoleList fail: ' + err);
        console.error('[authorization] getRoleList fail: ', err);
      },
    });
  }

  /** 設定查詢條件 */
  getFilter(pageIndex: number, pageSize?: number) {
    const filter = new Filter();
    filter.pageIndex = pageIndex;

    if (pageSize !== undefined) {
      filter.pageSize = pageSize;
    }

    const setField = (comparator: Comparator, field: string, value: any) => {
      filter.and.push({
        comparator: comparator,
        field: field,
        value: value,
      });
    };
    // setField(Comparator.like, 'name', '');
    // if (this.filterForm.value.company) {
    //   filter.and.push({
    //     field: 'customerName',
    //     comparator: Comparator.like,
    //     value: this.filterForm.value.company,
    //   });
    // }

    filter.sort = {};
    filter.sort[this.sortBy.prop] = this.sortBy.dir;
    return filter;
  }

  onTabChange(event: any): void {
    if (event === 0) {
      this.displayedColumns = this.columnlist;
    } else {
      this.displayedColumns = this.columnlist.slice(1);
    }
    this.tabIndex = event;
    let filterData = this.currentData.filter((e) =>
      e.status.includes(this.tabs[event]),
    );
    this.setGridData(filterData);

    this.selection.clear();
  }

  setGridData(data: any) {
    let tempRow: any[] = [];
    data.forEach((item: any, i: number) => {
      let currentRow: any = {};
      currentRow['check'] = false;
      currentRow['rowIndex'] = i + 1;
      currentRow['id'] = item.id;
      currentRow['name'] = item.name;
      currentRow['department'] = item.department;
      currentRow['job'] = item.job;
      currentRow['telephone'] = item.telephone;
      currentRow['ext'] = item.ext;
      currentRow['mobilePhone'] = item.mobilePhone;
      currentRow['email'] = item.email;
      currentRow['createTime'] = moment(item.createTime).format(
        'YYYY-MM-DD hh:mm:ss',
      );
      currentRow['role'] = [];
      currentRow['status'] = moment(item.modifyTime).format(
        'YYYY-MM-DD hh:mm:ss',
      );
      tempRow.push(this.formBuilder.group(currentRow));
    });
    this.form.setControl('items', new FormArray(tempRow));

    this.dataSource.data = this.dateFormArray.controls;

    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.paginator.pageIndex = this.currentPageIndex;
    }
  }

  getActualIndex(index: number) {
    return index + this.paginator.pageSize * this.paginator.pageIndex;
  }

  toggleSelection(change: MatCheckboxChange, row: any): void {
    // row.value.check = change.checked;
    row.get('check').setValue(change.checked);
    if (change.checked) {
      // this.selection.toggle(row);
      this.submitData.push({
        id: row.value.id,
        roleIdList: row.value.role || [],
      });
    } else {
      let index = this.submitData.findIndex((a) => a.id === row.value.id);
      this.submitData.splice(index, 1);
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.submitData = [];
      return;
    }

    this.selection.select(...this.dataSource.data);

    this.selection.selected.forEach((item: any) => {
      this.submitData.push({
        id: item.value.id,
        roleIdList: item.value.role || [],
      });
    });
  }

  submit(status: string) {
    // role not null
    if (status === 'PROCESSED') {
      let checkRole = false;
      this.submitData.forEach((item) => {
        if (item.roleIdList.length === 0) {
          checkRole = true;
        }
      });
      if (checkRole) {
        this.alert.errorAlert(this.translate.instant('register alert'));
        return;
      }
    }

    const submitList = {
      status: status,
      update: this.submitData,
    };
    this.isLoading = true;
    this.metaService.setRegistrationStatus(submitList).subscribe({
      next: (res) => {
        if (res.info.success) {
          this.alert.successAlert(res.info.message);
          // initial
          this.submitData= [];
          this.getRegistrationList();
        } else {
          this.alert.errorAlert(res.info.message);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.alert.errorAlert(
          '[authorization] setRegistrationStatus fail: ' + err,
        );
        console.error('[authorization] setRegistrationStatus fail: ', err);
        this.isLoading = false;
      },
    });
  }
}
