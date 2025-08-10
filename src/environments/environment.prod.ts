// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.tudominio.com/v1', // URL de producción
  enableDebug: false,
  security: {
    enableCSRF: true,
    enableXSSProtection: true,
    enableCORS: true
  },
  auth: {
    tokenRefreshInterval: 900000, // 15 minutos
    tokenKey: 'auth_token_prod'
  }
};