# 07 — Performance, SEO, Accessibility

## Budgets (mobile, throttled; verify with Lighthouse and Chrome DevTools MCP)
| Metric | Target |
| --- | --- |
| LCP | <= 2.5 s (aim for 2.0 s) |
| INP | <= 200 ms |
| CLS | <= 0.05 |
| TBT (lab) | <= 200 ms |
| Lighthouse Performance / SEO / Accessibility / Best Practices | >= 90 / 100 / 100 / 100 |
| First-load JS for the homepage | Track and report in README; keep as small as practical |

## Rendering strategy for speed
- Static shell via Cache Components; stream dynamic holes. See `02-nextjs-rendering.md`.
- Server Components by default to keep client JS small. Client leaves only.
- No client waterfalls: server fetch the first view, hydrate SWR with fallback.

## Images
- `next/image` always. Declare remote hosts in `remotePatterns` (hosts from `images.md`).
- The hero image is the LCP: `priority` (or `preload`), `fetchPriority="high"`, accurate `sizes`, explicit width/height or `fill` in a sized container. Never lazy-load it.
- Below-the-fold images lazy by default. Provide `blurDataURL` or a color placeholder to avoid flashes.
- Serve modern formats (AVIF/WebP via the optimizer). Set `qualities` explicitly if needed (check current default behavior in docs).
- Carousel: render only the first slide eagerly; others lazy. If there is a single banner, render **no carousel JavaScript**.

## Fonts
- `next/font/local`, self-hosted, subset to needed weights, `display: swap`, metric-adjusted fallback. No external font CSS.

## JavaScript
- Check bundles with the Next.js bundle analyzer or `next build` output. Dynamic import heavy, non-critical client widgets (`next/dynamic` with a skeleton).
- Import Ant Design components by name; do not import icon packs wholesale; Iconsax named imports only.
- Avoid scroll listeners. Use `IntersectionObserver`, CSS scroll-driven animations, `requestAnimationFrame` with passive listeners when unavoidable.
- Keep third-party scripts at zero unless required.

## CSS and motion
- Tailwind v4 output is purged automatically; keep component CSS in layers. Animate only `transform` and `opacity`. Add `will-change` only during an animation.
- `content-visibility: auto` with `contain-intrinsic-size` for long below-the-fold sections.

## Network
- Preconnect to the image/API origins used above the fold. Cache static assets with immutable headers (Next does for `/_next/static`). Compression is handled by the host or reverse proxy; document it.

## SEO
- Metadata API: `title` template, `description`, `canonical`, `alternates`, Open Graph, Twitter, `icons`, `manifest`, `robots`, `viewport` and `themeColor` (viewport export is separate from metadata in Next 15+).
- `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`.
- `<html lang="fa" dir="rtl">`. Add `alternates.languages` if more locales exist.
- JSON-LD (`Organization`, `WebSite`) as a script tag; escape `<` as `\u003c`.
- One `h1`, logical heading order, descriptive link text, `alt` text, semantic landmarks.
- Decide indexable vs `noindex` with the project owner (the reference site is behind login).
- Custom `not-found` with correct 404 status. Useful `error` pages.
- Use the skill `add-seo-metadata`.

## Accessibility
- Automated: `eslint-plugin-jsx-a11y` (via Next config), `@axe-core/playwright` in e2e on all three viewports.
- Manual: keyboard-only run of header, carousel, bottom nav, back-to-top; screen-reader labels; focus order in RTL.
- `prefers-reduced-motion`, `prefers-color-scheme` if the reference has a dark theme (check audit).
- Touch targets >= 44 px; safe areas; no horizontal scroll at 320 px.

## Reporting
At the end, store Lighthouse (mobile + desktop) and bundle numbers in `docs/PERFORMANCE.md` and summarize in README.
