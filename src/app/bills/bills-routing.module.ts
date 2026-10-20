import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillsComponent } from './bills.component';
import { DetailComponent } from './detail/detail.component';

const routes: Routes = [
  { 
    path: '', 
    component: BillsComponent 
  },
  { 
    path: ':bill', 
    data: { breadcrumb: '::' },
    component: DetailComponent 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillsRoutingModule { }
