/**
 * ============================================================
 * users.state.ts + users.reducer.ts
 * Classical NgRx equivalent of user.store.ts state + updateState() calls
 * ============================================================
 *
 * YOUR STORE                        → THIS FILE
 * ─────────────────────────────────────────────────────────────
 * type State { users, clonedUsers, stats }   → UsersState
 * withState(initialState)                    → initialUsersState
 * withPagination(...)                        → currentPage, pageSize, totalItems in state
 * withCallState({ collection:'users' })      → loading/error flags per operation
 * updateState(state, label, patch)           → on(action, (state) => ({ ...state, ...patch }))
 * startEditing / cancelEditing / restore     → pure reducer cases (no effect needed)
 */

import { User } from '@admin-dashboard-nx-monorepo/models';
import { createReducer, on } from '@ngrx/store';
import * as UsersActions from './users.actions';

// ── State shape ───────────────────────────────────────────────
// Combines your: State + PaginationState + CallState into one flat object
export interface UsersState {
  // Core data (mirrors your withState)
  users: User[];
  clonedUsers: Record<string, User>; // for inline editing — same as yours
  stats: Record<string, number>;

  // Pagination (mirrors your withPagination)
  currentPage: number;
  pageSize: number;
  totalItems: number;

  // Per-operation loading/error flags (mirrors your withCallState)
  usersLoading: boolean;
  usersError: string | null;
  addLoading: boolean;
  addError: string | null;
  updateLoading: boolean;
  updateError: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
  statsLoading: boolean;
  statsError: string | null;
  resetDemoLoading: boolean;
  resetDemoError: string | null;
}

export const initialUsersState: UsersState = {
  users: [],
  clonedUsers: {},
  stats: {},
  currentPage: 1,
  pageSize: 5,
  totalItems: 0,
  usersLoading: false,
  usersError: null,
  addLoading: false,
  addError: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
  statsLoading: false,
  statsError: null,
  resetDemoLoading: false,
  resetDemoError: null,
};

// ── Reducer ───────────────────────────────────────────────────
// Each `on()` = one `updateState()` call in your store
export const usersReducer = createReducer(
  initialUsersState,

  // ── Load Users ──────────────────────────────────────────────
  // your store: tap(() => setUsersLoading())
  on(UsersActions.loadUsers, state => ({
    ...state,
    usersLoading: true,
    usersError: null,
  })),

  // your store: updateState(state, 'Users: Load Success', { users, currentPage, pageSize, totalItems })
  on(
    UsersActions.loadUsersSuccess,
    (state, { users, totalItems, currentPage, pageSize }) => ({
      ...state,
      users,
      totalItems,
      currentPage,
      pageSize,
      usersLoading: false,
      usersError: null,
    })
  ),

  // your store: updateState(state, 'Users: Load Error')
  on(UsersActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    usersLoading: false,
    usersError: error,
  })),

  // ── Add User ────────────────────────────────────────────────
  on(UsersActions.addUser, state => ({
    ...state,
    addLoading: true,
    addError: null,
  })),

  // your store: after addUser success it re-calls loadUsers() to refresh pagination
  // In classical NgRx we handle that by dispatching loadUsers from the AddUser effect
  on(UsersActions.addUserSuccess, state => ({
    ...state,
    addLoading: false,
    addError: null,
    // Note: we don't manually push to users[] here because the effect
    // also dispatches loadUsers to re-fetch and keep pagination correct
  })),

  on(UsersActions.addUserFailure, (state, { error }) => ({
    ...state,
    addLoading: false,
    addError: error,
  })),

  // ── Update User ─────────────────────────────────────────────
  on(UsersActions.updateUser, state => ({
    ...state,
    updateLoading: true,
    updateError: null,
  })),

  // your store: users: state.users().map(u => u.id === user.id ? user : u)
  on(UsersActions.updateUserSuccess, (state, { user }) => ({
    ...state,
    updateLoading: false,
    updateError: null,
    users: state.users.map(u => (u.id === user.id ? user : u)), // replace in place
  })),

  on(UsersActions.updateUserFailure, (state, { error }) => ({
    ...state,
    updateLoading: false,
    updateError: error,
  })),

  // ── Delete User ─────────────────────────────────────────────
  on(UsersActions.deleteUser, state => ({
    ...state,
    deleteLoading: true,
    deleteError: null,
  })),

  // your store: users: state.users().filter(u => u.id !== userId)
  on(UsersActions.deleteUserSuccess, (state, { userId }) => ({
    ...state,
    deleteLoading: false,
    deleteError: null,
    users: state.users.filter(u => u.id !== userId), // remove from list
  })),

  on(UsersActions.deleteUserFailure, (state, { error }) => ({
    ...state,
    deleteLoading: false,
    deleteError: error,
  })),

  // ── Load Stats ──────────────────────────────────────────────
  on(UsersActions.loadStats, state => ({
    ...state,
    statsLoading: true,
    statsError: null,
  })),

  // your store: updateState(state, 'Stats: Loaded', { stats })
  on(UsersActions.loadStatsSuccess, (state, { stats }) => ({
    ...state,
    stats,
    statsLoading: false,
    statsError: null,
  })),

  on(UsersActions.loadStatsFailure, (state, { error }) => ({
    ...state,
    statsLoading: false,
    statsError: error,
  })),

  // ── Reset Demo Data ─────────────────────────────────────────
  on(UsersActions.resetDemoData, state => ({
    ...state,
    resetDemoLoading: true,
    resetDemoError: null,
  })),

  on(UsersActions.resetDemoDataSuccess, state => ({
    ...state,
    resetDemoLoading: false,
  })),

  on(UsersActions.resetDemoDataFailure, (state, { error }) => ({
    ...state,
    resetDemoLoading: false,
    resetDemoError: error,
  })),

  // ── Inline Editing ──────────────────────────────────────────
  // These are PURE SYNC — no HTTP, so they go directly to the reducer
  // (no Effect needed — just action → reducer)

  // your store: updateState(state, 'User: Start Editing', { clonedUsers: { ...state.clonedUsers(), [user.id]: structuredClone(user) } })
  on(UsersActions.startEditing, (state, { user }) => ({
    ...state,
    clonedUsers: {
      ...state.clonedUsers,
      [user.id]: structuredClone(user), // deep clone to preserve original
    },
  })),

  // your store: delete cloned[user.id]; updateState(...)
  on(UsersActions.cancelEditing, (state, { user }) => {
    const { [user.id]: _, ...rest } = state.clonedUsers; // remove key immutably
    return { ...state, clonedUsers: rest };
  }),

  // your store: map users[] replacing the edited user with the original clone
  on(UsersActions.restoreUser, (state, { userId }) => {
    const original = state.clonedUsers[userId];
    if (!original) return state;
    const { [userId]: _, ...remainingClones } = state.clonedUsers;
    return {
      ...state,
      users: state.users.map(u =>
        u.id === userId ? structuredClone(original) : u
      ),
      clonedUsers: remainingClones,
    };
  }),

  // your store: reset() → updateState(state, 'Users: Reset', initialState)
  on(UsersActions.resetState, () => initialUsersState)
);
