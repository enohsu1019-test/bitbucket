import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthGuard } from '../core/guards/auth.guard';
import { LoginComponent } from '../login/login.component';
import { HomeComponent } from './home/home.component';
import { MainComponent } from './main.component';
import { RegisterComponent } from '../register/register.component';

const routes: Routes = [
  {
    // path: 'main',
    path: 'main',
    component: MainComponent,
    // data: { breadcrumb: 'CMP' },
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'commodity-shop',
        pathMatch: 'full'
      },
      // {
      //   path: 'login',
      //   data: { breadcrumb: 'login' },
      //   component: LoginComponent
      // },
      {
        path: 'home',
        data: { breadcrumb: 'home' },
        canActivate: [AuthGuard],
        component: HomeComponent
      },
      {
        path: 'dashboards',
        data: { breadcrumb: 'dashboards' },
        canActivate: [AuthGuard],
        loadChildren: () => import('../dashboard-chart/dashboard-chart.module').then(m => m.DashboardChartModule)
      },
      // {
      //   path: 'authorization',
      //   data: { breadcrumb: 'authorization' },
      //   loadChildren: () => import('../authorization/authorization.module').then(m => m.AuthorizationModule)
      // },
      // {
      //   path: 'users',
      //   data: { breadcrumb: 'users' },
      //   loadChildren: () => import('../users/users.module').then(m => m.UsersModule)
      // },
      {
        path: 'customers',
        data: { breadcrumb: 'customers' },
        canActivate: [AuthGuard],
        loadChildren: () => import('../customers/customers.module').then(m => m.CustomersModule)
      },
      {
        path: 'orders',
        data: { breadcrumb: 'orders' },
        canActivate: [AuthGuard],
        loadChildren: () => import('../orders/orders.module').then(m => m.OrdersModule)
      },
      {
        path: 'brands',
        data: { breadcrumb: 'brands' },
        canActivate: [AuthGuard],
        loadChildren: () => import('../brands/brands.module').then(m => m.BrandsModule)
      },
      {
        path: 'commodity',
        data: { breadcrumb: 'commodity management' },
        loadChildren: () => import('../commodity/commodity.module').then(m => m.CommodityModule)
      },
      {
        path: 'commodity-shop',
        data: { breadcrumb: 'commodity' },
        loadChildren: () => import('../commodity-shop/commodity-shop.module').then(m => m.CommodityShopModule)
      },
      {
        path: 'bills',
        data: { breadcrumb: 'bills' },
        canActivate: [AuthGuard],
        loadChildren: () => import('../bills/bills.module').then(m => m.BillsModule)
      },
      {
        path: 'posting',
        data: { breadcrumb: 'posting' },
        loadChildren: () => import('../posting/posting.module').then(m => m.PostingModule)
      },
      {
        path: 'system',
        data: { breadcrumb: 'system' },
        canActivate: [AuthGuard],
        loadChildren: () => import('../system/system.module').then(m => m.SystemModule)
      },
      {
        path: 'savingInfo',
        data: { breadcrumb: 'savingInfo' },
        canActivate: [AuthGuard],
        loadChildren: () => import('../saving-info/saving-info.module').then(m => m.SavingInfoModule)
      },
      {
        path: 'analysis',
        data: { breadcrumb: 'analysis' },
        canActivate: [AuthGuard],
        loadChildren: () => import('../cost-analysis/cost-analysis.module').then(m => m.CostAnalysisModule)
      },
      {
        path: environment.production ? 'secrets/faad833e-c174-4c32-a4d0-3d975b45f0e4' : 'secrets',
        data: { breadcrumb: 'secrets' },
        canActivate: [AuthGuard],
        loadChildren: () => import('../secrets/secrets.module').then(m => m.SecretsModule)
      },
      {
        path: 'register',
        component: RegisterComponent
      },

      // 無法匹配時，直接轉回 main
      { path: '**', redirectTo: 'home', pathMatch: 'full' },
    ]

  },


  // 第一層無法匹配時，直接轉回 main（例如：/unknown)
  { path: '**', redirectTo: 'main', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
