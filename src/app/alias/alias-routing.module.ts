import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailComponent } from './detail/detail.component';


const routes: Routes = [
  { path: '', component: DetailComponent},
  // { path: 'list', component: DetailComponent, data: { breadcrumb: 'All Brands' } },
  // { path: '', redirectTo: 'list', pathMatch: 'full' },
];


@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AliasRoutingModule { }
