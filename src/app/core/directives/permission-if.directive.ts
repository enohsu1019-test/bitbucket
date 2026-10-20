import { Directive, TemplateRef, ViewContainerRef, Input } from '@angular/core';
import { PermissionService } from '../services/permission.service';

@Directive({
  selector: '[appPermissionIf]',
})
export class PermissionDirective {

  constructor(
    public permission: PermissionService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
  ) {}

  @Input() set appPermissionIf(permissionItem: string | string[]) {
    const permissionsFlat = this.permission.flat;

    // 有 permissionItem && permissionsFlat
    if (permissionItem && permissionsFlat) {
      // 如果為字串
      if (typeof permissionItem === 'string') {
        if (permissionsFlat[permissionItem]) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
          this.viewContainer.clear();
        }
      } else if (Array.isArray(permissionItem)) { // 如果是陣列
        let isEnabled = true;
        permissionItem.forEach(p => {
          const permission = permissionsFlat[p] ? true : false;
          isEnabled = isEnabled && permission;
        });
        if (isEnabled) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
          this.viewContainer.clear();
        }
      } else {
        this.viewContainer.clear();
      }
    } else {
      this.viewContainer.clear();
    }
  }
}
