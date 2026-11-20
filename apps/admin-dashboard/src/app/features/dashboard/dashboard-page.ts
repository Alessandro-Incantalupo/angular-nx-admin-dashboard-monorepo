import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import type { DashboardStats } from '@dashboard/models';
import { toProblem } from '../../core/http';
import { ChartCard, type ChartRow } from './chart-card';

const ROLE = { admin: 'Admin', editor: 'Editor', viewer: 'Viewer' } as const;
const STATUS = {
  active: 'Active',
  invited: 'Invited',
  inactive: 'Inactive',
} as const;

const monthName = new Intl.DateTimeFormat('en', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const dayName = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});
const number = new Intl.NumberFormat('en');

const peak = (rows: ChartRow[]) =>
  rows.reduce((a, b) => (b.value > a.value ? b : a), rows[0]);
const sum = (rows: ChartRow[]) => rows.reduce((n, r) => n + r.value, 0);

@Component({
  selector: 'app-dashboard-page',
  imports: [ChartCard],
  template: `
    <h1 class="text-2xl font-semibold">Dashboard</h1>
    <p class="text-muted mt-1">
      How the workspace is growing and how busy it is.
    </p>

    @if (stats.error(); as err) {
      <div
        role="alert"
        class="rounded-control border-danger bg-danger-subtle text-danger mt-6 border p-4"
      >
        <p class="m-0 font-semibold">{{ problem(err).title }}</p>
        <button
          type="button"
          class="mt-2 min-h-11 underline"
          (click)="stats.reload()"
        >
          Try again
        </button>
      </div>
    } @else if (stats.value(); as s) {
      <dl class="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        @for (tile of tiles(); track tile.label) {
          <div class="card p-4">
            <dt class="text-muted">{{ tile.label }}</dt>
            <dd class="m-0 mt-1 text-3xl font-semibold tabular-nums">
              {{ tile.value }}
            </dd>
          </div>
        }
      </dl>

      <div class="mt-6 grid gap-4 lg:grid-cols-2">
        <app-chart-card
          title="Sign-ups per month"
          [summary]="signupSummary()"
          [rows]="signups()"
          labelHeader="Month"
          valueHeader="Sign-ups"
        />
        <app-chart-card
          title="Activity per day"
          type="line"
          [summary]="activitySummary()"
          [rows]="activity()"
          labelHeader="Day"
          valueHeader="Events"
        />
        <app-chart-card
          title="Members by role"
          [summary]="roleSummary()"
          [rows]="roles()"
          [horizontal]="true"
          labelHeader="Role"
          valueHeader="Members"
        />
        <app-chart-card
          title="Members by status"
          [summary]="statusSummary()"
          [rows]="statuses()"
          [horizontal]="true"
          labelHeader="Status"
          valueHeader="Members"
        />
      </div>
    } @else {
      <p class="text-muted mt-6" role="status">Loading the numbers…</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DashboardPage {
  protected readonly stats = httpResource<DashboardStats>(() => '/api/stats');
  protected readonly problem = toProblem;

  protected readonly tiles = computed(() => {
    const t = this.stats.value()?.totals;
    if (!t) return [];
    return [
      { label: 'Members', value: number.format(t.members) },
      { label: 'Active members', value: number.format(t.active) },
      {
        label: 'Sign-ups, last 30 days',
        value: number.format(t.signupsLast30Days),
      },
      {
        label: 'Events, last 30 days',
        value: number.format(t.eventsLast30Days),
      },
    ];
  });

  protected readonly signups = computed<ChartRow[]>(() =>
    (this.stats.value()?.signupsByMonth ?? []).map(m => ({
      label: monthName.format(new Date(`${m.month}-01T00:00:00Z`)),
      value: m.count,
    }))
  );
  protected readonly activity = computed<ChartRow[]>(() =>
    (this.stats.value()?.activityByDay ?? []).map(d => ({
      label: dayName.format(new Date(`${d.day}T00:00:00Z`)),
      value: d.count,
    }))
  );
  protected readonly roles = computed<ChartRow[]>(() =>
    (this.stats.value()?.membersByRole ?? []).map(r => ({
      label: ROLE[r.role],
      value: r.count,
    }))
  );
  protected readonly statuses = computed<ChartRow[]>(() =>
    (this.stats.value()?.membersByStatus ?? []).map(r => ({
      label: STATUS[r.status],
      value: r.count,
    }))
  );

  protected readonly signupSummary = computed(() => {
    const rows = this.signups();
    if (!rows.length) return '';
    const top = peak(rows);
    return `${sum(rows)} sign-ups in the last 12 months, most in ${top.label} (${top.value}).`;
  });
  protected readonly activitySummary = computed(() => {
    const rows = this.activity();
    if (!rows.length) return '';
    const top = peak(rows);
    return `${sum(rows)} events in the last 30 days, about ${Math.round(sum(rows) / rows.length)} a day; the busiest day was ${top.label} (${top.value}).`;
  });
  protected readonly roleSummary = computed(
    () =>
      this.roles()
        .map(
          r => `${r.value} ${r.label.toLowerCase()}${r.value === 1 ? '' : 's'}`
        )
        .join(', ') + '.'
  );
  protected readonly statusSummary = computed(
    () =>
      this.statuses()
        .map(r => `${r.value} ${r.label.toLowerCase()}`)
        .join(', ') + '.'
  );
}
