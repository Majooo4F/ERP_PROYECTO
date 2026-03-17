
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { PermissionService } from '../../../services/permission.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ToastModule, ButtonModule, RouterLink],
  providers: [MessageService],
  templateUrl: './login.html'
})
export class Login {

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private permissionSvc: PermissionService
  ) {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

  }

  onSubmit() {

    if (this.loginForm.valid) {

      const { email, password } = this.loginForm.value;

      let permisos: string[] = [];

      if (email === 'admin@practica.com' && password === 'Password123!') {

  permisos = [
    
    'user:view',
    'user:add',
    'user:edit',
    'user:delete',

    'group:view',
    'group:add',
    'group:edit',
    'group:delete',

    'ticket:view',
    'ticket:add',
    'ticket:edit',
    'ticket:delete',

    'report:view'
  ];

} else if (email === 'user@practica.com' && password === 'Password123!') {

  permisos = [
    
    'user:view',

    
    'group:view',

     'ticket:view',
    'ticket:add',
    'ticket:edit',
    'ticket:delete',
    'ticket:view'
  ];

} else {
  alert('Correo o contraseña incorrectos');
  return;
}

      this.permissionSvc.setPermissions(permisos);

localStorage.setItem('usuario', email);

this.router.navigate(['/home']);

    }

  }

} 