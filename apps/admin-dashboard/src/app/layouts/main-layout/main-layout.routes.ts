import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { PATHS } from '../../core/constants/routes';
import { MainLayoutComponent } from './main-layout.component';
import { MenuService } from './services/menu.service';

export default [
  {
    path: '',
    component: MainLayoutComponent,
    providers: [MenuService],
    children: [
      {
        path: '',
        redirectTo: PATHS.USERS,
        pathMatch: 'full',
      },
      {
        path: PATHS.FEATURES_UI,
        loadChildren: () => import('../../features/ui/ui.routes'),
      },
      {
        path: PATHS.USERS,
        loadChildren: () => import('../../features/users/users.routes'),
      },
      {
        // The assistant is a chat panel on every page now; old links open it.
        path: PATHS.ASSISTANT,
        redirectTo: ({ queryParams }) =>
          inject(Router).createUrlTree([PATHS.USERS], {
            queryParams: { ...queryParams, chat: 'open' },
          }),
      },
    ],
  },
] satisfies Routes;
