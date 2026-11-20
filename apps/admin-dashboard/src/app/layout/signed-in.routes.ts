import { inject, provideEnvironmentInitializer } from '@angular/core';
import type { Routes } from '@angular/router';
import { primeNgTheme } from '@dashboard/design-system';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PrimeNG } from 'primeng/config';
import Shell from './shell';

export default [
  {
    path: '',
    component: Shell,
    providers: [
      // PrimeNG's config service lives at the root; its theme (the biggest part)
      // is handed over here, so the login page never downloads it.
      provideEnvironmentInitializer(() =>
        inject(PrimeNG).setConfig({ theme: primeNgTheme, ripple: false })
      ),
      MessageService,
      ConfirmationService,
    ],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard',
        loadComponent: () => import('../features/dashboard/dashboard-page'),
      },
      {
        path: 'members',
        title: 'Members',
        loadComponent: () => import('../features/members/members-page'),
      },
      {
        path: 'settings',
        title: 'Settings',
        loadComponent: () => import('../features/settings/settings-page'),
      },
    ],
  },
] satisfies Routes;
