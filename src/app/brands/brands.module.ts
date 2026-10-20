import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrandsRoutingModule } from './brands-routing.module';
import { BrandsComponent } from './brands.component';

import { CoreModule } from '../core/core.module';
import { DetailComponent } from './detail/detail.component';
import { InTableModule } from '@sysage/in-table';

import {MatTabsModule} from '@angular/material/tabs';
import { BrandsFieldManagementComponent } from './brands-field-management/brands-field-management.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import { BrandConditionComponent } from './brand-condition/brand-condition.component';
import {MatDialogModule} from '@angular/material/dialog';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { BrandsPayerIdComponent } from './detail/subcomponent/payerId/brands-payer-id/brands-payer-id.component';
import { SolutionListComponent } from './detail/subcomponent/solution/solution-list/solution-list.component';
import { BrandSolutionDetailComponent } from './detail/subcomponent/solution/brand-solution-detail/brand-solution-detail.component';
import { BrandPriceBookComponent } from './brand-price-book/brand-price-book.component';
import { UploadScriptComponent } from './detail/subcomponent/solution/upload-script/upload-script.component';
import { PayerIdSetKeyComponent } from './detail/subcomponent/payerId/payer-id-set-key/payer-id-set-key.component';
import { DealerProductsComponent } from './detail/subcomponent/dealer-products/dealer-products.component';
import { classificationComponent } from './detail/subcomponent/classification/classification.component';
import { AttributeComponent } from './detail/subcomponent/attribute/attribute.component';
import { StepperComponent } from './detail/subcomponent/stepper/stepper.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { DragDropModule } from '@angular/cdk/drag-drop';
@NgModule({
  declarations: [
    BrandsComponent,
    DetailComponent,
    BrandsFieldManagementComponent,
    BrandConditionComponent,
    BrandPriceBookComponent,
    BrandsPayerIdComponent,
    SolutionListComponent,
    BrandSolutionDetailComponent,
    classificationComponent,

    UploadScriptComponent,
     PayerIdSetKeyComponent,
     DealerProductsComponent,
    AttributeComponent,
    StepperComponent,
  ],
  imports: [
    CommonModule,
    BrandsRoutingModule,
    CoreModule,
    InTableModule,
    PopoverModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    CdkStepperModule,
    DragDropModule,
  ]
})
export class BrandsModule { }
