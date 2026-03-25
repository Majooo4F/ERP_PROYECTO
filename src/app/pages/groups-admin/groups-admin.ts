// import { Component, ViewChild } from '@angular/core';
// import { FormsModule } from '@angular/forms';

// import { ButtonModule } from 'primeng/button';
// import { DialogModule } from 'primeng/dialog';
// import { InputTextModule } from 'primeng/inputtext';
// import { TableModule } from 'primeng/table';
// import { Table } from 'primeng/table';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-group-management',
//   standalone: true,
//   imports: [
//     FormsModule,
//     ButtonModule,
//     DialogModule,
//     InputTextModule,
//     TableModule,
//     CommonModule
//   ],
//   templateUrl: './groups-admin.html'
// })
// export class GroupManagementComponent {

//   @ViewChild('dt') table!: Table;

//   visible: boolean = false;
//   isEdit: boolean = false;
//   editIndex: number | null = null;

//   user = {
//     name: '',
//     email: '',
//     role: ''
//   };

//   users: any[] = [
//     {
//       name: 'Jonathan Cruz',
//       email: 'jonathan@ulteq.edu.mx',
//       role: 'admin:all'
//     },
//     {
//       name: 'Usuario Prueba',
//       email: 'test@anteiku.com',
//       role: 'groups:view'
//     }
//   ];

//   openNew() {
//     this.user = { name: '', email: '', role: '' };
//     this.isEdit = false;
//     this.editIndex = null;
//     this.visible = true;
//   }

//   editUser(user: any, index: number) {
//     this.user = { ...user };
//     this.isEdit = true;
//     this.editIndex = index;
//     this.visible = true;
//   }

//   saveUser() {

//     if (this.isEdit && this.editIndex !== null) {

//       this.users[this.editIndex] = { ...this.user };

//     } else {

//       this.users.push({ ...this.user });

//     }

//     this.visible = false;
//   }

//   deleteUser(index: number) {
//     this.users.splice(index, 1);
//   }

// }
import { Component, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule, Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-group-management',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TableModule,
    CommonModule,
    MultiSelectModule
  ],
  templateUrl: './groups-admin.html'
})
export class GroupManagementComponent implements OnInit {

  @ViewChild('dt') table!: Table;

  visible: boolean = false;
  isEdit: boolean = false;
  editIndex: number | null = null;

  // 🔥 SIN ROLE
  user = {
    name: '',
    email: '',
    permissions: [] as string[]
  };

  users: any[] = [
  {
    name: 'Jonathan Cruz',
    email: 'jonathan@ulteq.edu.mx',
    permissions: ['user:view', 'user:add'],
    permissionsText: 'user:view user:add'
  },
  {
    name: 'Usuario Prueba',
    email: 'test@anteiku.com',
    permissions: ['group:view'],
    permissionsText: 'group:view'
  }
];

  permissionsList: any[] = [];

  ngOnInit() {
    this.loadPermissions();
  }

  // 🔥 TODOS LOS PERMISOS
  loadPermissions() {
    const allPerms = [
      'user:view','user:add','user:edit','user:edit:profile','user:delete','user:manage',
      'group:view','group:add','group:edit','group:delete','group:manage',
      'ticket:view','ticket:add','ticket:edit','ticket:delete','ticket:edit:state','ticket:edit:comment','ticket:manage'
    ];

    this.permissionsList = allPerms.map(p => ({
      label: this.formatPerm(p),
      value: p
    }));
  }

  formatPerm(perm: string): string {
    return perm ? perm.replace(/:/g, ' - ') : '';
  }

  openNew() {
    this.user = { name: '', email: '', permissions: [] };
    this.isEdit = false;
    this.editIndex = null;
    this.visible = true;
  }

  editUser(user: any, index: number) {
    this.user = {
      ...user,
      permissions: user.permissions ? [...user.permissions] : []
    };

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

  // 🔥 OPCIONAL (ADMIN SELECT ALL)
  selectAll() {
    this.user.permissions = this.permissionsList.map(p => p.value);
  }

  clearAll() {
    this.user.permissions = [];
  }

}