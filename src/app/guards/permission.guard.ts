import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PermissionService } from '../services/permission.service';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const permSvc = inject(PermissionService);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) return true;

  const requiredPermission = route.data['permission'] as string;

  if (!requiredPermission) return true;

  if (!permSvc.hasPermission(requiredPermission)) {
    router.navigate(['/home']);
    return false;
  }

  return true;
};