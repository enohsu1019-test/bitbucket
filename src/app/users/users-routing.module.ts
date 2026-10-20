import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailComponent } from './detail/detail.component';
import { ItemModalEntryComponent } from './users-role-detail/item-modal-entry.component';
import { UsersComponent } from './users.component';

const routes: Routes = [
  {
    path: '', component: UsersComponent
  },
  {
    path: 'add',
    data: { breadcrumb: 'add user' },
    component: DetailComponent
  },
  {
    path: ':user',
    data: { breadcrumb: '::' },
    component: DetailComponent,
    // children: [
    //   { path: ':ruleId', component: ItemModalEntryComponent, }
    // ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
