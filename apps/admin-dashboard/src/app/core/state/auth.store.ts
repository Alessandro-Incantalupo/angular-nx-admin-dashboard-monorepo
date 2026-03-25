import { User } from '@admin-dashboard-nx-monorepo/models';
import {
  setError,
  setLoaded,
  setLoading,
  updateState,
  withCallState,
} from '@angular-architects/ngrx-toolkit';
import { computed, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import {
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap } from 'rxjs';

export interface AuthState {
  userData: User | null;
  role: User['role'];
}

const AUTH_INITIAL_STATE: AuthState = {
  userData: null,
  role: 'guest',
} as const;

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withCallState({ collection: 'auth' }),
  withState(AUTH_INITIAL_STATE),
  withComputed(state => {
    const authService = inject(AuthService);
    const isAuthenticated = computed(() => authService.isAuthenticated());

    const isGuest = computed(
      () => state.role() === 'guest' || !isAuthenticated()
    );
    const isUser = computed(() => state.role() === 'user');
    const isAdmin = computed(() => state.role() === 'admin');

    const canView = computed(() => isAuthenticated() || isGuest());
    const canEdit = computed(
      () => isUser() || (isAdmin() && isAuthenticated())
    );
    const canDelete = computed(() => isAdmin());
    const canCreate = computed(() => isAdmin());

    return {
      isAuthenticated,
      isGuest,
      isUser,
      isAdmin,
      canView,
      canEdit,
      canDelete,
      canCreate,
    };
  }),

  withMethods(store => {
    const authService = inject(AuthService);
    return {
      syncAuthState: rxMethod<unknown>(
        pipe(
          tap(() => {
            const identity = authService.identityClaims();
            if (!identity) {
              updateState(store, '[Auth] Clear State', AUTH_INITIAL_STATE);
              return;
            }

            const firstName =
              identity.given_name ||
              identity.name?.split(' ')[0] ||
              identity.preferred_username ||
              'User';
            const lastName =
              identity.family_name ||
              identity.name?.split(' ').slice(1).join(' ') ||
              '';
            const fullName =
              identity.name ||
              (lastName ? `${firstName} ${lastName}` : firstName);

            const accessToken = authService.accessToken;
            let roles: string[] = [];

            try {
              if (accessToken) {
                const decodedAccess = JSON.parse(
                  atob(accessToken.split('.')[1])
                );
                roles = [
                  ...(decodedAccess.realm_access?.roles || []),
                  ...(decodedAccess.roles || []),
                ];
              }
            } catch (e) {
              console.error('Error decoding access token', e);
            }

            if (roles.length === 0) {
              roles =
                (identity.realm_access?.roles as string[]) ||
                (identity.roles as string[]) ||
                [];
            }

            let role: User['role'] = 'user';
            if (roles.some(r => r.toLowerCase().includes('admin'))) {
              role = 'admin';
            } else if (roles.some(r => r.toLowerCase().includes('user'))) {
              role = 'user';
            } else if (roles.includes('guest')) {
              role = 'guest';
            }

            const userData: User = {
              id: identity.sub,
              name: fullName,
              email: identity.email,
              firstName,
              lastName,
              role,
              status: 'active',
            };

            updateState(store, '[Auth] Sync State', { userData, role });
          })
        )
      ),
      login: () => authService.login(),
      logout: () => authService.logout(),
    };
  }),

  withHooks({
    onInit(store) {
      const authService = inject(AuthService);
      store.syncAuthState(authService.events$);
    },
  })
);
