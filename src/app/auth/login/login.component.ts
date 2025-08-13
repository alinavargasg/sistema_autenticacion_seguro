import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { xssSanitizationValidator } from '../../shared/validators/validators';
//Para los estados
import { Store } from '@ngrx/store';
import * as AuthActions from '../../core/state/auth/auth.actions';
import { selectIsLoading } from '../../core/state/auth/auth.selectors';
import { AppState } from '../../core/state/app.state';
import { finalize } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { AuthAttemptsService } from '../../core/services/auth/auth-attempts.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);  
  private store = inject(Store<AppState>);
  private authAtemptsService = inject(AuthAttemptsService);
  
  errorMessage: string | null = null;
  loading = false;
  loading$ = this.store.select(selectIsLoading);

  private readonly MAX_ATTEMPTS = 3;
  private readonly LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutos
  private failedAttempts = 0;
  private lastAttemptTime: number | null = null;
  //failedAttempts = 3 - this.authAttempts.getRemainingAttempts();
  locked = false;

  getRemainingAttempts(): number {
    return Math.max(0, this.MAX_ATTEMPTS - this.failedAttempts);
  }

  recordAttempt(): void {
    this.failedAttempts++;
    this.lastAttemptTime = Date.now();
  }

  isLocked(): boolean {
    if (!this.lastAttemptTime) return false;
    return this.failedAttempts >= this.MAX_ATTEMPTS && 
           (Date.now() - this.lastAttemptTime) < this.LOCKOUT_TIME;
  }

  getLockoutTimeLeft(): number {
    if (!this.lastAttemptTime || !this.isLocked()) return 0;
    return this.LOCKOUT_TIME - (Date.now() - this.lastAttemptTime);
  }

  resetAttempts(): void {
    this.failedAttempts = 0;
    this.lastAttemptTime = null;
  }

  loginForm = this.fb.group({
    username: ['', [Validators.required, xssSanitizationValidator]],
    password: ['', [Validators.required, xssSanitizationValidator]],
    remember: [false]
  });

  onSubmit() {
    console.log("Estamos en onSubmit");
    if (this.loginForm.invalid) return;

  if (this.authAtemptsService.isLocked()) {
      const tiempoRestante = this.authAtemptsService.getLockoutTimeLeft();
      this.errorMessage = `Has excedido el número máximo de intentos. Inténtalo en ${Math.ceil(tiempoRestante / 1000)} segundos.`;
      return;
  }

    this.errorMessage = null;
    this.loading = true;
    // Obtenemos los valores directamente del formulario

    const username = this.loginForm.value.username || '';
    const password = this.loginForm.value.password || '';

    this.store.dispatch(AuthActions.login({ username, password }));

    // Llamamos al servicio con los parámetros individuales
    this.authService.login(username, password)
    .pipe(
      finalize(() => this.loading = false) // Se ejecuta al terminar la petición
    )
    .subscribe({
      next: (response) => {
        console.log("Credenciales válidas", response.token);
        // Guardar el token en local storage
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('expires_at',  response.expiresAt.toString());
        localStorage.setItem('user', JSON.stringify(response.user));
        this.authAtemptsService.resetAttempts(); // éxito → reset
        this.router.navigateByUrl('/welcome', { replaceUrl: true });
      },
      error: (error) => {
        this.authAtemptsService.recordAttempt();
        this.errorMessage = error.message;
        this.loginForm.get('password')?.reset();
        setTimeout(() => {
          this.errorMessage = null;
        }, 3000);
      }
    });
  }

}