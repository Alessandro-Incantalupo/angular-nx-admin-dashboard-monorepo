/**
 * ============================================================
 * EXERCISE 07 — NgRx Classical (Redux Pattern)
 * vs your SignalStore
 * ============================================================
 *
 * YOUR PROJECT uses NgRx SignalStore (modern, signals-based).
 * Classical NgRx uses the Redux pattern (Actions→Reducer→Effects→Selectors).
 * Both are NgRx. Same library family, different API.
 *
 * ┌─────────────────────┬─────────────────────────────────────┐
 * │ SignalStore          │ Classical NgRx (Redux)              │
 * ├─────────────────────┼─────────────────────────────────────┤
 * │ withState()         │ createReducer() + initial state     │
 * │ withComputed()      │ createSelector()                    │
 * │ withMethods()       │ dispatch(action) + Effects          │
 * │ rxMethod()          │ createEffect() + Actions stream     │
 * │ updateState()       │ return new state from reducer        │
 * │ tapResponse()       │ catchError() / EMPTY in effect      │
 * │ inject(Store)       │ inject(Store) - same!               │
 * └─────────────────────┴─────────────────────────────────────┘
 *
 * REDUX CORE RULE (3 principles):
 *   1. Single source of truth — one Store for everything
 *   2. State is read-only     — you never mutate state directly
 *   3. Changes via pure functions — reducers: (state, action) → newState
 *
 * DATA FLOW (unidirectional):
 *   Component → dispatch(action) → Reducer → new State → Selector → Component
 *                                       ↳ Effect (async) → dispatch(resultAction)
 */

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  Store,
  createAction,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
  props,
} from '@ngrx/store';
import { EMPTY, catchError, map, switchMap } from 'rxjs';

// ─────────────────────────────────────────────────────────────
// SECTION 1 — ACTIONS
// ─────────────────────────────────────────────────────────────
//
// Actions = events. They describe WHAT HAPPENED, not how to handle it.
// Think of them as the "dispatch" call in your SignalStore.
//
// In your store:
//   loadUsers(paginatorState)  → triggers the rxMethod
//   updateState(state, 'Load Success', { users: [...] })
//
// In classical NgRx, each of those is a named action:

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'inactive';
}

// TODO A1: Create a 'loadUsers' action.
// It should carry page and size as props.
// Hint: createAction('[Users] Load Users', props<{ page: number; size: number }>())
export const loadUsers = createAction(
  '[Users] Load Users',
  /* TODO: add props for page: number, size: number */
  props<{ page: number; size: number }>() // ← already done; understand the syntax
);

// TODO A2: Create a 'loadUsersSuccess' action.
// It should carry the users array and totalItems count.
export const loadUsersSuccess = createAction(
  '[Users] Load Users Success',
  /* TODO */
  props<{ users: User[]; totalItems: number }>() // ← fill this yourself first
);

// TODO A3: Create a 'loadUsersFailure' action with an error string.
export const loadUsersFailure = createAction(
  '[Users] Load Users Failure',
  /* TODO */
  props<{ error: string }>()
);

// TODO A4: Create 'addUser', 'addUserSuccess', 'addUserFailure' actions.
// addUser carries a User object.
// addUserSuccess carries the created User.
// addUserFailure carries an error string.
export const addUser = /* TODO */ createAction(
  '[Users] Add User',
  props<{ user: User }>()
);
export const addUserSuccess = /* TODO */ createAction(
  '[Users] Add User Success',
  props<{ user: User }>()
);
export const addUserFailure = /* TODO */ createAction(
  '[Users] Add User Failure',
  props<{ error: string }>()
);

/*
 * ✅ ACTION SYNTAX EXPLAINED:
 *
 * createAction(type, props<T>())
 *   type    = unique string, convention: '[FeatureName] Description'
 *   props   = payload shape (what data this action carries)
 *
 * When you dispatch: store.dispatch(loadUsers({ page: 1, size: 10 }))
 * The action object looks like: { type: '[Users] Load Users', page: 1, size: 10 }
 *
 * Actions with no payload: createAction('[Users] Clear')  — no props()
 */

// ─────────────────────────────────────────────────────────────
// SECTION 2 — STATE & REDUCER
// ─────────────────────────────────────────────────────────────
//
// Reducer = pure function: (currentState, action) → newState
// It NEVER mutates state — always returns a new object.
//
// In your SignalStore:
//   withState(initialState)    → defines the shape + defaults
//   updateState(state, label, { users: [...] })  → like returning new state from a reducer

export interface UsersState {
  users: User[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

export const initialUsersState: UsersState = {
  users: [],
  totalItems: 0,
  currentPage: 1,
  pageSize: 5,
  loading: false,
  error: null,
};

// TODO R1: Complete the reducer.
// Each `on(action, (state, action) => newState)` handles one action.
// RULES:
//   - NEVER mutate state directly (state.users.push() is WRONG)
//   - Always return a new object: { ...state, changedField: newValue }
export const usersReducer = createReducer(
  initialUsersState,

  // When load starts → set loading true, clear errors
  on(loadUsers, state => ({
    /* TODO: spread state, set loading: true, error: null */
    ...state,
    loading: true,
    error: null,
  })),

  // TODO R2: Handle loadUsersSuccess
  // → set loading false, update users and totalItems from action payload
  on(loadUsersSuccess, (state, action) => ({
    /* TODO */
    ...state,
    loading: false,
    users: action.users,
    totalItems: action.totalItems,
  })),

  // TODO R3: Handle loadUsersFailure
  // → set loading false, store the error message
  on(loadUsersFailure, (state, action) => ({
    /* TODO */
    ...state,
    loading: false,
    error: action.error,
  })),

  // TODO R4: Handle addUserSuccess
  // → append the new user to the existing array (NO mutation!)
  // Hint: users: [...state.users, action.user]
  on(addUserSuccess, (state, action) => ({
    /* TODO */
    ...state,
    users: [...state.users, action.user],
  }))
);

/*
 * ✅ REDUCER KEY POINTS:
 *
 * { ...state, loading: true }
 *   → spread operator creates a NEW object — state is not mutated
 *   → only 'loading' changes; everything else stays the same
 *
 * [...state.users, action.user]
 *   → new array — the original is not mutated
 *
 * COMPARISON TO SIGNALSTORE:
 *   updateState(state, 'Load Success', { users: response.data })
 *   ≡ on(loadUsersSuccess, (s, a) => ({ ...s, users: a.users }))
 */

// ─────────────────────────────────────────────────────────────
// SECTION 3 — SELECTORS
// ─────────────────────────────────────────────────────────────
//
// Selectors = memoized derived state. Like computed() in SignalStore.
// They take the store state and return a slice or computed value.
// Memoized = only re-computed when their input changes.
//
// In your SignalStore:
//   withComputed(({ users }) => ({ hasUsers: computed(() => users().length > 0) }))

// Step 1: feature selector — points to the 'users' slice of the global store
export const selectUsersFeature = createFeatureSelector<UsersState>('users');

// Step 2: slice selectors — derive from the feature
export const selectAllUsers = createSelector(selectUsersFeature, s => s.users);
export const selectUsersLoading = createSelector(
  selectUsersFeature,
  s => s.loading
);
export const selectUsersError = createSelector(
  selectUsersFeature,
  s => s.error
);
export const selectTotalItems = createSelector(
  selectUsersFeature,
  s => s.totalItems
);

// TODO S1: Create a selector 'selectHasUsers' that returns true if users.length > 0
// Hint: use selectAllUsers as input, not selectUsersFeature directly
export const selectHasUsers = createSelector(
  /* TODO: input selector */
  selectAllUsers,
  /* TODO: projector function */
  users => users.length > 0
);

// TODO S2: Create a combined selector 'selectUsersVM' (view model) that
// returns { users, loading, error, hasUsers, totalItems } in one object.
// Use multiple input selectors.
export const selectUsersVM = createSelector(
  selectAllUsers,
  selectUsersLoading,
  selectUsersError,
  selectHasUsers,
  selectTotalItems,
  /* TODO: projector */
  (users, loading, error, hasUsers, totalItems) => ({
    users,
    loading,
    error,
    hasUsers,
    totalItems,
  })
);

/*
 * ✅ SELECTOR ANATOMY:
 *
 * createSelector(inputSelector1, inputSelector2, projectorFn)
 *
 * The LAST argument is always the projector:
 *   (valueFromSelector1, valueFromSelector2) => derivedValue
 *
 * WHY chain selectors?
 * selectHasUsers uses selectAllUsers (not selectUsersFeature directly).
 * If selectAllUsers changes, selectHasUsers re-computes.
 * If something ELSE in UsersState changes, selectHasUsers does NOT re-compute.
 * This is memoization — performance optimization.
 */

// ─────────────────────────────────────────────────────────────
// SECTION 4 — EFFECTS
// ─────────────────────────────────────────────────────────────
//
// Effects = where side effects live (HTTP calls, localStorage, etc.)
// They LISTEN for actions, do async work, and DISPATCH result actions.
//
// In your SignalStore:
//   rxMethod(pipe(switchMap(payload => service.call(payload).pipe(
//     tapResponse({ next: ..., error: ... })
//   ))))
//
// In classical NgRx, this is split: the action triggers an Effect
// which dispatches a success/failure action for the reducer to handle.

@Injectable()
export class UsersEffects {
  private readonly actions$ = inject(Actions); // stream of ALL dispatched actions
  private readonly http = inject(HttpClient);

  // TODO E1: Complete the loadUsers$ effect.
  //
  // It should:
  //   1. Listen for loadUsers action (ofType)
  //   2. switchMap to an HTTP call
  //   3. On success → dispatch loadUsersSuccess
  //   4. On error  → dispatch loadUsersFailure (return EMPTY to keep effect alive)
  //
  // IMPORTANT: { dispatch: true } = this effect dispatches an action (default)
  //            { dispatch: false } = this effect has side effects but no action

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUsers), // 1. listen for this action
      switchMap(
        (
          { page, size } // 2. start HTTP (cancel previous)
        ) =>
          this.http
            .get<{
              data: User[];
              meta: { totalItems: number };
            }>(`/api/users?page=${page}&size=${size}`)
            .pipe(
              map(
                (
                  response // 3. success → dispatch
                ) =>
                  loadUsersSuccess({
                    users: response.data,
                    totalItems: response.meta.totalItems,
                  })
              ),
              catchError(err => {
                // 4. error → dispatch failure
                /* TODO: dispatch loadUsersFailure({ error: err.message }) */
                // Hint: return of(loadUsersFailure({ error: err.message }))
                return EMPTY; // ← replace with the failure action dispatch
              })
            )
      )
    )
  );

  // TODO E2: Create an addUser$ effect that listens for addUser action,
  // POSTs to /api/users, dispatches addUserSuccess or addUserFailure.
  addUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addUser),
      switchMap(({ user }) =>
        this.http.post<User>('/api/users', user).pipe(
          map(created => addUserSuccess({ user: created })),
          catchError(err => {
            /* TODO */
            return EMPTY;
          })
        )
      )
    )
  );

  /*
   * ✅ EFFECT PATTERN EXPLAINED:
   *
   * createEffect(() => actions$.pipe(
   *   ofType(someAction),           ← filter: only this action type
   *   switchMap(payload => ...),    ← handle async (cancel previous)
   *   map(result => resultAction),  ← transform to success action
   *   catchError(() => EMPTY)       ← on error: dispatch failure action
   *                                    EMPTY = don't dispatch, keep effect alive
   * ))
   *
   * WHY `of(failureAction)` instead of EMPTY?
   *   catchError must return an Observable.
   *   of(action) emits one value (the failure action) then completes.
   *   EMPTY completes immediately without emitting — no action dispatched.
   *   Both keep the outer stream alive for future actions.
   *
   * THE COMPLETE ANSWER for catchError in effects:
   *   return of(loadUsersFailure({ error: err.message }));
   */
}

// ─────────────────────────────────────────────────────────────
// SECTION 5 — COMPONENT USAGE
// ─────────────────────────────────────────────────────────────
//
// In your SignalStore — inject the store and call methods:
//   const store = inject(UsersStore);
//   store.loadUsers({ page: 1, rows: 5 });
//   store.users()              ← signal, reactive
//   store.usersLoading()       ← signal
//
// In classical NgRx — inject Store, dispatch actions, select with signals/observables:

import { Component, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-users-classic',
  standalone: true,
  template: `
    @if (vm()?.loading) {
      <p>Loading…</p>
    }
    @for (user of vm()?.users; track user.id) {
      <p>{{ user.name }}</p>
    } @empty {
      <p>No users found.</p>
    }
  `,
})
export class UsersClassicComponent implements OnInit {
  private readonly store = inject(Store);

  // Convert Observable selector to signal (same as your SignalStore signals)
  readonly vm = toSignal(this.store.select(selectUsersVM));

  ngOnInit() {
    // TODO C1: Dispatch loadUsers action on init
    // Hint: this.store.dispatch(loadUsers({ page: 1, size: 5 }))
    /* TODO */
    this.store.dispatch(loadUsers({ page: 1, size: 5 }));
  }

  deleteUser(id: string) {
    // TODO C2: What would you dispatch here?
    // (You'd need a deleteUser action — same pattern as addUser above)
    /* TODO */
  }
}

/*
 * ✅ CLASSICAL NgRx vs SIGNALSTORE — INTERVIEW ANSWER
 *
 * "Both are NgRx. SignalStore is the modern, signal-based API added in NgRx 17.
 *  Classical NgRx uses Actions, Reducers, Effects, and Selectors — the Redux pattern.
 *
 *  In my project I use SignalStore because:
 *  - Less boilerplate: withMethods replaces Actions + Effects for simple cases
 *  - Signals are natively reactive without needing toSignal()
 *  - rxMethod handles the Observable pipeline in one place
 *
 *  But I understand the Redux pattern:
 *  - Actions = events dispatched by components
 *  - Reducers = pure functions that return new state
 *  - Effects = async side effects that dispatch result actions
 *  - Selectors = memoized derived state
 *
 *  The unidirectional data flow is the same:
 *  Component → dispatch action → Reducer updates state → Selector returns new value → Component re-renders"
 */
