import { Component, OnInit, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PermissionService } from '../../services/permission.service';

@Component({
  selector: 'app-dashboard-grupo',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CardModule, ButtonModule,
    DialogModule, InputTextModule,
    RouterLink, SelectModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './dashboard-group.html',
  styleUrls: ['./dashboard-group.css']
})
export class DashboardGrupo implements OnInit {

  grupoActual: any;
  visible = false;
  loading = false;

  total      = 0;
  pendientes = 0;
  progreso   = 0;
  hechos     = 0;
  bloqueados = 0;

  ticketsRecientes: any[] = [];

  nuevoTicket = {
    titulo: '', descripcion: '', estado: 'pendiente', prioridad: 'media'
  };

  nuevoEmail = '';
  usuariosAsignados: string[] = [];

  prioridades = [
    { label: 'Baja',  value: 'baja'  },
    { label: 'Media', value: 'media' },
    { label: 'Alta',  value: 'alta'  }
  ];

  estados = [
    { label: 'Pendiente',   value: 'pendiente'   },
    { label: 'En progreso', value: 'en_progreso'  },
    { label: 'Bloqueado',   value: 'bloqueado'   },
    { label: 'Hecho',       value: 'hecho'       }
  ];

  private apiUrl = 'http://localhost:3000';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor(
    public permsSvc: PermissionService,
    private http: HttpClient,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.isBrowser) return;
    const data = localStorage.getItem('grupoSeleccionado');
    this.grupoActual = data ? JSON.parse(data) : null;
    if (this.grupoActual?.id) {
      // ✅ Fix #2: Cargar permisos reales del grupo antes de renderizar
      this.permsSvc.loadPermissionsForGroup(this.grupoActual.id).then(() => {
        this.cargarTickets();
      });
    }
  }

  private getHeaders(): HttpHeaders {
    const token = this.isBrowser ? localStorage.getItem('token') : null;
    return new HttpHeaders({ Authorization: `Bearer ${token ?? ''}` });
  }

  cargarTickets() {
    this.http.get<any>(this.apiUrl + '/tickets', { headers: this.getHeaders() })
      .subscribe({
        next: (res) => {
          const todos: any[] = res.data || [];
          const delGrupo = todos.filter(t => t.grupo_id === this.grupoActual.id);

          // Asignaciones sincrónicas, sin setTimeout anidado
          this.ticketsRecientes = delGrupo.slice(0, 5);
          this.total      = delGrupo.length;
          this.pendientes = delGrupo.filter(t => t.estado === 'pendiente').length;
          this.progreso   = delGrupo.filter(t => t.estado === 'en_progreso').length;
          this.hechos     = delGrupo.filter(t => t.estado === 'hecho').length;
          this.bloqueados = delGrupo.filter(t => t.estado === 'bloqueado').length;

          if (this.isBrowser) localStorage.setItem('ticketsGrupo', JSON.stringify(delGrupo));

          // Notifica a Angular que revise cambios limpiamente
          this.cdr.markForCheck();

          // Las gráficas necesitan que el DOM ya esté actualizado
          this.dibujarGraficas();
        },
        error: () => {
          this.messageService.add({
            severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los tickets'
          });
        }
      });
  }

  dibujarGraficas() {
    if (!this.isBrowser) return;
    // setTimeout aquí está bien: solo lo usamos para esperar a que el DOM
    // pinte los <canvas> DESPUÉS de que Angular actualizó la vista.
    setTimeout(() => {
      this.dibujarDonut();
      this.dibujarBarras();
    }, 100);
  }

  dibujarDonut() {
    if (!this.isBrowser) return;
    const canvas = document.getElementById('donutChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const datos   = [this.pendientes, this.progreso, this.bloqueados, this.hechos];
    const colores = ['#EAB308', '#6366F1', '#EF4444', '#22C55E'];
    const labels  = ['Pendientes', 'En Progreso', 'Bloqueados', 'Hechos'];
    const total   = datos.reduce((a, b) => a + b, 0);
    if (total === 0) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2 - 20;
    const radio = Math.min(cx, cy) - 10;
    const radioInterno = radio * 0.6;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let startAngle = -Math.PI / 2;
    datos.forEach((val, i) => {
      if (val === 0) return;
      const slice = (val / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radio, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = colores[i];
      ctx.fill();
      startAngle += slice;
    });

    // Hueco central
    ctx.beginPath();
    ctx.arc(cx, cy, radioInterno, 0, 2 * Math.PI);
    ctx.fillStyle = '#f9fafb';
    ctx.fill();

    // Total en centro
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(total), cx, cy);

    // Leyenda abajo
    const leyendaY = canvas.height - 50;
    datos.forEach((val, i) => {
      const x = (i % 2) * (canvas.width / 2) + 16;
      const y = leyendaY + Math.floor(i / 2) * 22;
      ctx.fillStyle = colores[i];
      ctx.fillRect(x, y, 12, 12);
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`${labels[i]}: ${val}`, x + 16, y);
    });
  }

  dibujarBarras() {
    if (!this.isBrowser) return;
    const canvas = document.getElementById('barChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const delGrupo: any[] = JSON.parse(localStorage.getItem('ticketsGrupo') || '[]');
    const alta  = delGrupo.filter(t => t.prioridad === 'alta').length;
    const media = delGrupo.filter(t => t.prioridad === 'media').length;
    const baja  = delGrupo.filter(t => t.prioridad === 'baja').length;

    const datos   = [alta, media, baja];
    const colores = ['#EF4444', '#F97316', '#22C55E'];
    const labels  = ['Alta', 'Media', 'Baja'];
    const maxVal  = Math.max(...datos, 1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = 60;
    const gap      = (canvas.width - datos.length * barWidth) / (datos.length + 1);
    const chartH   = canvas.height - 40;

    datos.forEach((val, i) => {
      const barH = (val / maxVal) * (chartH - 20);
      const x    = gap + i * (barWidth + gap);
      const y    = chartH - barH;

      ctx.fillStyle = colores[i];
      ctx.beginPath();
      (ctx as any).roundRect(x, y, barWidth, barH, 6);
      ctx.fill();

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(String(val), x + barWidth / 2, y - 4);

      ctx.fillStyle = '#6b7280';
      ctx.font = '13px sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText(labels[i], x + barWidth / 2, chartH + 8);
    });
  }

  showDialog() {
    if (this.permsSvc.hasPermission('ticket:agregar')) {
      this.visible = true;
    } else {
      this.messageService.add({
        severity: 'warn', summary: 'Sin permiso', detail: 'No tienes permiso para crear tickets'
      });
    }
  }

  crearTicket() {
    if (!this.nuevoTicket.titulo) {
      this.messageService.add({
        severity: 'warn', summary: 'Campo requerido', detail: 'El título es obligatorio'
      });
      return;
    }

    this.loading = true;

    const payload = {
      grupo_id:    this.grupoActual.id,
      titulo:      this.nuevoTicket.titulo,
      descripcion: this.nuevoTicket.descripcion,
      prioridad:   this.nuevoTicket.prioridad,
      estado:      this.nuevoTicket.estado
    };

    this.http.post<any>(this.apiUrl + '/tickets', payload, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.loading = false;
          this.visible = false;
          this.messageService.add({
            severity: 'success', summary: 'Ticket creado', detail: 'Ticket creado correctamente'
          });
          this.resetForm();
          this.cargarTickets();
        },
        error: (err) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error', summary: 'Error',
            detail: err?.error?.data?.message || 'Error al crear ticket'
          });
        }
      });
  }

  resetForm() {
    this.nuevoTicket = { titulo: '', descripcion: '', estado: 'pendiente', prioridad: 'media' };
    this.usuariosAsignados = [];
    this.nuevoEmail = '';
  }

  agregarUsuario() {
    if (!this.nuevoEmail) return;
    if (!this.usuariosAsignados.includes(this.nuevoEmail)) {
      this.usuariosAsignados.push(this.nuevoEmail);
    }
    this.nuevoEmail = '';
  }

  eliminarUsuario(email: string) {
    this.usuariosAsignados = this.usuariosAsignados.filter(u => u !== email);
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

  getEstadoClass(estado: string): string {
    const map: any = {
      pendiente:   'text-yellow-800 bg-yellow-100',
      en_progreso: 'text-blue-800 bg-blue-100',
      bloqueado:   'text-red-800 bg-red-100',
      hecho:       'text-green-800 bg-green-100'
    };
    return map[estado] || '';
  }
}
