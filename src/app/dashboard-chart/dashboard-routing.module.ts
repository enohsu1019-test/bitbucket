import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboards', pathMatch: 'full' },
  {
    path: 'dashboards',
    data: { breadcrumb: 'dashboards' },
    component: DashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardsRoutingModule { }
