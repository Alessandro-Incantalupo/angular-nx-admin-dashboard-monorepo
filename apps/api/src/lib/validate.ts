import { zValidator } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import type { z } from 'zod';
import { problem } from './problem';

/**
 * Validates a JSON body or a query string with a shared Zod schema. A failure
 * answers 422 with one plain message per field.
 */
export const validate = <
  T extends z.ZodType,
  Target extends keyof ValidationTargets,
>(
  target: Target,
  schema: T
) =>
  zValidator(target, schema, (result, c) => {
    if (!result.success) {
      return problem(c, 422, {
        errors: result.error.issues.map(i => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      });
    }
    return undefined;
  });
