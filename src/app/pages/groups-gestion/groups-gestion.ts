import { Component, ViewChild, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule, Table } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-groups-gestion',
  standalone: true,
  imports: [
    FormsModule, CommonModule, ButtonModule, DialogModule,
    InputTextModule, TableModule, ToastModule, SelectModule
  ],
  providers: [MessageService],
  templateUrl: './groups-gestion.html',
  styleUrls: ['./groups-gestion.css']
})
export class GroupsGestion implements OnInit {

  @ViewChild('dt') table!: Table;

  private apiUrl = 'http://localhost:3000';

  visible = false;
  loading = signal(false);
  guardando = signal(false);

  grupoActual: any = {};
  groupName = '';
  groupDescripcion = '';

  emailSeleccionado = '';
  usuariosDisponibles = signal<any[]>([]);
  emailOptions = signal<{ label: string; value: string }[]>([]);
  miembros = signal<any[]>([]);

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    const stored = localStorage.getItem('grupoSeleccionado');
    if (stored) {
      this.grupoActual = JSON.parse(stored);
      this.groupName = this.grupoActual.nombre || '';
      this.groupDescripcion = this.grupoActual.descripcion || '';
    }
    this.cargarMiembros();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  cargarMiembros() {
    if (!this.grupoActual?.id) return;
    this.loading.set(true);

    this.http.get<any>(
      `${this.apiUrl}/groups/miembros/${this.grupoActual.id}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        const data = res.data || [];
        this.miembros.set(data.map((m: any) => ({
          nombre: m.usuarios?.nombre_completo || 'Sin nombre',
          email: m.usuarios?.email || '',
          usuario_id: m.usuario_id,
          fecha: new Date().toISOString().split('T')[0]
        })));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los miembros'
        });
      }
    });
  }

  cargarUsuarios() {
  this.http.get<any>(`${this.apiUrl}/users/`, { headers: this.getHeaders() })
    .subscribe({
      next: (res) => {
        const todos = res.data || [];
        this.usuariosDisponibles.set(todos);

        // ← filtrar por usuario_id, no por email
        const idsMiembros = this.miembros().map(m => m.usuario_id);
        this.emailOptions.set(
          todos
            .filter((u: any) => !idsMiembros.includes(u.id))
            .map((u: any) => ({
              label: `${u.email} — ${u.nombre_completo}`,
              value: u.email
            }))
        );
      },
      error: () => {
        this.messageService.add({
          severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios'
        });
      }
    });
}

  onFilter(event: Event) {
    this.table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.emailSeleccionado = '';
    this.visible = true;
    this.cargarUsuarios();
  }

  saveUser() {
    if (!this.emailSeleccionado) {
      this.messageService.add({
        severity: 'warn', summary: 'Campo requerido', detail: 'Selecciona un email'
      });
      return;
    }

    const usuario = this.usuariosDisponibles().find(
      (u: any) => u.email === this.emailSeleccionado
    );

    if (!usuario) {
      this.messageService.add({
        severity: 'warn', summary: 'No encontrado', detail: 'Usuario no encontrado'
      });
      return;
    }

    this.guardando.set(true);

    this.http.post<any>(
      `${this.apiUrl}/groups/miembros`,
      { grupo_id: this.grupoActual.id, usuario_id: usuario.id },
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.guardando.set(false);
        this.visible = false;
        this.messageService.add({
          severity: 'success', summary: 'Agregado',
          detail: `${usuario.nombre_completo} agregado al grupo`
        });
        this.cargarMiembros();
      },
      error: (err) => {
        this.guardando.set(false);
        this.messageService.add({
          severity: 'error', summary: 'Error',
          detail: err?.error?.data?.message || 'Error al agregar usuario'
        });
      }
    });
  }

  deleteUser(usuarioId: number) {
  this.http.delete<any>(
    `${this.apiUrl}/groups/miembros/${this.grupoActual.id}/usuario/${usuarioId}`,
    { headers: this.getHeaders() }
  ).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success', summary: 'Removido', detail: 'Miembro removido del grupo'
      });
      this.cargarMiembros();
    },
    error: (err) => {
      this.messageService.add({
        severity: 'error', summary: 'Error',
        detail: err?.error?.data?.message || 'Error al remover miembro'
      });
    }
  });
}

  saveGroup() {
    if (!this.groupName.trim()) return;
    this.guardando.set(true);

    this.http.put<any>(
      `${this.apiUrl}/groups/${this.grupoActual.id}`,
      {
        nombre: this.groupName,
        descripcion: this.groupDescripcion || 'Sin descripción'
      },
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.guardando.set(false);
        const updated = {
          ...this.grupoActual,
          nombre: this.groupName,
          descripcion: this.groupDescripcion
        };
        localStorage.setItem('grupoSeleccionado', JSON.stringify(updated));
        this.grupoActual = updated;
        this.messageService.add({
          severity: 'success', summary: 'Guardado', detail: 'Grupo actualizado correctamente'
        });
      },
      error: (err) => {
        this.guardando.set(false);
        this.messageService.add({
          severity: 'error', summary: 'Error',
          detail: err?.error?.data?.message || 'Error al actualizar grupo'
        });
      }
    });
  }
}