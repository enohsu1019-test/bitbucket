import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CostAnalysisComponent } from './cost-analysis/cost-analysis.component';
import { TagAnalysisComponent } from './tag-analysis/tag-analysis.component';
import { ProjectSettingComponent } from './project-setting/project-setting.component';
import { CostAnalysisDetailComponent } from './cost-analysis/cost-analysis-detail/cost-analysis-detail.component';
import { TagAnalysisDetailComponent } from './tag-analysis/tag-analysis-detail/tag-analysis-detail.component';

const routes: Routes = [
    { path: '', redirectTo: 'cost', pathMatch: 'full' },
    {
      path: 'cost',
      data: { breadcrumb: 'analysis cost' },
      children: [
        { path: '', component: CostAnalysisComponent },
        { path: ':clouId',
          data: { breadcrumb: '::'},
          children: [
            { path: '', component: CostAnalysisDetailComponent },
          ]
        }
      ]
    },
    {
      path: 'tag',
      data: { breadcrumb: 'analysis tag' },
      children: [
        { path: '', component: TagAnalysisComponent },
        { path: ':clouId',
          data: { breadcrumb: '::'},
          children: [
            { path: '', component: TagAnalysisDetailComponent },
          ]
        }
      ]
    },
    { path: 'setting', data: { breadcrumb: 'analysis setting' }, component: ProjectSettingComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CostAnalysisRoutingModule { }
