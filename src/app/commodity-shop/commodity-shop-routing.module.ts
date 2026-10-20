import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommodityShopComponent } from './commodity-shop.component';
import { DetailComponent } from './detail/detail.component';
import { OrderListDetailComponent } from './order-list-detail/order-list-detail.component';
import { OrderListComponent } from './order-list/order-list.component';
import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';

const routes: Routes = [
  {
    path: '',
    component: CommodityShopComponent,
  },
  // {
  //   path: 'add',
  //   data: { breadcrumb: 'add commodity' },
  //   component: DetailComponent
  // },
  {
    path: 'cart',
    data: { breadcrumb: 'shopping cart list' },
    component: ShoppingCartComponent
  },
  {
    path: 'order-list',
    data: { breadcrumb: 'shopping record' },
    children: [
      {
        path: '',
        data: { breadcrumb: '::' },
        component: OrderListComponent,
      },
      {
        path: ':cartOrder',
        data: { breadcrumb: '::' },
        component: OrderListDetailComponent
      },
    ]
  },
  {
    path: ':product',
    data: { breadcrumb: '::' },
    component: DetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommodityShopRoutingModule { }
