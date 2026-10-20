import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdLoginFailComponent } from './ad-login-fail/ad-login-fail.component';
import { AdLoginComponent } from './ad-login/ad-login.component';
import { ChangeRoleComponent } from './change-role/change-role.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';


const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'adLogin',
    component: AdLoginComponent,
  },
  {
    path: 'adLoginFail',
    component: AdLoginFailComponent,
  },
  {
    path: 'changeRole/:roleId',
    component: ChangeRoleComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes,
    {
      enableTracing: false,
      relativeLinkResolution: 'corrected'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
