// // import { Component, signal } from '@angular/core';
// // import { RouterOutlet } from '@angular/router';
// // import { ButtonModule } from 'primeng/button';

// // @Component({
// //   selector: 'app-root',
// //   imports: [RouterOutlet, ButtonModule],
// //   templateUrl: './app.html',
// //   styleUrl: './app.css'
// // })
// // export class App {
// //   protected readonly title = signal('ERP_PROYECTO');
// // }

// import { Component, signal } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
// import { ButtonModule } from 'primeng/button';

// import { PermissionService } from './services/permission.service';
// import { HasPermissionDirective } from './directives/has-permission.directive';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [RouterOutlet, ButtonModule, HasPermissionDirective],
//   templateUrl: './app.html',
//   styleUrl: './app.css'
// })
// export class App {

//   protected readonly title = signal('ERP_PROYECTO');

//   constructor(private permsSvc: PermissionService) {

//     // Simulación de permisos que vienen del JWT al iniciar sesión
//     const jwtPerms = [
//       // Groups
//       'group:view', 'groups:view',
//       'group:add', 'groups:add',
//       'group:edit', 'groups:edit',
//       'group:delete', 'groups:delete',

//       // Users
//       'user:view', 'users:view',
//       'user:add', 'users:add',
//       'user:edit', 'users:edit',
//       'user:delete', 'users:delete',

//       // Tickets
//       'ticket:view', 'tickets:view',
//       'ticket:add', 'tickets:add',
//       'ticket:edit', 'tickets:edit',
//       'ticket:delete', 'tickets:delete'
//     ];

//     this.permsSvc.setPermissions(jwtPerms);
//   }

// }

import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { isPlatformBrowser } from '@angular/common';

import { PermissionService } from './services/permission.service';
import { HasPermissionDirective } from './directives/has-permission.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ButtonModule, HasPermissionDirective],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  protected readonly title = signal('ERP_PROYECTO');

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor(private permsSvc: PermissionService) {

    if (this.isBrowser) {

      const storedPerms = localStorage.getItem('permissions');

      // 🔥 VALIDACIÓN COMPLETA
      if (storedPerms && storedPerms !== 'undefined') {
        try {
          const parsed = JSON.parse(storedPerms);
          this.permsSvc.setPermissions(parsed);
        } catch (error) {
          console.error('Error parsing permissions in App:', error);
          localStorage.removeItem('permissions');
        }
      }

    }

  }

}