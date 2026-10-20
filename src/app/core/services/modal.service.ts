import { Injectable, Component, EventEmitter, Output } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TranslateService } from '@ngx-translate/core';

/* This is a component which we pass in modal*/
@Component({
  selector: 'app-confirm-modal-content',
  template: `
    <div class="modal-body text-center p-4">
      <i class="fas fa-lg {{cssIcon}} mt-3 mb-4" style="font-size: 2.5em;"></i>
      <div style="font-size:1.25rem;" class="mb-4" [innerHTML]="message"></div>
      <button type="button"
              class="btn btn-light btn-lg mx-2"
              *ngIf="ui.isShowBtnYes"
              [disabled]="(ui.isShowInput ? (!inputText) : false)"
              (click)="confirm()" >{{ 'yes' | translate | titlecase }}</button>
      <button type="button"
              class="btn btn-primary btn-lg mx-2"
              *ngIf="ui.isShowBtnNo"
              (click)="decline()" >{{ 'no' | translate | titlecase }}</button>
    </div>
  `
})
export class ConfirmModalContentComponent  {
  @Output() action = new EventEmitter();
  message!: string;
  inputText!: string;
  ui = {
    isShowBtnYes: false,
    isShowBtnNo: false,
    isShowInput: false,
  };
  cssIcon = 'fa-exclamation-triangle text-warning';

  constructor(public bsModalRef: BsModalRef) { }

  confirm(): void {
    this.action.emit({
      isConfirmed: true,
      inputText: this.inputText
    });
    this.bsModalRef.hide();
  }

  decline(): void {
    this.action.emit({
      isConfirmed: false
    });
    this.bsModalRef.hide();
  }
}

@Injectable({
  providedIn: 'root'
})
export class EpicModalService {

  bsModalRef!: BsModalRef;
  constructor(private _modalService: BsModalService,
              private _translate: TranslateService) { }

  confirm(message: string| string[],
          confirmToDo?: (inputText?: string) => void,
          declineToDo?: () => void,
          isShowInput = false,
          defaultInput = '') {
    this.bsModalRef = this._modalService.show(ConfirmModalContentComponent,
      {
        class: 'modal-lg modal-dialog-centered',
        backdrop: 'static',
        keyboard: false
      });
    setTimeout(() => {
      let combinedMessage: string | undefined;
      if (Array.isArray(message)) {
        const arr: string[] = message;
        arr.forEach(msg => {
          if (msg !== '') {
            if (combinedMessage === undefined) {
              combinedMessage = msg;
            } else {
              combinedMessage = `${combinedMessage}<br>${msg}`;
            }
          }
        });
      } else {
        combinedMessage = message;
      }
      this.bsModalRef.content.message = combinedMessage || this._translate.instant('Do you want to confirm?');
      this.bsModalRef.content.ui = {
        isShowBtnYes: confirmToDo,
        isShowBtnNo: declineToDo,
        isShowInput: isShowInput,
      };

      if (isShowInput) {
        this.bsModalRef.content.cssIcon = 'fa-info-circle text-info';
        this.bsModalRef.content.inputText = defaultInput;
      }
    }, 50);


    this.bsModalRef.content.action.subscribe((result: any) => {
      console.log('[utils] confirm > action callback', result);

      if (result.isConfirmed) {
        if (confirmToDo) {
          confirmToDo(result.inputText);
        }
      } else {
        if (declineToDo) {
          declineToDo();
        }
      }
    });
  }

  system(message: string, dismissible: boolean) {
    const modalRef = this._modalService.show(ConfirmModalContentComponent, {
      class: 'modal-sm',
      backdrop: true,
      ignoreBackdropClick: true
    });

    if (modalRef.content) {
      modalRef.content.message = message;
      modalRef.content.ui = {
        isShowBtnYes: dismissible,
        isShowBtnNo: dismissible,
        isShowInput: false,
      };
      modalRef.content.cssIcon = 'fa-spin fa-refresh text-information';
    }
    return modalRef;
  }
}

