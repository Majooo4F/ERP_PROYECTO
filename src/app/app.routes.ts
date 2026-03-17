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
      loadComponent: () => import('./pages/user/user').then(m => m.User),
    },
    {
      path: 'groups',
      loadComponent:() => import('./pages/groups/groups').then(m => m.Groups),
    },
    {
  path: 'select-group',
  loadComponent: () => import('./pages/select-group/select-group')
    .then(m => m.GrupoSelector)
},
{
  path: 'dashboard-group',
  loadComponent: () => import('./pages/dashboard-grupo/dashboard-group')
    .then(m => m.DashboardGrupo)
},
{
  path: 'kanban',
  loadComponent: () => import('./pages/kanban/kanban')
    .then(m => m.Kanban)
},
{
  path: 'tickets',
  loadComponent: () => import('./pages/tickets/tickets')
    .then(m => m.TicketLista)
},
{
  path: 'groups-admin',
  loadComponent: () => import('./pages/groups-admin/groups-admin')
    .then(m => m.GroupManagementComponent)
},
{
  path: 'groups-gestion',
  loadComponent: () => import('./pages/groups-gestion/groups-gestion')
    .then(m => m.GroupsGestion)
},

    ]
    
  },

  {
    path:'**',
    redirectTo: 'login'
  },
  

];