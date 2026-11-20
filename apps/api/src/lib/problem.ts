import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { Problem } from '@dashboard/models';

const titles: Record<number, string> = {
  400: 'The request is not valid',
  401: 'Sign in to continue',
  403: 'You are not allowed to do this',
  404: 'Not found',
  409: 'This conflicts with existing data',
  413: 'The request is too large',
  415: 'Send JSON',
  422: 'Some fields need attention',
  429: 'Too many attempts',
  500: 'Something went wrong on our side',
};

/** An `application/problem+json` response (RFC 9457). Never carries a stack trace. */
export function problem(
  c: Context,
  status: ContentfulStatusCode,
  extra: Partial<Omit<Problem, 'status'>> = {},
  headers: Record<string, string> = {}
) {
  const body: Problem = {
    type: 'about:blank',
    title: titles[status] ?? 'Error',
    status,
    ...extra,
  };
  return c.body(JSON.stringify(body), status, {
    'Content-Type': 'application/problem+json',
    ...headers,
  });
}
