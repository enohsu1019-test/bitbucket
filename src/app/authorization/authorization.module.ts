import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreModule } from '../core/core.module';
import { InTableModule } from '@sysage/in-table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { AuthorizationRoutingModule } from './authorization-routing.module';
import { AuthorizationComponent } from './authorization.component';
import { DetailComponent } from './detail/detail.component';
import { EditModalComponent } from './edit-modal/edit-modal.component';
import { PopoverModule } from 'ngx-bootstrap/popover';

@NgModule({
  declarations: [
    AuthorizationComponent,
    DetailComponent,
    EditModalComponent
  ],
  imports: [
    CommonModule,
    AuthorizationRoutingModule,
    CoreModule,
    InTableModule,

    /** material */
    MatChipsModule,
    MatIconModule,

    /** ngx-bootstrap */
    PopoverModule
  ]
})
export class AuthorizationModule { }
