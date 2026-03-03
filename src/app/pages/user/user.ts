import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-user',
  standalone: true,  
  imports: [CommonModule, ReactiveFormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './user.html',
  styleUrls: ['./user.css']
})
export class User {

  showPassword = false;
  userForm!: any; 

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.userForm = this.fb.group({
      usuario: ['', Validators.required],
      nombreCompleto: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      fechaNacimiento: ['', Validators.required],
      direccion: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  passwordMatchValidator(form: any) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null
      : { notMatching: true };
  }

  onSave() {
    if (this.userForm.invalid) return;

    this.messageService.add({
      severity: 'info',
      summary: 'Actualizado',
      detail: 'Usuario actualizado correctamente'
    });

    console.log(this.userForm.value);
  }
}