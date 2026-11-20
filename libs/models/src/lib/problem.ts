/** An error response (RFC 9457, `application/problem+json`). */
export interface Problem {
  type: string;
  title: string;
  status: number;
  detail?: string;
  /** Field errors from validation, `path` like `email` or `newPassword`. */
  errors?: { path: string; message: string }[];
}

export function isProblem(value: unknown): value is Problem {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Problem).title === 'string' &&
    typeof (value as Problem).status === 'number'
  );
}
