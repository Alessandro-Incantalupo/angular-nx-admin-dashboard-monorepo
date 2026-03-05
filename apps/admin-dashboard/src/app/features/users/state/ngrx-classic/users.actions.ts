/**
 * ============================================================
 * users.actions.ts — Classical NgRx equivalent of user.store.ts
 * ============================================================
 *
 * YOUR STORE           → THIS FILE
 * ─────────────────────────────────────────────────────────────
 * rxMethod(loadUsers)  → [Users] Load Users / Success / Failure
 * rxMethod(addUser)    → [Users] Add User  / Success / Failure
 * rxMethod(updateUser) → [Users] Update    / Success / Failure
 * rxMethod(deleteUser) → [Users] Delete    / Success / Failure
 * rxMethod(loadStats)  → [Users] Load Stats / Success / Failure
 * rxMethod(resetDemo)  → [Users] Reset Demo / Success / Failure
 * startEditing(user)   → [Users] Start Editing
 * cancelEditing(user)  → [Users] Cancel Editing
 * restoreUser(user)    → [Users] Restore User
 * reset()              → [Users] Reset State
 */

import { User } from '@admin-dashboard-nx-monorepo/models';
import { createAction, props } from '@ngrx/store';

// ── Load Users ────────────────────────────────────────────────
export const loadUsers = createAction(
  '[Users] Load Users',
  props<{ page?: number; size?: number }>()
);
export const loadUsersSuccess = createAction(
  '[Users] Load Users Success',
  props<{
    users: User[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
  }>()
);
export const loadUsersFailure = createAction(
  '[Users] Load Users Failure',
  props<{ error: string }>()
);

// ── Add User ──────────────────────────────────────────────────
export const addUser = createAction(
  '[Users] Add User',
  props<{ user: User }>()
);
export const addUserSuccess = createAction(
  '[Users] Add User Success',
  props<{ user: User }>()
);
export const addUserFailure = createAction(
  '[Users] Add User Failure',
  props<{ error: string }>()
);

// ── Update User ───────────────────────────────────────────────
export const updateUser = createAction(
  '[Users] Update User',
  props<{ user: User }>()
);
export const updateUserSuccess = createAction(
  '[Users] Update User Success',
  props<{ user: User }>()
);
export const updateUserFailure = createAction(
  '[Users] Update User Failure',
  props<{ error: string }>()
);

// ── Delete User ───────────────────────────────────────────────
export const deleteUser = createAction(
  '[Users] Delete User',
  props<{ userId: string }>()
);
export const deleteUserSuccess = createAction(
  '[Users] Delete User Success',
  props<{ userId: string }>()
);
export const deleteUserFailure = createAction(
  '[Users] Delete User Failure',
  props<{ error: string }>()
);

// ── Load Stats ────────────────────────────────────────────────
export const loadStats = createAction('[Users] Load Stats');
export const loadStatsSuccess = createAction(
  '[Users] Load Stats Success',
  props<{ stats: Record<string, number> }>()
);
export const loadStatsFailure = createAction(
  '[Users] Load Stats Failure',
  props<{ error: string }>()
);

// ── Reset Demo Data ───────────────────────────────────────────
export const resetDemoData = createAction('[Users] Reset Demo Data');
export const resetDemoDataSuccess = createAction(
  '[Users] Reset Demo Data Success'
);
export const resetDemoDataFailure = createAction(
  '[Users] Reset Demo Data Failure',
  props<{ error: string }>()
);

// ── Inline Editing (pure sync — no HTTP, no effects needed) ──
// In your store these call updateState() directly.
// In classical NgRx they go action → reducer directly (no effect).
export const startEditing = createAction(
  '[Users] Start Editing',
  props<{ user: User }>()
);
export const cancelEditing = createAction(
  '[Users] Cancel Editing',
  props<{ user: User }>()
);
export const restoreUser = createAction(
  '[Users] Restore User',
  props<{ userId: string }>()
);
export const resetState = createAction('[Users] Reset State');
