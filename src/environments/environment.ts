// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api', // URL de tu backend en desarrollo
  enableDebug: true,
  security: {
    enableCSRF: true,
    enableXSSProtection: true,
    enableCORS: true
  },
  auth: {
    tokenRefreshInterval: 300000, // 5 minutos
    tokenKey: 'auth_token_dev'
  }
};