import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailComponent } from './detail/detail.component';
import { AliasRoutingModule } from './alias-routing.module';
import { CoreModule } from '../core/core.module';
// import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InTableModule } from '@sysage/in-table';
@NgModule({
  declarations: [
    DetailComponent
  ],
  imports: [
    CommonModule,
    AliasRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    // NgSelectModule
    InTableModule,
  ]
})
export class AliasModule { }
