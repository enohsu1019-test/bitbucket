import { InTableConfig } from '@sysage/in-table';
import { Component, OnInit } from '@angular/core';
import { AdvancedSetting, DataType, CommonFeldManagement } from '../brands';
import { MatDialog } from '@angular/material/dialog';
import { BrandConditionComponent } from '../brand-condition/brand-condition.component';
import _ from 'lodash';

@Component({
  selector: 'app-brands-field-management',
  templateUrl: './brands-field-management.component.html',
  styleUrls: ['./brands-field-management.component.scss']
})
export class BrandsFieldManagementComponent implements OnInit {

  constructor(
    public dialog: MatDialog
  ) { }
  // 布林下拉選單
  booleanDropdown: string[] = [
    'PARAMETER'
  ];
  // 單選下拉選單
  dropdown: string[] = [
    'PARAMETER',
    'API',
  ];
  // 多選下拉選單
  multisDropdown: string[] = [
    'PARAMETER',
    'API',
  ]
  // 數字下拉選單
  numberDropdown: string[] = [
    'PARAMETER',
    'API',
  ];


  // intable設定
  intableConfig = new InTableConfig();
  // intable資料
  intableDatas: CommonFeldManagement[]= [];
  // intable顯示清單設定
  intableEditConfig = new InTableConfig();

  managementRequired = {
    checkbox: false,
  };

  // 字串下拉選單格式
  stringDropdown: string[] = [
    'PARAMETER',
    'API',
  ];
  // 資料格式下拉選單
  typeDropdown: string[] = [
    DataType.string,
    DataType.number,
    DataType.boolean,
    DataType.dropdown,
    DataType.multiselect,
  ];
  ngOnInit(): void {
    this.intableDatas = [
      {
        defaultName: '一次性建設費用',
        type: DataType.string,
        function: 'PARAMETER',
        functionDropdowns: this.stringDropdown,
        require: false,
        settingStatus: false,
        settingViewStatus: false,
        settingButtonViewStatus: false,
        initial: false,
        key: 'test1',
      }
    ];

    // this.intableConfig.sitckyElemId = 'page-header';
    this.intableConfig.enableDragDrop = true;
    this.intableConfig.dragDropableKey = 'draggable';
  }

  // 新增欄位管理項目
  addFieldItem() {
    this.intableDatas.push(new CommonFeldManagement());
  }
  // 刪除欄位管理項目
  deleteFieldItem(index: number){
    this.intableDatas = this.intableDatas.filter((intableItem, intableIndex) => {
      return intableIndex !== index;
    });
  }


  // 處理資料格式轉換
  handleTypeChange(parameter: CommonFeldManagement, index: number) {
    if(parameter.advancedSetting) {
      delete parameter.advancedSetting;
    }
    switch(parameter.type) {
      case DataType.string:
        parameter.functionDropdowns = this.stringDropdown;
        parameter.function = 'PARAMETER';
        break;
      case DataType.number:
        parameter.functionDropdowns = this.numberDropdown;
        parameter.function = 'PARAMETER';
        break;
      case DataType.boolean:
        parameter.functionDropdowns = this.booleanDropdown;
        parameter.function = 'PARAMETER';
        break;
      case DataType.dropdown:
        parameter.functionDropdowns = this.dropdown;
        parameter.settingStatus = true;
        parameter.function = 'PARAMETER';
        parameter.advancedSetting = new AdvancedSetting();
        this.openDialog(parameter, index);
        break;
      case DataType.multiselect:
        parameter.functionDropdowns = this.multisDropdown;
        parameter.settingStatus = true;
        parameter.function = 'PARAMETER';
        parameter.advancedSetting = new AdvancedSetting();
        this.openDialog(parameter, index);

    }
  }
  // 開啟對話筐
  openDialog(parameter: CommonFeldManagement, index: number): void {
    const cloneData = _.cloneDeep(parameter)
    const dialogRef = this.dialog.open(BrandConditionComponent, {
      data: {data:parameter, index: index},
      disableClose: true,
      width: '800px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        parameter.settingViewStatus = true;
      } else {
        this.intableDatas[index] = cloneData;
      }
    });
  }

}
