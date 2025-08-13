import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';

export const securityInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Clonar la solicitud para agregar headers
  const authReq = addAuthHeader(req, authService);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {

        authService.logout().subscribe(() => {
          router.navigate(['/login'], { 
            replaceUrl: true,  // ← Esto limpia el historial
            queryParams: { sessionExpired: true }  // Usa un parámetro diferente
          });
        });

      }
      return throwError(() => error);
    })
  );
};

// Función helper para agregar el token
const addAuthHeader = (
  req: HttpRequest<unknown>,
  authService: AuthService
): HttpRequest<unknown> => {
  const token = authService.token;
  
  if (token && !req.url.includes('/login') && !req.url.includes('/register')) {
    return req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  
  return req;
};