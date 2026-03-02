import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}