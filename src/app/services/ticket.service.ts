import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TicketService {

  private apiUrl = 'http://localhost:3000/tickets';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = this.isBrowser ? localStorage.getItem('token') : '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getTickets(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }

  getTicketById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createTicket(ticket: any): Observable<any> {
    return this.http.post(this.apiUrl, ticket, { headers: this.getHeaders() });
  }

  updateTicket(id: number, ticket: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, ticket, { headers: this.getHeaders() });
  }

  updateEstado(id: number, estado: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/state`, { estado }, { headers: this.getHeaders() });
  }

  asignarTicket(id: number, asignado_id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/move`, { asignado_id }, { headers: this.getHeaders() });
  }

  deleteTicket(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}