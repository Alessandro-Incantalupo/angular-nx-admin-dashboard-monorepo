/**
 * Chart.js can't read CSS variables, so the chart colours are resolved from
 * the token roles at render time, and again when the theme changes.
 * Every chart here has one series, drawn in --accent: a single hue that the
 * token checks already keep above 3:1 against the surface in both themes.
 */
export interface ChartTheme {
  series: string;
  seriesSubtle: string;
  text: string;
  muted: string;
  grid: string;
  surface: string;
  font: string;
}

export function readChartTheme(
  el: Element = document.documentElement
): ChartTheme {
  const css = getComputedStyle(el);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    series: v('--accent'),
    seriesSubtle: v('--accent-subtle'),
    text: v('--text'),
    muted: v('--text-muted'),
    grid: v('--border'),
    surface: v('--surface-raised'),
    font: v('--body-font'),
  };
}
