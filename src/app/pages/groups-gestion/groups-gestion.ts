import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-groups-gestion',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TableModule
  ],
  templateUrl: './groups-gestion.html',
  styleUrls: ['./groups-gestion.css']
})
export class GroupsGestion {

  @ViewChild('dt') table!: Table;

  visible: boolean = false;

  groupName: string = 'Equipo DEV';

  user = {
    name: '',
    email: '',
    role: 'Miembro',
    date: ''
  };

  users: any[] = [
    {
      name: 'Jonathan Cruz',
      email: 'jonathan@uteq.edu.mx',
      role: 'Admin',
      date: '2026-01-20'
    },
    {
      name: 'Emmanuel R.',
      email: 'emmanuel@dev.com',
      role: 'Miembro',
      date: '2026-02-15'
    }
  ];

  openNew() {
    this.user = {
      name: '',
      email: '',
      role: 'Miembro',
      date: ''
    };
    this.visible = true;
  }

  saveUser() {
    // Asignar nombre por defecto y fecha
    this.user.name = 'Nuevo Usuario';
    this.user.date = new Date().toISOString().split('T')[0];

    this.users.push({ ...this.user });
    this.visible = false;
  }

  deleteUser(index: number) {
    this.users.splice(index, 1);
  }

  saveGroup() {
    console.log("Grupo actualizado:", this.groupName);
  }
}