import { User } from '@admin-dashboard-nx-monorepo/models';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal,
} from '@angular/core';
import { email, Field, form, required } from '@angular/forms/signals';
import { UsersStore } from '@features/users/state/user.store';
import { TranslocoDirective } from '@jsverse/transloco';
import { toast } from 'ngx-sonner';

interface UserFormData {
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-user-form-signal',
  imports: [Field, TranslocoDirective],
  templateUrl: './user-form-signal.component.html',
  host: {
    class: 'block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormSignalComponent {
  private userStore = inject(UsersStore);
  isSubmitted = output<boolean>();

  // Create the form model signal
  userModel = signal<UserFormData>({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
  });

  // Create the field tree with schema-based validation
  userForm = form(this.userModel, schemaPath => {
    required(schemaPath.name, { message: 'Name is required' });
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Invalid email format' });
  });

  onSubmit(event: Event) {
    event.preventDefault();

    // Check if form is valid
    if (this.userForm().invalid()) {
      toast.error('Please fill out the form correctly');
      return;
    }

    const formData = this.userModel();

    const newUser: User = {
      id: crypto.randomUUID(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.status,
    };

    this.userStore.addUser(newUser);
    this.isSubmitted.emit(true);

    // Reset the form
    this.reset();
  }

  reset() {
    this.userModel.set({
      name: '',
      email: '',
      role: 'user',
      status: 'active',
    });
  }
}
