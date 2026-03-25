import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
// import packageJson from '@root/package.json';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { BaseResponseInterceptor } from '@core/interceptors/base-response.interceptor';
import { errorHandlerInterceptor } from '@core/interceptors/error-handler.interceptor';
import { LoadingInterceptor } from '@core/interceptors/loading.interceptor';

import { provideAngularSvgIcon } from 'angular-svg-icon';
import { providePrimeNG } from 'primeng/config';
import { provideOAuthClient, OAuthService } from 'angular-oauth2-oidc';
import { authCodeFlowConfig } from '@core/services/auth.service';
import { routes } from './app.routes';
import { TranslocoHttpLoader } from './transloco-loader';

/**
 * app.config.ts = global config file passed into bootstrapApplication()
 * It contains all the DI providers Angular should use app-wide.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Enables Angular routing with lazy loading and route guards
    provideRouter(routes, withComponentInputBinding()),

    // Adds HttpClient so we can make HTTP requests in services
    provideHttpClient(
      withInterceptors([
        LoadingInterceptor,
        authInterceptor,
        BaseResponseInterceptor,
        errorHandlerInterceptor, // Catch all backend errors
      ])
    ),

    // Provides Angular's change detection system (required by default)
    // The `eventCoalescing: true` option optimizes performance by batching multiple events
    // of the same type within a single change detection cycle, reducing redundant checks.
    // provideZoneChangeDetection({ eventCoalescing: true }),

    // Enables animations with better performance (lazy initialization)
    provideAnimationsAsync(),

    // Alternative change detection strategy that runs outside Angular's zone.
    provideZonelessChangeDetection(),

    // Registers PrimeNG UI config so components work globally
    providePrimeNG(),

    // Allows using SVG icons like <svg-icon src="..."></svg-icon>
    provideAngularSvgIcon(),

    // OIDC / OAuth2 Client support
    provideOAuthClient(),

    // Initialize OIDC at startup (Resilient/Non-blocking)
    provideAppInitializer(() => {
      const oauthService = inject(OAuthService);
      oauthService.configure(authCodeFlowConfig);

      return oauthService
        .loadDiscoveryDocumentAndTryLogin()
        .then(() => {
          if (isDevMode()) console.log('OIDC Discovery Successful');
        })
        .catch(error => {
          // Failure is caught so the app still bootstraps (Showcase Mode)
          console.warn(
            'OIDC Discovery Failed. App is running in unauthenticated mode.',
            error
          );
          return Promise.resolve();
        });
    }),

    // Custom DI token containing package metadata (e.g. version, name)
    // { provide: APP_INFO, useValue: packageJson },
    provideTransloco({
      config: {
        availableLangs: ['en', 'it'],
        defaultLang: 'en',
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
  ],
};
