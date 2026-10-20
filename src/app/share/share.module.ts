import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InTableModule } from '@sysage/in-table';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BillsDetailComponent } from './components/bills-detail/bills-detail.component';
import { SafePipe } from './pipes/safe.pipe';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { CommodityCartBtnComponent } from './commodity-cart-btn/commodity-cart-btn.component';
import { CommodityShopDetailComponent } from './commodity-shop-detail/commodity-shop-detail.component';
import { CommodityShopPreviewComponent } from './commodity-shop-preview/commodity-shop-preview.component';
import { BillsListComponent } from './components/bills-list/bills-list.component';
import { PopoverModule } from 'ngx-bootstrap/popover';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableComponent } from './components/mat-table/mat-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CustomPaginatorIntl } from './components/custom-paginator';

@NgModule({
  declarations: [
    BillsDetailComponent,
    BillsListComponent,
    SafePipe,
    CommodityCartBtnComponent,
    CommodityShopDetailComponent,
    CommodityShopPreviewComponent,
    MatTableComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    InTableModule,
    FormsModule,
    ReactiveFormsModule,
    PopoverModule,

    /** ngx-bootstrap */
    BsDatepickerModule,
    RouterModule,

    TranslateModule,
    MatCheckboxModule,
    MatTableModule,
    MatSelectModule,
    MatSortModule,
    MatPaginatorModule,
  ],
  exports: [
    BillsDetailComponent,
    BillsListComponent,
    SafePipe,
    CommodityCartBtnComponent,
    CommodityShopDetailComponent,
    CommodityShopPreviewComponent,
    MatTableComponent,
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
export class ShareModule {}
