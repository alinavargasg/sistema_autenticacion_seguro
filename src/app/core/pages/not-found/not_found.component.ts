import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './not_found.component.html',
  styleUrls: ['./not_found.component.css']
})
export class NotFoundComponent {}