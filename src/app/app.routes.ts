import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  { 
    path: 'loading', 
    loadComponent: () => import('./pages/landing/loading/loading').then(m => m.Loading) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./pages/auth/register/register').then(m => m.Register) 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/auth/login/login').then(m => m.Login) 
  }
];