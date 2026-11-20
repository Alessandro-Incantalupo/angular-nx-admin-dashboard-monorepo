import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { SpinnerService } from '../services/spinner.service';

export const BYPASS_LOADING_SPINNER = new HttpContextToken(() => false);

export const LoadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(BYPASS_LOADING_SPINNER)) return next(req);

  const spinner = inject(SpinnerService);
  spinner.dispatch(true);

  return next(req).pipe(finalize(() => spinner.dispatch(false)));
};
