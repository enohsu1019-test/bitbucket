import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatSelect } from '@angular/material/select';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-mat-table',
  templateUrl: './mat-table.component.html',
  styleUrls: ['./mat-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatTableComponent implements OnInit, OnChanges {
  @Input() configInput!: any;
  @Input() dataInput!: any[];
  @Output() action: EventEmitter<any> = new EventEmitter();
  selection = new SelectionModel<any>(true, []);
  currentTrans: any;
  form!: FormGroup;
  itemColumn: any;
  // itemGroup: any;

  dataSource = new MatTableDataSource();
  displayedColumns: any[] = [];
  selectOption: any[] = [];
  // currentPage: PageEvent;
  // currentSort: Sort;
  currentPageIndex: number = 0;
  // filters: string;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  // get the view reference from the html called '#mySelect'
  @ViewChild(MatSelect, { static: false }) allSelected!: MatSelect;

  constructor(
    private _cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
  ) {
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.currentTrans = translate.currentLang;
      this._cdr.detectChanges();
    });
    this.currentTrans = translate.currentLang;
  }

  get t(): FormArray {
    return this.form.controls['items'] as FormArray;
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      items: new FormArray([]),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.initeTable();
  }

  initeTable() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.paginator.pageIndex = this.currentPageIndex;
    }
    this.dataSource.data = this.dataInput;

    const columns: any[] = [];
    // initial columns
    this.dataInput.forEach((item: any, i: any) => {
      if (i === 0) {
        // check box
        if (this.configInput.check) {
          columns.push('check');
        }
        Object.keys(item).forEach(function (k) {
          columns.push(k);
        });

        // action
        if (this.configInput.action) {
          columns.push('action');
        }

        this.displayedColumns = columns;
      }
      this.setCellControls(columns, item);
    });

  }

  setCellControls(columns: any, item: any) {
    let group: any = {};
    columns.forEach((col: any) => {
      if (item[col]) {
        if (item[col].type) {
          group[col] = new FormControl( item[col].value, [])
        } else {
          group[col] = new FormControl( item[col], [])
        }
      }
    });
    this.t.push(this.formBuilder.group(group));


  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  isChecked(): any {
    console.log('');
  }

  isIndeterminate(): any {
    console.log('');
  }

  toggleSelection(change: MatCheckboxChange): void {
    console.log('');
  }

  toggleAllSelection(row: any, column: any) {
    if (this.allSelected.selected) {
    } else {
      row['role'] = [];
    }
  }

  actionEvent(item: any) {
    console.log(item);
  }

}
