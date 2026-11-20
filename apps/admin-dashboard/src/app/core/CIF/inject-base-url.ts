import { assertInInjectionContext, inject } from '@angular/core';
import { BASE_URL } from '@core/providers/base-url';
import { environment } from '@environments/environment';

export const injectBaseUrl = () => {
  assertInInjectionContext(injectBaseUrl);
  const baseUrl = inject(BASE_URL);

  return (mockUrl: string, prodUrl: string | (() => string)): string => {
    if (environment.mode === 'development') {
      // For development, use the mockUrl directly (assets are served from root)
      return baseUrl + mockUrl;
    } else {
      // For production, use the baseUrl + prodUrl
      if (typeof prodUrl === 'string') {
        return baseUrl + prodUrl;
      }
      const currProdUrl = prodUrl();
      return baseUrl + currProdUrl;
    }
  };
};
