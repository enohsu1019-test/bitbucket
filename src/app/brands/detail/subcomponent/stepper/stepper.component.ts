import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { CdkStepper } from '@angular/cdk/stepper';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  providers: [{ provide: CdkStepper, useExisting: StepperComponent }]
})
export class StepperComponent extends CdkStepper {
  @Input() title!: string;
  @Input() isLoading = false;
  @Input() attributeForm!: FormGroup;
  @Output() stepChangeEvent = new EventEmitter<number>();
  @Output() submitEvent = new EventEmitter;

  get stepArray() {
    return this.steps.toArray();
  }

  constructor(
    dir: Directionality,
    changeDetectorRef: ChangeDetectorRef,
    elementRef: ElementRef,
    public bsModalRef: BsModalRef,
    private modalService: BsModalService,
  ) {
    super(dir, changeDetectorRef, elementRef, null);
  }

  onStepChanged() {
    this.stepChangeEvent.emit(this.selectedIndex);
  }

  /** 關閉屬性編輯跳窗 */
  closeBsModal() {
    this.modalService.hide();
  }

  /** 完成送出 */
  submitData() {
    this.submitEvent.emit();
  }

}
