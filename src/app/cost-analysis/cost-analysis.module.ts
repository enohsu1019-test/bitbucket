import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CostAnalysisRoutingModule } from './cost-analysis-routing.module';
import { CoreModule } from '../core/core.module';
import { CostAnalysisComponent } from './cost-analysis/cost-analysis.component';
import { CostAnalysisDetailComponent } from './cost-analysis/cost-analysis-detail/cost-analysis-detail.component';
import { TagAnalysisComponent } from './tag-analysis/tag-analysis.component';
import { TagAnalysisDetailComponent } from './tag-analysis/tag-analysis-detail/tag-analysis-detail.component';
import { ProjectSettingComponent } from './project-setting/project-setting.component';
import { AnalysisChartComponent } from './analysis-chart/analysis-chart.component';
import { NgChartsModule } from 'ng2-charts';

import { PaginationModule } from 'ngx-bootstrap/pagination';
import { InTableModule } from '@sysage/in-table';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';


@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    CostAnalysisRoutingModule,
    NgChartsModule,
    InTableModule,
    BsDatepickerModule,
    PaginationModule.forRoot()
  ],
  declarations: [
    CostAnalysisComponent,
    CostAnalysisDetailComponent,
    TagAnalysisComponent,
    TagAnalysisDetailComponent,
    ProjectSettingComponent,
    AnalysisChartComponent
  ],
  exports: [
    AnalysisChartComponent
  ],
})
export class CostAnalysisModule { }
