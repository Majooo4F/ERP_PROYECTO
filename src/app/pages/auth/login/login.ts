import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button'; 


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ToastModule, ButtonModule, RouterLink],
  providers: [MessageService],
  templateUrl: './login.html'
})
export class Login {
  loginForm: FormGroup;
  private readonly VALID_USER = {
    email: 'admin@practica.com',
    password: 'Password123!'
  };

  constructor(
    private fb: FormBuilder, 
    private messageService: MessageService,
    private router: Router 
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      if (email === this.VALID_USER.email && password === this.VALID_USER.password) {
        // Redirección inmediata al Home
        this.router.navigate(['/home']);
        
      } else {
        alert('Correo o contraseña incorrectos'); // Simplificado para el ejemplo
      }
    }
  }
}