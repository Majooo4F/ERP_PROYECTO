import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { ToolbarModule } from 'primeng/toolbar';
import { Sidebar } from '../../components/sidebar/sidebar'; 

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ButtonModule,
    DrawerModule,
    ToolbarModule,
    Sidebar
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css']
})
export class MainLayout {
  visible: boolean = false;
}