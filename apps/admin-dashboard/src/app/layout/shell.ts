import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { filter, skip } from 'rxjs';
import { SessionStore } from '../core/session-store';
import { ThemeService } from '../core/theme';
import { Icon, type IconName } from '../ui/icon';

interface NavItem {
  path: string;
  label: string;
  icon: IconName;
}

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    Icon,
    Toast,
    ConfirmDialog,
  ],
  template: `
    <a
      href="#main"
      class="sr-only-focusable rounded-control bg-accent text-on-accent absolute top-2 left-2 z-50 px-4 py-2"
    >
      Skip to content
    </a>

    <div class="min-h-dvh md:grid md:grid-cols-[15rem_1fr]">
      <header
        class="border-border bg-surface-raised border-b md:border-r md:border-b-0"
      >
        <div
          class="flex items-center justify-between gap-2 px-4 py-3 md:px-5 md:py-5"
        >
          <a
            routerLink="/dashboard"
            class="text-default text-lg font-semibold no-underline"
            >Admin Dashboard</a
          >
          <button
            type="button"
            class="rounded-control text-default hover:bg-surface-sunken inline-flex size-11 items-center justify-center md:hidden"
            [attr.aria-label]="themeLabel()"
            (click)="theme.toggle()"
          >
            <app-icon [name]="theme.theme() === 'dark' ? 'sun' : 'moon'" />
          </button>
        </div>

        <nav aria-label="Main" class="px-2 pb-2 md:px-3">
          <ul class="flex gap-1 md:flex-col">
            @for (item of nav; track item.path) {
              <li>
                <a
                  [routerLink]="item.path"
                  routerLinkActive="bg-accent-subtle text-on-accent-subtle font-semibold"
                  ariaCurrentWhenActive="page"
                  class="rounded-control text-default hover:bg-surface-sunken flex min-h-11 items-center gap-3 px-3 no-underline"
                >
                  <app-icon [name]="item.icon" />
                  {{ item.label }}
                </a>
              </li>
            }
          </ul>
        </nav>
      </header>

      <div class="flex min-w-0 flex-col">
        <div
          class="border-border bg-surface-raised flex flex-wrap items-center justify-end gap-3 border-b px-4 py-2 md:px-8"
        >
          @if (session.user(); as user) {
            <p class="text-muted m-0 mr-auto">
              <span class="text-default">{{ user.name }}</span>
              · {{ user.role === 'admin' ? 'Admin' : 'Viewer' }}
            </p>
          }
          <button
            type="button"
            class="rounded-control text-default hover:bg-surface-sunken hidden min-h-11 items-center gap-2 px-3 md:inline-flex"
            (click)="theme.toggle()"
          >
            <app-icon [name]="theme.theme() === 'dark' ? 'sun' : 'moon'" />
            {{ theme.theme() === 'dark' ? 'Light theme' : 'Dark theme' }}
          </button>
          <button
            type="button"
            class="rounded-control text-default hover:bg-surface-sunken inline-flex min-h-11 items-center gap-2 px-3"
            (click)="logout()"
          >
            <app-icon name="logout" />
            Sign out
          </button>
        </div>

        @if (!session.isAdmin()) {
          <p
            class="border-border bg-warning-subtle text-warning m-0 border-b px-4 py-2 md:px-8"
          >
            You are signed in as a viewer: you can look at everything, but not
            change it.
          </p>
        }

        <main
          id="main"
          #main
          tabindex="-1"
          class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 outline-none md:px-8 md:py-8"
        >
          <router-outlet />
        </main>
      </div>
    </div>
    <p-toast position="bottom-right" />
    <p-confirmdialog />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Shell {
  protected readonly session = inject(SessionStore);
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  protected readonly nav: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/members', label: 'Members', icon: 'members' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
  ];

  protected themeLabel() {
    return this.theme.theme() === 'dark'
      ? 'Switch to the light theme'
      : 'Switch to the dark theme';
  }

  constructor() {
    // After each page change, move focus to the content so keyboard and screen
    // reader users start at the new page, not at the link they used.
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        skip(1),
        takeUntilDestroyed()
      )
      .subscribe(() => this.main().nativeElement.focus());
  }

  protected async logout() {
    await this.session.logout();
    await this.router.navigate(['/login']);
  }
}
