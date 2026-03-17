import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToastModule,
    ButtonModule,TableModule, CardModule
  ],
  providers: [MessageService],
  templateUrl: './user.html',
  styleUrls: ['./user.css']
})
export class User {
  showPassword = false;
  editMode = false;
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.userForm = this.fb.group({
      usuario: [{ value: 'juan.perez', disabled: true }, Validators.required],
      nombreCompleto: [{ value: 'Juan Pérez', disabled: true }, Validators.required],
      email: [{ value: 'juan@example.com', disabled: true }, [Validators.required, Validators.email]],
      telefono: [{ value: '1234567890', disabled: true }, [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      fechaNacimiento: [{ value: '1990-01-01', disabled: true }, [Validators.required, this.ageValidator]],
      direccion: [{ value: 'Calle Falsa 123', disabled: true }, Validators.required],
      password: [{ value: 'Password123!', disabled: true }, [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
      ]],
      confirmPassword: [{ value: 'Password123!', disabled: true }, Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Getter para facilitar el acceso en el HTML
  get f() {
    return this.userForm.controls;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  enableEdit() {
    this.editMode = true;
    
    this.userForm.enable();
  }
  tickets = [
  {
    id: 1,
    titulo: 'Error en login',
    estado: 'Abierto',
    prioridad: 'Alta',
    fechaLimite: '2026-03-15'
  },
  {
    id: 2,
    titulo: 'Actualizar dashboard',
    estado: 'En progreso',
    prioridad: 'Media',
    fechaLimite: '2026-03-20'
  },
  {
    id: 3,
    titulo: 'Bug en reporte',
    estado: 'Hecho',
    prioridad: 'Baja',
    fechaLimite: '2026-03-05'
  }
];

get abiertos() {
  return this.tickets.filter(t => t.estado === 'Abierto').length;
}

get enProgreso() {
  return this.tickets.filter(t => t.estado === 'En progreso').length;
}

get hechos() {
  return this.tickets.filter(t => t.estado === 'Hecho').length;
}

  // Validador de mayoría de edad
  ageValidator(control: AbstractControl) {
    if (!control.value) return null;
    const birthDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())) {
      age--;
    }
    return age >= 18 ? null : { menorDeEdad: true };
  }

  // Validador de coincidencia de contraseñas
  passwordMatchValidator(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notMatching: true };
  }

  onSave() {
    if (this.userForm.invalid) {
      // Mensaje AZUL (severity: 'info')
      this.messageService.add({
        severity: 'info',
        summary: 'Atención',
        detail: 'Revisa los campos marcados antes de guardar.'
      });
      this.userForm.markAllAsTouched();
      return;
    }

    // Mensaje AZUL (severity: 'info')
    this.messageService.add({
      severity: 'info',
      summary: 'Actualizado',
      detail: 'Los datos del usuario se han actualizado correctamente.'
    });

    this.editMode = false;
    this.userForm.disable();
    // Usamos getRawValue() para obtener todos los datos, incluidos los deshabilitados
    console.log(this.userForm.getRawValue());
  }
}