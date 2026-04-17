import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';

import { PermissionService } from '../../services/permission.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MenuModule,
    AvatarModule,
    BadgeModule,
    RippleModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar {

  items: MenuItem[] = [];

  constructor(
    private router: Router,
    private permsSvc: PermissionService
  ) {
    effect(() => {
      this.permsSvc.getPermissions(); // suscripción reactiva al signal
      this.buildMenu();
    });
  }

  buildMenu() {
    this.items = [
      {
        label: 'Panel',
        items: [
          {
            label: 'Home',
            icon: 'pi pi-home',
            command: () => this.router.navigate(['/home'])
          },
          {
            label: 'Dashboard',
            icon: 'pi pi-th-large',
            command: () => this.router.navigate(['/dashboard-group']),
            visible: this.permsSvc.hasPermission('grupo:ver')
          },
          ...(this.permsSvc.hasPermission('usuario:ver') ? [{
            label: 'Perfil',
            icon: 'pi pi-user',
            command: () => this.router.navigate(['/user'])
          }] : []),
          {
            label: 'Mis Grupos',
            icon: 'pi pi-id-card',
            command: () => this.router.navigate(['/groups'])
          },
          // Tickets: visible si tiene ticket:ver pero NO es administrador
          ...(this.permsSvc.hasPermission('ticket:ver') && !this.permsSvc.hasPermission('usuario:admin') ? [{
            label: 'Tickets',
            icon: 'pi pi-ticket',
            command: () => this.router.navigate(['/tickets'])
          }] : []),
        ]
      },
      { separator: true },
      {
        label: 'Administración',
        items: [
          // Gestión de Usuarios: requiere usuario:admin
          ...(this.permsSvc.hasPermission('usuario:admin') ? [{
            label: 'Gestión de Usuarios',
            icon: 'pi pi-users',
            command: () => this.router.navigate(['/groups-admin'])
          }] : []),
          // Gestión de Grupo: requiere grupo:admin
          ...(this.permsSvc.hasPermission('grupo:admin') ? [{
            label: 'Gestión de Grupo',
            icon: 'pi pi-cog',
            command: () => this.router.navigate(['/groups-gestion'])
          }] : []),
          {
            label: 'Cerrar sesión',
            icon: 'pi pi-sign-out',
            command: () => {
              this.permsSvc.clearPermissions();
              localStorage.clear();
              this.router.navigate(['/login']);
            }
          }
        ]
      }
    ];
  }
}