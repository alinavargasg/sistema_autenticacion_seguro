import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth/auth.service';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

// Registrar español (muy importante)
registerLocaleData(localeEs);

@Component({
  selector: 'app-welcome',
  standalone: true, // Si usas Angular 15+ con standalone components
  imports: [CommonModule, RouterModule], // Importaciones necesarias
  providers: [{ provide: LOCALE_ID, useValue: 'es' }],
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
    const stored = localStorage.getItem('user'); 
    if (stored) {
      // Convertir el texto a objeto
      this.currentUser = JSON.parse(stored);
    }
  }

  private setWelcomeMessage(): void {
    const hour = this.currentDate.getHours();
    if (hour < 12) {
      this.welcomeMessage = '¡Buenos días!\n';
    } else if (hour < 19) {
      this.welcomeMessage = '¡Buenas tardes!\n';
    } else {
      this.welcomeMessage = '¡Buenas noches!\n';
    }    
  }

  // Método para cerrar sesión
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Sesión cerrada correctamente');
        // Redirigir al login
        window.location.href = '/login'; // O con Router
        // this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err.message);
        // Igual redirigir o mostrar mensaje
        window.location.href = '/login';
      }
    });
  }
}