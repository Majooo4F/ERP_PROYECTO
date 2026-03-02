import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MenuModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit {

  items: MenuItem[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.items = [
      {
        label: 'Panel',
        items: [
          {
            label: 'Dashboard',
            icon: 'pi pi-home',
            command: () => this.router.navigate(['/home'])
          },
          {
            label: 'Usuarios',
            icon: 'pi pi-users',
            command: () => this.router.navigate(['/user'])
          },
          {
            label: 'Reportes',
            icon: 'pi pi-chart-bar',
            command: () => this.router.navigate(['/reportes'])
          }
        ]
      },
      {
        label: 'Cuenta',
        items: [
          {
            label: 'Perfil',
            icon: 'pi pi-user',
            command: () => this.router.navigate(['/perfil'])
          },
          {
            label: 'Cerrar sesión',
            icon: 'pi pi-sign-out',
            command: () => this.router.navigate(['/login'])
          }
        ]
      }
    ];
  }
}