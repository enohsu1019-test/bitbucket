import { Component, OnInit, Input } from '@angular/core';
import { InTableConfig } from '@sysage/in-table';
import { PricebookFiled } from '../brands';

@Component({
  selector: 'app-brand-price-book',
  templateUrl: './brand-price-book.component.html',
  styleUrls: ['./brand-price-book.component.scss']
})
export class BrandPriceBookComponent implements OnInit {
  @Input() intableDatas!: PricebookFiled[];

  constructor() { }

  // intable設定
  intableConfig = new InTableConfig();





  ngOnInit(): void {
    this.intableConfig.enableDragDrop = true;
    this.intableConfig.dragDropableKey = 'draggable';
  }
  addPriceBookItem() {
    this.intableDatas.push(new PricebookFiled());
  }
  // 刪除pricebook項目
  deletePriceBookItem(index: number) {
    this.intableDatas = this.intableDatas.filter((intableItem, intableIndex) => {
      return intableIndex !== index;
    });
  }

}
