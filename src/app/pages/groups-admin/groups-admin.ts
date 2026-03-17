import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-group-management',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TableModule,
    CommonModule
  ],
  templateUrl: './groups-admin.html'
})
export class GroupManagementComponent {

  @ViewChild('dt') table!: Table;

  visible: boolean = false;
  isEdit: boolean = false;
  editIndex: number | null = null;

  user = {
    name: '',
    email: '',
    role: ''
  };

  users: any[] = [
    {
      name: 'Jonathan Cruz',
      email: 'jonathan@ulteq.edu.mx',
      role: 'admin:all'
    },
    {
      name: 'Usuario Prueba',
      email: 'test@anteiku.com',
      role: 'groups:view'
    }
  ];

  openNew() {
    this.user = { name: '', email: '', role: '' };
    this.isEdit = false;
    this.editIndex = null;
    this.visible = true;
  }

  editUser(user: any, index: number) {
    this.user = { ...user };
    this.isEdit = true;
    this.editIndex = index;
    this.visible = true;
  }

  saveUser() {

    if (this.isEdit && this.editIndex !== null) {

      this.users[this.editIndex] = { ...this.user };

    } else {

      this.users.push({ ...this.user });

    }

    this.visible = false;
  }

  deleteUser(index: number) {
    this.users.splice(index, 1);
  }

}