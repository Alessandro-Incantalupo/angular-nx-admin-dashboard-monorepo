import { User } from '@admin-dashboard-nx-monorepo/models';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UsersStore } from '@features/users/state/user.store';
import { TranslocoDirective } from '@jsverse/transloco';
import { toast } from 'ngx-sonner';
import { map } from 'rxjs';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, TranslocoDirective],
  templateUrl: './user-form.component.html',
  host: {
    class: 'block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private userStore = inject(UsersStore);
  private readonly destroyRef = inject(DestroyRef);
  isSubmitted = output<boolean>();
  readonly submitted = signal(false);

  readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['user', Validators.required],
    status: ['active'],
  });

  ngOnInit() {
    this.form
      .get('name')!
      .valueChanges.pipe(
        takeUntilDestroyed(this.destroyRef),
        map(value => value.toUpperCase())
      )
      .subscribe(val => {});
  }

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
