import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BillsRoutingModule } from './bills-routing.module';
import { BillsComponent } from './bills.component';

import { CoreModule } from '../core/core.module';
import { DetailComponent } from './detail/detail.component';
import { ShareModule } from '../share/share.module';


@NgModule({
  declarations: [
    BillsComponent,
    DetailComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    ShareModule,
    BillsRoutingModule,
  ]
})
export class BillsModule { }
