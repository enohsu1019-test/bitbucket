import { Directive, Input, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appPermissionDisabled]',
})
export class PermissionDisabledDirective implements AfterViewInit {
  @Input() appPermissionDisabled!: string | string[];

  constructor(
    // public permission: PermissionService,
    private elRef: ElementRef,
    private renderer: Renderer2,
  ) { }

  ngAfterViewInit() {
    // const permissionsFlat = this.permission.flat;
    let isDisabled = false;

    // ...

  }
}
