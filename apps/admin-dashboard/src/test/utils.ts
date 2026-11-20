import {
  importProvidersFrom,
  provideZonelessChangeDetection,
} from '@angular/core';
import { TestBed, TestModuleMetadata } from '@angular/core/testing';
import {
  TranslocoTestingModule,
  TranslocoTestingOptions,
} from '@jsverse/transloco';

import en from '@assets/i18n/en.json';
import it from '@assets/i18n/it.json';
export const testInjectionContext = <T>(fn: () => T): T => {
  return TestBed.runInInjectionContext(fn);
};

export const testingModuleZoneless = async (config: TestModuleMetadata) => {
  config = {
    ...config,
    providers: [...(config?.providers ?? []), provideZonelessChangeDetection()],
  };
  await TestBed.configureTestingModule(config).compileComponents();
};

export function provideTranslocoMock(
  scopes: TranslocoTestingOptions['langs'] = {}
) {
  return importProvidersFrom(
    TranslocoTestingModule.forRoot({
      langs: { it, en, ...scopes },
      translocoConfig: {
        availableLangs: ['it', 'en'],
        defaultLang: 'it',
        reRenderOnLangChange: true,
      },
    })
  );
}
