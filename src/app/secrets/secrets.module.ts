import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InTableModule } from '@sysage/in-table';
import { CoreModule } from '../core/core.module';
import { SecretsRoutingModule } from './secrets-routing.module';
import { SecretsComponent } from './secrets.component';
import { SolutionListComponent } from './solution-list/solution-list.component';
import { SolutionDetailComponent } from './solution-detail/solution-detail.component';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';
import {MatTreeModule} from '@angular/material/tree';


@NgModule({
  declarations: [
    SecretsComponent,
    SolutionListComponent,
    SolutionDetailComponent
  ],
  imports: [
    CommonModule,
    SecretsRoutingModule,
    InTableModule,
    CoreModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatTreeModule,
  ]
})
export class SecretsModule { }
