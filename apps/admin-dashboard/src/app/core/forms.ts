import {
  type FieldTree,
  isFieldTree,
  type ValidationError,
} from '@angular/forms/signals';
import type { Problem } from '@dashboard/models';

/**
 * Turns the API's field errors (`problem.errors`, path like `email`) into
 * Signal Forms errors on the matching fields, so a server-side check (an
 * email already taken, a wrong current password) shows under its input like
 * any other validation message.
 */
export function serverErrors<T>(
  form: FieldTree<T>,
  problem: Problem
): ValidationError.WithFieldTree[] {
  const fields = form as unknown as Record<string, unknown>;
  const errors: ValidationError.WithFieldTree[] = [];
  for (const e of problem.errors ?? []) {
    const field = fields[e.path];
    if (isFieldTree(field))
      errors.push({ kind: 'server', message: e.message, fieldTree: field });
  }
  return errors;
}

/** On a failed submit, put the cursor in the first field that needs attention. */
export function focusFirstInvalid<T>(form: FieldTree<T>): void {
  form().errorSummary()[0]?.fieldTree().focusBoundControl();
}
