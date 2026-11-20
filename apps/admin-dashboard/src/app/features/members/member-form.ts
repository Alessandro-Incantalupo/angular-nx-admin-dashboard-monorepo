import {
  ChangeDetectionStrategy,
  Component,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  validateStandardSchema,
} from '@angular/forms/signals';
import {
  type Member,
  type MemberInput,
  memberInputSchema,
  memberRoles,
  memberStatuses,
} from '@dashboard/models';
import { Button } from 'primeng/button';
import { focusFirstInvalid, serverErrors } from '../../core/forms';
import { toProblem } from '../../core/http';
import { FieldErrors, showErrors } from '../../ui/field-errors';

const EMPTY: MemberInput = {
  name: '',
  email: '',
  role: 'viewer',
  status: 'invited',
};

export const roleLabel: Record<MemberInput['role'], string> = {
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};
export const statusLabel: Record<MemberInput['status'], string> = {
  active: 'Active',
  invited: 'Invited',
  inactive: 'Inactive',
};

/**
 * Create or edit a member. Validation is the shared Zod schema, run by Signal
 * Forms; what only the server can know (an email already in use) comes back
 * as a field error on the same input.
 */
@Component({
  selector: 'app-member-form',
  imports: [FormField, FormRoot, FieldErrors, Button],
  template: `
    <form [formRoot]="memberForm" class="grid gap-4">
      <div>
        <label for="m-name" class="mb-1 block font-medium">Name</label>
        <input
          id="m-name"
          autocomplete="off"
          [formField]="memberForm.name"
          [attr.aria-invalid]="showErrors(memberForm.name)"
          aria-describedby="m-name-error"
        />
        <app-field-errors id="m-name-error" [field]="memberForm.name" />
      </div>
      <div>
        <label for="m-email" class="mb-1 block font-medium">Email</label>
        <input
          id="m-email"
          type="email"
          autocomplete="off"
          [formField]="memberForm.email"
          [attr.aria-invalid]="showErrors(memberForm.email)"
          aria-describedby="m-email-error"
        />
        <app-field-errors id="m-email-error" [field]="memberForm.email" />
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="m-role" class="mb-1 block font-medium">Role</label>
          <select id="m-role" [formField]="memberForm.role">
            @for (r of roles; track r) {
              <option [value]="r">{{ roleLabel[r] }}</option>
            }
          </select>
        </div>
        <div>
          <label for="m-status" class="mb-1 block font-medium">Status</label>
          <select id="m-status" [formField]="memberForm.status">
            @for (s of statuses; track s) {
              <option [value]="s">{{ statusLabel[s] }}</option>
            }
          </select>
        </div>
      </div>

      @if (formError(); as e) {
        <p role="alert" class="text-danger m-0">{{ e }}</p>
      }

      <div class="flex flex-wrap justify-end gap-2 pt-2">
        <p-button
          type="button"
          label="Cancel"
          severity="secondary"
          [text]="true"
          (onClick)="cancelled.emit()"
        />
        <p-button
          type="submit"
          [label]="member() ? 'Save changes' : 'Add member'"
          [loading]="memberForm().submitting()"
        />
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberForm {
  /** The member to edit; none to create one. */
  readonly member = input<Member | null>(null);
  /** Saves and resolves, or throws the HTTP error. */
  readonly save = input.required<(value: MemberInput) => Promise<unknown>>();
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  protected readonly roles = memberRoles;
  protected readonly statuses = memberStatuses;
  protected readonly roleLabel = roleLabel;
  protected readonly statusLabel = statusLabel;
  protected readonly showErrors = showErrors;

  /** Follows the input: opening the form on another member resets it. */
  protected readonly model = linkedSignal<MemberInput>(() => {
    const m = this.member();
    return m
      ? { name: m.name, email: m.email, role: m.role, status: m.status }
      : { ...EMPTY };
  });
  protected readonly formError = linkedSignal<Member | null, string | null>({
    source: this.member,
    computation: () => null,
  });

  protected readonly memberForm = form(
    this.model,
    path => validateStandardSchema(path, memberInputSchema),
    {
      submission: {
        action: async f => {
          this.formError.set(null);
          try {
            await this.save()(memberInputSchema.parse(this.model()));
            this.saved.emit();
            return undefined;
          } catch (err) {
            const problem = toProblem(err);
            const fieldErrors = serverErrors(f, problem);
            if (!fieldErrors.length)
              this.formError.set(problem.detail ?? problem.title);
            return fieldErrors;
          }
        },
        onInvalid: f => focusFirstInvalid(f),
      },
    }
  );
}
