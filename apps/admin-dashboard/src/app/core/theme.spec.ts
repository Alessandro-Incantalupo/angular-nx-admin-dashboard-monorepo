import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme';

/** Node 26 has its own (empty) localStorage global that hides jsdom's: use a small in-memory one. */
class MemoryStorage
  implements Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'clear'>
{
  private items = new Map<string, string>();
  getItem(k: string) {
    return this.items.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.items.set(k, v);
  }
  removeItem(k: string) {
    this.items.delete(k);
  }
  clear() {
    this.items.clear();
  }
}

describe('ThemeService', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: new MemoryStorage(),
      configurable: true,
    });
  });

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('sets data-theme on <html> and remembers the choice', () => {
    const theme = TestBed.inject(ThemeService);
    theme.set('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(window.localStorage.getItem('theme')).toBe('dark');

    theme.toggle();
    expect(theme.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('forgets the choice when set back to the system setting', () => {
    const theme = TestBed.inject(ThemeService);
    theme.set('dark');
    theme.set('system');
    expect(window.localStorage.getItem('theme')).toBeNull();
    expect(document.documentElement.getAttribute('data-theme')).toMatch(
      /^(light|dark)$/
    );
  });
});
