// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// import { CardModule } from 'primeng/card';
// import { ButtonModule } from 'primeng/button';
// import { TableModule } from 'primeng/table';
// import { DialogModule } from 'primeng/dialog';
// import { InputTextModule } from 'primeng/inputtext';
// import { TextareaModule } from 'primeng/textarea';
// import { ConfirmDialogModule } from 'primeng/confirmdialog';
// import { ConfirmationService } from 'primeng/api';

// interface Grupo {
//   nivel: string;
//   autor: string;
//   nombre: string;
//   integrantes: number;
//   tickets: number;
//   descripcion: string;
// }

// @Component({
//   selector: 'app-groups',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     CardModule,
//     ButtonModule,
//     TableModule,
//     DialogModule,
//     InputTextModule,
//     TextareaModule,
//     ConfirmDialogModule
//   ],
//   providers: [ConfirmationService],
//   templateUrl: './groups.html'
// })
// export class Groups {

//   registros: Grupo[] = [
//     {
//       nivel: 'Básico',
//       autor: 'Juan Pérez',
//       nombre: 'Grupo Angular',
//       integrantes: 10,
//       tickets: 25,
//       descripcion: 'Grupo de introducción a Angular'
//     }
//   ];

//   visible: boolean = false;
//   isEdit: boolean = false;
//   editIndex: number | null = null;

//   form: Grupo = this.resetForm();

//   constructor(private confirmationService: ConfirmationService) {}

//   get totalUsuarios(): number {
//     return this.registros.length;
//   }

//   resetForm(): Grupo {
//     return {
//       nivel: '',
//       autor: '',
//       nombre: '',
//       integrantes: 0,
//       tickets: 0,
//       descripcion: ''
//     };
//   }

//   openNew(): void {
//     this.isEdit = false;
//     this.editIndex = null;
//     this.form = this.resetForm();
//     this.visible = true;
//   }

//   edit(item: Grupo, index: number): void {
//     this.isEdit = true;
//     this.editIndex = index;
//     this.form = { ...item };
//     this.visible = true;
//   }

//   save(): void {
//     if (this.isEdit && this.editIndex !== null) {
//       this.registros[this.editIndex] = { ...this.form };
//     } else {
//       this.registros.push({ ...this.form });
//     }

//     this.visible = false;
//     this.form = this.resetForm();
//   }

//   confirmDelete(index: number): void {
//     this.confirmationService.confirm({
//       message: '¿Seguro que deseas eliminar este grupo?',
//       header: 'Confirmar eliminación',
//       icon: 'pi pi-exclamation-triangle',
//       accept: () => {
//         this.registros.splice(index, 1);
//       }
//     });
//   }
// }
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AvatarModule } from 'primeng/avatar'; // Añadido para el diseño de lista
import { ConfirmationService } from 'primeng/api';

import { HasPermissionDirective } from '../../directives/has-permission.directive';

interface UsuarioGrupo {
  nombre: string;
  email: string;
}

interface Grupo {
  nivel: string;
  autor: string;
  nombre: string;
  integrantes: number;
  tickets: number;
  descripcion: string;
  usuarios: UsuarioGrupo[]; // Cambiado de string[] a objeto
}

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    ConfirmDialogModule,
    AvatarModule,
    HasPermissionDirective
  ],
  providers: [ConfirmationService],
  templateUrl: './groups.html'
})
export class Groups {

  registros: Grupo[] = [
    {
      nivel: 'Básico',
      autor: 'Juan Pérez',
      nombre: 'Grupo Angular',
      integrantes: 2,
      tickets: 25,
      descripcion: 'Grupo de introducción a Angular',
      usuarios: [
        { nombre: 'Juan Pérez', email: 'juan@gmail.com' },
        { nombre: 'Ana García', email: 'ana@gmail.com' }
      ]
    }
  ];

  visible: boolean = false;
  isEdit: boolean = false;
  editIndex: number | null = null;
  nuevoEmail: string = '';

  form: Grupo = this.resetForm();

  constructor(private confirmationService: ConfirmationService) {}

  resetForm(): Grupo {
    return {
      nivel: '',
      autor: '',
      nombre: '',
      integrantes: 0,
      tickets: 0,
      descripcion: '',
      usuarios: []
    };
  }

  openNew(): void {
    this.isEdit = false;
    this.editIndex = null;
    this.form = this.resetForm();
    this.visible = true;
  }

  edit(item: Grupo, index: number): void {
    this.isEdit = true;
    this.editIndex = index;
    // Deep copy para evitar editar la tabla directamente
    this.form = JSON.parse(JSON.stringify(item));
    this.visible = true;
  }

  agregarUsuario() {
    if (!this.nuevoEmail || !this.nuevoEmail.includes('@')) return;

    // Lógica temporal: Extraer nombre del email para que no aparezca vacío
    const nombreExtraido = this.nuevoEmail.split('@')[0];
    const capitalizado = nombreExtraido.charAt(0).toUpperCase() + nombreExtraido.slice(1);

    this.form.usuarios.push({
      nombre: capitalizado,
      email: this.nuevoEmail
    });

    this.form.integrantes = this.form.usuarios.length;
    this.nuevoEmail = '';
  }

  eliminarUsuario(index: number) {
    this.form.usuarios.splice(index, 1);
    this.form.integrantes = this.form.usuarios.length;
  }

  save(): void {
    if (this.isEdit && this.editIndex !== null) {
      this.registros[this.editIndex] = { ...this.form };
    } else {
      this.registros.push({ ...this.form });
    }
    this.visible = false;
  }

  confirmDelete(index: number): void {
    this.confirmationService.confirm({
      message: '¿Seguro que deseas eliminar este grupo?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.registros.splice(index, 1);
      }
    });
  }
}