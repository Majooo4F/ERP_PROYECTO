// import { Component, signal } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
// import { ButtonModule } from 'primeng/button';

// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet, ButtonModule],
//   templateUrl: './app.html',
//   styleUrl: './app.css'
// })
// export class App {
//   protected readonly title = signal('ERP_PROYECTO');
// }
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PermissionService } from './services/permission.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  protected readonly title = signal('ERP_PROYECTO');

  constructor(private permsSvc: PermissionService) {

    const jwtPerms = [

        'grupos:ver',
        'grupos:crear',
        'grupos:editar',
        'grupos:eliminar',

      'usuarios:ver',

      'tickets:ver',
      'tickets:crear'

    ];

    this.permsSvc.setPermissions(jwtPerms);
  }

}