// src/app/shared/validators/auth.validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { PASSWORD_REGEX, USERNAME_REGEX } from './constants';

// Validador de fortaleza de contraseña
export const passwordStrengthValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;

  const errors: ValidationErrors = {};
  
  if (!/[A-Z]/.test(value)) errors['missingUpperCase'] = true;
  if (!/[a-z]/.test(value)) errors['missingLowerCase'] = true;
  if (!/\d/.test(value)) errors['missingNumber'] = true;
  if (!/[@$!%*?&]/.test(value)) errors['missingSpecialChar'] = true;
  if (value.length < 8) errors['minlength'] = { requiredLength: 8 };

  return Object.keys(errors).length ? { passwordStrength: errors } : null;
};

// Validador de coincidencia de contraseñas
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  return password && confirmPassword && password !== confirmPassword 
    ? { passwordMismatch: true } 
    : null;
};

// Validador contra XSS
export const xssSanitizationValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;

  const forbiddenPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+="[^"]*"/gi
  ];

  return forbiddenPatterns.some(pattern => pattern.test(value)) 
    ? { xssDetected: true } 
    : null;
};

// Validador de email seguro
export const secureEmailValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(value)) return { invalidEmail: true };

  return null;
};