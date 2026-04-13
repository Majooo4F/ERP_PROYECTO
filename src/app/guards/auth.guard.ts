import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

const checkAuth = (): boolean => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) return true;

  const token = localStorage.getItem('token');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      localStorage.clear();
      router.navigate(['/login']);
      return false;
    }
  } catch {
    localStorage.clear();
    router.navigate(['/login']);
    return false;
  }

  return true;
};

export const authGuard: CanActivateFn = () => checkAuth();
export const authGuardChild: CanActivateChildFn = () => checkAuth();