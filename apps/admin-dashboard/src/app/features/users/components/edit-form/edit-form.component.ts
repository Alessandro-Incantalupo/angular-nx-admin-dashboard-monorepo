import { User } from '@admin-dashboard-nx-monorepo/models';

import {
  ChangeDetectionStrategy,
  Component,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import {
  email,
  form,
  FormField,
  FormRoot,
  required,
} from '@angular/forms/signals';

@Component({
  selector: 'app-edit-form',
  imports: [FormField, FormRoot],
  templateUrl: './edit-form.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditFormComponent {
  readonly user = input.required<User>();
  readonly save = output<User>();
  readonly cancel = output<void>();

  // The form's model follows the `user` input: a new user resets it, and
  // typing writes to it. linkedSignal replaces the effect() + patchValue pair.
  readonly model = linkedSignal(() => ({ ...this.user() }));

  readonly form = form(
    this.model,
    path => {
      required(path.name, { message: 'Name is required' });
      required(path.email, { message: 'Email is required' });
      email(path.email, { message: 'Enter a valid email address' });
    },
    {
      submission: {
        action: async () => {
          this.save.emit(this.model());
        },
      },
    }
  );

  onCancel() {
    this.cancel.emit();
  }
}
