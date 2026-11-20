/**
 * @deprecated Legacy implementation using @HostListener
 *
 * What is @HostListener?
 * ----------------------
 * @HostListener is a decorator that lets you listen to events on:
 * - The host element (the element the directive is attached to)
 * - Global objects (document, window)
 *
 * Syntax:
 * @HostListener('eventName', ['$event', 'otherArgs'])
 * - 'eventName': The event to listen to (e.g., 'click', 'mouseenter')
 * - 'document:click': Listen to clicks on the entire document
 * - 'window:resize': Listen to window resize events
 * - ['$event']: Pass the event object to the method
 *
 * How it works in this directive:
 * 1. @HostListener('document:click', ['$event']) - Listen to ALL clicks on the document
 * 2. When any click happens, Angular calls onClick(event)
 * 3. We check if the click was outside our element
 * 4. If yes, emit the output
 *
 * Usage:
 * <div clickOutside (clickOutside)="closeMenu()">Menu</div>
 *
 * Issues with this approach:
 * - Always active (listens even when output isn't subscribed to)
 * - Less composable with RxJS streams
 * - Harder to test in isolation
 * - Not aligned with Angular's future (signals/observables)
 *
 * @see ClickOutsideRxjsDirective - Modern reactive implementation
 *
 * Kept for reference/legacy purposes only.
 * Consider migrating usages to ClickOutsideRxjsDirective.
 */
import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  output,
} from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[clickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  // Reference to the host element (the element with [clickOutside] attribute)
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  // Signal-based output that emits when click happens outside
  clickOutside = output();

  /**
   * @HostListener decorator - Listens to document-wide click events
   *
   * Breakdown:
   * - 'document:click': Target is the entire document (not just the host element)
   * - ['$event']: Pass the click event to the method parameter
   *
   * This method runs EVERY TIME anyone clicks ANYWHERE on the page
   */
  @HostListener('document:click', ['$event'])
  public onClick(event: Event): void {
    // Cast event.target to HTMLElement (TypeScript requirement)
    const targetElement = event.target as HTMLElement;
    if (!targetElement) return;

    // Check if the clicked element is inside our host element
    const isClickedInside =
      this.elementRef.nativeElement.contains(targetElement);

    // Only emit if the click was OUTSIDE
    if (!isClickedInside) {
      this.clickOutside.emit();
    }
  }
}
