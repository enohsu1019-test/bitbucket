import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommodityShopRoutingModule } from './commodity-shop-routing.module';
import { CommodityShopComponent } from './commodity-shop.component';
import { DetailComponent } from './detail/detail.component';
import { CoreModule } from '../core/core.module';
import { ShareModule } from '../share/share.module';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';
import { InTableModule } from '@sysage/in-table';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ShoppingListComponent } from './shopping-cart/shopping-list/shopping-list.component';
import { ShoppingDetailComponent } from './shopping-cart/shopping-detail/shopping-detail.component';
import { OrderListComponent } from './order-list/order-list.component';
import { OrderListDetailComponent } from './order-list-detail/order-list-detail.component';


@NgModule({
  declarations: [
    CommodityShopComponent,
    DetailComponent,
    ShoppingCartComponent,
    ShoppingListComponent,
    ShoppingDetailComponent,
    OrderListComponent,
    OrderListDetailComponent
  ],
  imports: [
    CommonModule,
    CommodityShopRoutingModule,
    CoreModule,
    ShareModule,
    InTableModule,

   /** ngx-bootstrap */
    CarouselModule.forRoot(),
    BsDatepickerModule,
  ]
})
export class CommodityShopModule { }
