import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  validateStandardSchema,
} from '@angular/forms/signals';
import {
  type PasswordChangeInput,
  passwordChangeSchema,
} from '@dashboard/models';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { firstValueFrom } from 'rxjs';
import { focusFirstInvalid, serverErrors } from '../../core/forms';
import { toProblem } from '../../core/http';
import { SessionStore } from '../../core/session-store';
import { FieldErrors, showErrors } from '../../ui/field-errors';

const EMPTY: PasswordChangeInput = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

@Component({
  selector: 'app-password-form',
  imports: [FormField, FormRoot, FieldErrors, Button],
  template: `
    @if (session.isDemo()) {
      <p class="text-muted m-0">
        The demo account's password can't be changed, so it keeps working for
        everyone.
      </p>
    } @else {
      <form [formRoot]="passwordForm" class="grid gap-4">
        <div>
          <label for="pw-current" class="mb-1 block font-medium"
            >Current password</label
          >
          <input
            id="pw-current"
            type="password"
            autocomplete="current-password"
            [formField]="passwordForm.currentPassword"
            [attr.aria-invalid]="showErrors(passwordForm.currentPassword)"
            aria-describedby="pw-current-error"
          />
          <app-field-errors
            id="pw-current-error"
            [field]="passwordForm.currentPassword"
          />
        </div>
        <div>
          <label for="pw-new" class="mb-1 block font-medium"
            >New password</label
          >
          <p id="pw-new-hint" class="text-muted m-0 mb-1">
            At least 12 characters. A few unrelated words work well.
          </p>
          <input
            id="pw-new"
            type="password"
            autocomplete="new-password"
            [formField]="passwordForm.newPassword"
            [attr.aria-invalid]="showErrors(passwordForm.newPassword)"
            aria-describedby="pw-new-hint pw-new-error"
          />
          <app-field-errors
            id="pw-new-error"
            [field]="passwordForm.newPassword"
          />
        </div>
        <div>
          <label for="pw-confirm" class="mb-1 block font-medium"
            >Repeat the new password</label
          >
          <input
            id="pw-confirm"
            type="password"
            autocomplete="new-password"
            [formField]="passwordForm.confirmPassword"
            [attr.aria-invalid]="showErrors(passwordForm.confirmPassword)"
            aria-describedby="pw-confirm-error"
          />
          <app-field-errors
            id="pw-confirm-error"
            [field]="passwordForm.confirmPassword"
          />
        </div>
        @if (formError(); as e) {
          <p role="alert" class="text-danger m-0">{{ e }}</p>
        }
        <p class="text-muted m-0">
          Changing it signs you out on your other devices.
        </p>
        <div>
          <p-button
            type="submit"
            label="Change password"
            [loading]="passwordForm().submitting()"
          />
        </div>
      </form>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordForm {
  protected readonly session = inject(SessionStore);
  private readonly http = inject(HttpClient);
  private readonly messages = inject(MessageService);
  protected readonly showErrors = showErrors;

  protected readonly model = signal<PasswordChangeInput>({ ...EMPTY });
  protected readonly formError = signal<string | null>(null);

  protected readonly passwordForm = form(
    this.model,
    path => validateStandardSchema(path, passwordChangeSchema),
    {
      submission: {
        action: async f => {
          this.formError.set(null);
          try {
            await firstValueFrom(
              this.http.post('/api/auth/password', this.model())
            );
            this.passwordForm().reset({ ...EMPTY });
            this.messages.add({
              severity: 'success',
              summary: 'Password changed',
              life: 4000,
            });
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
