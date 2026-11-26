import { User } from '@admin-dashboard-nx-monorepo/models';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  resource,
} from '@angular/core';
import { AssistantUsersService } from '../services/assistant-users.service';
import {
  RoleBadgeComponent,
  StatusDotComponent,
} from './user-badges.component';

/** `UserCard` for the model: one user, loaded by id from the dashboard's data. */
@Component({
  selector: 'app-assistant-user-card',
  imports: [RoleBadgeComponent, StatusDotComponent],
  template: `
    @if (user.value(); as user) {
      <div
        class="border-border bg-background flex max-w-[28rem] items-center gap-4 rounded-xl border p-4 shadow-sm"
      >
        <div
          class="bg-primary text-primary-foreground flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold"
          aria-hidden="true"
        >
          {{ initials(user) }}
        </div>
        <div class="min-w-0 grow">
          <p class="text-foreground truncate font-semibold">
            {{ user.name }}
          </p>
          <p class="text-muted-foreground truncate text-sm">
            {{ user.email }}
          </p>
          <div class="mt-2 flex items-center gap-3 text-xs">
            <app-role-badge [role]="user.role" />
            <app-status-dot [status]="user.status" />
          </div>
        </div>
      </div>
    } @else if (user.isLoading()) {
      <div
        class="bg-muted/30 h-20 max-w-[28rem] animate-pulse rounded-xl"
      ></div>
    } @else {
      <p class="text-muted-foreground text-sm">
        No user with id {{ userId() }}.
      </p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssistantUserCardComponent {
  readonly userId = input.required<string>();
  private readonly users = inject(AssistantUsersService);

  protected readonly user = resource({
    params: () => this.userId(),
    loader: async ({ params }) => (await this.users.byIds([params]))[0] ?? null,
  });

  protected initials(user: User): string {
    return user.name
      .split(/\s+/)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
