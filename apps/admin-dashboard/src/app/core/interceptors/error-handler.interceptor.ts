import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ProblemDetails } from '@admin-dashboard-nx-monorepo/models';
import { toast } from 'ngx-sonner';
import { catchError, throwError } from 'rxjs';

/**
 * ErrorHandlerInterceptor is the final line of defense for API failures.
 *
 * INTELLIGENT PATTERN: RFC 7807 Professional Error Handling
 * This interceptor catches HttpErrorResponse and attempts to parse the "Problem Details"
 * JSON body sent by our JHipster-style Quarkus backend.
 *
 * It automatically triggers professional toast notifications via ngx-sonner,
 * ensuring the user always knows EXACTLY what went wrong without custom wiring in every component.
 */
export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';
      let errorTitle = 'Error';

      if (error.error) {
        // Try to parse RFC 7807 Problem Details
        const problem = error.error as ProblemDetails;
        errorTitle = problem.title || `Error ${error.status}`;
        errorMessage = problem.detail || error.message || errorMessage;

        // Special handling for Field Validation Errors
        if (problem.fieldErrors && problem.fieldErrors.length > 0) {
          const fields = problem.fieldErrors
            .map(f => `${f.field}: ${f.message}`)
            .join(', ');
          errorMessage = `Validation failed: ${fields}`;
        }
      }

      // Display the error as a rich toast
      toast.error(errorTitle, {
        description: errorMessage,
        duration: 5000,
      });

      // Pass the error along for any component-specific logic
      return throwError(() => error);
    })
  );
};
