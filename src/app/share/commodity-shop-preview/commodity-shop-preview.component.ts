import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-commodity-shop-preview',
  templateUrl: './commodity-shop-preview.component.html',
  styleUrls: ['./commodity-shop-preview.component.scss'],
  // 使內部的 css, js 不要影響到外部
  encapsulation: ViewEncapsulation.ShadowDom
})
export class CommodityShopPreviewComponent {
  @Input() content: string | undefined = '';

  constructor() { }

}
