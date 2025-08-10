import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth/auth.service';

@Component({
  selector: 'app-welcome',
  standalone: true, // Si usas Angular 15+ con standalone components
  imports: [CommonModule, RouterModule], // Importaciones necesarias
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  // Variables del componente
  currentUser: any;
  welcomeMessage = '';
  currentDate = new Date();
  
  // Inyectar servicios
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserData();
    this.setWelcomeMessage();
  }

  private loadUserData(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  private setWelcomeMessage(): void {
    const hour = this.currentDate.getHours();
    if (hour < 12) {
      this.welcomeMessage = '¡Buenos días!';
    } else if (hour < 19) {
      this.welcomeMessage = '¡Buenas tardes!';
    } else {
      this.welcomeMessage = '¡Buenas noches!';
    }
    
    if (this.currentUser?.name) {
      this.welcomeMessage += ` ${this.currentUser.name}`;
    }
  }

  // Método para cerrar sesión
  logout(): void {
    this.authService.logout();
  }
}