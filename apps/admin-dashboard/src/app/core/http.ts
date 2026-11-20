import {
  HttpErrorResponse,
  type HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { isProblem, type Problem } from '@dashboard/models/problem';
import { catchError, throwError } from 'rxjs';
import { SessionStore } from './session-store';

/** Any failed request as a Problem, so components handle one shape. */
export function toProblem(err: unknown): Problem {
  if (err instanceof HttpErrorResponse) {
    if (isProblem(err.error)) return err.error;
    if (err.status === 0) {
      return {
        type: 'about:blank',
        status: 0,
        title: "Can't reach the server",
        detail: 'Check your connection and try again.',
      };
    }
    return {
      type: 'about:blank',
      status: err.status,
      title: 'Something went wrong',
      detail: 'Please try again.',
    };
  }
  return {
    type: 'about:blank',
    status: 0,
    title: 'Something went wrong',
    detail: 'Please try again.',
  };
}

/**
 * A 401 from any call but the session check means the session ended (it
 * expired, or the password was changed elsewhere): forget the user and go
 * to the sign-in page, coming back here afterwards.
 */
export const sessionExpiredInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionStore);
  const router = inject(Router);
  return next(req).pipe(
    catchError((err: unknown) => {
      const expired =
        err instanceof HttpErrorResponse &&
        err.status === 401 &&
        !req.url.startsWith('/api/auth/') &&
        session.user() !== null;
      if (expired) {
        session.forget();
        void router.navigate(['/login'], { queryParams: { next: router.url } });
      }
      return throwError(() => err);
    })
  );
};
