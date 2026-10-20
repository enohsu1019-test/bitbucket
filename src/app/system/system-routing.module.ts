import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailComponent } from '../users/detail/detail.component';
import { SystemComponent } from './system.component';
import { RegisterListComponent } from '../register-list/register-list.component';

const routes: Routes = [
  {
    path: '',
    component: SystemComponent,
  },
  {
    path: 'authorization',
    data: { breadcrumb: 'authorization' },
    loadChildren: () =>
      import('../authorization/authorization.module').then(
        (m) => m.AuthorizationModule,
      ),
  },
  {
    path: 'users',
    data: { breadcrumb: 'users' },
    loadChildren: () =>
      import('../users/users.module').then((m) => m.UsersModule),
  },
  {
    path: 'alias',
    data: { breadcrumb: 'alias' },
    loadChildren: () =>
      import('../alias/alias.module').then((m) => m.AliasModule),
  },
  {
    path: 'personal',
    data: { breadcrumb: 'personal' },
    component: DetailComponent,
  },
  {
    path: 'register-list',
    data: { breadcrumb: 'register list' },
    component: RegisterListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SystemRoutingModule {}
