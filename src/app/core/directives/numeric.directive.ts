import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appNumeric]'
})
export class NumericDirective {

  @Input() decimals = 0;

  private specialKeys = [
    'Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'
  ];

  private check(value: string, decimals: number) {
    if (decimals <= 0) {
      return String(value).match(new RegExp(/^\d+$/));
    } else {
      const regExpString = `^\\s*((\\d+(\\.\\d{0,${decimals}})?)|((\\d*(\\.\\d{1,${decimals}}))))\\s*$`;
      return String(value).match(new RegExp(regExpString));
    }
  }

  constructor(private el: ElementRef) {
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    // Do not use event.keycode this is deprecated.
    // See: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
    const current: string = this.el.nativeElement.value;
    const position: number = this.el.nativeElement.selectionStart;
    const next: string = [current.slice(0, position), event.key, current.slice(position)].join('');
    if (next && !this.check(next, this.decimals)) {
      event.preventDefault();
    }
  }
}
