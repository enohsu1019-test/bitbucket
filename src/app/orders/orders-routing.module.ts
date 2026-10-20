import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillsListComponent } from '../share/components/bills-list/bills-list.component';
import { BillsDetailComponent } from '../share/components/bills-detail/bills-detail.component';
import { DetailComponent } from './detail/detail.component';
import { OrdersComponent } from './orders.component';

const routes: Routes = [
  {
    path: '',
    component: OrdersComponent
  },
  {
    path: 'add',
    data: { breadcrumb: 'add order' },
    component: DetailComponent
  },
  {
    path: ':order',
    data: { breadcrumb: '::'},
    component: DetailComponent,
    children: [
      { path: '', component: BillsListComponent},
      { path: ':bill', data: { breadcrumb: '::'}, component: BillsDetailComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }
