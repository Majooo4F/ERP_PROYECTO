// import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
// import { PermissionService } from '../services/permission.service';

// @Directive({
//   selector: '[ifHasPermission]',
//   standalone: true
// })
// export class HasPermissionDirective implements OnInit {

//   @Input('ifHasPermission') permisos: string | string[] = '';

//   constructor(
//     private permissionSvc: PermissionService,
//     private templateRef: TemplateRef<any>,
//     private viewContainer: ViewContainerRef
//   ) {}

//   ngOnInit() {

//     const permisosArray = Array.isArray(this.permisos)
//       ? this.permisos
//       : [this.permisos];

//     if (this.permissionSvc.hasAnyPermission(permisosArray)) {
//       this.viewContainer.createEmbeddedView(this.templateRef);
//     }

//   }

// }

import { Directive, Input, OnInit, TemplateRef, ViewContainerRef, effect, Injector, runInInjectionContext } from '@angular/core';
import { PermissionService } from '../services/permission.service';

@Directive({
  selector: '[ifHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit {

  @Input('ifHasPermission') permisos: string | string[] = '';

  constructor(
    private permissionSvc: PermissionService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private injector: Injector
  ) {}

  ngOnInit() {
    runInInjectionContext(this.injector, () => {
      effect(() => {
        this.permissionSvc.getPermissions();

        const permisosArray = Array.isArray(this.permisos)
          ? this.permisos
          : [this.permisos];

        this.viewContainer.clear();
        if (this.permissionSvc.hasAnyPermission(permisosArray)) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      });
    });

  }

}
