import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AvatarModule } from 'primeng/avatar';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HasPermissionDirective } from '../../directives/has-permission.directive';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PermissionService } from '../../services/permission.service';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CardModule, ButtonModule,
    TableModule, DialogModule, InputTextModule,
    ConfirmDialogModule, AvatarModule, ToastModule,
    HasPermissionDirective
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './groups.html'
})
export class Groups implements OnInit {

  private apiUrl = 'http://localhost:3000';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  registros = signal<any[]>([]);
  loading = signal(false);
  guardando = signal(false);

  visible = false;
  isEdit = false;
  editId: number | null = null;
  nuevoEmail = '';

  usuariosDisponibles: any[] = [];
  form = this.resetForm();

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private http: HttpClient,
    public permsSvc: PermissionService  // ← agregar
  ) {}

  ngOnInit() {
    if (!this.isBrowser) return;
    this.cargarMisGrupos();
  }

  private getHeaders(): HttpHeaders {
    const token = this.isBrowser ? localStorage.getItem('token') : null;
    return new HttpHeaders({ Authorization: `Bearer ${token ?? ''}` });
  }

  cargarGrupos() {
    this.loading.set(true);
    this.http.get<any>(`${this.apiUrl}/groups`, { headers: this.getHeaders() })
      .subscribe({
        next: (res) => {
          this.registros.set(res.data || []);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los grupos'
          });
        }
      });
  }

  cargarMisGrupos() {
    if (!this.isBrowser) return;
    this.loading.set(true);
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (!usuario?.id) {
      this.loading.set(false);
      return;
    }
    this.http.get<any>(
      `${this.apiUrl}/groups/miembros/usuario/${usuario.id}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        this.registros.set(res.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error', summary: 'Error', detail: 'No se pudieron cargar tus grupos'
        });
      }
    });
  }

  cargarUsuarios() {
    this.http.get<any>(`${this.apiUrl}/users/`, { headers: this.getHeaders() })
      .subscribe({
        next: (res) => { this.usuariosDisponibles = res.data || []; }
      });
  }

  resetForm() {
    return { nombre: '', descripcion: '', usuarios: [] as any[] };
  }

  openNew() {
    this.isEdit = false;
    this.editId = null;
    this.form = this.resetForm();
    this.nuevoEmail = '';
    this.cargarUsuarios();
    this.visible = true;
  }

  edit(grupo: any) {
    this.isEdit = true;
    this.editId = grupo.id;
    this.form = { nombre: grupo.nombre, descripcion: grupo.descripcion, usuarios: [] };
    this.nuevoEmail = '';
    this.cargarUsuarios();
    this.visible = true;
  }

  agregarUsuario() {
    if (!this.nuevoEmail || !this.nuevoEmail.includes('@')) return;
    const usuario = this.usuariosDisponibles.find(u => u.email === this.nuevoEmail);
    if (!usuario) {
      this.messageService.add({ severity: 'warn', summary: 'No encontrado', detail: 'No existe un usuario con ese email' });
      return;
    }
    const yaAgregado = this.form.usuarios.find((u: any) => u.email === this.nuevoEmail);
    if (yaAgregado) {
      this.messageService.add({ severity: 'warn', summary: 'Duplicado', detail: 'El usuario ya está en la lista' });
      return;
    }
    this.form.usuarios.push({ id: usuario.id, nombre: usuario.nombre_completo, email: usuario.email });
    this.nuevoEmail = '';
  }

  eliminarUsuario(index: number) {
    this.form.usuarios.splice(index, 1);
  }

  save() {
    if (!this.form.nombre.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Campo requerido', detail: 'El nombre es obligatorio' });
      return;
    }

    const descripcionLimpia = (this.form.descripcion ?? '').trim();
    if (!descripcionLimpia) {
      this.form.descripcion = 'Sin descripción';
    } else if (descripcionLimpia.length < 5) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Descripción inválida',
        detail: 'La descripción debe tener mínimo 5 caracteres (o déjala vacía y se pondrá "Sin descripción").'
      });
      return;
    }

    this.guardando.set(true);

    if (this.isEdit && this.editId) {
      this.http.put<any>(
        `${this.apiUrl}/groups/${this.editId}`,
        { nombre: this.form.nombre, descripcion: this.form.descripcion },
        { headers: this.getHeaders() }
      ).subscribe({
        next: () => {
          this.guardando.set(false);
          this.visible = false;
          this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Grupo actualizado' });
          this.cargarMisGrupos();
        },
        error: (err) => {
          this.guardando.set(false);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.data?.message || 'Error al actualizar' });
        }
      });
    } else {
      this.http.post<any>(
        `${this.apiUrl}/groups`,
        { nombre: this.form.nombre, descripcion: this.form.descripcion },
        { headers: this.getHeaders() }
      ).subscribe({
        next: (res) => {
          const grupoId = res.data?.grupo?.id;
          if (grupoId && this.form.usuarios.length > 0) {
            const requests = this.form.usuarios.map((u: any) =>
              this.http.post<any>(`${this.apiUrl}/groups/miembros`, { grupo_id: grupoId, usuario_id: u.id }, { headers: this.getHeaders() }).toPromise()
            );
            Promise.all(requests).catch(() => {});
          }
          this.guardando.set(false);
          this.visible = false;
          this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Grupo creado correctamente' });
          this.cargarMisGrupos();
        },
        error: (err) => {
          this.guardando.set(false);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.data?.message || 'Error al crear grupo' });
        }
      });
    }
  }

  confirmDelete(grupo: any) {
    this.confirmationService.confirm({
      message: `¿Seguro que deseas eliminar "${grupo.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.http.delete<any>(`${this.apiUrl}/groups/${grupo.id}`, { headers: this.getHeaders() })
          .subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Grupo eliminado' });
              this.cargarMisGrupos();
            },
            error: (err) => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.data?.message || 'Error al eliminar' });
            }
          });
      }
    });
  }
}
