import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { provideClientHydration } from '@angular/platform-browser';
import { provideStore } from '@ngrx/store';
export function tokenGetter() {
  return localStorage.getItem('access_token');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([errorInterceptor])),
    /*provideHttpClient(
      withInterceptors([securityInterceptor])
    ),*/
    importProvidersFrom(JwtModule.forRoot({
        config: {
            tokenGetter: tokenGetter,
            allowedDomains: ['tu-dominio.com'],
            disallowedRoutes: ['/login', '/register']
        }
    })),
    // Si usas SSR, añade:
    provideClientHydration(),
    provideStore()
]
};