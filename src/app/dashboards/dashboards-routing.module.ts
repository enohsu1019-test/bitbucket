import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AkamaiDashboardComponent } from './akamai-dashboard/akamai-dashboard.component';
import { AwsDashboardComponent } from './aws-dashboard/aws-dashboard.component';
import { GoogleDashboardComponent } from './google-dashboard/google-dashboard.component';
import { VmwareDashboardComponent } from './vmware-dashboard/vmware-dashboard.component';

const routes: Routes = [
  { 
    path: 'akamai',
    data: { breadcrumb: 'akamai' },
    component: AkamaiDashboardComponent 
  },
  { 
    path: 'aws', 
    data: { breadcrumb: 'aws' },
    component: AwsDashboardComponent 
  },
  { 
    path: 'google', 
    data: { breadcrumb: 'google' },
    component: GoogleDashboardComponent 
  },
  { 
    path: 'vmware', 
    data: { breadcrumb: 'vmware' },
    component: VmwareDashboardComponent 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardsRoutingModule { }
