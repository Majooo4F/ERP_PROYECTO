import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ToastModule,
    ButtonModule, TableModule, CardModule, TagModule
  ],
  providers: [MessageService],
  templateUrl: './user.html',
  styleUrls: ['./user.css']
})
export class User implements OnInit {

  private apiUrl = 'http://localhost:3000';

  showPassword = false;
  editMode = false;
  guardando = signal(false);

  usuarioActual: any = {};

  // ← signals para evitar NG0100
  tickets = signal<any[]>([]);

  // ← computed para los contadores
  pendientes = computed(() => this.tickets().filter(t => t.estado === 'pendiente').length);
  enProgreso = computed(() => this.tickets().filter(t => t.estado === 'en_progreso').length);
  hechos = computed(() => this.tickets().filter(t => t.estado === 'hecho').length);

  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private http: HttpClient
  ) {
    this.userForm = this.fb.group({
      usuario:         [{ value: '', disabled: true }, Validators.required],
      nombreCompleto:  [{ value: '', disabled: true }, Validators.required],
      email:           [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      telefono:        [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      direccion:       [{ value: '', disabled: true }, Validators.required],
      password:        [{ value: '', disabled: true }, [
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)
      ]],
      confirmPassword: [{ value: '', disabled: true }]
    }, { validators: this.passwordMatchValidator });
  }

  get f() { return this.userForm.controls; }

  ngOnInit() {
    const stored = localStorage.getItem('usuario');
    if (stored) {
      this.usuarioActual = JSON.parse(stored);
      this.userForm.patchValue({
        usuario:        this.usuarioActual.username,
        nombreCompleto: this.usuarioActual.nombre_completo,
        email:          this.usuarioActual.email,
        telefono:       this.usuarioActual.telefono,
        direccion:      this.usuarioActual.direccion
      });
    }
    this.cargarTickets();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  cargarTickets() {
    this.http.get<any>(this.apiUrl + '/tickets', { headers: this.getHeaders() })
      .subscribe({
        next: (res) => {
          const todos = res.data || [];
          this.tickets.set(
            todos.filter((t: any) =>
              t.autor_id === this.usuarioActual.id ||
              t.asignado_id === this.usuarioActual.id
            )
          );
        },
        error: () => {
          this.messageService.add({
            severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los tickets'
          });
        }
      });
  }

  getEstadoLabel(estado: string): string {
    const map: any = {
      pendiente: 'Pendiente', en_progreso: 'En Progreso',
      bloqueado: 'Bloqueado', hecho: 'Hecho'
    };
    return map[estado] || estado;
  }

  getEstadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      pendiente: 'warn', en_progreso: 'info', bloqueado: 'danger', hecho: 'success'
    };
    return map[estado] ?? 'secondary';
  }

  getPrioridadSeverity(prioridad: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      alta: 'danger', media: 'warn', baja: 'info'
    };
    return map[prioridad] ?? 'secondary';
  }

  togglePassword() { this.showPassword = !this.showPassword; }

  enableEdit() {
    this.editMode = true;
    this.userForm.enable();
  }

  passwordMatchValidator(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (!password) return null;
    return password === confirmPassword ? null : { notMatching: true };
  }

  onSave() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn', summary: 'Formulario inválido',
        detail: 'Revisa los campos marcados.'
      });
      return;
    }

    this.guardando.set(true);
    const values = this.userForm.getRawValue();

    const payload: any = {
      username:        values.usuario,
      nombre_completo: values.nombreCompleto,
      email:           values.email,
      telefono:        values.telefono,
      direccion:       values.direccion
    };

    if (values.password) payload.password = values.password;

    this.http.put<any>(
      `${this.apiUrl}/users/perfil`,
      payload,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        this.guardando.set(false);
        this.editMode = false;
        this.userForm.disable();

        const updated = { ...this.usuarioActual, ...res.data?.perfil };
        localStorage.setItem('usuario', JSON.stringify(updated));
        this.usuarioActual = updated;

        this.messageService.add({
          severity: 'success', summary: 'Actualizado',
          detail: 'Perfil actualizado correctamente'
        });
      },
      error: (err) => {
        this.guardando.set(false);
        this.messageService.add({
          severity: 'error', summary: 'Error',
          detail: err?.error?.data?.message || 'Error al actualizar perfil'
        });
      }
    });
  }
}