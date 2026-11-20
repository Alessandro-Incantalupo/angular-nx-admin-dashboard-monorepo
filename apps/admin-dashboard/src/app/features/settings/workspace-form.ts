import { HttpClient, httpResource } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  readonly,
  validateStandardSchema,
} from '@angular/forms/signals';
import {
  type WorkspaceSettings,
  workspaceSettingsSchema,
} from '@dashboard/models';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { firstValueFrom } from 'rxjs';
import { focusFirstInvalid, serverErrors } from '../../core/forms';
import { toProblem } from '../../core/http';
import { SessionStore } from '../../core/session-store';
import { FieldErrors, showErrors } from '../../ui/field-errors';

const BLANK: WorkspaceSettings = {
  workspaceName: '',
  supportEmail: '',
  defaultLanguage: 'en',
  weekStartsOn: 'monday',
};

/** Workspace settings: everyone sees them, admins change them (the API enforces it). */
@Component({
  selector: 'app-workspace-form',
  imports: [FormField, FormRoot, FieldErrors, Button],
  template: `
    @if (!session.isAdmin()) {
      <p class="text-muted m-0 mb-4">Only admins can change these settings.</p>
    }
    @if (settings.error()) {
      <p role="alert" class="text-danger m-0">
        The settings could not be loaded. Reload the page to try again.
      </p>
    } @else {
      <form
        [formRoot]="settingsForm"
        class="grid gap-4"
        [attr.aria-busy]="settings.isLoading()"
      >
        <div>
          <label for="ws-name" class="mb-1 block font-medium"
            >Workspace name</label
          >
          <input
            id="ws-name"
            [formField]="settingsForm.workspaceName"
            [attr.aria-invalid]="showErrors(settingsForm.workspaceName)"
            aria-describedby="ws-name-error"
          />
          <app-field-errors
            id="ws-name-error"
            [field]="settingsForm.workspaceName"
          />
        </div>
        <div>
          <label for="ws-email" class="mb-1 block font-medium"
            >Support email</label
          >
          <p id="ws-email-hint" class="text-muted m-0 mb-1">
            Shown to members who need help.
          </p>
          <input
            id="ws-email"
            type="email"
            [formField]="settingsForm.supportEmail"
            [attr.aria-invalid]="showErrors(settingsForm.supportEmail)"
            aria-describedby="ws-email-hint ws-email-error"
          />
          <app-field-errors
            id="ws-email-error"
            [field]="settingsForm.supportEmail"
          />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="ws-lang" class="mb-1 block font-medium"
              >Language of emails</label
            >
            <select id="ws-lang" [formField]="settingsForm.defaultLanguage">
              <option value="en">English</option>
              <option value="it">Italian</option>
            </select>
          </div>
          <div>
            <label for="ws-week" class="mb-1 block font-medium"
              >Weeks start on</label
            >
            <select id="ws-week" [formField]="settingsForm.weekStartsOn">
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>
        </div>
        @if (formError(); as e) {
          <p role="alert" class="text-danger m-0">{{ e }}</p>
        }
        @if (session.isAdmin()) {
          <div>
            <p-button
              type="submit"
              label="Save settings"
              [loading]="settingsForm().submitting()"
            />
          </div>
        }
      </form>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceForm {
  protected readonly session = inject(SessionStore);
  private readonly http = inject(HttpClient);
  private readonly messages = inject(MessageService);
  protected readonly showErrors = showErrors;

  protected readonly settings = httpResource<WorkspaceSettings>(
    () => '/api/settings'
  );
  /** The loaded settings, then whatever is typed. */
  protected readonly model = linkedSignal<WorkspaceSettings>(() =>
    this.settings.hasValue() ? { ...this.settings.value() } : { ...BLANK }
  );
  protected readonly formError = signal<string | null>(null);

  protected readonly settingsForm = form(
    this.model,
    path => {
      validateStandardSchema(path, workspaceSettingsSchema);
      readonly(path, () => !this.session.isAdmin());
    },
    {
      submission: {
        action: async f => {
          this.formError.set(null);
          try {
            const body = workspaceSettingsSchema.parse(this.model());
            const saved = await firstValueFrom(
              this.http.put<WorkspaceSettings>('/api/settings', body)
            );
            this.settings.set(saved);
            this.messages.add({
              severity: 'success',
              summary: 'Settings saved',
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
