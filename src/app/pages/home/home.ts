import { Component, OnInit, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './home.html'
})
export class Home implements OnInit {

  usuario: string = '';
  grupos: any[] = [];
  loading = false;
  cargado = false;

  private apiUrl = 'http://localhost:3000';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.isBrowser) return;
    const stored = localStorage.getItem('usuario');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        this.usuario = user.username || user.email?.split('@')[0] || '';
      } catch {
        this.usuario = stored.split('@')[0];
      }
    }
    setTimeout(() => this.cargarGrupos());
  }

  cargarGrupos() {
    if (!this.isBrowser) return;
    this.loading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(`${this.apiUrl}/groups`, { headers }).subscribe({
      next: (res) => {
        this.grupos = res.data || [];
        this.loading = false;
        this.cargado = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.grupos = [];
        this.loading = false;
        this.cargado = true;
        this.cdr.detectChanges();
      }
    });
  }

  entrarGrupo(grupo: any) {
    if (!this.isBrowser) return;
    localStorage.setItem('grupoSeleccionado', JSON.stringify(grupo));
    this.router.navigate(['/dashboard-group']);
  }

  colores = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

  getColor(index: number): string {
    return this.colores[index % this.colores.length];
  }
}
