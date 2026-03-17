import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { PermissionService } from '../../services/permission.service';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-grupo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    RouterLink,
    SelectModule,
    
  ],
  templateUrl: './dashboard-group.html'
})
export class DashboardGrupo implements OnInit {

  grupoActual: any;

  visible: boolean = false;

  total = 12;
  pendientes = 4;
  progreso = 3;
  hechos = 4;
  bloqueados = 1;

  ticketsRecientes = [
    { titulo: 'Error login', estado: 'Pendiente' },
    { titulo: 'Actualizar UI', estado: 'En progreso' },
    { titulo: 'Bug Kanban', estado: 'Bloqueado' }
  ];
constructor(public permsSvc: PermissionService) {}

  nuevoTicket = {
    titulo: '',
    descripcion: '',
    estado: 'Pendiente',
    prioridad: 'Media',
    asignado: ''
  };
  nuevoEmail: string = '';

usuariosAsignados: string[] = [];
prioridades = [
  { label: 'Baja', value: 'Baja' },
  { label: 'Media', value: 'Media' },
  { label: 'Alta', value: 'Alta' }
];
estados = [
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'En progreso', value: 'En progreso' },
  { label: 'Bloqueado', value: 'Bloqueado' },
  { label: 'Hecho', value: 'Hecho' }
];
  ngOnInit() {
    const data = localStorage.getItem('grupoActual');
    this.grupoActual = data ? JSON.parse(data) : null;
  }

 showDialog() {
  if (this.permsSvc.hasPermission('ticket:add')) {
    this.visible = true;
  } else {
    alert('No tienes permiso para crear tickets');
  }
}

crearTicket() {

  if (!this.nuevoTicket.titulo) {
    alert('El título es obligatorio');
    return;
  }

  const ticket = {
    titulo: this.nuevoTicket.titulo,
    descripcion: this.nuevoTicket.descripcion,
    estado: this.nuevoTicket.estado,
    prioridad: this.nuevoTicket.prioridad,
    asignados: [...this.usuariosAsignados]
  };

  this.ticketsRecientes.unshift(ticket);


  this.total++;

  if (ticket.estado === 'Pendiente') this.pendientes++;
  if (ticket.estado === 'En progreso') this.progreso++;
  if (ticket.estado === 'Hecho') this.hechos++;
  if (ticket.estado === 'Bloqueado') this.bloqueados++;

  this.visible = false;

  // Limpiar formulario
  this.nuevoTicket = {
    titulo: '',
    descripcion: '',
    estado: 'Pendiente',
    prioridad: 'Media',
    asignado: ''
  };

  // Limpiar usuarios asignados
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
  this.usuariosAsignados = this.usuariosAsignados.filter(
    user => user !== email
  );
}

}