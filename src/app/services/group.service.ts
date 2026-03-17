import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GroupService {
  private grupoSeleccionado: any;

  setGrupo(grupo: any) {
    this.grupoSeleccionado = grupo;
    localStorage.setItem('grupoSeleccionado', JSON.stringify(grupo));
  }

  getGrupo() {
    if (!this.grupoSeleccionado) {
      this.grupoSeleccionado = JSON.parse(localStorage.getItem('grupoSeleccionado') || '{}');
    }
    return this.grupoSeleccionado;
  }
}