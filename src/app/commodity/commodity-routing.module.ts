import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommodityComponent } from './commodity.component';
import { DetailComponent } from './detail/detail.component';

const routes: Routes = [
  {
    path: '',
    component: CommodityComponent
  },
  {
    path: 'add',
    data: { breadcrumb: 'add commodity' },
    component: DetailComponent
  },
  {
    path: ':commodity',
    data: { breadcrumb: '::' },
    component: DetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommodityRoutingModule { }
