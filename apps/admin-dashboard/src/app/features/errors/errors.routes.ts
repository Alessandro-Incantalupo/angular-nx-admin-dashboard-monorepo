import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';
import { PATHS } from '../../core/constants/routes';

export const routes: Routes = [
  {
    path: '',
    providers: [provideTranslocoScope('errors')],
    children: [
      {
        path: '',
        redirectTo: PATHS.ERRORS_RFC7807,
        pathMatch: 'full',
      },
      {
        path: PATHS.ERRORS_RFC7807,
        loadComponent: () => import('./pages/rfc-7807/rfc-7807.component'),
      },
    ],
  },
];

export default routes;
