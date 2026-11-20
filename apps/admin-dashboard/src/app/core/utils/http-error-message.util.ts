import { HttpErrorResponse } from '@angular/common/http';

const statusMessages = {
  429: 'Too many requests. Please wait and try again.',
} as const;

export function getHttpErrorMessage(
  err: unknown,
  fallback = 'Error fallback'
): string {
  if (err instanceof HttpErrorResponse) {
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
