import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { InNumberPipe } from './pipes/in-number.pipe';
import { MatchFilterPipe } from './pipes/match-filter.pipe';
import { TrimExtensionPipe } from './pipes/trim-extension.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { MinDateValidator } from './directives/min-date.directive';
import { MinDirective, MaxDirective } from './directives/min-max.directive';
import { NumericDirective } from './directives/numeric.directive';
import { PermissionDisabledDirective } from './directives/permission-disabled.directive';
import { PermissionDirective } from './directives/permission-if.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmModalContentComponent } from './services/modal.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

@NgModule({
  declarations: [
    InNumberPipe,
    MatchFilterPipe,
    TrimExtensionPipe,
    TruncatePipe,
    AutoFocusDirective,
    MinDateValidator,
    MinDirective,
    MaxDirective,
    NumericDirective,
    PermissionDisabledDirective,
    PermissionDirective,
    ConfirmModalContentComponent
  ],
  imports: [
    CommonModule,

    FormsModule,
    ReactiveFormsModule,

    TranslateModule.forChild(),
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    AngularMultiSelectModule,
    TypeaheadModule.forRoot(),
  ],
  entryComponents: [ConfirmModalContentComponent],
  exports: [
    FormsModule,
    ReactiveFormsModule,

    TranslateModule,
    BsDropdownModule,

    InNumberPipe,
    MatchFilterPipe,
    TrimExtensionPipe,
    TruncatePipe,
    AutoFocusDirective,
    MinDateValidator,
    MinDirective,
    MaxDirective,
    NumericDirective,
    PermissionDisabledDirective,
    PermissionDirective,
    TabsModule,
    AngularMultiSelectModule,
    TypeaheadModule
  ]
})
export class CoreModule { }
