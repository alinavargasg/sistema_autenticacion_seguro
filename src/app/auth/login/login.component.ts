import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { secureEmailValidator, xssSanitizationValidator } from '../../shared/validators/validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, secureEmailValidator, xssSanitizationValidator]],
  password: ['', [Validators.required, xssSanitizationValidator]],
    remember: [false]
  });

  errorMessage = '';
  loading = false;

  async onSubmit() {
    if (this.loginForm.invalid) return;
    
    this.loading = true;
    try {
      await this.auth.login(
        this.loginForm.value.email!,
        this.loginForm.value.password!,
        this.loginForm.value.remember!
      );
      this.router.navigate(['/welcome']);
    } catch (error) {
      this.errorMessage = 'Credenciales inválidas';
      console.error('Login error:', error);
    } finally {
      this.loading = false;
    }
  }
}