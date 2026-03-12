/**
 * REFERENCE ONLY — not used in the app.
 *
 * This is the plain-signals + rxMethod equivalent of menu.store.ts.
 * It shows how you would achieve the same result WITHOUT SignalStore,
 * using an @Injectable service with manual signal + rxMethod wiring.
 *
 * Compare with: apps/admin-dashboard/src/app/core/state/menu.store.ts
 */

import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { pages } from '@core/constants/menu';
import { CustomMenuItem, SubMenuItem } from '@core/models/menu.model';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MenuServiceReference {
  private readonly router = inject(Router);

  // ── Core state as private writable signals ─────────────────────────────
  private readonly _menuItems = signal<CustomMenuItem[]>(pages);
  private readonly _expandedPaths = signal<string[]>([]);
  private readonly _showSidebar = signal(true);
  private readonly _showMobileMenu = signal(false);

  // ── Navigation signal via toSignal() ──────────────────────────────────
  // toSignal() converts an Observable into a Signal and auto-unsubscribes
  // via DestroyRef (no manual Subscription / ngOnDestroy needed).
  private readonly nav = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ),
    { initialValue: null }
  );

  // ── Derived state via computed() ──────────────────────────────────────
  // computed() re-runs automatically whenever nav() or _expandedPaths() changes.
  // No rxMethod, no subscription, no destroy hook.
  readonly pagesMenu: Signal<CustomMenuItem[]> = computed(() => {
    this.nav(); // register nav as a reactive dependency
    const expanded = new Set(this._expandedPaths());

    return this._menuItems().map(group => {
      const items = group.items.map(item => {
        const active = this.isActive(item.route);
        return {
          ...item,
          active,
          expanded: active || expanded.has(item.route ?? ''),
          children: item.children?.map(child => ({
            ...child,
            expanded: expanded.has(child.route ?? ''),
          })),
        };
      });
      return { ...group, active: items.some(i => i.active), items };
    });
  });

  // ── Read-only public signal surfaces ──────────────────────────────────
  readonly showSidebar: Signal<boolean> = this._showSidebar.asReadonly();
  readonly showMobileMenu: Signal<boolean> = this._showMobileMenu.asReadonly();

  // ── Commands ──────────────────────────────────────────────────────────
  toggleSidebar() {
    this._showSidebar.update(v => !v);
  }

  setMobileMenu(value: boolean) {
    this._showMobileMenu.set(value);
  }

  toggleMobileMenu() {
    this._showMobileMenu.update(v => !v);
  }

  toggleMenu(item: SubMenuItem) {
    this._showSidebar.set(true);
    this._toggle(item.route ?? '');
  }

  toggleSubMenu(item: SubMenuItem) {
    this._toggle(item.route ?? '');
  }

  // ── Private helpers ───────────────────────────────────────────────────
  private _toggle(route: string) {
    this._expandedPaths.update(paths =>
      paths.includes(route) ? paths.filter(p => p !== route) : [...paths, route]
    );
  }

  private isActive(route: string | null | undefined): boolean {
    if (!route) return false;
    return this.router.isActive(this.router.createUrlTree([route]), {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }
}

/**
 * ─── WHY rxMethod IS STILL USEFUL (reference example) ────────────────────────
 *
 * rxMethod shines when you need to react to an Observable and perform
 * async side-effects with automatic cancellation (switchMap, exhaustMap etc).
 *
 * Example: if toggleMenu triggered a backend call to persist the state:
 *
 *   readonly persistExpanded = rxMethod<string[]>(
 *     pipe(
 *       debounceTime(300),
 *       switchMap(paths => this.menuApi.saveExpandedState(paths)),
 *       tapResponse({
 *         next: () => {},
 *         error: err => console.error(err),
 *       })
 *     )
 *   );
 *
 * You'd call: this.persistExpanded(this._expandedPaths)  ← pass the signal directly
 *
 * rxMethod accepts both Observables AND Signals. When passed a Signal it watches
 * it reactively, re-triggering the pipeline on every change.
 */
