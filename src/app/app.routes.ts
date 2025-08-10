import { authGuard } from './core/guards/auth.guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '',
    loadComponent: () => import('../app/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('../app/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'welcome',
    loadComponent: () => import('../app/welcome/welcome.component').then(m => m.WelcomeComponent),
    canActivate: [authGuard]  // Protege esta ruta
  },
  {
    path: '**',  // Ruta comodín para páginas no encontradas
    loadComponent: () => import('../app/auth/login/login.component').then(m => m.LoginComponent)
  }
];