import { inject, Injectable, isDevMode } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '@environments/environment';
import { map, shareReplay } from 'rxjs';

export const authCodeFlowConfig: AuthConfig = {
  issuer: environment.oidc.issuer,
  redirectUri: environment.oidc.redirectUri,
  clientId: environment.oidc.clientId,
  responseType: 'code',
  scope: environment.oidc.scope,
  showDebugInformation: isDevMode(),
  requireHttps: environment.oidc.requireHttps,
  strictDiscoveryDocumentValidation: false,
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oauthService = inject(OAuthService);

  // Observable stream of OIDC events
  readonly events$ = this.oauthService.events.pipe(shareReplay(1));

  // Signal-based reactive state using toSignal interop
  readonly isAuthenticated = toSignal(
    this.events$.pipe(map(() => this.oauthService.hasValidAccessToken())),
    { initialValue: false }
  );

  readonly identityClaims = toSignal(
    this.events$.pipe(map(() => this.oauthService.getIdentityClaims() as any)),
    { initialValue: null }
  );

  // Direct access for non-reactive needs (interceptors, etc.)
  get accessToken() {
    return this.oauthService.getAccessToken();
  }

  login = () => {
    if (!this.oauthService.discoveryDocumentLoaded) {
      console.warn(
        'Cannot login: OIDC Discovery Document not loaded. Is the backend running?'
      );
      return;
    }
    this.oauthService.initCodeFlow();
  };
  logout = () => this.oauthService.logOut();
}
