import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NgApexchartsModule } from 'ng-apexcharts';
import { UsersStore } from '../../state/user.store';

import {
  ApexChart,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexTheme,
  ApexTitleSubtitle,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  theme: ApexTheme;
  title: ApexTitleSubtitle;
  legend: ApexLegend;
};

@Component({
  selector: 'app-user-stats',
  standalone: true,
  imports: [NgApexchartsModule, TranslocoDirective],
  template: `
    <div
      *transloco="let t; prefix: 'users.stats'"
      class="card border-border bg-card overflow-hidden rounded-xl border shadow-sm"
    >
      <!-- Header -->
      <div class="border-border bg-muted/20 border-b px-6 py-4">
        <h3
          class="text-foreground flex items-center gap-2 text-base font-semibold"
        >
          <i class="pi pi-chart-pie text-primary"></i>
          {{ t('user-roles-distribution') }}
        </h3>
      </div>

      <!-- Content -->
      <div class="p-6">
        @if (chartSeries().length > 0) {
          <apx-chart
            [series]="chartSeries()"
            [chart]="chartOptions.chart!"
            [labels]="chartLabels()"
            [responsive]="chartOptions.responsive!"
            [colors]="chartColors"
            [legend]="chartLegend"
            [stroke]="{ show: false }"
          ></apx-chart>
        }
      </div>
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
export class UserChartStatsComponent {
  store = inject(UsersStore);

  chartSeries = computed(() => Object.values(this.store.stats()));

  chartLabels = computed(() =>
    Object.keys(this.store.stats()).map(
      key => key.charAt(0).toUpperCase() + key.slice(1)
    )
  );

  chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#64748b'];

  chartLegend: ApexLegend = {
    position: 'bottom',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    itemMargin: {
      horizontal: 10,
      vertical: 5,
    },
    labels: {
      colors: '#71717a',
    },
  };

  chartOptions: Partial<ChartOptions> = {
    chart: {
      type: 'donut',
      height: 350,
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false,
      },
      background: 'transparent',
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };
}
