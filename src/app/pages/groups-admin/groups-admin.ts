import { Component, ViewChild, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule, Table } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-group-management',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, CommonModule, ButtonModule, DialogModule,
    InputTextModule, TableModule, MultiSelectModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './groups-admin.html'
})
export class GroupManagementComponent implements OnInit {

  @ViewChild('dt') table!: Table;

  private apiUrl = 'http://localhost:3000';

  visible = false;
  isEdit = false;
  editUserId: number | null = null;
  loading = signal(false);
  guardando = signal(false);
  showPassword = false;

  newUserForm!: FormGroup;
  editUser_model = { name: '', email: '', permissions: [] as string[] };

  users = signal<any[]>([]);
  permissionsList: any[] = [];

  permisosMap: Record<string, number> = {
    'user:view': 1, 'user:add': 2, 'user:edit': 3,
    'user:edit:profile': 4, 'user:delete': 5, 'user:manage': 6,
    'group:view': 7, 'group:add': 8, 'group:edit': 9,
    'group:delete': 10, 'group:manage': 11,
    'ticket:view': 12, 'ticket:add': 13, 'ticket:edit': 14,
    'ticket:delete': 15, 'ticket:edit:state': 16,
    'ticket:edit:comment': 17, 'ticket:manage': 18
  };

  private permisosAdmin = [6, 11, 18];

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.loadPermissions();
    this.cargarUsuarios();
    this.initForm();
  }

  initForm() {
    this.newUserForm = this.fb.group({
      usuario:         ['', Validators.required],
      nombreCompleto:  ['', Validators.required],
      email:           ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/)]],
      direccion:       ['', Validators.required],
      telefono:        ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      fechaNacimiento: ['', [Validators.required, this.validarEdad]],
      password:        ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
      confirmPassword: ['', Validators.required],
      permissions:     [[]]
    }, { validators: this.compararPasswords });
  }

  validarEdad(control: AbstractControl) {
    if (!control.value) return null;
    const fechaNac = new Date(control.value);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) edad--;
    return edad >= 18 ? null : { menorDeEdad: true };
  }

  compararPasswords(group: AbstractControl) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { notMatching: true };
  }

  togglePassword() { this.showPassword = !this.showPassword; }

  isInvalid(field: string) {
    const ctrl = this.newUserForm.get(field);
    return ctrl?.invalid && ctrl?.touched;
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  cargarUsuarios() {
    this.loading.set(true);
    this.http.get<any>(`${this.apiUrl}/users/`, { headers: this.getHeaders() })
      .subscribe({
        next: async (res) => {
          const data = res.data || [];
          const usersConPermisos = await Promise.all(
            data.map(async (u: any) => {
              try {
                const permRes: any = await this.http.get<any>(
                  `${this.apiUrl}/groups/permisos-usuario/${u.id}`,
                  { headers: this.getHeaders() }
                ).toPromise();
                const permisos = permRes?.data?.map((p: any) => p.permisos?.nombre).filter(Boolean) || [];
                return {
                  id: u.id,
                  name: u.nombre_completo,
                  email: u.email,
                  username: u.username,
                  permissions: permisos,
                  permissionsText: permisos.join(' ')
                };
              } catch {
                return {
                  id: u.id,
                  name: u.nombre_completo,
                  email: u.email,
                  username: u.username,
                  permissions: [],
                  permissionsText: ''
                };
              }
            })
          );
          this.users.set(usersConPermisos);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios'
          });
        }
      });
  }

  onFilter(event: Event) {
    if (this.table) {
      this.table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
  }

  loadPermissions() {
    const allPerms = [
      'user:view', 'user:add', 'user:edit', 'user:edit:profile', 'user:delete', 'user:manage',
      'group:view', 'group:add', 'group:edit', 'group:delete', 'group:manage',
      'ticket:view', 'ticket:add', 'ticket:edit', 'ticket:delete',
      'ticket:edit:state', 'ticket:edit:comment', 'ticket:manage'
    ];
    this.permissionsList = allPerms.map(p => ({ label: this.formatPerm(p), value: p }));
  }

  formatPerm(perm: string): string {
    return perm ? perm.replace(/:/g, ' - ') : '';
  }

  openNew() {
    this.isEdit = false;
    this.editUserId = null;
    this.showPassword = false;
    this.initForm();
    this.visible = true;
  }

  openEdit(u: any) {
    this.editUser_model = {
      name: u.name,
      email: u.email,
      permissions: [...(u.permissions || [])]
    };
    this.isEdit = true;
    this.editUserId = u.id;
    this.visible = true;
  }

  saveUser() {
    if (this.isEdit) {
      this.guardando.set(true);
      this.guardarPermisos(this.editUserId!, this.editUser_model.permissions);
      return;
    }

    if (this.newUserForm.invalid) {
      this.newUserForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn', summary: 'Formulario inválido', detail: 'Revisa los campos en rojo.'
      });
      return;
    }

    this.guardando.set(true);

    const { usuario, nombreCompleto, email, password, confirmPassword, direccion, telefono, fechaNacimiento, permissions } = this.newUserForm.value;

    this.http.post<any>(
      `${this.apiUrl}/users/admin`,
      { username: usuario, nombre_completo: nombreCompleto, email, password, confirmPassword, direccion, telefono, fechaNacimiento, permisos: [] },
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        const nuevoId = res.data?.user?.id;
        if (nuevoId && permissions.length > 0) {
          this.guardarPermisos(nuevoId, permissions);
        } else {
          this.guardando.set(false);
          this.visible = false;
          this.messageService.add({
            severity: 'success', summary: 'Creado', detail: 'Usuario creado correctamente'
          });
          this.cargarUsuarios();
        }
      },
      error: (err) => {
        this.guardando.set(false);
        this.messageService.add({
          severity: 'error', summary: 'Error',
          detail: err?.error?.data?.message || 'Error al crear usuario'
        });
      }
    });
  }

  async guardarPermisos(usuarioId: number, permisos: string[]) {
    const grupoId = 7;

    try {
      await this.http.delete<any>(
        `${this.apiUrl}/groups/${grupoId}/usuario/${usuarioId}/permisos`,
        { headers: this.getHeaders() }
      ).toPromise();
    } catch {}

    await new Promise(resolve => setTimeout(resolve, 300));

    if (permisos.length > 0) {
      const permisosIds = permisos
        .map(p => this.permisosMap[p])
        .filter(id => !!id && !this.permisosAdmin.includes(id));

      for (const permisoId of permisosIds) {
        try {
          await this.http.post<any>(
            `${this.apiUrl}/groups/${grupoId}/permisos`,
            { usuario_id: usuarioId, permiso_id: permisoId },
            { headers: this.getHeaders() }
          ).toPromise();
        } catch (err: any) {
          console.error('Error en permiso:', permisoId, err);
        }
      }
    }

    this.guardando.set(false);
    this.visible = false;
    this.messageService.add({
      severity: 'success', summary: 'Guardado',
      detail: permisos.length === 0 ? 'Todos los permisos fueron eliminados' : 'Permisos guardados correctamente'
    });
    this.cargarUsuarios();
  }

  deleteUser(u: any) {
    this.http.delete<any>(
      `${this.apiUrl}/users/admin/${u.id}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success', summary: 'Eliminado', detail: 'Usuario eliminado'
        });
        this.cargarUsuarios();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error', summary: 'Error',
          detail: err?.error?.data?.message || 'Error al eliminar usuario'
        });
      }
    });
  }

  selectAll() {
    if (this.isEdit) {
      this.editUser_model.permissions = this.permissionsList.map(p => p.value);
    } else {
      this.newUserForm.patchValue({ permissions: this.permissionsList.map(p => p.value) });
    }
  }

  clearAll() {
    if (this.isEdit) {
      this.editUser_model.permissions = [];
    } else {
      this.newUserForm.patchValue({ permissions: [] });
    }
  }
}