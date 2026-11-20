import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  type ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  TitleStrategy,
  withComponentInputBinding,
} from '@angular/router';
import { routes } from './app.routes';
import { sessionExpiredInterceptor } from './core/http';
import { PageTitleStrategy } from './core/page-title';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // No zone.js: change detection runs from signals and template events.
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    { provide: TitleStrategy, useClass: PageTitleStrategy },
    provideHttpClient(
      withFetch(),
      withInterceptors([sessionExpiredInterceptor])
    ),
  ],
};
