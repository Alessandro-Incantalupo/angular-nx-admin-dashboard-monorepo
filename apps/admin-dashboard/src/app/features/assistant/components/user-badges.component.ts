import { User } from '@admin-dashboard-nx-monorepo/models';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-role-badge',
  template: `<span
    class="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium capitalize"
    >{{ role() }}</span
  >`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleBadgeComponent {
  readonly role = input.required<User['role']>();
}

@Component({
  selector: 'app-status-dot',
  template: `<span
    class="text-muted-foreground inline-flex items-center gap-1.5 capitalize"
    ><span
      class="h-2 w-2 rounded-full"
      [class]="status() === 'active' ? 'bg-emerald-500' : 'bg-zinc-400'"
      aria-hidden="true"
    ></span
    >{{ status() }}</span
  >`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusDotComponent {
  readonly status = input.required<User['status']>();
}
