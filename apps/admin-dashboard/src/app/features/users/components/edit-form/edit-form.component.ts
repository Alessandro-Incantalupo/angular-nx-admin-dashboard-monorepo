import { User } from '@admin-dashboard-nx-monorepo/models';

import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-edit-form',
  standalone: true,
  imports: [ReactiveFormsModule],
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

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);

  readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['user'],
    status: ['active'],
  });

  constructor() {
    effect(() => {
      if (this.user()) {
        this.form.patchValue(this.user());
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    const value = this.form.value;

    this.save.emit({
      ...this.user(),
      ...value,
      role: value.role as 'admin' | 'user' | 'guest',
      status: value.status as 'active' | 'inactive',
    });
  }

  onCancel() {
    this.cancel.emit();
  }
}
