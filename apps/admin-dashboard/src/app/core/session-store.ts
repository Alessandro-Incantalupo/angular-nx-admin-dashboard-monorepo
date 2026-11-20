import { HttpClient } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import type { LoginInput, SessionUser } from '@dashboard/models';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

interface SessionState {
  user: SessionUser | null;
  /** True once the server has been asked who is signed in. */
  checked: boolean;
}

/**
 * Who is signed in, from the server: the session lives in an HttpOnly cookie
 * the app can't read, so it asks GET /api/auth/session. The role here only
 * shapes the UI; the API checks it again on every request.
 */
export const SessionStore = signalStore(
  { providedIn: 'root' },
  withState<SessionState>({ user: null, checked: false }),
  withComputed(({ user }) => ({
    signedIn: computed(() => user() !== null),
    isAdmin: computed(() => user()?.role === 'admin'),
    isDemo: computed(() => user()?.demo === true),
  })),
  withMethods((store, http = inject(HttpClient)) => {
    let pending: Promise<SessionUser | null> | null = null;

    return {
      /** Asks the server once; later calls reuse the answer. */
      ensureLoaded(): Promise<SessionUser | null> {
        if (store.checked()) return Promise.resolve(store.user());
        pending ??= firstValueFrom(http.get<SessionUser>('/api/auth/session'))
          .catch(() => null)
          .then(user => {
            patchState(store, { user, checked: true });
            pending = null;
            return user;
          });
        return pending;
      },

      /** Throws the HTTP error on failure; the login page turns it into a message. */
      async login(input: LoginInput): Promise<SessionUser> {
        const user = await firstValueFrom(
          http.post<SessionUser>('/api/auth/login', input)
        );
        patchState(store, { user, checked: true });
        return user;
      },

      async logout(): Promise<void> {
        try {
          await firstValueFrom(http.post('/api/auth/logout', null));
        } finally {
          patchState(store, { user: null, checked: true });
        }
      },

      forget(): void {
        patchState(store, { user: null, checked: true });
      },
    };
  })
);
