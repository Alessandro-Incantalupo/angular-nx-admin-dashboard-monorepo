import { User } from '@admin-dashboard-nx-monorepo/models';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UsersStore } from '@features/users/state/user.store';
import { TranslocoDirective } from '@jsverse/transloco';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, TranslocoDirective],
  templateUrl: './user-form.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent {
  private fb = inject(NonNullableFormBuilder);
  private userStore = inject(UsersStore);
  isSubmitted = output<boolean>();
  readonly submitted = signal(false);

  readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['user', Validators.required],
    status: ['active'],
  });

  onSubmit() {
    this.submitted.set(true);

    if (this.form.invalid) {
      toast.error('Please fill out the form correctly');
      return;
    }

    const value = this.form.value;

    const newUser: User = {
      id: crypto.randomUUID(),
      name: value.name ?? '',
      email: value.email ?? '',
      role: value.role as 'admin' | 'user' | 'guest',
      status: value.status as 'active' | 'inactive',
    };

    this.userStore.addUser(newUser);

    this.isSubmitted.emit(true);

    this.form.reset({ role: 'user', status: 'active' });
    this.submitted.set(false);
  }
}
