/**
 * Single source of truth for the values that both the Ant Design theme
 * (`ConfigProvider` in `src/providers/antd.tsx`) and the Tailwind `@theme`
 * block (`src/styles/tokens.css`) must agree on. `palette.test.ts` fails if the
 * CSS drifts from this module.
 */
export const palette = {
  brand: '#307FE2',
  brandHover: '#1C66C1',
  brandActive: '#154C91',
  text: '#1C1C1C',
  textSecondary: '#4B4B4B',
  radius: 12,
  controlHeight: 40,
  controlHeightSm: 32,
  controlHeightLg: 48,
} as const;

/** CSS custom-property names in `tokens.css` that mirror {@link palette} colors. */
export const paletteCssMirrors = [
  ['--color-primary-brand', palette.brand],
  ['--color-primary-brand-hover', palette.brandHover],
  ['--color-content-primary', palette.text],
  ['--color-content-secondary', palette.textSecondary],
] as const;
