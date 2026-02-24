import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-loading',
  standalone: true,  
  imports: [RouterLink],
  templateUrl: './loading.html',
  styleUrl: './loading.css',
})
export class Loading {

}
