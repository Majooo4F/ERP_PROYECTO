import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ToastModule, RouterLink, InputTextModule,
  ButtonModule],
  providers: [MessageService],
  templateUrl: './register.html'
})
export class Register implements OnInit {
  registerForm!: FormGroup;

  constructor(private fb: FormBuilder, private messageService: MessageService) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      usuario: ['', Validators.required],
      nombreCompleto: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      fechaNacimiento: ['', [Validators.required, this.validarEdad]],
      password: ['', [
        Validators.required, 
        Validators.minLength(10),
        Validators.pattern('^(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{10,}$')
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.compararPasswords });
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
    if (this.registerForm.valid) {
      this.messageService.add({ 
        severity: 'success', 
        summary: 'Registro Exitoso', 
        detail: 'Tu cuenta ha sido creada (Localmente)' 
      });
      console.log('Datos enviados:', this.registerForm.value);
    } else {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Formulario Inválido', 
        detail: 'Por favor, revisa los campos marcados en rojo' 
      });
      this.registerForm.markAllAsTouched();
    }
  }
}