import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ToastModule, RouterLink, InputTextModule, ButtonModule],
  providers: [MessageService],
  templateUrl: './register.html'
})
export class Register implements OnInit {
  registerForm!: FormGroup;

  showPassword = false;

  constructor(
  private fb: FormBuilder,
  private messageService: MessageService,
  private router: Router
) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      usuario: ['', Validators.required],
      nombreCompleto: ['', Validators.required],
      email: ['', [
  Validators.required,
  Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/)
]],
      direccion: ['', Validators.required],
      
   
      telefono: ['', [
        Validators.required, 
        Validators.pattern('^[0-9]{10}$')
      ]],
      
      fechaNacimiento: ['', [Validators.required, this.validarEdad]],
      
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      
      confirmPassword: ['', Validators.required]
    }, { validators: this.compararPasswords });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  validarEdad(control: AbstractControl) {
    if (!control.value) return null;
    const fechaNac = new Date(control.value);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad >= 18 ? null : { menorDeEdad: true };
  }

  compararPasswords(group: AbstractControl) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { notMatching: true };
  }

  onRegister() {

  // 🔴 Validar si es menor de edad
  if (this.registerForm.get('fechaNacimiento')?.errors?.['menorDeEdad']) {
    
    this.messageService.add({
      severity: 'error',
      summary: 'Edad inválida',
      detail: 'Debes ser mayor de 18 años para registrarte.'
    });

    this.registerForm.get('fechaNacimiento')?.markAsTouched();
    return;
  }
  if (this.registerForm.get('email')?.invalid) {
  this.messageService.add({
    severity: 'error',
    summary: 'Correo inválido',
    detail: 'El correo debe contener @ y un dominio válido.'
  });
  return;
}

  if (this.registerForm.valid) {

    this.messageService.add({
      severity: 'success',
      summary: 'Registro Exitoso',
      detail: 'Redirigiendo al login...'
    });

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1500);

  } else {

    this.messageService.add({
      severity: 'warn',
      summary: 'Formulario Inválido',
      detail: 'Revisa los campos en rojo.'
    });

    this.registerForm.markAllAsTouched();
  }
  }}