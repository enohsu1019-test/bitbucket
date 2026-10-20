import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomersRoutingModule } from './customers-routing.module';
import { CustomersComponent } from './customers.component';
import { DetailComponent } from './detail/detail.component';

import { CoreModule } from '../core/core.module';
import { InTableModule } from '@sysage/in-table';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PopoverModule } from 'ngx-bootstrap/popover';


@NgModule({
  declarations: [
    CustomersComponent,
    DetailComponent
  ],
  imports: [
    CommonModule,
    CustomersRoutingModule,
    CoreModule,
    InTableModule,
    TabsModule,
    PopoverModule,
  ]
})
export class CustomersModule { }
