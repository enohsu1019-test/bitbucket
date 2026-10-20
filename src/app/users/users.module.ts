import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users.component';

import { CoreModule } from '../core/core.module';
import { DetailComponent } from './detail/detail.component';
import { InTableModule } from '@sysage/in-table';
import { MatChipsModule } from '@angular/material/chips';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { UsersRoleDetailComponent } from './users-role-detail/users-role-detail.component';


@NgModule({
  declarations: [
    UsersComponent,
    DetailComponent,
    UsersRoleDetailComponent
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    CoreModule,
    InTableModule,

    /** material */
    MatChipsModule,

    /** ngx-bootstrap */
    PopoverModule
  ]
})
export class UsersModule { }
