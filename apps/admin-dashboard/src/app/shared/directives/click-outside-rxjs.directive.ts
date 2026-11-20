/**
 * Modern reactive directive to detect clicks outside an element.
 *
 * This directive uses RxJS observables and Angular's `outputFromObservable()`
 * to provide a reactive, performant way to detect clicks outside the host element.
 *
 * @example
 * ```html
 * <div (clickOutsideRxjs)="closeMenu()">
 *   Menu content
 * </div>
 * ```
 *
 * Advantages over @HostListener approach:
 * - ✅ Lazy subscription (only listens when output is actually used)
 * - ✅ Composable with other RxJS operators
 * - ✅ Automatic cleanup (unsubscribes when directive is destroyed)
 * - ✅ Easier to test in isolation
 * - ✅ Aligned with Angular's reactive future
 *
 * @see ClickOutsideDirective - Legacy @HostListener implementation
 */
import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, inject } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { filter, fromEvent } from 'rxjs';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[clickOutside]',
  standalone: true,
})
export class ClickOutsideRxjsDirective {
  // Inject the Document to listen to global click events
  private readonly dom = inject(DOCUMENT);

  // Reference to the host element this directive is attached to
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Emits when a click occurs outside the host element.
   *
   * Why `outputFromObservable()`?
   * ---------------------------
   * Angular component outputs (`output()`) are signal-based, but DOM events
   * are inherently Observable-based (via RxJS `fromEvent()`).
   *
   * `outputFromObservable()` bridges this gap:
   * - Takes an Observable (the click stream)
   * - Converts it to a signal-based output
   * - Provides automatic cleanup when directive is destroyed
   * - Only subscribes when the output is actually used (lazy)
   *
   * Why not signals directly?
   * -------------------------
   * DOM events (`click`, `scroll`, etc.) are asynchronous streams that emit
   * multiple values over time - perfect for Observables, but signals are
   * designed for single synchronous values. `fromEvent()` returns an Observable,
   * so we need the bridge.
   *
   * Flow:
   * 1. `fromEvent(document, 'click')` → Creates Observable of click events
   * 2. `.pipe(filter(...))` → Filters to only outside clicks
   * 3. `outputFromObservable()` → Converts Observable to Angular output
   * 4. Component receives it as: `(clickOutsideRxjs)="handleClick()"`
   */
  clickOutside = outputFromObservable(
    fromEvent(this.dom, 'click').pipe(
      filter(
        event =>
          !this.elementRef.nativeElement.contains(event.target as HTMLElement)
      )
    )
  );
}
