import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AssistantChatComponent } from './assistant-chat.component';

/** `?chat=open` in the URL opens the panel, so a link can land on the assistant. */
const OPEN_PARAM = 'chat';

/**
 * The round button in the bottom-right corner and the chat panel it opens.
 * The chat (and Hashbrown with it) loads the first time the panel opens, and
 * stays mounted when it closes, so the conversation is still there next time.
 */
@Component({
  selector: 'app-assistant-launcher',
  imports: [AssistantChatComponent],
  host: { '(document:keydown.escape)': 'close()' },
  template: `
    <div
      id="assistant-panel"
      role="dialog"
      aria-labelledby="assistant-title"
      class="bg-card border-border fixed inset-x-4 bottom-24 z-50 flex h-[min(40rem,calc(100dvh-8rem))] origin-bottom-right flex-col overflow-hidden rounded-2xl border shadow-2xl transition-all duration-200 ease-out motion-reduce:transition-none sm:right-6 sm:left-auto sm:w-[26rem]"
      [class]="
        open()
          ? 'visible translate-y-0 scale-100 opacity-100'
          : 'pointer-events-none invisible translate-y-3 scale-95 opacity-0'
      "
      [attr.aria-hidden]="!open()"
    >
      @defer (when loaded()) {
        <app-assistant-chat [open]="open()" (closed)="close()" />
      } @placeholder {
        <div class="flex grow items-center justify-center">
          <i class="pi pi-spin pi-spinner text-primary text-xl"></i>
        </div>
      }
    </div>
    <button
      type="button"
      class="bg-primary text-primary-foreground hover:bg-primary/90 fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform duration-200 hover:scale-105 motion-reduce:transition-none"
      aria-controls="assistant-panel"
      data-testid="assistant-launcher"
      [attr.aria-label]="open() ? 'Close the assistant' : 'Open the assistant'"
      [attr.aria-expanded]="open()"
      (click)="toggle()"
    >
      <i
        class="pi text-xl transition-transform duration-200"
        [class]="open() ? 'pi-times rotate-90' : 'pi-comments rotate-0'"
      ></i>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssistantLauncherComponent {
  protected readonly open = signal(false);
  /** True from the first open on: the chat loads then and is never dropped. */
  protected readonly loaded = signal(false);

  constructor() {
    const router = inject(Router);
    router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(event => {
        const params = router.parseUrl(event.urlAfterRedirects).queryParams;
        if (params[OPEN_PARAM] === 'open') this.show();
      });
  }

  protected toggle(): void {
    if (this.open()) this.close();
    else this.show();
  }

  close(): void {
    this.open.set(false);
  }

  private show(): void {
    this.loaded.set(true);
    this.open.set(true);
  }
}
