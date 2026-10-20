import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { COMMA, ENTER, SPACE, SEMICOLON } from '@angular/cdk/keycodes';
import { DropDownItem } from 'src/app/core/models/commodity';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-autocomplete-dropdown-list',
  templateUrl: './autocomplete-dropdown-list.component.html',
  styleUrls: ['./autocomplete-dropdown-list.component.scss']
})
export class AutocompleteDropdownListComponent implements OnInit {
  @ViewChild('auto') matAutocomplete!: MatAutocomplete;

  /** all-item-list */
  @Input() isLoading: boolean = false;
  @Input() mode: 'add' | 'edit' = 'add';

  allListVal: DropDownItem[] = [];
  @Input()
  get allList() { return this.allListVal; }
  set allList(allListVal: DropDownItem[]) {
    this.allListVal = allListVal;
    this.setChips();
  }

  isDealerVal!: boolean;
  @Input()
  get isDealer() { return this.isDealerVal; }
  set isDealer(isDealerVal: boolean) {
    this.isDealerVal = isDealerVal;
    this.setChips();
  }

  keyword: string = '';

  /** chips directive properties */
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA, SPACE, SEMICOLON];
  separatorKeysCodesAvoid: number[] = [ENTER, COMMA, SPACE, SEMICOLON];

  /** all-item-list map object */
  allMapList = new Map();

  /** 已被選取的 item-id-list */
  selectedIdListVal!: string[];
  @Output() selectedIdListChange = new EventEmitter<string[]>();
  @Input()
  get selectedIdList() {
    return this.selectedIdListVal;
  }
  set selectedIdList(selectedIdListVal: string[]) {
    this.selectedIdListVal = selectedIdListVal;
    this.selectedIdListChange.emit(this.selectedIdListVal);
  }

  /** all-item-list 過濾出的物件陣列，用於 autocomplete 搜尋 */
  searchedList: DropDownItem[] = [];

  /** 依照 input value change 過濾後的 autocomplete option */
  filteredList: DropDownItem[] = [];

  constructor() { }

  ngOnInit(): void {
    this.setChips();
  }

  setChips() {
    this.searchedList = [];
    this.filteredList = [];

    this.allMapList = new Map();
    this.allList.forEach((item) => {
      this.allMapList.set(item.id, item);
    });

    this.searchedList = this.mapListFilter(this.allMapList);
    this.filteredList = this.keyword ? this._itemFilter(this.keyword) : this.searchedList;

    // this.searchedList =
    //   this.keyword ? this._itemFilter(this.keyword) : this.mapListFilter(this.allMapList);

    // this.userSearchList = this.userListFilter(this.usersList);
    // /** 監聽 label input change - 收件人列表 */
    // this.filteredUsers = this.f.recipients.valueChanges.pipe(
    //   startWith(null),
    //   map((data: any | null) =>
    //     data ? this._userFilter(data) : this.userSearchList
    //   )
    // );
  }

  /**
   * 建立 autocomplete options
   * @param mapList onInit 建立之userList map型態物件
   * @returns autocomplete options 陣列
   */
  private mapListFilter(mapList: Map<string, any>) {
    const itemSearchList: any[] = [...mapList.values()];
    const itemIdSearchList: string[] = [...mapList.keys()];

    /** 移除 labeled 的 users */
    this.selectedIdList?.forEach((id) => {
      const index: number = itemIdSearchList.indexOf(id);
      if (index !== -1) {
        itemSearchList.splice(index, 1);
        itemIdSearchList.splice(index, 1);
      }
    });
    return itemSearchList;
  }

  /**
   * autocomplete options filter
   * @param value autocomplete input value (id)
   * @returns 篩選後的 User 陣列
   */
  private _itemFilter(value: string) {
    const filterValue = value.toLowerCase();
    return this.searchedList.filter(item => item.name?.toLowerCase().indexOf(filterValue) > -1);
  }

  /**
   * 移除 user chips
   * @param id 欲移除的label id
   */
  removeChip(id: string): void {
    const index = this.selectedIdList.indexOf(id);
    if (index >= 0) {
      this.selectedIdList.splice(index, 1);
    }

    this.setChips();
    this.keyword = '';
  }

  /**
   * 選擇並建立chips
   * @param event autocomplete event
   * @param inputEvent chips input event
   */
  selectItem(event: MatAutocompleteSelectedEvent, inputEvent: any): void {
    this.selectedIdList.push(event.option.value);
    this.searchedList = this.mapListFilter(this.allMapList);
    this.filteredList = inputEvent.value ? this._itemFilter(this.keyword) : this.searchedList;

    inputEvent.value = '';
    this.keyword = '';
  }

  /** 離開 autoComplete input */
  autocompleteInputBlur(event: any) {
    const list = this._itemFilter(event.target.value);

    // 如果本來有輸入 keyword 但沒有找到，blur 時要清掉
    if (event.target.value && !list.length) {
      console.log('autocompleteInputBlur');
      this.keyword = '';
      event.target.value = '';
      event.target.blur();
    }
  }

  /** when autoComplete panel closed */
  onClose(inputEvent: any) {
    if (inputEvent.value) {
      inputEvent.value = '';
      this.keyword = '';
    }
  }
}
