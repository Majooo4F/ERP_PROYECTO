import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class Auth {

  private apiUrl = 'http://localhost:3000';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/login`, { email, password });
  }

  register(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register`, payload);
  }
  // PERFIL
  getPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/perfil`);
  }

  updatePerfil(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/perfil`, data);
  }

  setToken(token: string): void {
    if (this.isBrowser) localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (this.isBrowser) return localStorage.getItem('token');
    return null;
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('permissions');
      localStorage.removeItem('grupoSeleccionado');
      localStorage.removeItem('user');
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  getPermissions(): string[] {
  if (this.isBrowser) {
    const perms = localStorage.getItem('permissions');
    return perms ? JSON.parse(perms) : [];
  }
  return [];
}

hasPermission(permission: string): boolean {
  return this.getPermissions().includes(permission);
}

// Para saber quién es el usuario actual
getUserData() {
  if (this.isBrowser) {
    const user = localStorage.getItem('user'); // Veo que lo usas en logout
    return user ? JSON.parse(user) : null;
  }
  return null;
}
}