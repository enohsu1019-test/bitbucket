import { Directive, Input, forwardRef, SimpleChanges, OnChanges, OnInit } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';


@Directive({
  selector: '[appMinCheck][formControlName],[appMinCheck][formControl],[appMinCheck][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MinDirective),
      multi: true
    }
  ]
})
export class MinDirective implements Validator, OnInit, OnChanges {
  @Input() minCheck: any;

  private validator!: ValidatorFn;
  private onChange!: () => void;

  ngOnInit() {
    this.validator = Validators.min(this.minCheck);
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const key in changes) {
      if (key === 'minCheck') {
        this.validator = Validators.min(changes[key].currentValue);
        if (this.onChange) { this.onChange(); }
      }
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.validator(control);
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onChange = fn;
  }
}

@Directive({
  selector: '[appMaxCheck][formControlName],[appMaxCheck][formControl],[appMaxCheck][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MaxDirective),
      multi: true
    }
  ]
})
export class MaxDirective implements Validator, OnInit, OnChanges {
  @Input() maxCheck: any;

  private validator!: ValidatorFn;
  private onChange!: () => void;

  ngOnInit() {
    this.validator = Validators.max(this.maxCheck);
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const key in changes) {
      if (key === 'maxCheck') {
        this.validator = Validators.min(changes[key].currentValue);
        if (this.onChange) { this.onChange(); }
      }
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.validator(control);
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onChange = fn;
  }
}
