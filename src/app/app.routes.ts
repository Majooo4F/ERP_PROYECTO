import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';

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
  },


  { 
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then(m => m.Home),
        
      },
    {
      path: 'user',
      loadComponent: () => import('./pages/user/user').then(m => m.User)
    }
    ]
  },

  {
    path:'**',
    redirectTo: 'login'
  },
  

];