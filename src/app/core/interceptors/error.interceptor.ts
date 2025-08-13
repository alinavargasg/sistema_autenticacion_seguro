import {
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpInterceptorFn } from '@angular/common/http';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error) => {
      let errorMsg = '';
      
      if (error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMsg = `Client Error: ${error.message}`;
      } else if (error instanceof HttpErrorResponse) {
        // Error del servidor
        errorMsg = `Server Error [${error.status}]: ${error.message}`;
        
        // Manejo específico por códigos de estado
        switch (error.status) {
          case 401:
            console.warn('Unauthorized - Redirigiendo a login');
            errorMsg = "Acceso no autorizado, credenciales no válidas"
            // Aquí puedes redirigir a la página de login
            break;
          case 404:
            console.warn('Recurso no encontrado');
            errorMsg = "Recurso no encontrado"
            break;
          case 500:
            console.error('Error interno del servidor');
            errorMsg = "Error interno"
            break;
        }
      } else {
        // Otros tipos de error
        errorMsg = `Unknown Error: ${JSON.stringify(error)}`;
      }

      console.error('[Interceptor] Error:', errorMsg);
      return throwError(() => new Error(errorMsg));
    })
  );
};