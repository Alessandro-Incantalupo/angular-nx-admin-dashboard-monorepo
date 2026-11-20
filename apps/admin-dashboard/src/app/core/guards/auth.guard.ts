import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@core/state/auth.store';
import { PATHS } from '../constants/routes';

export const AuthGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.isAuthenticated()) {
    router.navigate([PATHS.SIGN_UP]); // Redirect if not logged in
    return false;
  }
  return true; // Allow access if authenticated
};
