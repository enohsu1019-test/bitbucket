import { Directive, Input, forwardRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { NG_VALIDATORS, Validator, ValidatorFn, AbstractControl } from '@angular/forms';

const MIN_DATE_VALIDATOR: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MinDateValidator),
  multi: true
};

export function isPresent(obj: any): boolean {
  return obj !== undefined && obj !== null;
}

export function isDate(obj: any): boolean {
  return !/Invalid|NaN/.test(new Date(obj).toString());
}

@Directive({
  selector: '[appMinDateCheck][formControlName], [appMinDateCheck][formControl], [appMinDateCheck][ngModel]',
  providers: [MIN_DATE_VALIDATOR]
})
export class MinDateValidator implements Validator, OnInit, OnChanges {
  @Input() minDateCheck: any;

  private validator!: ValidatorFn;
  private onChange!: () => void;

  ngOnInit() {
    this.validator = this.minDateValidator(this.minDateCheck);
  }

  minDateValidator(minDate: any): ValidatorFn {

    if (!isDate(minDate) && !(minDate instanceof Function)) {
      throw Error('minDate value must be or return a formatted date');
    }

    return (control: AbstractControl): { [key: string]: any } | null => {
      const d: Date = new Date(control.value);

      if (!isDate(d)) { return { minDate: true }; }
      if (minDate instanceof Function) { minDate = minDate(); }

      return d >= new Date(minDate) ? null : { minDate: true };
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const key in changes) {
      if (key === 'minDateCheck') {
        this.validator = this.minDateValidator(changes[key].currentValue);
        if (this.onChange) { this.onChange(); }
      }
    }
  }

  validate(c: AbstractControl): { [key: string]: any } | null {
    return this.validator(c);
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onChange = fn;
  }
}
