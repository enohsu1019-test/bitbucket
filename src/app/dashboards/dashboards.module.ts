import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardsRoutingModule } from './dashboards-routing.module';
import { GoogleDashboardComponent } from './google-dashboard/google-dashboard.component';
import { AwsDashboardComponent } from './aws-dashboard/aws-dashboard.component';
import { VmwareDashboardComponent } from './vmware-dashboard/vmware-dashboard.component';
import { AkamaiDashboardComponent } from './akamai-dashboard/akamai-dashboard.component';

import { CoreModule } from '../core/core.module';

@NgModule({
  declarations: [
    GoogleDashboardComponent,
    AwsDashboardComponent,
    VmwareDashboardComponent,
    AkamaiDashboardComponent
  ],
  imports: [
    CommonModule,
    DashboardsRoutingModule,
    CoreModule
  ]
})
export class DashboardsModule { }
