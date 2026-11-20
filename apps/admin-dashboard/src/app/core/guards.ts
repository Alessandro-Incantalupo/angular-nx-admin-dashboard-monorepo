import { inject } from '@angular/core';
import { type CanMatchFn, Router } from '@angular/router';
import { SessionStore } from './session-store';

/**
 * These guards only decide what the UI shows. Every API route checks the
 * session and the role on the server, whatever the browser does.
 */
export const signedIn: CanMatchFn = async (_route, segments) => {
  // inject() before the first await: after it, the injection context is gone.
  const router = inject(Router);
  const user = await inject(SessionStore).ensureLoaded();
  if (user) return true;
  const next = '/' + segments.map(s => s.path).join('/');
  return router.createUrlTree(['/login'], {
    queryParams: next === '/' ? {} : { next },
  });
};

export const guestOnly: CanMatchFn = async () => {
  const router = inject(Router);
  const user = await inject(SessionStore).ensureLoaded();
  return user ? router.createUrlTree(['/dashboard']) : true;
};

/** Where to go after signing in: only a path inside this app, never another site. */
export function safeNext(next: string | null | undefined): string {
  if (
    !next ||
    !next.startsWith('/') ||
    next.startsWith('//') ||
    next.startsWith('/\\')
  ) {
    return '/dashboard';
  }
  return next.startsWith('/login') ? '/dashboard' : next;
}
