// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';

// // PrimeNG
// import { TableModule } from 'primeng/table';
// import { DialogModule } from 'primeng/dialog';
// import { ButtonModule } from 'primeng/button';
// import { InputTextModule } from 'primeng/inputtext';
// import { SelectModule } from 'primeng/select';
// import { TagModule } from 'primeng/tag';


// interface Ticket {
//   id: number;
//   titulo: string;
//   estado: string;
//   asignado: string;
//   prioridad: string;
//   fechaLimite: string;
// }

// @Component({
//   selector: 'app-ticket-lista',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     ReactiveFormsModule,
//     TableModule,
//     DialogModule,
//     ButtonModule,
//     InputTextModule,
//     SelectModule,
//     TagModule,
    
//   ],
//   templateUrl: './tickets.html'
// })
// export class TicketLista implements OnInit {

//   usuarioActual = 'Juan';

//   filtros = [
//     { label: 'Mis tickets', value: 'misTickets' },
//     { label: 'Sin asignar', value: 'sinAsignar' },
//     { label: 'Prioridad alta', value: 'prioridadAlta' }
//   ];
//   filtroRapido: string = '';

//   tickets: Ticket[] = [
//     { id: 1, titulo: 'Error login', estado: 'Pendiente', asignado: 'Juan', prioridad: 'Alta', fechaLimite: '2026-03-20' },
//     { id: 2, titulo: 'Actualizar UI', estado: 'En progreso', asignado: '', prioridad: 'Media', fechaLimite: '2026-03-18' },
//     { id: 3, titulo: 'Agregar filtro', estado: 'Bloqueado', asignado: 'Maria', prioridad: 'Urgente', fechaLimite: '2026-03-22' }
//   ];

//   ticketsFiltrados: Ticket[] = [];

//   estados = ['Pendiente', 'En progreso', 'Bloqueado', 'Resuelto'];
//   prioridades = [
//     { label: 'Muy urgente', value: 'Muy urgente' },
//     { label: 'Urgente', value: 'Urgente' },
//     { label: 'Alta', value: 'Alta' },
//     { label: 'Media', value: 'Media' },
//     { label: 'Baja', value: 'Baja' }
//   ];
//   usuarios = ['Juan', 'Maria', 'Admin', 'Pedro'];

//   displayDialog = false;
//   ticketForm: FormGroup;
//   selectedTicket: Ticket | null = null;

//   constructor(private fb: FormBuilder) {
//     this.ticketForm = this.fb.group({
//       titulo: [''],
//       estado: [''],
//       asignado: [''],
//       prioridad: [''],
//       fechaLimite: ['']
//     });
//   }

//   ngOnInit() {
//     this.ticketsFiltrados = [...this.tickets];
//   }

//   aplicarFiltroRapido(filtro: string) {
//     this.filtroRapido = filtro;
//     switch (filtro) {
//       case 'misTickets':
//         this.ticketsFiltrados = this.tickets.filter(t => t.asignado === this.usuarioActual);
//         break;
//       case 'sinAsignar':
//         this.ticketsFiltrados = this.tickets.filter(t => !t.asignado);
//         break;
//       case 'prioridadAlta':
//         this.ticketsFiltrados = this.tickets.filter(t => ['Muy urgente','Urgente','Alta'].includes(t.prioridad));
//         break;
//       default:
//         this.ticketsFiltrados = [...this.tickets];
//     }
//   }

//   editarTicket(ticket: Ticket) {
//     this.selectedTicket = { ...ticket };
//     this.ticketForm.patchValue(this.selectedTicket);
//     this.displayDialog = true;
//   }

//   guardarCambios() {
//     if (!this.selectedTicket) return;

//     const values = this.ticketForm.getRawValue();
//     const index = this.tickets.findIndex(t => t.id === this.selectedTicket!.id);

//     if (index > -1) {
//       this.tickets[index] = { ...this.tickets[index], ...values };
//       this.aplicarFiltroRapido(this.filtroRapido);
//     }

//     this.displayDialog = false;
//   }

//   eliminarTicket(ticket: Ticket) {
//     this.tickets = this.tickets.filter(t => t.id !== ticket.id);
//     this.aplicarFiltroRapido(this.filtroRapido);
//   }
// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  asignado: string;
  prioridad: string;
  fechaCreacion: string;
  fechaLimite: string;
  creadoPor: string;
  historial: string[];
  comentarios: string[];
}

@Component({
  selector: 'app-ticket-lista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    TagModule
  ],
  templateUrl: './tickets.html'
})
export class TicketLista implements OnInit {
  usuarioActual = 'Juan';

  // Filtros rápidos
 filtros = [
  { label: 'Todos', value: 'todos' },          
  { label: 'Mis tickets', value: 'misTickets' },
  { label: 'Sin asignar', value: 'sinAsignar' },
  { label: 'Prioridad alta', value: 'prioridadAlta' }
];
filtroRapido: string = 'todos'; 

  tickets: Ticket[] = [
    { id: 1, titulo: 'Error login', descripcion: 'No permite entrar con OAuth', estado: 'Pendiente', asignado: 'Juan', prioridad: 'Alta', fechaCreacion: '2026-03-01', fechaLimite: '2026-03-20', creadoPor: 'Admin', historial: [], comentarios: [] },
    { id: 2, titulo: 'Actualizar UI', descripcion: 'Cambiar colores de botones', estado: 'En progreso', asignado: '', prioridad: 'Media', fechaCreacion: '2026-03-05', fechaLimite: '2026-03-18', creadoPor: 'Juan', historial: [], comentarios: [] }
  ];

  ticketsFiltrados: Ticket[] = [];

  prioridades = [
    { label: 'Muy urgente', value: 'Muy urgente' },
    { label: 'Urgente', value: 'Urgente' },
    { label: 'Alta', value: 'Alta' },
    { label: 'Media', value: 'Media' },
    { label: 'Baja', value: 'Baja' },
    { label: 'Muy baja', value: 'Muy baja' },
    { label: 'Insignificante', value: 'Insignificante' }
  ];

  estados = ['Pendiente', 'En progreso', 'Bloqueado', 'Resuelto'];
  usuarios = ['Juan', 'Maria', 'Admin', 'Pedro'];

  displayDialog: boolean = false;
  ticketForm: FormGroup;
  selectedTicket: Ticket | null = null;

  constructor(private fb: FormBuilder) {
    this.ticketForm = this.fb.group({
      titulo: [''],
      descripcion: [''],
      estado: [''],
      asignado: [''],
      prioridad: [''],
      fechaLimite: [''],
      nuevoComentario: ['']
    });
  }

  ngOnInit() {
    this.ticketsFiltrados = [...this.tickets];
  }

  aplicarFiltroRapido(filtro: string) {
  this.filtroRapido = filtro;

  switch (filtro) {
    case 'misTickets':
      this.ticketsFiltrados = this.tickets.filter(t => t.asignado === this.usuarioActual);
      break;
    case 'sinAsignar':
      this.ticketsFiltrados = this.tickets.filter(t => !t.asignado);
      break;
    case 'prioridadAlta':
      this.ticketsFiltrados = this.tickets.filter(t => ['Muy urgente','Urgente','Alta'].includes(t.prioridad));
      break;
    case 'todos':
    default:
      this.ticketsFiltrados = [...this.tickets]; // muestra todos
      break;
  }
}

  editarTicket(ticket: Ticket) {
    this.selectedTicket = { ...ticket };
    this.ticketForm.patchValue(this.selectedTicket);
    this.ticketForm.enable();
    this.displayDialog = true;
  }

  guardarCambios() {
    if (!this.selectedTicket) return;

    const values = this.ticketForm.getRawValue();
    const index = this.tickets.findIndex(t => t.id === this.selectedTicket!.id);
    const original = this.tickets[index];

    if (original.estado !== values.estado) {
      this.selectedTicket.historial.push(`${this.usuarioActual} cambió el estado de "${original.estado}" a "${values.estado}" el ${new Date().toLocaleString()}`);
    }
    if (original.asignado !== values.asignado) {
      this.selectedTicket.historial.push(`${this.usuarioActual} reasignó el ticket a ${values.asignado} el ${new Date().toLocaleString()}`);
    }
    if (original.prioridad !== values.prioridad) {
      this.selectedTicket.historial.push(`${this.usuarioActual} cambió la prioridad a ${values.prioridad}`);
    }
    if (values.nuevoComentario) {
      this.selectedTicket.comentarios.push(`${this.usuarioActual}: ${values.nuevoComentario}`);
    }

    this.tickets[index] = { ...this.selectedTicket, ...values, nuevoComentario: '' };
    this.aplicarFiltroRapido(this.filtroRapido);
    this.displayDialog = false;
  }

  eliminarTicket(ticket: Ticket) {
    this.tickets = this.tickets.filter(t => t.id !== ticket.id);
    this.aplicarFiltroRapido(this.filtroRapido);
  }
}