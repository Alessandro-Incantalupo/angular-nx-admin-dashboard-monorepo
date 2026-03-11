import { Routes } from '@angular/router';
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
        path: PATHS.ERRORS,
        loadChildren: () => import('../../features/errors/errors.routes'),
      },
    ],
  },
] satisfies Routes;
