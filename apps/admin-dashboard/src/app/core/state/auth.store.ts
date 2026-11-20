import { User } from '@admin-dashboard-nx-monorepo/models';
import { updateState } from '@angular-architects/ngrx-toolkit';
import { computed, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { tapResponse } from '@ngrx/operators';
import {
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { toast } from 'ngx-sonner';
import { switchMap } from 'rxjs';

type UserState = {
  isAuthenticated: boolean;
  userData: User | null;
  error: string | null;
};

const initialState: UserState = {
  isAuthenticated: !!localStorage.getItem('token'),
  userData: null,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<UserState>(initialState),
  withComputed(state => {
    const isGuest = computed(() => state.userData()?.role === 'guest');
    const isUser = computed(() => state.userData()?.role === 'user');
    const isAdmin = computed(() => state.userData()?.role === 'admin');
    const canView = computed(
      () => state.isAuthenticated() || state.userData()?.role === 'guest'
    );
    const canEdit = computed(
      () => isUser() || (isAdmin() && state.isAuthenticated())
    );
    const canDelete = computed(() => isAdmin());
    const canCreate = computed(() => isAdmin());
    const roleDescription = computed(() => {
      const role = state.userData()?.role ?? 'guest';
      const descriptions = {
        guest: 'As a guest, you can only view limited content.',
        user: 'As a user, you can view and edit content.',
        admin: 'As an admin, you can create, edit, and delete content.',
      };
      return descriptions[role];
    });

    return {
      isGuest,
      isUser,
      isAdmin,
      canView,
      canEdit,
      canDelete,
      canCreate,
      roleDescription,
    };
  }),

  withMethods((state, authService = inject(AuthService)) => {
    const login = rxMethod<{ email: string; password: string }>(input$ =>
      input$.pipe(
        switchMap(({ email, password }) =>
          authService.login(email, password).pipe(
            tapResponse({
              next: ({ token }) => {
                localStorage.setItem('token', token);
                updateState(state, 'Login Success', {
                  isAuthenticated: true,
                  userData: authService.decodeUserFromToken(),
                });
                toast.success('Login successful');
              },
              error: () => {
                localStorage.removeItem('token');
                updateState(state, 'Login Error', {
                  isAuthenticated: false,
                  userData: null,
                  error: 'Invalid credentials',
                });
                toast.error('Login failed. Please check your credentials.');
              },
            })
          )
        )
      )
    );

    const logout = () => {
      localStorage.removeItem('token');
      updateState(state, 'Logout', {
        isAuthenticated: false,
        userData: null,
        error: null,
      });
    };

    const setError = (error: string) => {
      updateState(state, 'Set Error', { error });
    };

    const setRole = (role: 'guest' | 'user' | 'admin') => {
      const currentUser = state.userData();
      if (!currentUser) {
        toast.error('Cannot set role. No user is logged in.');
        return;
      }

      updateState(state, 'Set Role', {
        userData: { ...currentUser, role },
      });

      toast.success(`Role updated to "${role}"`);
    };

    return { login, logout, setError, setRole };
  }),
  // This hook runs when the AuthStore is initialized.
  // It checks if a JWT token exists in localStorage.
  // If a token is found, it decodes the user from the token and updates the store state.
  // This ensures that after a page refresh, the authentication state and user data are restored.
  withHooks((_, authService = inject(AuthService)) => ({
    onInit: () => {
      const token = localStorage.getItem('token');
      if (token) {
        updateState(_, 'Hydrate user from token', {
          isAuthenticated: true,
          userData: authService.decodeUserFromToken(),
          error: null,
        });
      }
    },
  }))
);
