import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { defineLocale } from 'ngx-bootstrap/chronos';
import { zhCnLocale } from 'ngx-bootstrap/locale';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { CoreModule } from './core/core.module';
import { MainModule } from './main/main.module';

import { EnvironmentService } from './core/services/environment.service';
import { HttpErrorInterceptorProvider } from './core/services/404.interceptor';

import { AdLoginComponent } from './ad-login/ad-login.component';
import { AdLoginFailComponent } from './ad-login-fail/ad-login-fail.component';
import { ChangeRoleComponent } from './change-role/change-role.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';

import { AlertModule } from 'ngx-bootstrap/alert';
import { interceptorProviders } from './core/interceptors';

if (zhCnLocale.week) {
  zhCnLocale.week.dow = 0;
}
defineLocale('zh-tw', zhCnLocale);

// AoT requires an exported function for factories
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '../assets/i18n/', '.json');
}

export function initConfigMap(environmentService: EnvironmentService) {
  return () => environmentService.init();
}

@NgModule({
  declarations: [
    AppComponent,
    AdLoginComponent,
    AdLoginFailComponent,
    ChangeRoleComponent,
    ForgotPasswordComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MainModule,
    CoreModule,
    // translate module 必須在 root 進行 config (然後在 core module import/export 讓 lazy-loading module 可以使用)
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    AlertModule.forRoot()
  ],
  providers: [
    interceptorProviders,
    HttpErrorInterceptorProvider,
    EnvironmentService,
    {
      provide: APP_INITIALIZER,
      useFactory: initConfigMap,
      deps: [EnvironmentService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
