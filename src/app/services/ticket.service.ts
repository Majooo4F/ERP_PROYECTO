import { Injectable } from '@angular/core';
import { Ticket } from '../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private tickets: Ticket[] = [
    {
      id: 1,
      titulo: 'Error en pasarela de pagos',
      descripcion: 'Los pagos con tarjeta fallan en producción.',
      estado: 'Pendiente',
      asignado: 'Juan Pérez',
      prioridad: '高',
      fechaCreacion: '2026-03-10',
      fechaLimite: '2026-03-20',
      comentarios: [],
      historial: ['Ticket creado']
    },
    {
      id: 2,
      titulo: 'Actualizar UI del dashboard',
      descripcion: 'Aplicar nuevo diseño al panel principal.',
      estado: 'En progreso',
      asignado: 'Maria Lopez',
      prioridad: '中',
      fechaCreacion: '2026-03-09',
      fechaLimite: '2026-03-18',
      comentarios: [],
      historial: ['Ticket creado']
    }
  ];

  getTickets(): Ticket[] {
    return this.tickets;
  }
}