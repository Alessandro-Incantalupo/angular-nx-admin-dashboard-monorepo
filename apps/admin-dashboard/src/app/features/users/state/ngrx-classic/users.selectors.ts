/**
 * ============================================================
 * users.selectors.ts — Classical NgRx equivalent of withComputed()
 * ============================================================
 *
 * YOUR STORE (withComputed)                → THIS FILE
 * ─────────────────────────────────────────────────────────────
 * computed(() => users().length > 0)       → selectHasUsers
 * state.users()                            → selectAllUsers
 * state.clonedUsers()                      → selectClonedUsers
 * state.stats()                            → selectStats
 * state.usersLoading()                     → selectUsersLoading
 * etc.                                     → per-field selectors
 *
 * COMPONENTS use selectors to read from the store.
 * The selector is MEMOIZED — only re-computes when its input changes.
 * This = computed() in your SignalStore.
 *
 * USAGE IN COMPONENT:
 *   this.store.select(selectAllUsers)          → Observable<User[]>
 *   toSignal(this.store.select(selectAllUsers)) → Signal<User[]>
 */

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UsersState } from './users.reducer';

// ── Feature selector ──────────────────────────────────────────
// Points to the 'users' slice registered in app.config.ts with:
//   provideState('users', usersReducer)
export const selectUsersFeature = createFeatureSelector<UsersState>('users');

// ── Data selectors ────────────────────────────────────────────
// Mirror: state.users(), state.clonedUsers(), state.stats()
export const selectAllUsers = createSelector(selectUsersFeature, s => s.users);
export const selectClonedUsers = createSelector(
  selectUsersFeature,
  s => s.clonedUsers
);
export const selectStats = createSelector(selectUsersFeature, s => s.stats);

// ── Pagination selectors ──────────────────────────────────────
// Mirror: withPagination signals — state.currentPage(), state.pageSize(), state.totalItems()
export const selectCurrentPage = createSelector(
  selectUsersFeature,
  s => s.currentPage
);
export const selectPageSize = createSelector(
  selectUsersFeature,
  s => s.pageSize
);
export const selectTotalItems = createSelector(
  selectUsersFeature,
  s => s.totalItems
);

// ── Loading/error selectors ───────────────────────────────────
// Mirror: withCallState — your store exposes these via separate signals
export const selectUsersLoading = createSelector(
  selectUsersFeature,
  s => s.usersLoading
);
export const selectUsersError = createSelector(
  selectUsersFeature,
  s => s.usersError
);
export const selectAddLoading = createSelector(
  selectUsersFeature,
  s => s.addLoading
);
export const selectUpdateLoading = createSelector(
  selectUsersFeature,
  s => s.updateLoading
);
export const selectDeleteLoading = createSelector(
  selectUsersFeature,
  s => s.deleteLoading
);
export const selectStatsLoading = createSelector(
  selectUsersFeature,
  s => s.statsLoading
);
export const selectResetDemoLoading = createSelector(
  selectUsersFeature,
  s => s.resetDemoLoading
);

// ── Computed/derived selectors ────────────────────────────────
// Mirror: withComputed(({ users }) => ({ hasUsers: computed(() => users().length > 0) }))
export const selectHasUsers = createSelector(
  selectAllUsers,
  users => users.length > 0 // ← same logic as your computed()
);

// Returns the cloned (original) version of a specific user — used for inline row editing
// Mirror: state.clonedUsers()[user.id]
export const selectClonedUser = (userId: string) =>
  createSelector(selectClonedUsers, cloned => cloned[userId] ?? null);

// ── View Model selector ───────────────────────────────────────
// Combines everything a component needs into one Object.
// Avoids multiple store.select() calls in the component.
// Mirror: your component injecting UsersStore and reading multiple signals.
export const selectUsersVM = createSelector(
  selectAllUsers,
  selectHasUsers,
  selectTotalItems,
  selectCurrentPage,
  selectPageSize,
  selectUsersLoading,
  selectUsersError,
  selectStats,
  (
    users,
    hasUsers,
    totalItems,
    currentPage,
    pageSize,
    loading,
    error,
    stats
  ) => ({
    users,
    hasUsers,
    totalItems,
    currentPage,
    pageSize,
    loading,
    error,
    stats,
  })
);
