# 04 — Styling, Design System, RTL, Typography

Read first: Tailwind docs (tailwindcss.com/docs), Ant Design docs for the installed major version (ant.design, `llms.txt`, migration guide v5→v6). Use the `antd` MCP for component APIs.

## Layers of the design system
1. **Tokens** (`src/styles/tokens.css`): colors, spacing, radii, shadows, z-index, motion, breakpoints, type scale. Defined once in `@theme`. Start from the existing `Design.md` and `css-variables.css`; improve and move them here.
2. **Base** (`src/styles/base.css`): resets, `html[dir=rtl]`, focus ring, selection, reduced motion.
3. **Primitives** (`src/shared/ui`): Button, IconButton, Container, Stack, Heading, Text, Image, Skeleton, Spinner, Badge, Tile, Section.
4. **Composites**: Carousel, Card, NavItem, Drawer, etc. built from primitives.
5. **Feature components** compose the above.

Build order: tokens → base → primitives → composites → features → pages.

## CSS file layout
```
src/styles/
├─ index.css            # the only global entry (imported once in app/layout.tsx)
├─ tokens.css           # @theme (design tokens)
├─ base.css             # @layer base
├─ typography.css       # @layer base + @utility for type styles
├─ antd-bridge.css      # layer order + Ant Design alignment with tokens
└─ components/          # @layer components, one file per component or feature
   ├─ button.css
   ├─ app-header.css
   └─ hero-banner.css
```
Layer order (verify against the Ant Design + Tailwind docs): `@layer theme, base, antd, components, utilities;` and configure Ant Design's CSS-in-JS to emit into the `antd` layer so Tailwind utilities can override it.

## Class strategy (mandatory)
**Do not write long utility strings in `className`.**

1. Component styles are semantic classes in `@layer components`:
```css
/* src/styles/components/hero-banner.css */
@layer components {
  .hero-banner { @apply relative isolate overflow-hidden rounded-card bg-surface; }
  .hero-banner__image { @apply size-full object-cover; }
  .hero-banner__title { @apply text-heading-lg text-on-image text-balance; }
  .hero-banner[data-state='loading'] { @apply animate-pulse; }
}
```
```tsx
<section className="hero-banner" data-state={state}>
```
2. Repeated single-purpose patterns are `@utility` (for example `content-auto`, `safe-area-pb`, `scrollbar-hide`).
3. Variants: `data-variant`, `data-size`, `data-state`, `aria-*` attributes selected in CSS. No string concatenation of class names.
4. Allowed inline: at most 3 single-purpose layout utilities (for example `className="flex gap-4"`) in page composition. Anything bigger becomes a class.
5. Values come from tokens. Arbitrary values (`w-[137px]`) need a comment and should be rare.
6. A class name is owned by exactly one component. No cross-component class reuse; extract a primitive instead.
7. `@apply` stays short and readable (about 8 utilities max per rule). Split into elements if longer.

## RTL (the site is Persian, right-to-left)
- Root: `<html lang="fa" dir="rtl">`.
- Use logical utilities: `ms-* me-* ps-* pe-* start-* end-* text-start text-end border-s border-e rounded-s rounded-e`. Never `ml-* mr-* pl-* pr-* left-* right-* text-left text-right`.
- Mirror direction-bearing icons (arrows, chevrons) with `rtl:-scale-x-100`. Do not mirror logos, clocks, media controls.
- Ant Design: `ConfigProvider direction="rtl"` with the Persian locale; check each component's RTL behavior in docs.
- Carousel and scroll-snap: confirm scroll origin and arrow semantics in RTL. Test in the browser.
- Numbers: decide Persian or Latin digits from the audit and apply consistently through one formatter.
- Bidirectional text: wrap Latin fragments with `<bdi>` or `dir="auto"` where needed.

## Typography (SSR-safe)
- Load fonts with `next/font/local` (self-host from `fonts.md`). `display: 'swap'`, `preload: true`, only needed weights, `adjustFontFallback` and a metric-compatible fallback to avoid layout shift.
- Expose the font as a CSS variable and bind it in `@theme` (`--font-sans`).
- Type scale is tokens: `--text-display`, `--text-heading-lg|md|sm`, `--text-body-lg|md|sm`, `--text-caption`, each with `line-height` and `letter-spacing`. Use `clamp()` for fluid sizes between 360 px and 1440 px.
- Persian text needs generous line-height (about 1.7 for body). Do not use negative letter-spacing on Persian.
- `text-wrap: balance` for headings, `pretty` for paragraphs.
- Headings use real `h1-h6` in order. One `h1` per page. Visual size is independent from semantic level.
- Type styles are Tailwind `@utility` classes (`text-heading-lg`) or component classes. Never hard-code `font-size` in components.

## Component decision rule (mandatory)
**Never re-develop what Ant Design already ships.** Before creating any UI component (primitive or composite), follow this order:

1. **Check Ant Design first** (`antd` MCP / `llms.txt`) for a component that covers the requirement.
2. **If it exists in Ant Design:** write a small wrapper in `src/shared/ui` that re-exports/extends the Ant Design component — set theme-driven defaults and antd's own props up front, fix RTL, and expose only the props our app needs. Do not re-implement behavior or styling from scratch.
3. **Only if no Ant Design component matches:** build the component from scratch with Tailwind following the class strategy below, matched to the reference.

Exceptions need a written reason (for example a bespoke visual that cannot be themed via `ConfigProvider` without `!important` fighting).

## Ant Design v6 usage
- Use the App Router registry package for SSR style extraction (check the "Usage with Next.js" page).
- Follow the component decision rule above: antd covers the widget → wrap it; antd does not cover it → build with Tailwind. Simple reference-matched visuals (tiles, banners, nav items) are still ours when antd has no fit.
- Theme through `ConfigProvider theme={{ token: {...} }}` mapped from our tokens. Do not fight Ant Design with `!important`.
- Static `message/notification/Modal` methods: use `App.useApp()`.
- Check the v5→v6 migration page for renamed or removed props. Treat console deprecation warnings as bugs.
- Import components by name from `antd` (tree-shakable). Do not import the whole CSS bundle.

## Icons
- Iconsax named imports only. One wrapper primitive `Icon` fixes `size`, `variant` and `color="currentColor"`. Icons are decorative by default (`aria-hidden`), or labelled when they are the only content of a control.

## Motion
- Tokens: `--motion-duration-fast|base|slow`, `--motion-ease-standard|emphasized`.
- Only animate `transform` and `opacity`. Avoid animating `height`, `top`, `left`, `box-shadow`.
- Scroll-linked behavior uses `IntersectionObserver` sentinels or CSS scroll-driven animations as progressive enhancement. No scroll event handlers that touch layout.
- `@media (prefers-reduced-motion: reduce)` removes non-essential motion.

## Responsive
- Mobile first. Breakpoints are tokens aligned with the audit (verify values from the reference). Test at 360, 390, 768, 1024, 1440.
- Use `container` primitives with fluid padding. Use `min-h-dvh`, not `vh`. Respect safe areas (`env(safe-area-inset-*)`) for the mobile bottom bar.
- Touch targets at least 44x44 px.
