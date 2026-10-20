import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RegisterComponent } from '../register/register.component';
import { RegisterListComponent} from '../register-list/register-list.component';

import { CoreModule } from '../core/core.module';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { DashboardChartModule } from '../dashboard-chart/dashboard-chart.module';
import { ShareModule} from '../share/share.module';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CustomPaginatorIntl } from '../share/components/custom-paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    MainComponent,
    HeaderComponent,
    HomeComponent,
    SidebarComponent,
    BreadcrumbComponent,
    RegisterComponent,
    RegisterListComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    BrowserAnimationsModule,
    CoreModule,
    AngularMultiSelectModule,
    DashboardChartModule,
    TranslateModule,
    MatFormFieldModule,
    MatTabsModule,
    MatInputModule,
    DragDropModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    ShareModule
  ],
  providers: [
    {
      provide: MatPaginatorIntl,
      useFactory: (translate: any) => {
        const service = new CustomPaginatorIntl();
        service.injectTranslateService(translate);
        return service;
      },
      deps: [TranslateService],
    },
  ],
})
export class MainModule { }
