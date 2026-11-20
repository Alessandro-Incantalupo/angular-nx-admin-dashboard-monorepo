# design-system

The dashboard's look, built on [`@a.incantalupo/design-tokens`](https://www.npmjs.com/package/@a.incantalupo/design-tokens):

- `dashboardPreset` / `primeNgTheme`: PrimeNG's Aura preset with every semantic token pointed at a token role (`--surface`, `--text`, `--accent`, `--focus-ring`...). Light and dark come from `data-theme` on `<html>`.
- `styles.css`: element defaults (body, focus ring, links, native inputs at 16px and 44px tall) and a `.card` class, all reading roles.
- `readChartTheme()`: the roles resolved to colours for Chart.js, which can't read CSS variables.

Components use roles only. A colour that isn't a role belongs in the tokens package, not here.
