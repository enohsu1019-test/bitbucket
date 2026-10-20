import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanDeactivateGuard } from '../core/guards/can-deactivate.guard';
import { AuthorizationComponent } from './authorization.component';
import { DetailComponent } from './detail/detail.component';

const routes: Routes = [
  { 
    path: '', 
    component: AuthorizationComponent 
  },
  { 
    path: 'add',
    data: { breadcrumb: 'add authorization' },
    component: DetailComponent 
  },
  { 
    path: ':authorization', 
    data: { breadcrumb: '::' },
    component: DetailComponent 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthorizationRoutingModule { }
