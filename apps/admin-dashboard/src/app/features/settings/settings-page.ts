import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { type ThemeChoice, ThemeService } from '../../core/theme';
import { PasswordForm } from './password-form';
import { WorkspaceForm } from './workspace-form';

@Component({
  selector: 'app-settings-page',
  imports: [WorkspaceForm, PasswordForm],
  template: `
    <h1 class="text-2xl font-semibold">Settings</h1>

    <div class="mt-6 grid max-w-2xl gap-6">
      <section class="card p-5 md:p-6" aria-labelledby="ws-title">
        <h2 id="ws-title" class="m-0 mb-4 text-lg font-semibold">Workspace</h2>
        <app-workspace-form />
      </section>

      <section class="card p-5 md:p-6" aria-labelledby="look-title">
        <h2 id="look-title" class="m-0 text-lg font-semibold">Appearance</h2>
        <fieldset class="mt-3 border-0 p-0">
          <legend class="text-muted mb-2">Theme for this browser</legend>
          <div class="flex flex-wrap gap-2">
            @for (option of themes; track option.value) {
              <label
                class="rounded-control border-border-strong flex min-h-11 cursor-pointer items-center gap-2 border px-3"
              >
                <input
                  type="radio"
                  name="theme"
                  class="size-5 accent-(--accent)"
                  [value]="option.value"
                  [checked]="theme.choice() === option.value"
                  (change)="theme.set(option.value)"
                />
                {{ option.label }}
              </label>
            }
          </div>
        </fieldset>
      </section>

      <section class="card p-5 md:p-6" aria-labelledby="pw-title">
        <h2 id="pw-title" class="m-0 mb-4 text-lg font-semibold">Password</h2>
        <app-password-form />
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SettingsPage {
  protected readonly theme = inject(ThemeService);
  protected readonly themes: { value: ThemeChoice; label: string }[] = [
    { value: 'system', label: 'Same as the system' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];
}
