import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

export const routes: Routes = [
  // Redirección inteligente de la ruta raíz
  { 
    path: '',
    pathMatch: 'full',
    redirectTo: 'login' // O 'login' según tu flujo preferido
  },
  
  // Rutas públicas
  {
    path: 'login',
    canActivate: [noAuthGuard], // Redirige a welcome si ya está autenticado
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
    data: { animation: 'loginPage' } // Opcional: animación específica
  },
  
  {
    path: 'register',
    canActivate: [noAuthGuard], // Redirige a welcome si ya está autenticado
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent),
    data: { animation: 'loginPage' } // Opcional: animación específica
  },
  
  // Rutas protegidas


  {
    path: 'welcome',
    canActivate: [authGuard],
    loadComponent: () => import('./welcome/welcome.component').then(m => m.WelcomeComponent),
    data: { title: 'Inicio' } // Metadata útil para breadcrumbs/SEO
  },
  
  // Manejo de errores
  { 
    path: 'not-found',
    title: 'Página no encontrada',
    loadComponent: () => import('../app/core/pages/not-found/not_found.component').then(m => m.NotFoundComponent)
  },
  
  // Redirecciones y comodines
  { 
    path: '**', 
    redirectTo: 'not-found',
    pathMatch: 'full' 
  }
];