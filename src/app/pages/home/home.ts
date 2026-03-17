import { Component, OnInit } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './home.html'
})
export class Home implements OnInit {

  constructor(private router: Router) {}

  usuario: string = '';

  grupos = [
    {
      name: 'Equipo Dev',
      color: '#3b82f6',
      modelo: 'Equipo de Desarrollo'
    },
    {
      name: 'Soporte',
      color: '#10b981',
      modelo: 'Equipo de atención al cliente'
    },
    {
      name: 'UX',
      color: '#f59e0b',
      modelo: 'Equipo de Experiencia de Usuario'
    }
  ];

  ngOnInit() {

    const email = localStorage.getItem('usuario');

    if (email) {
      this.usuario = email.split('@')[0];
    }

  }

  entrarGrupo(grupo: any) {

    localStorage.setItem('grupoActual', JSON.stringify(grupo));

    this.router.navigate(['/dashboard-group']);

  }

}

// import { Component, OnInit } from '@angular/core';    es el bueno de grupo 
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// import { CardModule } from 'primeng/card';
// import { SelectModule } from 'primeng/select';
// import { ButtonModule } from 'primeng/button';

// interface Grupo {
//   name: string;
//   code: string;
//   modelo: string;
//   color: string;
// }
// @Component({
//   selector: 'app-home',
//   standalone: true,
//   templateUrl: './home.html',
//   imports: [
//     CommonModule,
//     FormsModule,
//     CardModule,
//     SelectModule,
//     ButtonModule
//   ]
// })
// export class Home implements OnInit {

//   grupos: Grupo[] = [];

//   selectedGroup!: Grupo;

//   grupoConfirmado = false;

//   ngOnInit(){

//   this.grupos = [
//     { name: 'Equipo Dev', code: 'DEV', modelo:'GPT-4', color:'#4CAF50' },
//     { name: 'Soporte', code: 'SUP', modelo:'Claude', color:'#2196F3' },
//     { name: 'UX Design', code: 'UX', modelo:'Gemini', color:'#9C27B0' }
//   ];

// }


//   confirmGroup(){

//     this.grupoConfirmado = true;

//   }

// }

// import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// // PrimeNG Modules
// import { CardModule } from 'primeng/card';
// import { DialogModule } from 'primeng/dialog';
// import { ButtonModule } from 'primeng/button';

// @Component({
//   selector: 'app-home',
//   standalone: true,
//   imports: [CommonModule, CardModule, DialogModule, ButtonModule],
//   templateUrl: './home.html',
//   styleUrl: './home.css',
// })
// export class Home implements OnInit {
//   grupoActual: string | null = null;
//   visible: boolean = false; // Iniciamos en false para evitar parpadeos

//   grupos = [
//     { nombre: 'Equipo Dev', modelo: 'GPT-4' },
//     { nombre: 'Soporte', modelo: 'Claude' },
//     { nombre: 'UX', modelo: 'Gemini' }
//   ];

//   ngOnInit() {
//     const grupo = localStorage.getItem('grupoActual');

//     if (grupo) {
//       this.grupoActual = grupo;
//       this.visible = false;
//     } else {
//       // Si no hay grupo, mostramos el modal explícitamente
//       this.visible = true;
//     }
//   }

//   seleccionarGrupo(grupo: any) {
//     this.grupoActual = grupo.nombre;
//     localStorage.setItem('grupoActual', grupo.nombre);
//     this.visible = false;
//   }

//   // Método opcional para cambiar de grupo después
//   cambiarGrupo() {
//     this.visible = true;
//   }
// }