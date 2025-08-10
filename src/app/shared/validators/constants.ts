// src/app/shared/constants.ts
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/; // Sin caracteres especiales