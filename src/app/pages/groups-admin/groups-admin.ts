import { Component, ViewChild, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  visible = false;
  isEdit = false;
  editUserId: number | null = null;
  loading = signal(true);
  guardando = signal(false);
  showPassword = false;

  newUserForm!: FormGroup;
  editUser_model = { name: '', email: '', permissions: [] as string[] };

  users = signal<any[]>([]);
  permissionsList: any[] = [];

  private grupoId = signal<number | null>(null);
  grupoActivo = signal<{ id: number; nombre?: string; descripcion?: string } | null>(null);
  gruposDisponibles = signal<Array<{ id: number; nombre?: string; descripcion?: string }>>([]);
  private catalogoPermisos = signal<Array<{ id: number; nombre: string; descripcion: string | null }>>([]);
  private permisoNombreToId = new Map<string, number>();

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    if (this.isBrowser) this.syncGrupoActivoDesdeStorage();
    if (this.isBrowser) this.cargarListaGrupos();
    this.loadPermissions();
    this.initForm();
    if (!this.isBrowser) return;
    this.cargarUsuarios();
  }

  private syncGrupoActivoDesdeStorage() {
    const storedGrupo = localStorage.getItem('grupoSeleccionado');
    if (storedGrupo && storedGrupo !== 'undefined') {
      try {
        const parsed = JSON.parse(storedGrupo);
        if (parsed?.id) {
          this.grupoId.set(Number(parsed.id));
          this.grupoActivo.set({ id: Number(parsed.id), nombre: parsed.nombre });
          return;
        }
      } catch {}
    }

    const storedContext = localStorage.getItem('groupContext');
    if (storedContext && storedContext !== 'undefined') {
      try {
        const parsed = JSON.parse(storedContext);
        if (parsed !== null && parsed !== undefined) {
          this.grupoId.set(Number(parsed));
          this.grupoActivo.set({ id: Number(parsed) });
          return;
        }
      } catch {}
    }

    this.grupoId.set(null);
    this.grupoActivo.set(null);
  }

  private cargarListaGrupos() {
    const stored = localStorage.getItem('grupos');
    if (stored && stored !== 'undefined') {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.gruposDisponibles.set(parsed.map((g: any) => ({ id: Number(g.id), nombre: g.nombre, descripcion: g.descripcion })));
          return;
        }
      } catch {}
    }

    this.http.get<any>(`${this.apiUrl}/groups`, { headers: this.getHeaders() })
      .subscribe({
        next: (res) => {
          const data = Array.isArray(res?.data) ? res.data : [];
          this.gruposDisponibles.set(data.map((g: any) => ({ id: Number(g.id), nombre: g.nombre, descripcion: g.descripcion })));
        },
        error: () => {
          this.gruposDisponibles.set([]);
        }
      });
  }

  onChangeGrupoActivo(grupoIdStr: string) {
    const grupoId = Number(grupoIdStr);
    if (!Number.isFinite(grupoId) || grupoId <= 0) return;

    const grupo = this.gruposDisponibles().find(g => g.id === grupoId) ?? { id: grupoId };
    this.grupoId.set(grupoId);
    this.grupoActivo.set(grupo);

    if (this.isBrowser) {
      localStorage.setItem('groupContext', JSON.stringify(grupoId));
      localStorage.setItem('grupoSeleccionado', JSON.stringify(grupo));
    }

    this.cargarUsuarios();
  }

  private resolveGrupoId(): number | null {
    const storedGrupo = localStorage.getItem('grupoSeleccionado');
    if (storedGrupo && storedGrupo !== 'undefined') {
      try {
        const parsed = JSON.parse(storedGrupo);
        if (parsed?.id) return Number(parsed.id);
      } catch {}
    }

    const storedContext = localStorage.getItem('groupContext');
    if (storedContext && storedContext !== 'undefined') {
      try {
        const parsed = JSON.parse(storedContext);
        if (parsed !== null && parsed !== undefined) return Number(parsed);
      } catch {}
    }

    const storedGrupos = localStorage.getItem('grupos');
    if (storedGrupos && storedGrupos !== 'undefined') {
      try {
        const parsed = JSON.parse(storedGrupos);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.id) return Number(parsed[0].id);
      } catch {}
    }

    return null;
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
    const token = this.isBrowser ? localStorage.getItem('token') : null;
    return new HttpHeaders({ Authorization: `Bearer ${token ?? ''}` });
  }

  cargarUsuarios() {
    this.loading.set(true);
    this.http.get<any>(`${this.apiUrl}/users/`, { headers: this.getHeaders() })
      .subscribe({
        next: async (res) => {
          const data = res.data || [];
          if (this.isBrowser) this.syncGrupoActivoDesdeStorage();
          const grupoId = this.grupoId();
          const usersConPermisos = await Promise.all(
            data.map(async (u: any) => {
              try {
                const url = grupoId
                  ? `${this.apiUrl}/groups/${grupoId}/permisos/usuario/${u.id}`
                  : `${this.apiUrl}/groups/permisos-usuario/${u.id}`;

                const permRes: any = await this.http.get<any>(url, { headers: this.getHeaders() }).toPromise();

                const permisos = (permRes?.data ?? [])
                  .map((p: any) => p?.permisos?.nombre)
                  .filter(Boolean);

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
  this.http.get<any>(`${this.apiUrl}/groups/permisos-catalogo`, { headers: this.getHeaders() })
    .subscribe({
      next: (res) => {
        const raw = Array.isArray(res?.data) ? res.data : [];

        // Solo excluir "admin" (super admin global, no asignable manualmente)
        const data = raw.filter((p: any) => p?.nombre !== 'admin');

        setTimeout(() => {
          this.catalogoPermisos.set(data);
          this.permisoNombreToId = new Map(data.map((p: any) => [p.nombre, p.id]));
          this.permissionsList = data.map((p: any) => ({
            label: this.formatPerm(p.nombre),
            value: p.nombre
          }));
        }, 0);
      },
      error: () => {
        this.permissionsList = [];
        this.catalogoPermisos.set([]);
        this.permisoNombreToId.clear();
        this.messageService.add({
          severity: 'error', summary: 'Error', detail: 'No se pudo cargar el catálogo de permisos'
        });
      }
    });
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
  if (this.isBrowser) this.syncGrupoActivoDesdeStorage();
  const grupoId = this.grupoId();
  if (!grupoId) {
    this.guardando.set(false);
    this.messageService.add({
      severity: 'warn', summary: 'Sin grupo', detail: 'Selecciona un grupo antes de asignar permisos'
    });
    return;
  }

  try {
    await this.http.delete<any>(
      `${this.apiUrl}/groups/${grupoId}/usuario/${usuarioId}/permisos`,
      { headers: this.getHeaders() }
    ).toPromise();
  } catch {}

  await new Promise(resolve => setTimeout(resolve, 300));

  if (permisos.length > 0) {
    // El backend rechaza "admin" — no necesitamos filtrarlo aquí
    const permisosIds = permisos
      .map(p => this.permisoNombreToId.get(p))
      .filter((id): id is number => typeof id === 'number' && id > 0);

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
