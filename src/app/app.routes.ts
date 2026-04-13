import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { permissionGuard } from './guards/permission.guard';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then(m => m.Login)
  },

  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register').then(m => m.Register)
  },

  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout),
    canActivateChild: [authGuard],  // ← protege los hijos, no el padre
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then(m => m.Home)
      },
      {
        path: 'user',
        loadComponent: () => import('./pages/user/user').then(m => m.User)
      },
      {
        path: 'groups',
        loadComponent: () => import('./pages/groups/groups').then(m => m.Groups),
        canActivate: [permissionGuard],
        data: { permission: 'group:view' }
      },
      {
        path: 'dashboard-group',
        loadComponent: () => import('./pages/dashboard-grupo/dashboard-group').then(m => m.DashboardGrupo)
      },
      {
        path: 'kanban',
        loadComponent: () => import('./pages/kanban/kanban').then(m => m.Kanban),
        canActivate: [permissionGuard],
        data: { permission: 'ticket:view' }
      },
      {
        path: 'tickets',
        loadComponent: () => import('./pages/tickets/tickets').then(m => m.TicketLista),
        canActivate: [permissionGuard],
        data: { permission: 'ticket:view' }
      },
      {
        path: 'groups-admin',
        loadComponent: () => import('./pages/groups-admin/groups-admin').then(m => m.GroupManagementComponent),
        canActivate: [permissionGuard],
        data: { permission: 'user:manage' }
      },
      {
        path: 'groups-gestion',
        loadComponent: () => import('./pages/groups-gestion/groups-gestion').then(m => m.GroupsGestion),
        canActivate: [permissionGuard],
        data: { permission: 'group:manage' }
      },
      {
        path: 'select-group',
        loadComponent: () => import('./pages/select-group/select-group').then(m => m.GrupoSelector)
      },
    ]
  },

  { path: '**', redirectTo: 'login' }
];