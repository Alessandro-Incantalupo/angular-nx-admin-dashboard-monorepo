import {
  setError,
  setLoaded,
  setLoading,
  withCallState,
} from '@angular-architects/ngrx-toolkit';
import { signalStoreFeature } from '@ngrx/signals';

export function withUsersCallState() {
  return signalStoreFeature(
    signalStoreFeature(withCallState({ collection: 'users' }))
  );
}

// NOTE: Call state managed by withCallState (e.g. loading, loaded, error for 'users', 'users-add', etc.)
// is NOT merged into your main state and will NOT appear in Redux DevTools.
// Access call state in your components using the toolkit's selectors/signals, e.g.:
// @if (userStore.usersLoading()) {
// This is the recommended modern Angular SignalStore pattern.

export function setUsersLoading() {
  return setLoading('users');
}
export function setUsersLoaded() {
  return setLoaded('users');
}
export function setUsersError(error: string) {
  return setError(error, 'users');
}

export function setUsersAddLoading() {
  return setLoading('users-add');
}
export function setUsersAddLoaded() {
  return setLoaded('users-add');
}
export function setUsersAddError(error: string) {
  return setError(error, 'users-add');
}

export function setUsersUpdateLoading() {
  return setLoading('users-update');
}
export function setUsersUpdateLoaded() {
  return setLoaded('users-update');
}
export function setUsersUpdateError(error: string) {
  return setError(error, 'users-update');
}

export function setUsersDeleteLoading() {
  return setLoading('users-delete');
}
export function setUsersDeleteLoaded() {
  return setLoaded('users-delete');
}
export function setUsersDeleteError(error: string) {
  return setError(error, 'users-delete');
}

export function setUsersResetLoading() {
  return setLoading('users-reset');
}
export function setUsersResetLoaded() {
  return setLoaded('users-reset');
}
export function setUsersResetError(error: string) {
  return setError(error, 'users-reset');
}
