import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { readChartTheme } from '@dashboard/design-system';
import type { ChartData, ChartOptions } from 'chart.js';
import { UIChart } from 'primeng/chart';
import { ThemeService } from '../../core/theme';

export interface ChartRow {
  label: string;
  value: number;
}

let nextId = 0;

/**
 * One chart with its numbers. The canvas is labelled as an image for screen
 * readers, and the same numbers are always in a table: read by screen readers
 * as is, shown on screen with "Show the numbers".
 */
@Component({
  selector: 'app-chart-card',
  imports: [UIChart],
  template: `
    <figure
      class="card m-0 flex h-full flex-col p-4 md:p-5"
      [attr.aria-labelledby]="id + '-title'"
    >
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <h2 [id]="id + '-title'" class="m-0 text-lg font-semibold">
          {{ title() }}
        </h2>
        <button
          type="button"
          class="rounded-control text-link min-h-11 px-2 underline underline-offset-4"
          [attr.aria-expanded]="showTable()"
          [attr.aria-controls]="id + '-table'"
          (click)="showTable.update(v => !v)"
        >
          {{ showTable() ? 'Hide the numbers' : 'Show the numbers' }}
        </button>
      </div>
      <figcaption class="text-muted mt-1">{{ summary() }}</figcaption>

      <div class="relative mt-4 h-64">
        <p-chart
          [type]="type()"
          [data]="data()"
          [options]="options()"
          height="16rem"
          [ariaLabel]="
            title() +
            '. ' +
            summary() +
            ' The numbers are in the table that follows.'
          "
        />
      </div>

      <div
        [id]="id + '-table'"
        [class.sr-only]="!showTable()"
        class="mt-4 max-h-72 overflow-auto"
      >
        <table class="w-full border-collapse text-left">
          <caption class="sr-only">
            {{
              title()
            }}
          </caption>
          <thead>
            <tr class="border-border border-b">
              <th scope="col" class="py-2 pr-4 font-semibold">
                {{ labelHeader() }}
              </th>
              <th scope="col" class="py-2 text-right font-semibold">
                {{ valueHeader() }}
              </th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.label) {
              <tr class="border-border border-b">
                <th scope="row" class="py-1.5 pr-4 font-normal">
                  {{ row.label }}
                </th>
                <td class="py-1.5 text-right tabular-nums">{{ row.value }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </figure>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartCard {
  readonly title = input.required<string>();
  readonly summary = input.required<string>();
  readonly rows = input.required<ChartRow[]>();
  readonly type = input<'bar' | 'line'>('bar');
  readonly labelHeader = input('Item');
  readonly valueHeader = input('Count');
  readonly horizontal = input(false);

  protected readonly id = `chart-${nextId++}`;
  protected readonly showTable = signal(false);
  private readonly themeService = inject(ThemeService);

  /** Colours come from the token roles; recomputed when the theme changes. */
  private readonly colors = computed(() => {
    this.themeService.theme();
    return readChartTheme();
  });

  protected readonly data = computed<ChartData>(() => {
    const c = this.colors();
    const line = this.type() === 'line';
    return {
      labels: this.rows().map(r => r.label),
      datasets: [
        {
          label: this.valueHeader(),
          data: this.rows().map(r => r.value),
          backgroundColor: line ? c.seriesSubtle : c.series,
          borderColor: c.series,
          borderWidth: line ? 2 : 0,
          borderRadius: line ? 0 : 4,
          maxBarThickness: 32,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHitRadius: 12,
          fill: line,
          cubicInterpolationMode: 'monotone',
        },
      ],
    };
  });

  protected readonly options = computed<ChartOptions>(() => {
    const c = this.colors();
    const ticks = { color: c.muted, font: { family: c.font, size: 13 } };
    const valueAxis = {
      beginAtZero: true,
      ticks: { ...ticks, precision: 0 },
      grid: { color: c.grid },
      border: { display: false },
    };
    const labelAxis = {
      ticks: { ...ticks, maxRotation: 0, autoSkipPadding: 12 },
      grid: { display: false },
      border: { color: c.grid },
    };
    return {
      maintainAspectRatio: false,
      responsive: true,
      indexAxis: this.horizontal() ? 'y' : 'x',
      animation: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        // One series per chart: the heading names it, so no legend box.
        legend: { display: false },
        tooltip: {
          backgroundColor: c.surface,
          titleColor: c.text,
          bodyColor: c.text,
          borderColor: c.grid,
          borderWidth: 1,
          titleFont: { family: c.font },
          bodyFont: { family: c.font },
          displayColors: false,
        },
      },
      scales: this.horizontal()
        ? { x: valueAxis, y: labelAxis }
        : { x: labelAxis, y: valueAxis },
    } as ChartOptions;
  });
}
