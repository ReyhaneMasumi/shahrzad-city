# Shahrzad Homepage

Production-ready recreation of the Shahrzad homepage (https://web.shahrzadcity.ir/home).

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Runtime**: React 19
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4 (CSS-first `@theme`)
- **UI Library**: Ant Design v6 (RTL, CSS-variable mode)
- **Client State**: Zustand v5
- **Server Data**: SWR 2.x
- **HTTP**: Axios 1.x
- **Icons**: Iconsax React
- **Font**: IRANSans (via `next/font`)
- **Testing**: Vitest + Testing Library + MSW (unit/integration), Playwright (e2e)
- **Package Manager**: pnpm

## Quick Start

### Local Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Run tests
pnpm test            # unit + integration (86 tests, Vitest + MSW)
pnpm test:unit       # unit project only
pnpm test:int        # integration project only
pnpm test:cov        # coverage run (thresholds enforced)
pnpm test:e2e        # e2e (desktop / mobile / tablet projects)

# Lint & typecheck
pnpm lint
pnpm typecheck

# Full gate: lint + typecheck + tests + build
pnpm verify

# Production build
pnpm build
pnpm start
```

### Docker

```bash
# Build image
docker build -t shahrzad-home .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=/api \
  -e NEXT_PUBLIC_SITE_URL=https://your-domain.com \
  shahrzad-home

# Or with docker-compose
docker-compose up --build
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | No | `/api` | Base URL for API calls (relative for in-process MSW) |
| `NEXT_PUBLIC_SITE_URL` | No | `https://web.shahrzadcity.ir` | Canonical site URL for SEO (sitemap, OG, manifest) |

Copy `.env.example` to `.env.local` for local overrides.

## Project Structure

```
src/
├── app/                    # Next.js App Router (routing only)
│   ├── api/health/         # Health check endpoint
│   ├── fonts.ts            # IRANSans via next/font/local
│   ├── layout.tsx          # Root layout + metadata
│   ├── page.tsx            # Home page (HeroBanner + HomeSections)
│   ├── robots.ts           # robots.txt
│   ├── sitemap.ts          # sitemap.xml
│   └── manifest.ts         # PWA manifest
├── features/               # Feature-based modules
│   ├── app-header/         # Desktop + mobile header
│   ├── app-footer/         # Desktop footer (scroll reveal)
│   ├── app-shell/          # Responsive shell + scroll orchestration
│   ├── back-to-top/        # Mobile back-to-top button
│   ├── bottom-nav/         # Mobile bottom navigation
│   ├── hero-banner/        # Static banner + carousel (SWR)
│   └── home-sections/      # Services grid with tiles (SWR)
├── providers/              # React context providers
│   ├── antd.tsx            # AntD ConfigProvider (RTL, theme, locale)
│   ├── antd-registry.tsx   # AntD style registry
│   └── swr.tsx             # SWR config
├── shared/
│   ├── api/                # Axios client, fetcher, error types
│   ├── config/env.ts       # Validated env vars (Zod)
│   ├── design/palette.ts   # Design tokens (single source of truth)
│   ├── hooks/              # Shared hooks (useMediaQuery, useReducedMotion)
│   ├── i18n/fa.ts          # Persian copy (only place for UI strings)
│   └── ui/                 # Design system primitives
│       ├── Button/         # AntD Button wrapper
│       ├── Carousel/       # Scroll-snap carousel + hook
│       ├── Empty/          # AntD Empty wrapper
│       ├── ErrorState/     # AntD Result wrapper
│       ├── Icon/           # Iconsax wrapper
│       ├── Image/          # Next.js Image wrapper
│       ├── SectionHead/    # Heading + divider + see-all
│       ├── SectionStates/  # Loading/empty/error/success wrapper
│       ├── Skeleton/       # AntD Skeleton wrapper
│       ├── Spinner/        # AntD Spin wrapper
│       └── Tile/           # Home service tile
├── mocks/                  # MSW handlers + data
│   ├── handlers.ts
│   ├── server.ts
│   ├── browser.ts
│   └── data/
└── styles/
    ├── index.css           # Tailwind import + CSS layers
    ├── tokens.css          # CSS custom properties (mirrors palette.ts)
    ├── base.css            # HTML resets + antd bridge
    ├── typography.css      # Fluid type scale
    └── components/         # Semantic component classes (@apply)
```

## Key Architectural Decisions

### SSR-First, Client Only Where Needed
- Server Components by default
- `'use client'` only on leaves that need state/effects (header, hero, sections, shell)
- No unnecessary client boundaries

### Data Flow
```
API types → endpoint function → SWR key → SWR hook → mapper → view-model → UI
```
Components never call Axios or `fetch` directly. Server data lives in SWR; Zustand holds only UI state.

### RTL & Persian
- `dir="rtl"`, `lang="fa"` on `<html>`
- Logical Tailwind utilities only (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`)
- All Persian UI copy centralized in `src/shared/i18n/fa.ts`
- Font: IRANSans via `next/font` (SSR-safe, no layout shift)

### Design System
- Tokens defined once in `src/shared/design/palette.ts`
- Mirrored to CSS custom properties in `src/styles/tokens.css`
- Consumed by AntD `ConfigProvider` (`cssVar: { key: 'app' }`) and Tailwind `@theme`
- Guarded by `palette.test.ts`

### Mock Backend (MSW)
- Runs in-process in **both dev and production** (no separate service)
- `instrumentation.ts` (Node) + `instrumentation-client.ts` (browser worker)
- Endpoints:
  - `GET /api/main-page/apps-nested?platform=pwa` → services/main/wallet/navBar
  - `GET /api/banners?type=mainPage&platform=pwa` → hero banners
- No failures on reads (~200ms latency), ~20% failure on writes (not used here)

## Features Implemented

| Feature | Status | Notes |
|---------|--------|-------|
| Header (desktop + mobile) | ✅ | Scroll shrink on mobile, responsive nav |
| Hero Banner (static + carousel) | ✅ | Priority image, preload, scroll-snap carousel |
| Services Grid (tiles) | ✅ | 4-col grid, skeleton loading, empty/error states |
| Footer (desktop) | ✅ | Fixed, scroll-reveal animation |
| Bottom Navigation (mobile) | ✅ | Wallet / QR / Services |
| Back-to-Top (mobile) | ✅ | In-flow button above footer spacer |
| SEO (metadata, OG, sitemap, robots, manifest, JSON-LD) | ✅ | WebSite structured data |
| Global error boundaries | ✅ | `error.tsx`, `global-error.tsx` |
| Accessibility | ✅ | Landmarks, focus-visible, ARIA labels, RTL icons |
| Unit + Integration tests | ✅ | 86 tests, coverage gates enforced |
| E2E tests | ✅ | Playwright (desktop / mobile / tablet) |
| PWA (metadata, SW, favicons) | ✅ | Manifest, Serwist service worker, generated icon set |

## Visual Fidelity

Implementation matches reference screenshots at:
- Mobile: 360px (header shrink, bottom nav, back-to-top)
- Tablet: 768px (mobile shell)
- Desktop: 1440px (static header, footer reveal, 4-col grid)

Animations respect `prefers-reduced-motion`.

## Performance

- Static prerendering for home page
- Hero banner: `priority` + `fetchpriority="high"` + `<link rel="preload">`
- Next.js Image optimization with `remotePatterns` for `static.shahrzadcity.ir`
- AntD CSS-in-JS with CSS variable mode (no style tag injection in prod)
- Turbopack for fast dev builds

## Docker

Multi-stage `Dockerfile`:
1. `base` - Node 22 + pnpm
2. `builder` - Install deps, `pnpm build` (output: `standalone`)
3. `runner` - Non-root user, copy standalone output, healthcheck

No secrets in image. Config via runtime env vars.

## Testing

```bash
pnpm test:unit       # unit project only
pnpm test:int        # integration project only
pnpm test:cov        # coverage run with enforced thresholds
pnpm test:e2e        # Playwright (desktop / mobile / tablet projects)
pnpm verify          # full gate: lint + typecheck + tests + build
```

Coverage thresholds (enforced in `vitest.config.ts`): global `60/60/60/50`; logic and data
folders (`src/**/lib/**`, `src/shared/api/**`, `src/shared/design/**`) `85/85/85/75`.

## AI Tools Used

This project was built with assistance from:
- **OpenCode** (coding agent) - implementation, debugging, test generation
- **Next.js bundled docs** (version-matched) - API reference
- **Ant Design MCP** - component API verification
- **Context7** - library documentation lookup

The AI was used for code generation, test writing, bug fixes, and architectural guidance. All code was reviewed and approved by the human author.

**Process:** every task followed the session protocol in `AGENTS.md` — plan before code,
doc-check before using a library API, one Conventional Commit per task, and `pnpm verify`
as the definition of done. The reference site was investigated programmatically (browser
automation in `docs/audit/scripts/`) and its behavior was written down
(`docs/audit/`, `docs/API.md`) before implementation. Architectural decisions are logged in
`docs/DECISIONS.md`.

## Brief Compliance

- [x] Next.js 16 + React + TypeScript strict + Tailwind + Ant Design + Zustand + SWR + Axios
- [x] Iconsax icons only
- [x] Font investigated and justified (`docs/fonts.md`)
- [x] Header, navigation, tiles, banners, footer
- [x] Responsive: mobile, tablet, desktop
- [x] States: hover, focus, active, loading, empty, error
- [x] Motion: header/footer scroll animation, carousel, reduced-motion support
- [x] Provided mock backend used (`docs/API.md`, MSW in-process)
- [x] Undocumented behavior investigated and written down (`docs/audit/`, `docs/DECISIONS.md`)
- [x] Performance budget met (see `docs/architecture/07-performance-seo-a11y.md`)
- [x] SEO: metadata, OG, robots, sitemap, structured data
- [x] Type safety: no `any`
- [x] Tests: unit, integration, end-to-end
- [x] Dockerfile, no secrets in image, `.env.example`
- [x] README: run locally, run in Docker, env vars, decisions, limitations, AI tools and process, improvements

## Improvements Over Reference Site

1. **TypeScript strict** - No `any`, full type safety
2. **SSR-first** - Better SEO, faster initial paint
3. **Accessibility** - Proper landmarks, focus management, ARIA labels
4. **Design tokens** - Single source of truth, no magic values
5. **Testing** - Three-level test pyramid (unit/integration/e2e)
6. **Docker** - Production-ready multi-stage image
7. **Performance** - Static prerendering, hero preload, optimized images
8. **Maintainability** - Feature-based structure, SOLID principles, small files

## Known Limitations

- Header nav links (`/faq`, `/about-shahrzad`, `/wallet`, `/qr-payment`, `/shahrzad-services`) return 404 (only `/` and `/_not-found` implemented)
- Parent tile (`parent_tile` type) flyout behavior not fully specified in reference
- Responsive aspect-ratio swap for hero banner deferred (uses mobile aspect on all breakpoints)

## License

Private - Shahrzad project.