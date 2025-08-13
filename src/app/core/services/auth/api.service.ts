import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../../../shared/models/user.model';

const API_URL = 'http://localhost:3000'; // URL de JSON Server

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Headers comunes para todas las solicitudes
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
      
      // Manejo específico para errores comunes
      if (error.status === 401) {
        errorMessage = 'Sesión expirada. Por favor ingresa nuevamente.';
        // Aquí podrías redirigir al login
      } else if (error.status === 403) {
        errorMessage = 'No tienes permisos para esta acción';
      } else if (error.status === 0) {
        errorMessage = 'No se pudo conectar al servidor';
      }
    }
    
    console.error('Error en la solicitud:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Método genérico para solicitudes seguras
   */
private secureRequest<T>(
  method: string,
  endpoint: string,
  body?: any,
  customHeaders?: HttpHeaders
): Observable<T> {
  const url = `${this.apiUrl}/${endpoint}`;
  const headers = customHeaders || this.getHeaders();

  return this.http.request<T>(method, url, {
    body,
    headers,
    withCredentials: true
  }).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorMessage = this.getErrorMessage(error);
      console.error(`Error en ${method} ${url}:`, errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
}

private getErrorMessage(error: HttpErrorResponse): string {
  if (error.error instanceof ErrorEvent) {
    return `Error de cliente: ${error.error.message}`;
  }

  switch (error.status) {
    case 0:
      return 'Error de conexión: No se pudo contactar al servidor';
    case 400:
      return 'Solicitud inválida: ' + (error.error?.message || 'Datos incorrectos');
    case 401:
      return 'No autorizado: Sesión expirada o credenciales inválidas';
    case 403:
      return 'Prohibido: No tienes permisos para esta acción';
    case 404:
      return 'Recurso no encontrado';
    case 409:
      return 'Conflicto: ' + (error.error?.message || 'El recurso ya existe');
    case 500:
      return 'Error interno del servidor';
    default:
      return `Error ${error.status}: ${error.message}`;
  }
}

  /**
   * Servicios de Usuario
   */
  getCurrentUser(): Observable<User> {
    return this.secureRequest('GET', 'users/me');
  }

  updateUser(userId: string, userData: Partial<User>): Observable<User> {
    return this.secureRequest('PUT', `users/${userId}`, userData);
  }

  /**
   * Métodos protegidos con CSRF
   */
  refreshToken(): Observable<{ access_token: string }> {
    return this.secureRequest('POST', 'auth/refresh-token');
  }

  sensitiveAction(): Observable<{ message: string }> {
    return this.secureRequest('POST', 'actions/sensitive');
  }
}

