
// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { Router, RouterLink } from '@angular/router';
// import { MessageService } from 'primeng/api';
// import { ToastModule } from 'primeng/toast';
// import { ButtonModule } from 'primeng/button';
// import { PermissionService } from '../../../services/permission.service';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [ReactiveFormsModule, CommonModule, ToastModule, ButtonModule, RouterLink],
//   providers: [MessageService],
//   templateUrl: './login.html'
// })
// export class Login {

//   loginForm: FormGroup;

//   constructor(
//     private fb: FormBuilder,
//     private messageService: MessageService,
//     private router: Router,
//     private permissionSvc: PermissionService
//   ) {

//     this.loginForm = this.fb.group({
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', [Validators.required]]
//     });

//   }

//   onSubmit() {

//     if (this.loginForm.valid) {

//       const { email, password } = this.loginForm.value;

//       let permisos: string[] = [];

//       if (email === 'admin@practica.com' && password === 'Password123!') {

//   permisos = [
    
//     'user:view',
//     'user:add',
//     'user:edit',
//     'user:delete',

//     'group:view',
//     'group:add',
//     'group:edit',
//     'group:delete',

//     'ticket:view',
//     'ticket:add',
//     'ticket:edit',
//     'ticket:delete',

//     'report:view'
//   ];

// } else if (email === 'user@practica.com' && password === 'Password123!') {

//   permisos = [
    
//     'user:view',

    
//     'group:view',

//      'ticket:view',
//     'ticket:add',
//     'ticket:edit',
//     'ticket:delete',
//     'ticket:view'
//   ];

// } else {
//   alert('Correo o contraseña incorrectos');
//   return;
// }

//       this.permissionSvc.setPermissions(permisos);

// localStorage.setItem('usuario', email);

// this.router.navigate(['/home']);

//     }

//   }

// } 
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { PermissionService } from '../../../services/permission.service';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ToastModule, ButtonModule, RouterLink],
  providers: [MessageService],
  templateUrl: './login.html'
})
export class Login {

  loginForm: FormGroup;
  loading = false;

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private permissionSvc: PermissionService,
    private auth: Auth
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.auth.login(email, password).subscribe({
      next: (res) => {
        this.loading = false;
        const data = res.data; // ← tu API devuelve { statusCode, intOpCode, data }

        // guardar token
        if (data?.token) this.auth.setToken(data.token);

        // guardar permisos
        if (data?.permisos) this.permissionSvc.setPermissions(data.permisos);

        // guardar usuario
        if (this.isBrowser && data?.user) {
          localStorage.setItem('usuario', JSON.stringify(data.user));
          const grupos = data.grupos || [];
          localStorage.setItem('grupos', JSON.stringify(grupos));

          // Fijar el contexto de grupo al primer grupo disponible
          if (grupos.length > 0) {
            this.permissionSvc.setGroupContext(grupos[0].id ?? null);
            localStorage.setItem('grupoSeleccionado', JSON.stringify(grupos[0]));
          }
        }

        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.data?.message || 'Correo o contraseña incorrectos'
        });
      }
    });
  }
}