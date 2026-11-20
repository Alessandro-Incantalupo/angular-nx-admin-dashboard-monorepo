import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  validateStandardSchema,
} from '@angular/forms/signals';
import { Router } from '@angular/router';
import { type LoginInput, loginSchema, type Problem } from '@dashboard/models';
import { focusFirstInvalid } from '../../core/forms';
import { safeNext } from '../../core/guards';
import { toProblem } from '../../core/http';
import { SessionStore } from '../../core/session-store';
import { FieldErrors, showErrors } from '../../ui/field-errors';

const DEMO: LoginInput = {
  email: 'demo@example.com',
  password: 'look-but-dont-touch',
};

@Component({
  selector: 'app-login-page',
  imports: [FormField, FormRoot, FieldErrors],
  template: `
    <main
      class="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10"
    >
      <h1 class="text-2xl font-semibold">Sign in to the Admin Dashboard</h1>

      <section class="card mt-6 p-4" aria-labelledby="demo-title">
        <h2 id="demo-title" class="text-base font-semibold">Try the demo</h2>
        <p class="text-muted mt-1">
          Email <code class="font-code text-default">{{ demo.email }}</code
          >, password
          <code class="font-code text-default">{{ demo.password }}</code
          >. The demo account can look at everything and change nothing.
        </p>
        <button
          type="button"
          class="btn btn-secondary mt-3"
          (click)="useDemo()"
        >
          Fill in the demo login
        </button>
      </section>

      <form
        [formRoot]="loginForm"
        class="card mt-6 grid gap-4 p-6"
        aria-labelledby="form-title"
      >
        <h2 id="form-title" class="sr-only">Your account</h2>

        @if (problem(); as p) {
          <div
            role="alert"
            class="rounded-control border-danger bg-danger-subtle text-danger border p-3"
          >
            <p class="m-0 font-semibold">{{ p.title }}</p>
            @if (p.detail) {
              <p class="m-0">{{ p.detail }}</p>
            }
          </div>
        }

        <div>
          <label for="email" class="mb-1 block font-medium">Email</label>
          <input
            id="email"
            type="email"
            autocomplete="username"
            [formField]="loginForm.email"
            [attr.aria-invalid]="showErrors(loginForm.email)"
            aria-describedby="email-error"
          />
          <app-field-errors id="email-error" [field]="loginForm.email" />
        </div>

        <div>
          <label for="password" class="mb-1 block font-medium">Password</label>
          <input
            id="password"
            type="password"
            autocomplete="current-password"
            [formField]="loginForm.password"
            [attr.aria-invalid]="showErrors(loginForm.password)"
            aria-describedby="password-error"
          />
          <app-field-errors id="password-error" [field]="loginForm.password" />
        </div>

        <button
          type="submit"
          class="btn btn-primary w-full"
          [disabled]="loginForm().submitting()"
        >
          {{ loginForm().submitting() ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginPage {
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);

  /** `?next=/members` from the guard: where to go after signing in. */
  readonly next = input<string>();

  protected readonly demo = DEMO;
  protected readonly showErrors = showErrors;
  protected readonly problem = signal<Problem | null>(null);
  protected readonly model = signal<LoginInput>({ email: '', password: '' });

  protected readonly loginForm = form(
    this.model,
    path => validateStandardSchema(path, loginSchema),
    {
      submission: {
        action: async () => {
          this.problem.set(null);
          try {
            await this.session.login(loginSchema.parse(this.model()));
            await this.router.navigateByUrl(safeNext(this.next()));
          } catch (err) {
            this.problem.set(toProblem(err));
          }
          return undefined;
        },
        onInvalid: f => focusFirstInvalid(f),
      },
    }
  );

  protected useDemo() {
    this.model.set({ ...DEMO });
  }
}
