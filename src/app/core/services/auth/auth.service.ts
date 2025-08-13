import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, filter, from, map, of, switchMap, take, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { StorageService } from '../../services/storage/storage.service';
import { AuthAttemptsService } from './auth-attempts.service';

export interface LoginResponse {
  ok: boolean;
  token: string;
  expiresAt: number;
  user: {
    id: number;
    username: string;
  };
}

interface UserData {
  email: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private jwtHelper = inject(JwtHelperService);
  private storage = inject(StorageService);
  private authAttempts = inject(AuthAttemptsService);

  private currentUserSubject = new BehaviorSubject<UserData | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public authStatus = new BehaviorSubject<boolean>(false);
  private csrfToken$ = new BehaviorSubject<string>('');

  private apiUrl = 'http://localhost:8080';
  private csrfToken = '';


  private initializeAuthState(): void {
    this.loadCSRFToken().subscribe({
      next: () => {
        this.currentUserSubject.next(this.getUserFromStorage());
        this.authStatus.next(this.isAuthenticated());
      },
      error: (err) => {
        console.warn('CSRF initialization warning:', err.message);
        this.currentUserSubject.next(this.getUserFromStorage());
        this.authStatus.next(this.isAuthenticated());
      }
    });
  }


  private getCSRFError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return `Error ${error.status}: ${error.message}`;
    } else if (error instanceof Error) {
      return `Error: ${error.message}`;
    }
    return 'Error desconocido al obtener CSRF token';
  }

  getCurrentUser(): UserData | null {
    return this.currentUserSubject.value;
  }

  private getUserFromStorage(): UserData | null {
    const token = this.storage.getItem('access_token');
    if (!token) return null;
    
    try {
      return {
        email: this.jwtHelper.decodeToken(token).sub,
        token: token
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  private isAuthenticated(): boolean {
    const token = this.storage.getItem('access_token');
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }

  private loadCSRFToken(): Observable<string> {
    return this.http.get<{ token: string }>(
      `${this.apiUrl}/csrf-token`, 
      { withCredentials: true }
    ).pipe(
      map(response => {
        this.csrfToken = response.token;
        this.csrfToken$.next(response.token);
        return response.token;
      }),
      catchError(error => {
        const errorMsg = this.getCSRFError(error);
        console.error('Error loading CSRF token:', errorMsg);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  getCurrentCSRFToken(): Observable<string> {
    if (this.csrfToken) {
      return of(this.csrfToken);
    }
    return this.csrfToken$.pipe(
      filter(token => !!token),
      take(1)
    );
  }

  private getAuthHeaders(): Observable<HttpHeaders> {
    return this.getCurrentCSRFToken().pipe(
      map(token => {
        return new HttpHeaders({
          'Content-Type': 'application/json',
          'X-CSRF-Token': token,
          'X-Requested-With': 'XMLHttpRequest'
        });
      }),
      catchError(() => {
        // Fallback sin CSRF token si hay error
        return of(new HttpHeaders({
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }));
      })
    );
  }

  /**
 * Realiza el login del usuario
 * @param username Cuenta del usuario
 * @param password Contraseña
 * @param rememberMe (Opcional) Recordar sesión
 * @param useCsrf (Opcional) Usar protección CSRF (default: true)
 */

  // auth.service.ts
  login(username: string, password: string) {
    if (this.authAttempts.isLocked()) {
      const timeLeft = Math.ceil(this.authAttempts.getLockoutTimeLeft() / 1000 / 60);
      return throwError(() => new Error(`Demasiados intentos. Espere ${timeLeft} minutos.`));
    }
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`, 
      { username, password }
    ).pipe(
      // Eliminar catchError aquí, ya que el interceptor lo manejará
      tap(response => {
        // Resetear intentos si el login es exitoso
        this.authAttempts.resetAttempts();
      }),
      catchError(error => {
        // Solo manejar errores 401 (no autorizado)
        if (error.status === 401) {
          this.authAttempts.recordAttempt();
          
          if (this.authAttempts.isLocked()) {
            const timeLeft = Math.ceil(this.authAttempts.getLockoutTimeLeft() / 1000 / 60);
            return throwError(() => new Error(`Demasiados intentos. Espere ${timeLeft} minutos.`));
          } else {
            const remaining = this.authAttempts.getRemainingAttempts();
            return throwError(() => new Error(`Credenciales inválidas. Intentos restantes: ${remaining}`));
          }
        }
        // Para otros errores, propagar el error original
        return throwError(() => error);
      })
    );
  }


  private setSession(token: string): void {
    this.storage.setItem('access_token', token);
  }

  logout(): Observable<void> {
    const token = localStorage.getItem('auth_token'); // Obtén el token almacenado

    return this.http.post<void>(
      `${this.apiUrl}/logout`, 
      {}, 
      { 
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Envía el token en el header
        })
      }
    ).pipe(
      tap(() => {
        this.clearSession(); // Limpia el estado local (token, etc.)
      }),
      catchError(error => {
        this.clearSession(); // Limpieza incluso si falla
        return throwError(() => new Error(
          error.error?.error || 'Error al cerrar sesión'
        ));
      })
    );
  }  

  private clearSession(): void {
    this.storage.removeItem('access_token');
    this.currentUserSubject.next(null);
    this.authStatus.next(false);
    this.router.navigate(['/login']);
  }

  get authStatus$(): Observable<boolean> {
    return this.authStatus.asObservable();
  }

  get token(): string | null {
    return this.storage.getItem('access_token');
  }

  get currentUserEmail(): string | null {
    const token = this.token;
    return token ? this.jwtHelper.decodeToken(token).sub : null;
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.post<{ exists: boolean }>(
          `${this.apiUrl}/check-email`, 
          { email },
          { headers, withCredentials: true }
        ).pipe(
          map(response => response.exists),
          catchError(error => {
            if (error.status === 400) {
              return throwError(() => new Error('Formato de email inválido'));
            }
            return throwError(() => error);
          })
        );
      })
    );
  }

  register(credentials: { username: string; password: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/register`,
      credentials,
      { 
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        // Se eliminó withCredentials: true
      }
    ).pipe(
      catchError(error => {
        if (error.status === 409) {
          return throwError(() => new Error('El nombre de usuario ya existe'));
        }
        if (error.status === 400) {
          return throwError(() => new Error('Datos inválidos: ' + (error.error?.error || '')));
        }
        return throwError(() => new Error('Error en el registro: ' + error.message));
      })
    );
  }
}