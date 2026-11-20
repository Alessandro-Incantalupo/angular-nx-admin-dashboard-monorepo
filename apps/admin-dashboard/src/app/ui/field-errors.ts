import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';

/**
 * The messages for one field, shown once the field was touched (or a submit
 * was attempted). Give the input `aria-describedby` with the same id, and
 * `[attr.aria-invalid]="showErrors(field)"`.
 */
@Component({
  selector: 'app-field-errors',
  template: `
    <p
      [id]="id()"
      class="text-danger mt-1 text-sm"
      [class.hidden]="!messages().length"
    >
      @for (m of messages(); track m) {
        <span class="block">{{ m }}</span>
      }
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldErrors {
  readonly field = input.required<FieldTree<unknown>>();
  readonly id = input.required<string>();

  protected readonly messages = computed(() => {
    const state = this.field()();
    if (!state.touched()) return [];
    // One message per field is enough: the first one that applies.
    const first = state.errors()[0]?.message;
    return first ? [first] : [];
  });
}

export function showErrors(field: FieldTree<unknown>): boolean | null {
  const state = field();
  return state.touched() && state.invalid() ? true : null;
}
