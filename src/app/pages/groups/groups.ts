import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea'; // ✅ CAMBIO AQUÍ
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

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
    TextareaModule, // ✅ CAMBIO AQUÍ
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './groups.html'
})
export class Groups {

  registros: any[] = [];

  visible: boolean = false;
  isEdit: boolean = false;
  editIndex: number | null = null;

  form: any = this.resetForm();

  constructor(private confirmationService: ConfirmationService) {}

  get totalUsuarios() {
    return this.registros.length;
  }

  resetForm() {
    return {
      nivel: '',
      autor: '',
      nombre: '',
      integrantes: '',
      tickets: '',
      descripcion: ''
    };
  }

  openNew() {
    this.isEdit = false;
    this.editIndex = null; // buena práctica
    this.form = this.resetForm();
    this.visible = true;
  }

  edit(item: any, index: number) {
    this.isEdit = true;
    this.editIndex = index;
    this.form = { ...item };
    this.visible = true;
  }

  save() {
    if (this.isEdit && this.editIndex !== null) {
      this.registros[this.editIndex] = { ...this.form };
    } else {
      this.registros.push({ ...this.form });
    }

    this.visible = false;
    this.form = this.resetForm();
  }

  confirmDelete(index: number) {
    this.confirmationService.confirm({
      message: '¿Seguro que deseas eliminar?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.registros.splice(index, 1);
      }
    });
  }
}