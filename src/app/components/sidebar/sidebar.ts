// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { MenuModule } from 'primeng/menu';
// import { MenuItem } from 'primeng/api';
// import { group } from 'console';

// @Component({
//   selector: 'app-sidebar',
//   standalone: true,
//   imports: [CommonModule, MenuModule],
//   templateUrl: './sidebar.html',
//   styleUrls: ['./sidebar.css']
// })
// export class Sidebar implements OnInit {

//   items: MenuItem[] = [];

//   constructor(private router: Router) {}

//   ngOnInit() {
//     this.items = [
//       {
//         label: 'Panel',
//         items: [
//           {
//             label: 'Dashboard',
//             icon: 'pi pi-home',
//             command: () => this.router.navigate(['home'])
//           },
//           {
//             label: 'Usuarios',
//             icon: 'pi pi-users',
//             command: () => this.router.navigate(['user'])
//           },
//         {
//           label:  'Grupos',
//           icon: 'pi pi-id-card',
//           command:() => this.router.navigate(['groups'])
//         },
//           {
//             label: 'Reportes',
//             icon: 'pi pi-chart-bar',
//             command: () => this.router.navigate(['/reportes'])
//           }
//         ]
//       },
//       {
//         label: 'Cuenta',
//         items: [
//           {
//             label: 'Perfil',
//             icon: 'pi pi-user',
//             command: () => this.router.navigate(['/perfil'])
//           },
//           {
//             label: 'Cerrar sesión',
//             icon: 'pi pi-sign-out',
//             command: () => this.router.navigate(['/login'])
//           }

//         ]
//       }
//     ];
//   }
// } 
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { PermissionService } from '../../services/permission.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MenuModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit {

  items: MenuItem[] = [];

  constructor(
    private router: Router,
    private permsSvc: PermissionService
  ) {}

  ngOnInit() {
    this.buildMenu();
  }

  buildMenu() {

    this.items = [
      {
        label: 'Panel',
        items: [

          {
            label: 'Dashboard',
            icon: 'pi pi-home',
            command: () => this.router.navigate(['home'])
          },

          ...(this.permsSvc.hasPermission('usuarios:ver') ? [{
            label: 'Usuarios',
            icon: 'pi pi-users',
            command: () => this.router.navigate(['user'])
          }] : []),

        ...(
            this.permsSvc.hasPermission('grupos:ver') ||
            this.permsSvc.hasPermission('usuarios:ver')
            ? [{
                label: 'Grupos',
                icon: 'pi pi-id-card',
                command: () => this.router.navigate(['/groups'])
              }]
            : []
          ),

          ...(this.permsSvc.hasPermission('tickets:ver') ? [{
            label: 'Tickets',
            icon: 'pi pi-ticket',
            command: () => this.router.navigate(['tickets'])
          }] : [])

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
            command: () => {
              this.permsSvc.clearPermissions();
              this.router.navigate(['/login']);
            }
          }
        ]
      }
    ];
  }

}