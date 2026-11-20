import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * PrimeNG's Aura preset with its semantic tokens pointed at the design-token
 * roles (`--surface`, `--text`, `--accent`...). The roles switch with
 * `data-theme` on <html>, so one mapping serves light and dark; Aura's own
 * `light-dark()` values follow the `color-scheme` each token theme sets.
 *
 * Sizes are raised for reading and touch: 16px text, 44px controls.
 */
const n = (step: number) => `var(--palette-neutral-${step})`;

export const dashboardPreset = definePreset(Aura, {
  semantic: {
    typography: { fontSize: '1rem', fontFamily: 'var(--body-font)' },
    iconSize: '1rem',
    focusRing: {
      width: 'var(--focus-ring-width)',
      style: 'solid',
      color: 'var(--focus-ring)',
      offset: 'var(--focus-ring-offset)',
      shadow: 'none',
    },
    primary: {
      color: 'var(--accent)',
      contrastColor: 'var(--on-accent)',
      hoverColor: 'var(--accent-strong)',
      activeColor: 'var(--accent-strong)',
    },
    // Aura reads a neutral ramp in many components (table rows, paginator...).
    surface: {
      0: 'var(--palette-white)',
      50: n(50),
      100: n(100),
      200: n(200),
      300: n(300),
      400: n(400),
      500: n(500),
      600: n(600),
      700: n(700),
      800: n(800),
      900: n(900),
      950: n(950),
    },
    highlight: {
      background: 'var(--accent-subtle)',
      focusBackground: 'var(--accent-subtle)',
      color: 'var(--on-accent-subtle)',
      focusColor: 'var(--on-accent-subtle)',
    },
    text: {
      color: 'var(--text)',
      hoverColor: 'var(--text)',
      mutedColor: 'var(--text-muted)',
      hoverMutedColor: 'var(--text)',
    },
    content: {
      background: 'var(--surface-raised)',
      hoverBackground: 'var(--surface-sunken)',
      borderColor: 'var(--border)',
      color: 'var(--text)',
      hoverColor: 'var(--text)',
      borderRadius: 'var(--card-radius)',
    },
    formField: {
      fontSize: '1rem',
      paddingX: '0.75rem',
      paddingY: '0.625rem',
      borderRadius: 'var(--control-radius)',
      background: 'var(--surface-raised)',
      disabledBackground: 'var(--surface-sunken)',
      filledBackground: 'var(--surface-sunken)',
      borderColor: 'var(--border-strong)',
      hoverBorderColor: 'var(--text-muted)',
      focusBorderColor: 'var(--accent)',
      invalidBorderColor: 'var(--danger)',
      color: 'var(--text)',
      disabledColor: 'var(--text-muted)',
      placeholderColor: 'var(--text-muted)',
      invalidPlaceholderColor: 'var(--danger-text)',
      iconColor: 'var(--text-muted)',
      focusRing: {
        width: 'var(--focus-ring-width)',
        style: 'solid',
        color: 'var(--focus-ring)',
        offset: '0',
        shadow: 'none',
      },
    },
    overlay: {
      select: {
        background: 'var(--surface-raised)',
        borderColor: 'var(--border)',
        color: 'var(--text)',
        shadow: 'var(--overlay-shadow)',
      },
      popover: {
        background: 'var(--surface-raised)',
        borderColor: 'var(--border)',
        color: 'var(--text)',
        shadow: 'var(--overlay-shadow)',
      },
      modal: {
        background: 'var(--surface-raised)',
        borderColor: 'var(--border)',
        color: 'var(--text)',
        shadow: 'var(--overlay-shadow)',
        borderRadius: 'var(--card-radius)',
      },
    },
    list: {
      option: {
        focusBackground: 'var(--surface-sunken)',
        color: 'var(--text)',
        focusColor: 'var(--text)',
      },
    },
    navigation: {
      item: {
        focusBackground: 'var(--surface-sunken)',
        activeBackground: 'var(--accent-subtle)',
        color: 'var(--text)',
        focusColor: 'var(--text)',
        activeColor: 'var(--on-accent-subtle)',
      },
    },
  },
  components: {
    button: {
      root: {
        paddingY: '0.625rem',
        paddingX: '1rem',
        borderRadius: 'var(--control-radius)',
      },
    },
    // Status tags read as text: 16px, and colours from the status roles.
    tag: {
      root: { fontSize: '1rem', fontWeight: '600', padding: '0.125rem 0.5rem' },
      success: {
        background: 'var(--success-subtle)',
        color: 'var(--success-text)',
      },
      info: {
        background: 'var(--accent-subtle)',
        color: 'var(--on-accent-subtle)',
      },
      secondary: {
        background: 'var(--surface-sunken)',
        color: 'var(--text-muted)',
      },
      danger: {
        background: 'var(--danger-subtle)',
        color: 'var(--danger-text)',
      },
      warn: {
        background: 'var(--warning-subtle)',
        color: 'var(--warning-text)',
      },
    },
    // 44px page buttons, easy to hit on a phone.
    paginator: {
      navButton: { width: '2.75rem', height: '2.75rem' },
    },
  },
});

/** Options for providePrimeNG(): the preset, the dark selector and the CSS layer. */
export const primeNgTheme = {
  preset: dashboardPreset,
  options: {
    darkModeSelector: '[data-theme="dark"]',
    // PrimeNG's styles sit in their own layer, under Tailwind's utilities.
    cssLayer: {
      name: 'primeng',
      order: 'theme, base, primeng, components, utilities',
    },
  },
} as const;
