import { computed, effect } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

type State = {
  mode: 'light' | 'dark';
  color: string;
};

const initialState: State = {
  mode: 'dark',
  color: 'base',
};

const themeColors = [
  { name: 'base', code: '#e11d48' },
  { name: 'yellow', code: '#f59e0b' },
  { name: 'green', code: '#22c55e' },
  { name: 'blue', code: '#3b82f6' },
  { name: 'orange', code: '#ea580c' },
  { name: 'red', code: '#cc0022' },
  { name: 'violet', code: '#6d28d9' },
];

export const ThemeStore = signalStore(
  { providedIn: 'root' },
  withState<State>(initialState),
  withComputed(state => ({
    isDark: computed(() => state.mode() === 'dark'),
  })),
  withMethods(state => {
    const loadTheme = () => {
      try {
        const saved = localStorage.getItem('theme');
        if (saved) {
          const parsed: State = JSON.parse(saved);
          patchState(state, parsed);
        }
      } catch (error) {
        console.error('Failed to load theme from localStorage:', error);
      }
    };

    const setTheme = (theme: Partial<State>) => {
      patchState(state, theme);
      try {
        localStorage.setItem(
          'theme',
          JSON.stringify({ mode: state.mode(), color: state.color() })
        );
      } catch (error) {
        console.error('Failed to save theme to localStorage:', error);
      }
    };

    const toggleMode = () => {
      setTheme({ mode: state.mode() === 'dark' ? 'light' : 'dark' });
    };

    const setColor = (color: string) => {
      setTheme({ color });
    };

    const getThemeColors = () => themeColors;
    const getMode = () => ['light', 'dark'];

    return {
      loadTheme,
      setTheme,
      toggleMode,
      setColor,
      getThemeColors,
      getMode,
    };
  }),
  withHooks(store => ({
    // Automatically apply theme updates
    onInit: () => {
      store.loadTheme();

      // This effect runs whenever the theme mode or color changes in the store.
      effect(() => {
        // Get the current mode ('light' or 'dark') from the store signal
        const mode = store.mode();
        // Get the current color theme (e.g., 'base', 'blue', etc.) from the store signal
        const color = store.color();

        // Reference to the <html> element (document root)
        const root = document.documentElement;

        // Remove both 'light' and 'dark' classes to reset the state
        root.classList.remove('light', 'dark');
        // Add the current mode as a class to <html> (either 'light' or 'dark')
        root.classList.add(mode);
        // Set the data-theme attribute to the current color (e.g., data-theme="blue")
        root.setAttribute('data-theme', color);

        // --- Force browser to repaint styles ---
        // Hide the <html> element (triggers a layout flush)
        root.style.display = 'none';
        // Access offsetHeight to force a reflow (browser applies style changes immediately)
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        root.offsetHeight;
        // Restore the <html> element's display property
        root.style.display = '';
      });
    },
  }))
);
