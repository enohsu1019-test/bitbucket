import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { SavingInfoRoutingModule } from './saving-info-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';
import { RiReportComponent } from './ri-report/ri-report.component';
import { SizeSuggestComponent } from './size-suggest/size-suggest.component';
import { SavingPlanComponent } from './saving-plan/saving-plan.component';
import { InTableModule } from '@sysage/in-table';
import { PopoverModule } from 'ngx-bootstrap/popover';



@NgModule({
  declarations: [
    RiReportComponent,
    SizeSuggestComponent,
    SavingPlanComponent,
  ],
  imports: [
    CommonModule,
    SavingInfoRoutingModule,
    ReactiveFormsModule,
    CoreModule,
    InTableModule,
    PopoverModule,
  ],
  providers: [DecimalPipe]
})
export class SavingInfoModule {}
