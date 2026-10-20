import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrandSolutionDetailComponent } from './detail/subcomponent/solution/brand-solution-detail/brand-solution-detail.component';
import { BrandsComponent } from './brands.component';
import { DetailComponent } from './detail/detail.component';
import { PayerIdSetKeyComponent } from './detail/subcomponent/payerId/payer-id-set-key/payer-id-set-key.component';

const routes: Routes = [
  {
    path: '',
    component: BrandsComponent
  },
  {
    path: 'add',
    data: { breadcrumb: 'add brand' },
    component: DetailComponent
  },
  {
    path: ':brand',
    children: [
      {
        path: ':brand1', data: { breadcrumb: '::' }, children: [
          { path: '', component: DetailComponent },
          {
            path: 'payer',  children: [
              { path: ':id', component: PayerIdSetKeyComponent,  data: { breadcrumb: '::' } },
            ]
          },
          {
            path: 'solution',  children: [
              { path: '', component: BrandSolutionDetailComponent },
              { path: ':edit', component: BrandSolutionDetailComponent,  data: { breadcrumb: 'edit solution' } },
            ]
          },
        ]
      },
      // {
      //   path: ':solution', data: { breadcrumb: '::' }, children: [
      //     { path: '', component: BrandSolutionDetailComponent },
      //     { path: ':edit', component: BrandSolutionDetailComponent, data: { breadcrumb: 'edit solution' } },
      //   ]
      // },



    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BrandsRoutingModule { }
