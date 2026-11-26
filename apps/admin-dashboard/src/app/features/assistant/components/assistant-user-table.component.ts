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

/** `UserTable` for the model: several users, loaded by id from the dashboard's data. */
@Component({
  selector: 'app-assistant-user-table',
  imports: [RoleBadgeComponent, StatusDotComponent],
  template: `
    <div
      class="border-border bg-background overflow-x-auto rounded-xl border shadow-sm"
    >
      <table class="min-w-full text-left text-sm">
        <thead class="text-muted-foreground text-xs">
          <tr>
            <th class="border-border border-b px-3 py-2 font-semibold">Name</th>
            <!-- In the chat panel (narrower than 28rem) the email gives way to role and status. -->
            <th
              class="border-border hidden border-b px-3 py-2 font-semibold @md:table-cell"
            >
              Email
            </th>
            <th class="border-border border-b px-3 py-2 font-semibold">Role</th>
            <th class="border-border border-b px-3 py-2 font-semibold">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          @for (user of users.value() ?? []; track user.id) {
            <tr>
              <td class="text-foreground border-border border-b px-3 py-2">
                {{ user.name }}
              </td>
              <td
                class="text-muted-foreground border-border hidden border-b px-3 py-2 @md:table-cell"
              >
                {{ user.email }}
              </td>
              <td class="border-border border-b px-3 py-2">
                <app-role-badge [role]="user.role" />
              </td>
              <td class="border-border border-b px-3 py-2 text-xs">
                <app-status-dot [status]="user.status" />
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="4" class="text-muted-foreground px-4 py-4">
                {{ users.isLoading() ? 'Loading…' : 'No matching users.' }}
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssistantUserTableComponent {
  readonly userIds = input.required<string[]>();
  private readonly service = inject(AssistantUsersService);

  protected readonly users = resource({
    params: () => this.userIds(),
    loader: ({ params }) => this.service.byIds(params),
  });
}
