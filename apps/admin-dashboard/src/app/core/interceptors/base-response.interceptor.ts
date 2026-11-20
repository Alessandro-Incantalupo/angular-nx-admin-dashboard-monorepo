import { BaseResponse } from '@admin-dashboard-nx-monorepo/models';
import {
  HttpContextToken,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { filter, map } from 'rxjs';

// Token to whitelist APIs that should skip this interceptor
export const WHITELISTED_API = new HttpContextToken<boolean>(() => false);

// Main interceptor function
export const BaseResponseInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip interception if the request is whitelisted
  if (req.context.get(WHITELISTED_API)) return next(req);

  return next(req).pipe(
    // Only process HttpResponse events
    filter(
      (event): event is HttpResponse<BaseResponse<unknown>> =>
        event instanceof HttpResponse
    ),
    map(resp => {
      // Throw if the response body is missing
      if (!resp.body) throw new Error('No body in response');
      const { data, code, message } = resp.body;

      // Throw if backend signals an error (code -1 or >0 with a message)
      if (
        typeof message === 'string' &&
        typeof code === 'number' &&
        (code === -1 || code > 0)
      ) {
        throw new Error(message ?? 'Unknown error');
      }

      // Unwrap the data property for downstream consumers
      return resp.clone({ body: resp.body });
    })
  );
};
