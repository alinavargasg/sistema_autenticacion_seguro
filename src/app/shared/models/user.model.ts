/**
 * Modelo de usuario con todas las interfaces y tipos necesarios
 * para el sistema de autenticación seguro (Angular + FastAPI)
 */

export interface User {
  id: string;                   // UUID v4
  email: string;                // Email validado
  username: string;             // Nombre de usuario sanitizado
  isActive: boolean;            // Estado de la cuenta
  createdAt: string;            // Fecha ISO 8601
  updatedAt: string;            // Fecha ISO 8601
  lastLogin?: string;           // Fecha último login (opcional)
  role: UserRole;               // Rol del usuario
}

// Tipos para autenticación
export interface UserLogin {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface UserRegister {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

// Tipos para respuestas del API
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
}

export interface UserUpdate {
  username?: string;
  currentPassword?: string;
  newPassword?: string;
}

// Roles del sistema (RBAC)
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

// Ejemplo de mock data para pruebas
export const MOCK_USER: User = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'usuario@ejemplo.com',
  username: 'usuario_ejemplo',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  role: UserRole.USER
};

// Tipos para paginación (opcional)
export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

// Validación de contraseña segura
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;