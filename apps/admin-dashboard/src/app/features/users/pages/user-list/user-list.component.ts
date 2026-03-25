import { User } from '@admin-dashboard-nx-monorepo/models';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  signal,
} from '@angular/core';
import { AuthStore } from '@core/state/auth.store';
import { UsersStore } from '@features/users/state/user.store';

import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { PrimeNgTableComponent } from '@shared/prime-ng-table/prime-ng-table.component';
import { toast } from 'ngx-sonner';

import { Dialog } from 'primeng/dialog';
import { PaginatorState } from 'primeng/paginator';
import { UserFormSignalComponent } from '../../components/user-form-signal/user-form-signal.component';
import { UserFormComponent } from '../../components/user-form/user-form.component';

@Component({
  selector: 'app-user-list',
  imports: [
    TranslocoDirective,
    UserFormComponent,
    UserFormSignalComponent,
    PrimeNgTableComponent,
    Dialog,
    RouterLink,
  ],
  templateUrl: './user-list.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class UserListComponent {
  protected userStore = inject(UsersStore);
  protected authStore = inject(AuthStore);

  readonly showForm = signal(false);
  readonly useSignalForm = signal(true);
  clonedUsers: { [s: string]: User } = {};
  readonly roles = [
    { label: 'Guest', value: 'guest' },
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' },
  ];

  // Quick login removed because OIDC requires redirect to Keycloak

  canEditUser(user: User): boolean {
    const currentUser = this.authStore.userData();
    const role = currentUser?.role ?? 'guest';

    const editRules = {
      admin: () => true,
      user: () => user.email !== currentUser?.email && user.role === 'user',
      guest: () => false,
    } as const;

    return (editRules[role] ?? editRules.guest)();
  }

  saveEdit(user: User) {
    this.userStore.updateUser(user);
  }

  onEdit(user: User) {
    if (!this.authStore.canEdit()) {
      toast.error('Unauthorized', {
        description: 'You need to be logged in to edit users.',
      });
      return;
    }
    this.userStore.startEditing(user);
  }

  onRowEditSave(user: User) {
    this.userStore.cancelEditing(user);
    this.userStore.updateUser(user);
  }

  onRowEditCancel({ user }: { user: User; index: number }) {
    this.userStore.restoreUser(user);
  }

  onDelete(event: { user: User; index: number }) {
    if (!this.authStore.canDelete()) {
      toast.error('Unauthorized', {
        description: 'Only admins can delete users.',
      });
      return;
    }

    // Confirmation dialog
    const confirmed = confirm(
      `Are you sure you want to delete user "${event.user.name}"?`
    );
    if (!confirmed) {
      toast.info('Delete cancelled', {
        description: `User "${event.user.name}" was not deleted.`,
      });
      return;
    }

    this.userStore.deleteUser(event.user.id);
  }

  toggleForm() {
    if (!this.authStore.canCreate()) {
      toast.error('Unauthorized', {
        description: 'Only admins can create users.',
      });
      return;
    }
    this.showForm.set(!this.showForm());
  }

  onPageChange(event: PaginatorState) {
    this.userStore.loadUsers(event);
  }
}
