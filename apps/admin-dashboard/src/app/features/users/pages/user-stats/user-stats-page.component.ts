import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { UserChartStatsComponent } from '../../components/user-stats/user-stats.component';

@Component({
  selector: 'app-user-stats-page',
  standalone: true,
  imports: [UserChartStatsComponent, TranslocoDirective],
  template: `
    <div class="space-y-6" *transloco="let t; read: 'users.stats'">
      <div class="flex items-center justify-between">
        <h1 class="text-primary text-2xl font-bold">{{ t('title') }}</h1>
      </div>
      <app-user-stats></app-user-stats>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UserStatsPageComponent {}
