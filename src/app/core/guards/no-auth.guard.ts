import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { map } from 'rxjs';

export const noAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.authStatus$.pipe(
    map(authenticated => {
      console.log('Guard noAuthGuard -> authenticated:', authenticated);
      if (authenticated) {
        router.navigate(['/welcome']);
        return false;
      }
      return true;
    })
  );
};