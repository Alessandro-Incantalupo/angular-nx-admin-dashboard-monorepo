/**
 * ============================================================
 * EXERCISE 09 — Live Coding: Angular Signals & rxResource
 * ============================================================
 *
 * RULES (simulate a live coding screen):
 *   - No looking at notes. Type imports yourself.
 *   - All imports come from '@angular/core' unless noted.
 *   - rxResource lives in '@angular/core/rxjs-interop'.
 *   - Target: ~5–8 min per task.
 *
 * Topics covered (Tier 4 pool):
 *   signal · computed · effect · input/output
 *   rxResource · toSignal · resource status
 */

// ═══════════════════════════════════════════════════════════
// TASK 1 — SIGNALS: Counter component from scratch
// ═══════════════════════════════════════════════════════════
//
// Build a StandaloneCounterComponent:
//   - Standalone: true, OnPush
//   - Internal signal: count (number, starts at 0)
//   - Computed signal: doubled (count * 2)
//   - Methods: increment(), decrement(), reset()
//   - Template: display count and doubled, three buttons
//   - Selector: 'app-live-counter'
//
// From memory — no skeleton. Include all imports.

// ═══════════════════════════════════════════════════════════
// TASK 2 — SIGNALS: input/output + computed
// ═══════════════════════════════════════════════════════════
//
// Build a FilteredListComponent:
//   - Takes items = input<string[]>() (required)
//   - Takes filterTerm = input<string>('')
//   - Exposes filtered = computed(() => items filtered by filterTerm)
//   - Output: selected = output<string>()
//   - Template: @for the filtered list, click emits selected
//   - Selector: 'app-filtered-list'
//
// From memory — include imports.

// ═══════════════════════════════════════════════════════════
// TASK 3 — EFFECT: sync a signal to localStorage
// ═══════════════════════════════════════════════════════════
//
// Write a ThemeService:
//   - Reads the initial theme from localStorage('theme') ?? 'light'
//   - Exposes theme as a public read-only signal
//   - Has setTheme(t: 'light' | 'dark'): void
//   - In the constructor, effect() that writes the theme
//     back to localStorage whenever it changes
//   - providedIn: 'root'
//
// From memory.

// ═══════════════════════════════════════════════════════════
// TASK 4 — rxResource: search with reactive HTTP
// ═══════════════════════════════════════════════════════════
//
// Build a UserSearchComponent:
//   - Standalone, OnPush
//   - searchTerm = signal<string>('')
//   - users = rxResource({
//       request: () => searchTerm(),
//       loader: ({ request }) => http.get<User[]>(`/api/users?q=${request}`)
//     })
//   - Template:
//       - An <input> that updates searchTerm on (input)
//       - @if loading → "Loading..."
//       - @if error  → "Failed to load"
//       - @for users.value() → display user.name, track user.id
//   - Selector: 'app-user-search'
//
// Interface User = { id: number; name: string; email: string }
//
// From memory — include ALL imports.

// ═══════════════════════════════════════════════════════════
// TASK 5 — toSignal: bridge an Observable to a signal
// ═══════════════════════════════════════════════════════════
//
// Write a PriceTickerComponent:
//   - Injects a PriceService that has prices$: Observable<number>
//   - Bridges it with toSignal(prices$, { initialValue: 0 })
//   - Computed signal: formatted = `€${price().toFixed(2)}`
//   - Template: display formatted
//   - No subscribe(), no BehaviorSubject, no async pipe
//   - Selector: 'app-price-ticker'
//
// From memory.

// ═══════════════════════════════════════════════════════════
// ✅ SOLUTIONS — only look after trying
// ═══════════════════════════════════════════════════════════
/*
// TASK 1 — Counter component
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-live-counter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>Count: {{ count() }}</p>
    <p>Doubled: {{ doubled() }}</p>
    <button (click)="increment()">+</button>
    <button (click)="decrement()">-</button>
    <button (click)="reset()">Reset</button>
  `,
})
export class StandaloneCounterComponent {
  readonly count = signal(0);
  readonly doubled = computed(() => this.count() * 2);

  increment() { this.count.update(n => n + 1); }
  decrement() { this.count.update(n => n - 1); }
  reset()     { this.count.set(0); }
}

// TASK 2 — Filtered list with input/output
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-filtered-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (item of filtered(); track item) {
      <div (click)="selected.emit(item)">{{ item }}</div>
    }
  `,
})
export class FilteredListComponent {
  readonly items = input.required<string[]>();
  readonly filterTerm = input<string>('');
  readonly selected = output<string>();

  readonly filtered = computed(() =>
    this.items().filter(i => i.toLowerCase().includes(this.filterTerm().toLowerCase()))
  );
}

// TASK 3 — ThemeService with effect
import { Injectable, effect, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') ?? 'light'
  );
  readonly theme = this._theme.asReadonly();

  constructor() {
    effect(() => {
      localStorage.setItem('theme', this._theme());
    });
  }

  setTheme(t: 'light' | 'dark') { this._theme.set(t); }
}

// TASK 4 — rxResource
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';

interface User { id: number; name: string; email: string; }

@Component({
  selector: 'app-user-search',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input (input)="searchTerm.set($any($event.target).value)" placeholder="Search…" />
    @if (users.isLoading()) {
      <p>Loading...</p>
    } @else if (users.error()) {
      <p>Failed to load</p>
    } @else {
      @for (user of users.value(); track user.id) {
        <p>{{ user.name }}</p>
      }
    }
  `,
})
export class UserSearchComponent {
  private readonly http = inject(HttpClient);

  readonly searchTerm = signal('');

  readonly users = rxResource({
    request: () => this.searchTerm(),
    loader: ({ request }) =>
      this.http.get<User[]>(`/api/users?q=${request}`),
  });
}

// TASK 5 — toSignal bridge
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PriceService } from './price.service'; // hypothetical

@Component({
  selector: 'app-price-ticker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>{{ formatted() }}</p>`,
})
export class PriceTickerComponent {
  private readonly priceService = inject(PriceService);

  readonly price = toSignal(this.priceService.prices$, { initialValue: 0 });
  readonly formatted = computed(() => `€${this.price().toFixed(2)}`);
}
*/
