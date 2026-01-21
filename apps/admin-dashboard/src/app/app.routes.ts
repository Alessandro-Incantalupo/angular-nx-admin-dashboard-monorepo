import { Routes } from '@angular/router';
import { PATHS } from './core/constants/routes';
import { AuthGuard } from './core/guards';

export const routes: Routes = [
  // { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: '',
    // pathMatch: 'full',
    loadChildren: () => import('./layouts/main-layout/main-layout.routes'),
  },
  {
    path: PATHS.AUTH,
    loadChildren: () => import('./features/auth/auth.routes'),
  },
  {
    path: PATHS.PROFILE + '/:id',
    loadComponent: () => import('./features/profile/profile.component'),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    loadComponent: () => import('./features/error-page/error-page.component'),
  },
];
