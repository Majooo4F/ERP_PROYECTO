import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { PermissionService } from '../../services/permission.service';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [
    CommonModule, ButtonModule, TagModule, DragDropModule,
    DialogModule, InputTextModule, FormsModule,
    SelectModule, ToggleSwitchModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './kanban.html'
})
export class Kanban implements OnInit {

  private apiUrl = 'http://localhost:3000';

  modoLista = false;
  visible = false;
  visibleCrear = false;
  loading = signal(false);
  guardando = signal(false);

  grupoActual: any = {};
  usuarioActual: any = {};

  ticketOriginal: any = null;
  ticketSeleccionado: any = {
    titulo: '', asignado_id: '', prioridad: '', estado: ''
  };

  nuevoTicket = {
    titulo: '', descripcion: '', prioridad: '', estado: 'pendiente'
  };

  prioridades = [
    { label: 'Alta', value: 'alta' },
    { label: 'Media', value: 'media' },
    { label: 'Baja', value: 'baja' }
  ];

  estados = [
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'En progreso', value: 'en_progreso' },
    { label: 'Bloqueado', value: 'bloqueado' },
    { label: 'Hecho', value: 'hecho' }
  ];

  pendientes: any[] = [];
  progreso: any[] = [];
  bloqueados: any[] = [];
  hecho: any[] = [];

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private permsSvc: PermissionService
  ) {}

  ngOnInit() {
    const user = localStorage.getItem('usuario');
    if (user) this.usuarioActual = JSON.parse(user);

    const grupo = localStorage.getItem('grupoSeleccionado');
    if (grupo) this.grupoActual = JSON.parse(grupo);

    this.cargarTickets();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  cargarTickets() {
    this.loading.set(true);
    this.http.get<any>(this.apiUrl + '/tickets', { headers: this.getHeaders() })
      .subscribe({
        next: (res) => {
          const todos: any[] = res.data || [];
          const delGrupo = this.grupoActual?.id
            ? todos.filter(t => t.grupo_id === this.grupoActual.id)
            : todos;

          this.pendientes = delGrupo.filter(t => t.estado === 'pendiente');
          this.progreso   = delGrupo.filter(t => t.estado === 'en_progreso');
          this.bloqueados = delGrupo.filter(t => t.estado === 'bloqueado');
          this.hecho      = delGrupo.filter(t => t.estado === 'hecho');
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los tickets'
          });
        }
      });
  }

  abrirTicket(ticket: any) {
    this.ticketOriginal = ticket;
    this.ticketSeleccionado = { ...ticket };
    this.visible = true;
  }

  guardarTicket() {
    this.guardando.set(true);
    const { id, titulo, descripcion, prioridad, estado } = this.ticketSeleccionado;
    const promises: any[] = [];

    if (titulo !== this.ticketOriginal.titulo ||
        descripcion !== this.ticketOriginal.descripcion ||
        prioridad !== this.ticketOriginal.prioridad) {
      promises.push(
        this.http.put<any>(
          `${this.apiUrl}/tickets/${id}`,
          { titulo, descripcion, prioridad },
          { headers: this.getHeaders() }
        ).toPromise()
      );
    }

    if (estado !== this.ticketOriginal.estado) {
      promises.push(
        this.http.patch<any>(
          `${this.apiUrl}/tickets/${id}/state`,
          { estado },
          { headers: this.getHeaders() }
        ).toPromise()
      );
    }

    if (promises.length === 0) {
      this.guardando.set(false);
      this.visible = false;
      return;
    }

    Promise.all(promises)
      .then(() => {
        this.guardando.set(false);
        this.visible = false;
        this.messageService.add({
          severity: 'success', summary: 'Actualizado', detail: 'Ticket actualizado'
        });
        this.cargarTickets();
      })
      .catch((err) => {
        this.guardando.set(false);
        this.messageService.add({
          severity: 'error', summary: 'Error',
          detail: err?.error?.data?.message || 'Error al actualizar'
        });
      });
  }

  abrirCrearTicket() {
    this.nuevoTicket = { titulo: '', descripcion: '', prioridad: 'media', estado: 'pendiente' };
    this.visibleCrear = true;
  }

  crearTicket() {
    if (!this.nuevoTicket.titulo) {
      this.messageService.add({
        severity: 'warn', summary: 'Campo requerido', detail: 'El título es obligatorio'
      });
      return;
    }

    this.guardando.set(true);
    const payload = {
      grupo_id: this.grupoActual.id,
      titulo:      this.nuevoTicket.titulo,
      descripcion: this.nuevoTicket.descripcion,
      prioridad:   this.nuevoTicket.prioridad,
      estado:      this.nuevoTicket.estado
    };

    this.http.post<any>(this.apiUrl + '/tickets', payload, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.visibleCrear = false;
          this.messageService.add({
            severity: 'success', summary: 'Creado', detail: 'Ticket creado correctamente'
          });
          this.cargarTickets();
        },
        error: (err) => {
          this.guardando.set(false);
          this.messageService.add({
            severity: 'error', summary: 'Error',
            detail: err?.error?.data?.message || 'Error al crear ticket'
          });
        }
      });
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    const ticket = event.previousContainer.data[event.previousIndex];

    // ✅ Regla 1: debe tener permiso ticket:move
    if (!this.permsSvc.hasPermission('ticket:move')) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin permiso',
        detail: 'No tienes permiso para mover tickets'
      });
      return;
    }

    // ✅ Regla 2: debe estar asignado al usuario o sin asignar
    const estaAsignado = ticket.asignado_id === this.usuarioActual.id;
    const sinAsignar   = ticket.asignado_id === null || ticket.asignado_id === undefined;

    if (!estaAsignado && !sinAsignar) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No asignado',
        detail: 'Solo puedes mover tickets asignados a ti'
      });
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    const nuevoEstado = this.getEstadoByContainerId(event.container.id);
    if (nuevoEstado) {
      ticket.estado = nuevoEstado;
      this.http.patch<any>(
        `${this.apiUrl}/tickets/${ticket.id}/state`,
        { estado: nuevoEstado },
        { headers: this.getHeaders() }
      ).subscribe({
        error: () => {
          this.messageService.add({
            severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el estado'
          });
          this.cargarTickets();
        }
      });
    }
  }

  getEstadoByContainerId(id: string): string {
    const map: any = {
      'list-pendientes': 'pendiente',
      'list-progreso':   'en_progreso',
      'list-bloqueados': 'bloqueado',
      'list-hecho':      'hecho'
    };
    return map[id] || '';
  }

  getSeverity(prioridad: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      alta: 'danger', media: 'warn', baja: 'info'
    };
    return map[prioridad] ?? 'secondary';
  }

  getEstadoLabel(estado: string): string {
    const map: any = {
      pendiente:   'Pendiente',
      en_progreso: 'En Progreso',
      bloqueado:   'Bloqueado',
      hecho:       'Hecho'
    };
    return map[estado] || estado;
  }
}