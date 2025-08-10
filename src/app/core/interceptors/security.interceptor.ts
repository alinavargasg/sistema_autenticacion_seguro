import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { HttpInterceptorFn } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';

export const securityInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Clonar la solicitud para agregar headers
  const authReq = addAuthHeader(req, authService);

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401 || error.status === 403) {
        authService.logout();
        router.navigate(['/login'], { 
          queryParams: { returnUrl: router.url } 
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
      withCredentials: true
    });
  }
  
  return req.clone({ withCredentials: true });
};