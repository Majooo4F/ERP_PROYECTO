import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class Auth {

  private apiUrl = 'https://spatial-delcine-devemma-edfc3f92.koyeb.app';

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor(private http: HttpClient) {}

  // 🔐 LOGIN
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, {
      email,
      password
    });
  }

  // 💾 GUARDAR TOKEN
  setToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('token', token);
    }
  }

  // 📥 OBTENER TOKEN
  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('token');
    }
    return null;
  }

  // 🧹 LOGOUT
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('permissions');
    }
  }

  // ✅ VERIFICAR SI ESTÁ LOGUEADO
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

}