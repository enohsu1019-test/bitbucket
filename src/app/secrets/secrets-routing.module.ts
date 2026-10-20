import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecretsComponent } from './secrets.component';
import { SolutionDetailComponent } from './solution-detail/solution-detail.component';
import {SolutionListComponent} from './solution-list/solution-list.component'

const routes: Routes = [
  { path: '', component: SecretsComponent },
  { path: ':solution', data: { breadcrumb: 'all solutions' }, children: [
      { path: '', component: SolutionListComponent },
      { path: ':edit', component: SolutionDetailComponent, data: { breadcrumb: 'edit solution' } },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecretsRoutingModule { }
