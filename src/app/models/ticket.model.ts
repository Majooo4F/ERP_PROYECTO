export interface Ticket {

  id:number;

  titulo:string;

  descripcion:string;

  estado:string;

  asignado:string;

  prioridad:string;

  fechaCreacion:string;

  fechaLimite:string;

  comentarios:string[];

  historial:string[];

}