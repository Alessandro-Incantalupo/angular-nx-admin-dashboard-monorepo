import { BaseResponse } from '@admin-dashboard-nx-monorepo/models';
import {
  HttpContextToken,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { filter, map } from 'rxjs';

// Token to whitelist APIs that should skip this interceptor
export const WHITELISTED_API = new HttpContextToken<boolean>(() => false);

/**
 * BaseResponseInterceptor handles "Unwrapping" the Response Envelope.
 *
 * INTELLIGENT PATTERN: Conditional Unwrapping
 * We check if the response looks like an envelope ({data, ...}).
 * - If YES: We unwrap 'data' and present it to the service.
 * - If NO: We pass the raw response through (supports direct entities or library calls).
 */
export const BaseResponseInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(WHITELISTED_API)) return next(req);

  return next(req).pipe(
    filter(
      (event): event is HttpResponse<any> => event instanceof HttpResponse
    ),
    map(resp => {
      const body = resp.body;

      // Smart Check: Does it look like an envelope we should unwrap?
      if (body && typeof body === 'object' && 'data' in body) {
        const { data, code, message } = body;

        // Legacy check for app-level error codes inside a 200 OK
        if (
          typeof message === 'string' &&
          Number.isInteger(code) &&
          (code === -1 || (code !== null && code > 0))
        ) {
          throw new Error(message ?? 'Backend signaled an application error');
        }

        /**
         * INTELLIGENT PATTERN: Selective Unwrapping
         * If it's a PaginatedResponse (contains 'meta'), we DON'T unwrap 'data'
         * because the component needs the metadata (totalItems, etc).
         */
        if ('meta' in body) {
          return resp;
        }

        // For simple envelopes, return the unwrapped data
        return resp.clone({ body: data });
      }

      // If not an envelope, pass through the raw body (Standard REST / entities)
      return resp;
    })
  );
};
