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
import { ConfirmationService } from 'primeng/api';

interface Grupo {
  nivel: string;
  autor: string;
  nombre: string;
  integrantes: number;
  tickets: number;
  descripcion: string;
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
    ConfirmDialogModule
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
      integrantes: 10,
      tickets: 25,
      descripcion: 'Grupo de introducción a Angular'
    }
  ];

  visible: boolean = false;
  isEdit: boolean = false;
  editIndex: number | null = null;

  form: Grupo = this.resetForm();

  constructor(private confirmationService: ConfirmationService) {}

  get totalUsuarios(): number {
    return this.registros.length;
  }

  resetForm(): Grupo {
    return {
      nivel: '',
      autor: '',
      nombre: '',
      integrantes: 0,
      tickets: 0,
      descripcion: ''
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
    this.form = { ...item };
    this.visible = true;
  }

  save(): void {
    if (this.isEdit && this.editIndex !== null) {
      this.registros[this.editIndex] = { ...this.form };
    } else {
      this.registros.push({ ...this.form });
    }

    this.visible = false;
    this.form = this.resetForm();
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