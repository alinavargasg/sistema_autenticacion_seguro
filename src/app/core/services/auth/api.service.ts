import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserLogin, UserRegister, User } from '../../../shared/models/user.model';

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
      withCredentials: true // Importante para cookies HttpOnly
    });
  }

  /**
   * Servicios de Autenticación
   */
  login(credentials: UserLogin): Observable<{ access_token: string }> {
    return this.secureRequest('POST', 'auth/login', credentials);
  }

  register(userData: UserRegister): Observable<User> {
    return this.secureRequest('POST', 'auth/register', userData);
  }

  logout(): Observable<void> {
    return this.secureRequest('POST', 'auth/logout');
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