/**
 * ============================================================
 * users.effects.ts — Classical NgRx equivalent of rxMethod() calls
 * ============================================================
 *
 * YOUR STORE (rxMethod)                  → THIS EFFECT CLASS
 * ─────────────────────────────────────────────────────────────
 * rxMethod(loadUsers pipe switchMap)     → loadUsers$
 * rxMethod(addUser pipe switchMap)       → addUser$ + addUserReload$
 * rxMethod(updateUser pipe switchMap)    → updateUser$
 * rxMethod(deleteUser pipe switchMap)    → deleteUser$ + deleteUserReload$
 * rxMethod(loadStats pipe switchMap)     → loadStats$
 * rxMethod(resetDemoData pipe switchMap) → resetDemoData$
 * setTimeout(loadUsers, getNextResetMs)  → scheduleAutoRefresh$ (init effect)
 *
 * KEY DIFFERENCE FROM YOUR STORE:
 * In your store, rxMethod handles BOTH the loading state AND the HTTP.
 * In classical NgRx, effects ONLY do the HTTP — the loading state is
 * set by the reducer reacting to the action (e.g. on(loadUsers) sets loading:true).
 *
 * Effects dispatch result actions → Reducer handles state updates.
 * That's the separation of concerns in the Redux pattern.
 */

import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { toast } from 'ngx-sonner';
import { of, timer } from 'rxjs';
import { catchError, debounceTime, map, switchMap, tap } from 'rxjs/operators';

import { getNextResetMs } from '@app-info';
import { getHttpErrorMessage } from '@core/utils/http-error-message.util';
import { UsersService } from '@features/users/services/user.service';
import * as UsersActions from './users.actions';

@Injectable()
export class UsersEffects {
  private readonly actions$ = inject(Actions);
  private readonly usersService = inject(UsersService);
  private readonly store = inject(Store);

  // ── Load Users ──────────────────────────────────────────────
  // Mirrors: rxMethod<PaginatorState>(pipe(debounceTime(300), switchMap(...)))
  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadUsers),
      debounceTime(300), // ← same as your store
      switchMap(({ page = 1, size = 5 }) =>
        this.usersService.getUsers(page, size).pipe(
          map(response =>
            UsersActions.loadUsersSuccess({
              users: response.data,
              totalItems: response.meta.totalItems,
              currentPage: page,
              pageSize: size,
            })
          ),
          catchError(err => {
            const message = getHttpErrorMessage(err, 'Failed to load users');
            toast.error(message);
            return of(UsersActions.loadUsersFailure({ error: message }));
          })
        )
      )
    )
  );

  // ── Add User ────────────────────────────────────────────────
  // Mirrors: rxMethod<User>(pipe(debounceTime(300), switchMap(...)))
  addUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.addUser),
      debounceTime(300),
      switchMap(({ user }) =>
        this.usersService.addUser(user).pipe(
          tap(() =>
            toast.success('User created!', {
              description: 'The user has been added to the system.',
              duration: 4000,
              position: 'top-right',
            })
          ),
          map(created => UsersActions.addUserSuccess({ user: created })),
          catchError(err => {
            const message = getHttpErrorMessage(err, 'Failed to add user');
            toast.error(message);
            return of(UsersActions.addUserFailure({ error: message }));
          })
        )
      )
    )
  );

  // After add succeeds → re-fetch to keep pagination correct
  // Mirrors: loadUsers({ page: currentPage(), rows: pageSize() }) inside tapResponse
  // This dispatch chain (addUserSuccess → loadUsers) replaces the store's direct call.
  addUserReload$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.addUserSuccess),
      map(() => UsersActions.loadUsers({ page: 1, size: 5 }))
      // Note: in a real app you'd select currentPage from the store and pass it here
    )
  );

  // ── Update User ─────────────────────────────────────────────
  // Mirrors: rxMethod<User>(pipe(debounceTime(500), switchMap(...)))
  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.updateUser),
      debounceTime(500),
      switchMap(({ user }) =>
        this.usersService.updateUser(user).pipe(
          tap(updated =>
            toast.success('User updated!', {
              description: `User "${updated.name}" has been updated.`,
              duration: 4000,
              position: 'top-right',
            })
          ),
          map(updated => UsersActions.updateUserSuccess({ user: updated })),
          catchError(err => {
            const message = getHttpErrorMessage(err, 'Failed to update user');
            toast.error(message);
            return of(UsersActions.updateUserFailure({ error: message }));
          })
        )
      )
    )
  );

  // ── Delete User ─────────────────────────────────────────────
  // Mirrors: rxMethod<string>(pipe(debounceTime(500), switchMap(...)))
  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.deleteUser),
      debounceTime(500),
      switchMap(({ userId }) =>
        this.usersService.deleteUser(userId).pipe(
          tap(() =>
            toast.success('User deleted!', {
              description: 'The user has been removed from the system.',
              duration: 4000,
              position: 'top-right',
            })
          ),
          map(() => UsersActions.deleteUserSuccess({ userId })),
          catchError(err => {
            const message = getHttpErrorMessage(err, 'Failed to delete user');
            toast.error(message);
            return of(UsersActions.deleteUserFailure({ error: message }));
          })
        )
      )
    )
  );

  // After delete → re-fetch (same as your store's loadUsers() + loadStats() calls)
  deleteUserReload$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.deleteUserSuccess),
      switchMap(() => [
        UsersActions.loadUsers({ page: 1, size: 5 }),
        UsersActions.loadStats(),
      ])
    )
  );

  // ── Load Stats ──────────────────────────────────────────────
  loadStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadStats),
      switchMap(() =>
        this.usersService.getUserStats().pipe(
          map(stats => UsersActions.loadStatsSuccess({ stats })),
          catchError(err => {
            const message = getHttpErrorMessage(
              err,
              'Failed to load user stats'
            );
            toast.error(message);
            return of(UsersActions.loadStatsFailure({ error: message }));
          })
        )
      )
    )
  );

  // ── Reset Demo Data ─────────────────────────────────────────
  resetDemoData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.resetDemoData),
      debounceTime(500),
      switchMap(() =>
        this.usersService.resetDemoData().pipe(
          map(() => UsersActions.resetDemoDataSuccess()),
          catchError(err => {
            const message = getHttpErrorMessage(
              err,
              'Failed to reset demo data'
            );
            toast.error(message);
            return of(UsersActions.resetDemoDataFailure({ error: message }));
          })
        )
      )
    )
  );

  // After reset → re-fetch users (same as your store's loadUsers() in tapResponse)
  resetDemoDataReload$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.resetDemoDataSuccess),
      map(() => UsersActions.loadUsers({}))
    )
  );

  // ── Auto-refresh (mirrors your setTimeout → setInterval in withMethods) ──
  // Your store:
  //   setTimeout(() => {
  //     loadUsers();
  //     setInterval(() => loadUsers(), intervalMs);
  //   }, getNextResetMs());
  //
  // Classical NgRx equivalent: an init effect using timer()
  scheduleAutoRefresh$ = createEffect(() =>
    timer(getNextResetMs(), 1000 * 60 * 60).pipe(
      // delay then repeat every hour
      map(() => UsersActions.loadUsers({}))
    )
  );
}
