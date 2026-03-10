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

import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {

  private userPermissions = signal<string[]>([]);

  setPermissions(perms: string[]) {
    this.userPermissions.set(perms);
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
  }

}