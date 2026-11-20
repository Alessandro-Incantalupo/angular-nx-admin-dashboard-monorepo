import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';

export type ThemeChoice = 'system' | 'light' | 'dark';
const KEY = 'theme';

/**
 * Light or dark, per browser. The choice is kept in localStorage (a viewer
 * preference, nothing the server needs); "system" follows the OS setting.
 * index.html applies the same rule before the first paint.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly media = this.doc.defaultView?.matchMedia?.(
    '(prefers-color-scheme: dark)'
  );
  private readonly systemDark = signal(this.media?.matches ?? false);

  readonly choice = signal<ThemeChoice>(this.read());
  readonly theme = computed<'light' | 'dark'>(() => {
    const c = this.choice();
    return c === 'system' ? (this.systemDark() ? 'dark' : 'light') : c;
  });

  constructor() {
    this.media?.addEventListener('change', e => {
      this.systemDark.set(e.matches);
      this.apply();
    });
    this.apply();
  }

  set(choice: ThemeChoice): void {
    this.choice.set(choice);
    try {
      const storage = this.doc.defaultView?.localStorage;
      if (choice === 'system') storage?.removeItem(KEY);
      else storage?.setItem(KEY, choice);
    } catch {
      // Private mode or blocked storage: the choice lasts for this visit.
    }
    this.apply();
  }

  toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  /** Sets data-theme on <html> right away, so styles read below see the new theme. */
  private apply(): void {
    this.doc.documentElement.setAttribute('data-theme', this.theme());
  }

  private read(): ThemeChoice {
    try {
      const saved = this.doc.defaultView?.localStorage.getItem(KEY);
      return saved === 'light' || saved === 'dark' ? saved : 'system';
    } catch {
      return 'system';
    }
  }
}
