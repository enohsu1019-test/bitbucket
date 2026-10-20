import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

import { CommodityRoutingModule } from './commodity-routing.module';
import { CommodityComponent } from './commodity.component';

import { CoreModule } from '../core/core.module';
import { DetailComponent } from './detail/detail.component';
import { InTableModule } from '@sysage/in-table';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { EmailEditorModule } from 'angular-email-editor';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { AutocompleteDropdownListComponent } from './autocomplete-dropdown-list/autocomplete-dropdown-list.component';
import { ShareModule } from '../share/share.module';


@NgModule({
  declarations: [
    CommodityComponent,
    DetailComponent,
    AutocompleteDropdownListComponent
  ],
  imports: [
    CommonModule,
    CommodityRoutingModule,
    CoreModule,
    InTableModule,
    ShareModule,

    /** editor: unlayer */
    EmailEditorModule,

    /** ngx-bootstrap */
    PopoverModule,
    BsDatepickerModule,

    /** material */
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatAutocompleteModule,
    MatInputModule
  ],
  providers: [DecimalPipe]
})
export class CommodityModule { }
