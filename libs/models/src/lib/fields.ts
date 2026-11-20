import * as z from 'zod';

/** An email address: trimmed and lower-cased before it is checked. */
export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Enter an email address')
  .max(254, 'Use at most 254 characters')
  .pipe(z.email('Enter a valid email address, like name@example.com'));

/** A person's or a workspace's display name. */
export const nameField = z
  .string()
  .trim()
  .min(2, 'Use at least 2 characters')
  .max(80, 'Use at most 80 characters');
