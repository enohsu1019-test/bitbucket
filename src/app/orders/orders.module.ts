import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersComponent } from './orders.component';
import { DetailComponent } from './detail/detail.component';

import { CoreModule } from '../core/core.module';
import { InTableModule } from '@sysage/in-table';

import {MatExpansionModule} from '@angular/material/expansion';
import { SolutionDetialComponent } from './solution-detial/solution-detial.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTableModule} from '@angular/material/table';
import { OrderProductListComponent } from './solution-detial/order-product-list/order-product-list.component';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { MicrosoftFieldComponent } from './solution-detial/brands/microsoft/microsoft-field/microsoft-field.component';
import { AwsFieldComponent } from './solution-detial/brands/aws/aws-field/aws-field.component';
import { MicrosoftProductComponent } from './solution-detial/brands/microsoft/microsoft-product/microsoft-product.component';
import { AwsProductComponent } from './solution-detial/brands/aws/aws-product/aws-product.component';
import { AkamaiFieldComponent } from './solution-detial/brands/akamai/akamai-field/akamai-field.component';
import { AkamaiProductComponent } from './solution-detial/brands/akamai/akamai-product/akamai-product.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { GoogleFieldComponent } from './solution-detial/brands/google/google-field/google-field.component';
import { GoogleProductComponent } from './solution-detial/brands/google/google-product/google-product.component';
import { CiscoFieldComponent } from './solution-detial/brands/cisco/cisco-field/cisco-field.component';
import { CiscoProductComponent } from './solution-detial/brands/cisco/cisco-product/cisco-product.component';
import { ShareModule } from '../share/share.module';
import { AddOrderProductComponent } from './solution-detial/add-order-product/add-order-product.component';

@NgModule({
  declarations: [
    OrdersComponent,
    DetailComponent,
    SolutionDetialComponent,
    OrderProductListComponent,
    OrderHistoryComponent,
    MicrosoftFieldComponent,
    AwsFieldComponent,
    MicrosoftProductComponent,
    AwsProductComponent,
    AkamaiFieldComponent,
    AkamaiProductComponent,
    GoogleFieldComponent,
    GoogleProductComponent,
    CiscoFieldComponent,
    CiscoProductComponent,
    AddOrderProductComponent
  ],
  imports: [
    CommonModule,
    OrdersRoutingModule,
    CoreModule,
    InTableModule,
    MatExpansionModule,
    BsDatepickerModule,
    BsDropdownModule,
    TypeaheadModule,
    MatTabsModule,
    MatTableModule,
    PopoverModule,
    ModalModule,
    ShareModule,
  ]
})
export class OrdersModule { }
