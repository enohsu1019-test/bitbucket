import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderComponent } from './order/order.component';
import { UsagesComponent } from './usages/usages.component';
import { CoreModule } from '../core/core.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServiceAmoutTableComponent} from './service-amout-table/service-amout-table.component';
import { NgChartsModule } from 'ng2-charts';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

import { MatTableModule } from '@angular/material/table';
import { FutureForecastUsageComponent } from './future-forecast-usage/future-forecast-usage.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { DashboardComponent } from './dashboard.component';
import { DashboardsRoutingModule } from './dashboard-routing.module';

// import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({

  declarations: [
    OrderComponent,
    UsagesComponent,
    ServiceAmoutTableComponent,
    FutureForecastUsageComponent,
    DashboardComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    PaginationModule,
    NgChartsModule,
    TypeaheadModule,
    MatTableModule,
    ReactiveFormsModule,
    // NgSelectModule,
    BsDatepickerModule,
    PopoverModule,
    DashboardsRoutingModule
  ],
  exports: [
    MatTableModule,
    OrderComponent,
    UsagesComponent,
    ServiceAmoutTableComponent,
    FutureForecastUsageComponent,
  ],
})
export class DashboardChartModule { }
