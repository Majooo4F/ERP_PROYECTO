import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button'; // Opcional, para un botón de confirmar

interface Grupo {
  name: string;
  modelo: string;
  color: string;
}

@Component({
  selector: 'app-grupo-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, ButtonModule],
  templateUrl: './select-group.html'
})
export class GrupoSelector {
  gruposUsuario: Grupo[] = [
    { name: 'Equipo Dev', modelo: 'GPT-4', color: '#6366f1' },
    { name: 'Soporte', modelo: 'GPT-3.5', color: '#10b981' },
    { name: 'UX', modelo: 'Claude', color: '#f59e0b' }
  ];

  grupoSeleccionado: Grupo | undefined;

  constructor(private router: Router) {}

  // Se dispara cuando el usuario elige una opción
  onGroupChange(grupo: Grupo) {
    if (grupo) {
      localStorage.setItem('grupoActual', JSON.stringify(grupo));
      this.router.navigate(['/dashboard-group']);
    }
  }
}