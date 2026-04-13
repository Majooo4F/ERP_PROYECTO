import { Component, ViewChild, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PermissionService } from '../../services/permission.service';

@Component({
  selector: 'app-ticket-lista',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TableModule, DialogModule, ButtonModule,
    InputTextModule, SelectModule, TagModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './tickets.html'
})
export class TicketLista implements OnInit {

  @ViewChild('tabla') tabla!: Table;

  private apiUrl = 'http://localhost:3000';

  loading  = signal(false);
  guardando = signal(false);

  usuarioActual: any = {};
  grupoActual: any = {};
  miembrosGrupo: any[] = [];

  filtros = [
    { label: 'Todos',         value: 'todos'        },
    { label: 'Mis tickets',   value: 'misTickets'   },
    { label: 'Sin asignar',   value: 'sinAsignar'   },
    { label: 'Prioridad alta',value: 'prioridadAlta'}
  ];
  filtroRapido = 'todos';

  tickets: any[] = [];
  ticketsFiltrados: any[] = [];

  prioridades = [
    { label: 'Alta',  value: 'alta'  },
    { label: 'Media', value: 'media' },
    { label: 'Baja',  value: 'baja'  }
  ];

  estados = [
    { label: 'Pendiente',   value: 'pendiente'   },
    { label: 'En progreso', value: 'en_progreso'  },
    { label: 'Bloqueado',   value: 'bloqueado'   },
    { label: 'Hecho',       value: 'hecho'       }
  ];

  displayDialog = false;
  ticketForm: FormGroup;
  selectedTicket: any = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private messageService: MessageService,
    public permsSvc: PermissionService,
     private cdr: ChangeDetectorRef 
  ) {
    this.ticketForm = this.fb.group({
      titulo:      [''],
      descripcion: [''],
      estado:      [''],
      prioridad:   [''],
      asignado_id: [null]
    });
  }

  ngOnInit() {
  const user = localStorage.getItem('usuario');
  if (user) this.usuarioActual = JSON.parse(user);

  const grupo = localStorage.getItem('grupoSeleccionado');
  if (grupo) this.grupoActual = JSON.parse(grupo);

  setTimeout(() => {
    this.cargarTickets();
    this.cargarMiembros();
  });
}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  cargarMiembros() {
    if (!this.grupoActual?.id) return;
    this.http.get<any>(
      `${this.apiUrl}/groups/miembros/${this.grupoActual.id}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        this.miembrosGrupo = (res.data || []).map((m: any) => ({
          label: m.usuarios?.username || m.usuarios?.email,
          value: m.usuario_id
        }));
        this.cdr.detectChanges(); 
      },
      error: () => {}
    });
  }

  cargarTickets() {
    this.loading.set(true);
    this.http.get<any>(this.apiUrl + '/tickets', { headers: this.getHeaders() })
      .subscribe({
        next: (res) => {
          const todos = res.data || [];
          this.tickets = this.grupoActual?.id
            ? todos.filter((t: any) => t.grupo_id === this.grupoActual.id)
            : todos;
          this.aplicarFiltroRapido(this.filtroRapido);
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

  onFilter(event: Event, field?: string) {
    const value = (event.target as HTMLInputElement).value;
    if (field) {
      this.tabla.filter(value, field, 'contains');
    } else {
      this.tabla.filterGlobal(value, 'contains');
    }
  }

  aplicarFiltroRapido(filtro: string) {
    this.filtroRapido = filtro;
    switch (filtro) {
      case 'misTickets':
        this.ticketsFiltrados = this.tickets.filter(t =>
          t.autor_id === this.usuarioActual?.id ||
          t.asignado_id === this.usuarioActual?.id
        );
        break;
      case 'sinAsignar':
        this.ticketsFiltrados = this.tickets.filter(t => !t.asignado_id);
        break;
      case 'prioridadAlta':
        this.ticketsFiltrados = this.tickets.filter(t => t.prioridad === 'alta');
        break;
      default:
        this.ticketsFiltrados = [...this.tickets];
    }
  }

  editarTicket(ticket: any) {
    this.selectedTicket = { ...ticket };
    this.ticketForm.patchValue({
      titulo:      ticket.titulo,
      descripcion: ticket.descripcion,
      estado:      ticket.estado,
      prioridad:   ticket.prioridad,
      asignado_id: ticket.asignado_id || null
    });
    this.displayDialog = true;
  }

  guardarCambios() {
    if (!this.selectedTicket) return;
    this.guardando.set(true);

    const values = this.ticketForm.getRawValue();
    const updatePromises: any[] = [];

    if (
      values.titulo      !== this.selectedTicket.titulo ||
      values.descripcion !== this.selectedTicket.descripcion ||
      values.prioridad   !== this.selectedTicket.prioridad
    ) {
      updatePromises.push(
        this.http.put<any>(
          `${this.apiUrl}/tickets/${this.selectedTicket.id}`,
          { titulo: values.titulo, descripcion: values.descripcion, prioridad: values.prioridad },
          { headers: this.getHeaders() }
        ).toPromise()
      );
    }

    if (values.estado !== this.selectedTicket.estado) {
      updatePromises.push(
        this.http.patch<any>(
          `${this.apiUrl}/tickets/${this.selectedTicket.id}/state`,
          { estado: values.estado },
          { headers: this.getHeaders() }
        ).toPromise()
      );
    }

    // ← asignar ticket si cambió
    if (values.asignado_id !== this.selectedTicket.asignado_id) {
      updatePromises.push(
        this.http.patch<any>(
          `${this.apiUrl}/tickets/${this.selectedTicket.id}/move`,
          { asignado_id: values.asignado_id },
          { headers: this.getHeaders() }
        ).toPromise()
      );
    }

    if (updatePromises.length === 0) {
      this.guardando.set(false);
      this.displayDialog = false;
      return;
    }

    Promise.all(updatePromises)
      .then(() => {
        this.guardando.set(false);
        this.displayDialog = false;
        this.messageService.add({
          severity: 'success', summary: 'Actualizado', detail: 'Ticket actualizado correctamente'
        });
        this.cargarTickets();
      })
      .catch((err) => {
        this.guardando.set(false);
        this.messageService.add({
          severity: 'error', summary: 'Error',
          detail: err?.error?.data?.message || 'Error al actualizar ticket'
        });
      });
  }

  eliminarTicket(ticket: any) {
    this.http.delete<any>(
      `${this.apiUrl}/tickets/${ticket.id}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success', summary: 'Eliminado', detail: 'Ticket eliminado'
        });
        this.cargarTickets();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error', summary: 'Error',
          detail: err?.error?.data?.message || 'Error al eliminar ticket'
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
}