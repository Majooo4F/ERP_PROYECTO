// import { Injectable, signal } from '@angular/core';

// @Injectable({
//   providedIn: 'root',
// })
// export class PermissionService {

//   private userPermissions = signal<string[]>([]);

//   setPermissions(perms: string[]) {
//     this.userPermissions.set(perms);
//   }

//   hasPermission(permission: string): boolean {
//     return this.userPermissions().includes(permission);
//   }

//   hasAnyPermission(perms: string[]): boolean {
//     return perms.some(p => this.hasPermission(p));
//   }

// }
import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private userPermissions = signal<string[]>([]);


  constructor() {

    if (this.isBrowser) {

      const storedPerms = localStorage.getItem('permissions');

      // 🔥 VALIDACIÓN CORRECTA
      if (storedPerms && storedPerms !== 'undefined') {
        try {
          this.userPermissions.set(JSON.parse(storedPerms));
        } catch (error) {
          console.error('Error parsing permissions:', error);
          localStorage.removeItem('permissions');
        }
      }

    }

  }

  setPermissions(perms: string[]) {
    this.userPermissions.set(perms);

    if (this.isBrowser) {
      localStorage.setItem('permissions', JSON.stringify(perms));
    }
  }

  getPermissions(): string[] {
    return this.userPermissions();
  }

  hasPermission(permission: string): boolean {
    return this.userPermissions().includes(permission);
  }

  hasAnyPermission(perms: string[]): boolean {
    return perms.some(p => this.hasPermission(p));
  }

  clearPermissions() {
    this.userPermissions.set([]);

    if (this.isBrowser) {
      localStorage.removeItem('permissions');
    }
  }

}