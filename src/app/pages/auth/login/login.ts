
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

    if (this.loginForm.valid) {

      const { email, password } = this.loginForm.value;

      this.auth.login(email, password).subscribe({

        next: (response) => {

  console.log('API response:', response);

  // 🔥 VALIDAR permisos antes de guardar
  if (response.permissions) {
    this.permissionSvc.setPermissions(response.permissions);
  }

  if (this.isBrowser) {
    localStorage.setItem('usuario', response.email);
  }

  // 🔥 VALIDAR token
  if (response.token) {
    this.auth.setToken(response.token);
  }

  this.router.navigate(['/home']);
},

        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Correo o contraseña incorrectos'
          });
        }

      });

    }

  }

}