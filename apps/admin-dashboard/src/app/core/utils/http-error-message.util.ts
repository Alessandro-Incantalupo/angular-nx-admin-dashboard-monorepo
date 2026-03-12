import { ProblemDetails } from '@admin-dashboard-nx-monorepo/models';
import { HttpErrorResponse } from '@angular/common/http';

const statusMessages = {
  429: 'Too many requests. Please wait and try again.',
} as const;

export function getHttpErrorMessage(
  err: unknown,
  fallback = 'Error fallback'
): string {
  if (err instanceof HttpErrorResponse) {
    // RFC 7807 ProblemDetails: { title, detail, fieldErrors, ... }
    // The Quarkus backend sends this as the parsed JSON body in err.error.
    if (err.error && typeof err.error === 'object') {
      const problem = err.error as ProblemDetails;
      if (problem.fieldErrors?.length) {
        return `Validation failed: ${problem.fieldErrors.map(f => `${f.field}: ${f.message}`).join(', ')}`;
      }
      if (problem.detail) return problem.detail;
      if (problem.title) return problem.title;
    }
    // Fallback chain: plain string body → known status code → HTTP message → user-supplied fallback
    return (
      (typeof err.error === 'string' && err.error) ||
      statusMessages[err.status as keyof typeof statusMessages] ||
      err.message ||
      fallback
    );
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
