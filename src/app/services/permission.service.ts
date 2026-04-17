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
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {

  private platformId = inject(PLATFORM_ID);
  private isBrowser  = isPlatformBrowser(this.platformId);
  private http       = inject(HttpClient);

  private readonly API_URL = 'http://localhost:3000';

  private userPermissions = signal<string[]>([]);

  /** ID del grupo activo. Permite validar permisos en contexto de grupo. */
  private currentGroupId = signal<number | null>(null);

  constructor() {
    if (this.isBrowser) {
      const storedPerms = localStorage.getItem('permissions');
      if (storedPerms && storedPerms !== 'undefined') {
        try {
          this.userPermissions.set(JSON.parse(storedPerms));
        } catch (error) {
          console.error('Error parsing permissions:', error);
          localStorage.removeItem('permissions');
        }
      }

      const storedGroup = localStorage.getItem('groupContext');
      if (storedGroup && storedGroup !== 'undefined') {
        try {
          this.currentGroupId.set(JSON.parse(storedGroup));
        } catch {
          localStorage.removeItem('groupContext');
        }
      }
    }
  }

  // ── Permisos ────────────────────────────────────────────────────────────────

  private readonly permissionAliases: Record<string, string[]> = {
    'ticket:ver': ['ticket:view'],
    'ticket:view': ['ticket:ver'],
    'ticket:agregar': ['ticket:add'],
    'ticket:add': ['ticket:agregar'],
    'ticket:editar': ['ticket:edit'],
    'ticket:edit': ['ticket:editar'],
    'ticket:eliminar': ['ticket:delete'],
    'ticket:delete': ['ticket:eliminar'],
    'ticket:mover': ['ticket:move', 'tickets:move'],
    'ticket:move': ['ticket:mover'],
    'tickets:move': ['ticket:mover'],
    'grupo:ver': ['group:view'],
    'group:view': ['grupo:ver'],
    'grupo:agregar': ['group:add'],
    'group:add': ['grupo:agregar'],
    'grupo:editar': ['group:edit'],
    'group:edit': ['grupo:editar'],
    'grupo:eliminar': ['group:delete'],
    'group:delete': ['grupo:eliminar'],
    'grupo:admin': ['group:manage'],
    'group:manage': ['grupo:admin'],
    'usuario:ver': ['user:view'],
    'user:view': ['usuario:ver'],
    'usuario:agregar': ['user:add'],
    'user:add': ['usuario:agregar'],
    'usuario:editar': ['user:edit'],
    'user:edit': ['usuario:editar'],
    'usuario:eliminar': ['user:delete'],
    'user:delete': ['usuario:eliminar'],
    'usuario:admin': ['user:manage'],
    'user:manage': ['usuario:admin']
  };

  private expandPermissions(perms: string[]): string[] {
    const set = new Set<string>();
    for (const p of perms ?? []) {
      if (!p) continue;
      set.add(p);
      const aliases = this.permissionAliases[p] ?? [];
      for (const a of aliases) set.add(a);
    }
    return Array.from(set);
  }

  setPermissions(perms: string[]) {
    const expanded = this.expandPermissions(perms ?? []);
    this.userPermissions.set(expanded);
    if (this.isBrowser) {
      localStorage.setItem('permissions', JSON.stringify(expanded));
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
    this.currentGroupId.set(null);
    if (this.isBrowser) {
      localStorage.removeItem('permissions');
      localStorage.removeItem('groupContext');
    }
  }

  // ── Contexto de grupo ───────────────────────────────────────────────────────

  /**
   * Cambia al grupo activo y recarga los permisos del usuario para ESE grupo.
   * Llama a GET /groups/:grupoId/permisos/usuario/:usuarioId
   * y reemplaza completamente los permisos actuales (evita fuga de permisos).
   */
  async loadPermissionsForGroup(grupoId: number): Promise<void> {
    const token   = this.isBrowser ? localStorage.getItem('token') : null;
    const usuario = this.isBrowser ? JSON.parse(localStorage.getItem('usuario') ?? '{}') : {};

    if (!token || !usuario?.id) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    try {
      const res: any = await firstValueFrom(
        this.http.get(`${this.API_URL}/groups/${grupoId}/permisos/usuario/${usuario.id}`, { headers })
      );

      // El backend devuelve  { data: [{ permisos: { nombre } }] }
      const nombres: string[] = (res?.data ?? [])
        .map((row: any) => row?.permisos?.nombre)
        .filter(Boolean);

      // ✅ Reemplaza permisos — elimina cualquier fuga del grupo anterior
      this.setPermissions(nombres);
      this.setGroupContext(grupoId);

    } catch (err) {
      console.error('[PermissionService] Error cargando permisos del grupo:', err);
    }
  }

  /**
   * Establece solo el ID de grupo activo (sin recargar permisos desde la API).
   * Usar solo cuando los permisos ya fueron cargados por otro medio.
   */
  setGroupContext(groupId: number | null) {
    this.currentGroupId.set(groupId);
    if (this.isBrowser) {
      if (groupId !== null) {
        localStorage.setItem('groupContext', JSON.stringify(groupId));
      } else {
        localStorage.removeItem('groupContext');
      }
    }
  }

  /** Retorna el ID del grupo actualmente seleccionado. */
  getGroupId(): number | null {
    return this.currentGroupId();
  }

  /**
   * Verifica un permiso asegurándose de que hay un grupo activo.
   * Útil para acciones que requieren contexto de grupo explícito.
   */
  hasPermissionInCurrentGroup(permission: string): boolean {
    if (this.currentGroupId() === null) return false;
    return this.hasPermission(permission);
  }

}
