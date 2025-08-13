import { Component, ErrorHandler, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { passwordStrengthValidator, passwordMatchValidator, xssSanitizationValidator, secureEmailValidator } from '../../shared/validators/validators';
import { USERNAME_REGEX } from '../../shared/validators/constants';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {RegisterFormErrors} from '../../shared/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar'


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
  private readonly snackBar = inject(MatSnackBar);



  loading = false;
  
  registerForm = this.fb.group({
    username: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20),
      Validators.pattern(USERNAME_REGEX),
      xssSanitizationValidator
    ]],
    email: ['', [Validators.required/*, secureEmailValidator*/, xssSanitizationValidator]],
    password: ['', [
      Validators.required,
      passwordStrengthValidator,
      xssSanitizationValidator
    ]],
    confirmPassword: ['', [Validators.required, xssSanitizationValidator]]
  }, { validators: passwordMatchValidator });

  formErrors: RegisterFormErrors = {};

  async onSubmit() {
    console.log("Estamos en submit de registro");
    if (this.registerForm.invalid || this.loading) return;
    this.loading = true;
    try {
      const { username, password } = this.registerForm.value;
      if (!username || !password) {
        throw new Error('Datos incompletos');
      }
      await this.auth.register({ username, password }).subscribe({
        next: () => {
          this.handleSuccess();
          this.router.navigate(['/login']);
        },
        error: (error:HttpErrorResponse) => {
          this.handleError(error) //muestra el mensaje de error procesaro
        }
      });
      
    } catch (error) {
      // Verificación segura del tipo de error
      if (error instanceof Error) {
        //this.handleError(error);
      }
    } finally {
      console.log("Está en finally");
      this.loading = false;
    }
  }

  private handleSuccess(): void {
    this.loading = false;
    this.registerForm.reset();
    this.showSnackBar('Contacto registrado exitosamente!', 'success');
  }

    private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: `snackbar-${type}`
    });
  }

  private handleError(error: HttpErrorResponse): void {
      this.loading = false;
      this.formErrors = this.parseErrors(error);
      this.showSnackBar(this.getErrorMessage(error), 'error');
  }

  private parseErrors(error: HttpErrorResponse): RegisterFormErrors {
      if (error.status === 400 && error.error?.errors) {
        return error.error.errors;
      }
      return {};
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    console.error('Error completo:', error); // Para depuración
    
    if (error.status === 0) {
      return 'Error de conexión: No se pudo contactar al servidor. Verifica tu conexión a internet.';
    }
    
    if (error.status === 400) {
      // Manejo específico para errores de validación
      return error.error?.message || 
            'Datos inválidos: ' + (error.error?.errors?.join(', ') || 'por favor revisa el formulario');
    }
    
    if (error.status === 401) {
      return 'No autorizado: Debes iniciar sesión para realizar esta acción.';
    }
    
    if (error.status === 403) {
      return 'Acceso prohibido: No tienes permisos para esta acción.';
    }
    
    if (error.status === 404) {
      return 'Recurso no encontrado.';
    }
    
    if (error.status >= 500) {
      return 'Error del servidor: Por favor intenta más tarde.';
    }
    
    // Mensaje específico del backend si existe
    if (error.error?.message) {
      return error.error.message;
    }
    
    // Mensaje genérico como última opción
    return 'Error al procesar tu solicitud. Por favor intenta nuevamente.';
  }


}