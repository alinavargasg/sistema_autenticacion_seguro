import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { routes } from './app.routes';
import { securityInterceptor } from './core/interceptors/security.interceptor';
import { provideClientHydration } from '@angular/platform-browser';

export function tokenGetter() {
  return localStorage.getItem('access_token');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    /*provideHttpClient(
      withInterceptors([securityInterceptor])
    ),*/
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,
          allowedDomains: ['tu-dominio.com'],
          disallowedRoutes: ['/login', '/register']
        }
      })
    ),
    // Si usas SSR, añade:
    provideClientHydration()
  ]
};