import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostingStorageComponent } from './posting-storage/posting-storage.component';
import { PostingRoutingModule } from './posting-routing.module';
import { CoreModule } from '../core/core.module';
import { PostingListComponent } from './posting-list/posting-list.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { InTableModule } from '@sysage/in-table';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FileRecordComponent } from './file-record/file-record.component';
@NgModule({
  declarations: [
    PostingStorageComponent,
    PostingListComponent,
    FileRecordComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    PostingRoutingModule,
    MatTabsModule,
    MatFormFieldModule,
    BsDatepickerModule,
    InTableModule,
    ModalModule
  ]
})
export class PostingModule { }
