import type { Routes } from '@angular/router';
import { guestOnly, signedIn } from './core/guards';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Sign in',
    canMatch: [guestOnly],
    loadComponent: () => import('./features/login/login-page'),
  },
  {
    path: '',
    canMatch: [signedIn],
    // The signed-in pages, PrimeNG and its theme load after sign-in, not with the login page.
    loadChildren: () => import('./layout/signed-in.routes'),
  },
  {
    path: '**',
    title: 'Page not found',
    loadComponent: () => import('./features/not-found-page'),
  },
];
