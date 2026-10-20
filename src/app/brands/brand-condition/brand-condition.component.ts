import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InTableConfig } from '@sysage/in-table';
import { EditKBox, CommonFeldManagement, EditKBoxItems} from '../brands';

@Component({
  selector: 'app-brand-condition',
  templateUrl: './brand-condition.component.html',
  styleUrls: ['./brand-condition.component.scss']
})
export class BrandConditionComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<BrandConditionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {data: CommonFeldManagement, index: number},
  ) { }


  // intable設定
  intableConfig = new InTableConfig();
  // intable資料
  editDatas = new EditKBox();

  ngOnInit(): void {
    this.intableConfig.enableDragDrop = true;
    this.intableConfig.dragDropableKey = 'draggable';
    this.intableConfig.orderByKey = 'orderIndex';

    if(this.data.data.advancedSetting ) {
      this.editDatas = this.data.data.advancedSetting.contents
    }

    if(this.data.data.type === 'MULTISELECT') {
      if(this.data.data.advancedSetting)
        this.data.data.advancedSetting.contents.allowMultipleSelect = true;
    }
  }
  // 新增下拉選單項目
  addBoxItem() {
    this.editDatas.items.push(new EditKBoxItems());
  }
  // 刪除下拉選單項目
  deleteBoxItem(index: number) {
    this.editDatas.items = this.editDatas.items.filter((editItem, editIndex) => {
      return editIndex !== index;
    });
  }

  setBoxItemValue(parameter: EditKBoxItems) {
    parameter.value = parameter.label;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
