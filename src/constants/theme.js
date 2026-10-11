/** CSS variable references for React styles and SVG/icon props.
 * The actual palette is defined only in src/styles/theme.css.
 */
export const COLORS = Object.freeze({
  primary: 'var(--color-primary)',
  primaryHover: 'var(--color-primary-hover)',
  primaryLight: 'var(--color-primary-light)',
  tag: 'var(--color-tag)',
  mint: 'var(--color-mint)',
  bg: 'var(--color-bg)',
  surface: 'var(--color-surface)',
  soft: 'var(--color-soft)',
  ink: 'var(--color-ink)',
  muted: 'var(--color-muted)',
  faint: 'var(--color-faint)',
  line: 'var(--color-line)',
  lineStrong: 'var(--color-line-strong)',
  focus: 'var(--color-focus)',
  badgeGold: 'var(--color-badge-gold)',
  badgeGoldBg: 'var(--color-badge-gold-bg)',
});

/** Resolve a concrete CSS color for Canvas/chart APIs that cannot accept var().
 * Call after the stylesheet is loaded; pass a themed element for scoped colors.
 */
export function resolveThemeColor(name, element = document.documentElement) {
  if (!Object.hasOwn(COLORS, name)) throw new Error(`Unknown theme color: ${name}`);
  const reference = COLORS[name];
  const property = reference.slice(4, -1);
  return getComputedStyle(element).getPropertyValue(property).trim();
}
