import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { StorageService } from '../../services/storage/storage.service';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private jwtHelper = inject(JwtHelperService);

  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  public authStatus = new BehaviorSubject<boolean>(false);

  private apiUrl = '/api/auth';
  private csrfToken = '';

  constructor(private storage: StorageService) {
    this.loadCSRFToken();

    // Solo inicializar authStatus y usuario cuando Angular ya esté en el navegador
    setTimeout(() => {
      this.currentUserSubject.next(this.getUserFromStorage());
      this.authStatus.next(this.isAuthenticated());
    });
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  private getUserFromStorage(): any {
    const token = this.storage.getItem('access_token');
    if (!token) return null;
    try {
      return {
        email: this.jwtHelper.decodeToken(token).sub,
        token: token
      };
    } catch {
      return null;
    }
  }

  private isAuthenticated(): boolean {
    const token = this.storage.getItem('access_token');
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }

  private loadCSRFToken(): void {
    this.http.get<{ token: string }>(`${this.apiUrl}/csrf-token`, { withCredentials: true })
      .subscribe({
        next: (res) => this.csrfToken = res.token,
        error: (err) => console.error('Error loading CSRF token', err)
      });
  }

  login(email: string, password: string, rememberMe?: boolean): Observable<boolean> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      { username: email, password, remember_me: rememberMe },
      { withCredentials: true }
    ).pipe(
      map(res => {
        this.setSession(res.access_token);
        if (rememberMe) {
          this.storage.setItem('rememberedEmail', email);
        }
        this.currentUserSubject.next(this.getUserFromStorage());
        this.authStatus.next(true);
        return true;
      })
    );
  }

  private setSession(token: string): void {
    this.storage.setItem('access_token', token);
  }

  logout(): void {
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
    return this.http.post<{ exists: boolean }>(`${this.apiUrl}/check-email`, { email })
      .pipe(map(response => response.exists));
  }

  register(userData: { username: string, email: string, password: string }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/register`,
      userData,
      { withCredentials: true }
    );
  }
}
