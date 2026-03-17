import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DragDropModule,CdkDragDrop,moveItemInArray,transferArrayItem } from '@angular/cdk/drag-drop';

interface Ticket{
titulo:string;
asignado:string;
prioridad:string;
fecha:string;
estado:string;
}

@Component({
selector:'app-kanban',
standalone:true,
imports:[
CommonModule,
CardModule,
ButtonModule,
TagModule,
DragDropModule,
DialogModule,
InputTextModule,
FormsModule,
SelectModule,
ToggleSwitchModule
],
templateUrl:'./kanban.html',
})
export class Kanban{

modoLista:boolean=false;
visible:boolean=false;
visibleCrear:boolean=false;
ticketOriginal!:Ticket;

ticketSeleccionado:Ticket={
titulo:'',
asignado:'',
prioridad:'',
fecha:'',
estado:''
};

nuevoTicket={
titulo:'',
descripcion:'',
estado:'Pendiente',
prioridad:'',
asignado:'',
fecha:''
};

prioridades=[
{label:'Alta',value:'Alta'},
{label:'Media',value:'Media'},
{label:'Baja',value:'Baja'}
];

pendientes:Ticket[]=[
{titulo:'Error login',asignado:'Juan',prioridad:'Alta',fecha:'2026-03-10',estado:'Pendiente'}
];

progreso:Ticket[]=[
{titulo:'Actualizar UI',asignado:'Maria',prioridad:'Media',fecha:'2026-03-09',estado:'En progreso'}
];

hecho:Ticket[]=[
{titulo:'Fix API',asignado:'Carlos',prioridad:'Baja',fecha:'2026-03-05',estado:'Hecho'}
];

abrirTicket(ticket:Ticket){
this.ticketOriginal=ticket;
this.ticketSeleccionado={...ticket};
this.visible=true;
}


guardarTicket(){
Object.assign(this.ticketOriginal,this.ticketSeleccionado);
this.visible=false;
}


abrirCrearTicket(){
this.visibleCrear=true;
this.nuevoTicket={
titulo:'',
descripcion:'',
estado:'Pendiente',
prioridad:'',
asignado:'',
fecha:''
};
}

crearTicket(){
const ticket:Ticket={
titulo:this.nuevoTicket.titulo,
asignado:this.nuevoTicket.asignado,
prioridad:this.nuevoTicket.prioridad,
fecha:this.nuevoTicket.fecha,
estado:'Pendiente'
};
this.pendientes.push(ticket);
this.visibleCrear=false;
}

drop(event:CdkDragDrop<Ticket[]>){
if(event.previousContainer===event.container){
moveItemInArray(event.container.data,event.previousIndex,event.currentIndex);
}else{
transferArrayItem(event.previousContainer.data,event.container.data,event.previousIndex,event.currentIndex);
const ticket=event.container.data[event.currentIndex];
this.actualizarEstado(ticket,event.container.id);
}
}

actualizarEstado(ticket:Ticket,containerId:string){
if(containerId==='list-pendientes')ticket.estado='Pendiente';
if(containerId==='list-progreso')ticket.estado='En progreso';
if(containerId==='list-hecho')ticket.estado='Hecho';
}

getSeverity(prioridad:string){
switch(prioridad){
case 'Alta':return 'danger';
case 'Media':return 'warn';
case 'Baja':return 'info';
default:return 'secondary';
}
}
}