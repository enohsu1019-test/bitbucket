import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RiReportComponent } from './ri-report/ri-report.component';
import { SizeSuggestComponent } from './size-suggest/size-suggest.component';
import { SavingPlanComponent } from './saving-plan/saving-plan.component';

const routes: Routes = [
  { path: '', redirectTo: 'riReport', pathMatch: 'full' },
  { path: 'riReport', data: { breadcrumb: 'ri report' }, component: RiReportComponent},
  { path: 'sizeSuggest', data: { breadcrumb: 'size suggest' }, component: SizeSuggestComponent},
  { path: 'savingPlan', data: { breadcrumb: 'savingPlan' }, component: SavingPlanComponent},
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SavingInfoRoutingModule { }
