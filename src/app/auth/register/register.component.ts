import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { passwordStrengthValidator, passwordMatchValidator, xssSanitizationValidator, secureEmailValidator } from '../../shared/validators/validators';
import { USERNAME_REGEX } from '../../shared/validators/constants';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  
  registerForm = this.fb.group({
    username: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20),
      Validators.pattern(USERNAME_REGEX),
      xssSanitizationValidator
    ]],
    email: ['', [Validators.required, secureEmailValidator]],
    password: ['', [
      Validators.required,
      passwordStrengthValidator,
      xssSanitizationValidator
    ]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  async onSubmit() {
    if (this.registerForm.invalid || this.loading) return;
    
    this.loading = true;
    try {
    const { username, email, password } = this.registerForm.value as {
      username: string;
      email: string;
      password: string;
    };

    this.auth.register({ username, email, password });

      this.router.navigate(['/welcome']);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      this.loading = false;
    }
  }
}