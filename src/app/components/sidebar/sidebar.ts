import { Component, OnInit, effect } from '@angular/core';
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
            visible: this.permsSvc.hasPermission('group:view')
          },
          ...(this.permsSvc.hasPermission('user:view') ? [{
            label: 'Perfil',
            icon: 'pi pi-user',
            command: () => this.router.navigate(['/user'])
          }] : []),
          {
            label: 'Mis Grupos',
            icon: 'pi pi-id-card',
            command: () => this.router.navigate(['/groups'])
            
          },
          ...(this.permsSvc.hasPermission('ticket:view') && !this.permsSvc.hasPermission('user:manage') ? [{
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
          ...(this.permsSvc.hasPermission('user:manage') ? [{
            label: 'Gestión de Usuarios',
            icon: 'pi pi-users',
            command: () => this.router.navigate(['/groups-admin'])
          }] : []),
          ...(this.permsSvc.hasPermission('group:manage') ? [{
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