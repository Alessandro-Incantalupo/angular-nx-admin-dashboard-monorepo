import { computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { pages } from '@core/constants/menu';
import { CustomMenuItem, SubMenuItem } from '@core/models/menu.model';
import { isRouteActive } from '@core/utils/is-route-active.util';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { filter } from 'rxjs';

// ─── Grand schema ────────────────────────────────────────────────────────────
//
//  withState     raw facts that cannot be derived from anywhere else
//       ↓
//  withComputed  derived facts — recompute automatically when state or URL changes
//       ↓
//  withMethods   the only place state is mutated (always via patchState)
//       ↓
//  withHooks     one-time imperative bridge at app startup
//
//  Data flow (two independent triggers, same output):
//
//    URL changes  ──► nav signal updates ──► pagesMenu recomputes ──► template re-renders
//    User clicks  ──► toggleMenu/Sub     ──► expandedPaths patch  ──► pagesMenu recomputes ──► template re-renders
//
// ─────────────────────────────────────────────────────────────────────────────

// ── STATE ────────────────────────────────────────────────────────────────────
// Only store things that cannot be derived from something else.
// Notably: `active` and `expanded` are NOT stored — they are computed below.
type MenuState = {
  menuItems: CustomMenuItem[]; // static definition loaded from menu constants
  expandedPaths: string[]; // routes whose parent item the user has opened
  showSidebar: boolean; // desktop sidebar collapsed/expanded
  showMobileMenu: boolean; // mobile drawer open/closed
};

const initialState: MenuState = {
  menuItems: pages,
  expandedPaths: [], // nothing open until user interacts (or onInit seeds it)
  showSidebar: true,
  showMobileMenu: false,
};

export const MenuStore = signalStore(
  { providedIn: 'root' },
  withState<MenuState>(initialState),

  // ── COMPUTED ───────────────────────────────────────────────────────────────
  // Derives the full menu tree with `active` and `expanded` baked in.
  // Never stored — always re-derived from its two reactive dependencies.
  withComputed(store => {
    const router = inject(Router);

    // router.isActive() is imperative — it checks the URL right now when called.
    // computed() only re-runs when a *signal* it read changes, so calling
    // isActive() alone would compute once and go stale forever after.
    //
    // Solution: convert the router.events Observable into a signal.
    // We filter to NavigationEnd only (navigation fully completed — not the
    // intermediate Start/Recognized/GuardsCheck events).
    //
    // The type predicate `(e): e is NavigationEnd` has two jobs:
    //   - runtime:   the `instanceof` check filters the stream
    //   - compile:   TypeScript narrows the emitted type to NavigationEnd
    //                so .urlAfterRedirects etc. are available without casting
    const nav = toSignal(
      router.events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd)
      ),
      { initialValue: null } // value before the first NavigationEnd fires
    );

    const pagesMenu = computed(() => {
      // Reading nav() registers it as a reactive dependency.
      // We don't use the value — we only care that this re-runs on every navigation
      // so isRouteActive() is called against the new current URL.
      nav();

      // Build a Set for O(1) lookups instead of Array.includes() on every item.
      const expanded = new Set(store.expandedPaths());

      return store.menuItems().map(group => {
        const items = group.items.map(item => ({
          ...item,
          active: isRouteActive(router, item.route),
          // expandedPaths is the SOLE controller of expansion.
          // No `active || expanded` short-circuit — that would make toggleMenu
          // ineffective on an item you're currently visiting.
          expanded: expanded.has(item.route ?? ''),
          children: item.children?.map(child => ({
            ...child,
            active: isRouteActive(router, child.route),
            expanded: expanded.has(child.route ?? ''),
          })),
        }));
        // A group is active if any of its items is active (drives group styling).
        return { ...group, active: items.some(i => i.active), items };
      });
    });

    return { pagesMenu };
  }),

  // ── METHODS ────────────────────────────────────────────────────────────────
  // All state mutations go through patchState here — nowhere else.
  // pagesMenu recomputes automatically after each patch.
  withMethods(store => ({
    toggleSidebar: () =>
      patchState(store, { showSidebar: !store.showSidebar() }),

    setMobileMenu: (value: boolean) =>
      patchState(store, { showMobileMenu: value }),

    // Parent-level click: add/remove route from expandedPaths (true toggle).
    // Also ensures the sidebar is visible when the user expands an item.
    toggleMenu: (item: SubMenuItem) => {
      const route = item.route ?? '';
      const paths = store.expandedPaths();
      const next = paths.includes(route)
        ? paths.filter(p => p !== route) // already open → close
        : [...paths, route]; // closed → open
      patchState(store, { expandedPaths: next, showSidebar: true });
    },

    // Child-level click: same toggle logic, but doesn't force the sidebar open.
    toggleSubMenu: (item: SubMenuItem) => {
      const route = item.route ?? '';
      const paths = store.expandedPaths();
      const next = paths.includes(route)
        ? paths.filter(p => p !== route)
        : [...paths, route];
      patchState(store, { expandedPaths: next });
    },
  })),

  // ── HOOKS ──────────────────────────────────────────────────────────────────
  withHooks(store => {
    const router = inject(Router);

    return {
      onInit: () => {
        // expandedPaths starts empty every time the app loads.
        // If the user refreshes the browser on /errors/rfc-7807, the "Errors"
        // parent would render collapsed — you'd see the page content but the
        // sidebar wouldn't show you where you are.
        //
        // This block seeds expandedPaths once, at startup only, by scanning
        // the menu for any parent that is currently active:
        //
        //   menuItems  →  [ { group, items: [...] }, { group, items: [...] } ]
        //   flatMap        collapse the groups away → [ item, item, item, ... ]
        //   filter         keep only parents (have children) whose route matches the current URL
        //   map            extract just the route string from each match
        //
        // Result: e.g. ['errors'] if you loaded the app at /errors/rfc-7807.
        // patchState then puts that into expandedPaths so the sidebar opens correctly.
        //
        // Why not an effect()? An effect re-runs every time its signal dependencies
        // change — it would fire on every navigation and overwrite any collapse the
        // user manually triggered. Imperative onInit runs exactly once and hands
        // control back to the user after that.
        const activeRoutes = store
          .menuItems()
          .flatMap(g => g.items)
          .filter(i => i.children && isRouteActive(router, i.route))
          .map(i => i.route!);

        if (activeRoutes.length > 0) {
          patchState(store, { expandedPaths: activeRoutes });
        }
      },
    };
  })
);
