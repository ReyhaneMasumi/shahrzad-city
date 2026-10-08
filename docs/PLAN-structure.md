# PLAN — Structure, Tooling and Decisions (Step B)

> Status: proposed — waiting for project owner approval.
> This file answers the Step B requirements of `PROMPT.md` and extends `docs/architecture/01`.
> All measured reference facts come from `docs/audit/STEP-A-FINDINGS.md` and `docs/audit/visual-findings.md`.

## 1. Folder structure

Feature-based, per `docs/architecture/01-project-structure.md`. Single page (`/`); the
homepage composes features and owns no data logic. Created only on demand (skill `create-feature`).

```
.
├─ src/
│  ├─ app/                        # Routing only (one page)
│  │  ├─ layout.tsx               # html lang=fa dir=rtl, fonts, providers, metadata
│  │  ├─ page.tsx                 # Home composition (Server Component)
│  │  ├─ loading.tsx              # route-level skeletons
│  │  ├─ error.tsx                # route-level error boundary
│  │  └─ not-found.tsx
│  ├─ features/
│  │  ├─ app-header/              # logo, nav, wallet chip, person/QR/bell icons, shrink-on-scroll
│  │  ├─ hero-banner/             # banners API, single banner or carousel, arrows + bullets
│  │  ├─ home-sections/           # sections grid and tiles (API-driven), "see all" per section
│  │  ├─ bottom-nav/              # mobile/tablet: quality pill + center QR button
│  │  ├─ back-to-top/             # mobile/tablet in-flow button
│  │  ├─ app-footer/              # desktop fixed footer, reveal-on-scroll
│  │  └─ home/                    # page composition only (no data logic of its own)
│  ├─ shared/
│  │  ├─ ui/                      # primitives: Container, SectionHead, Tile, Image, Skeleton, Icon...
│  │  ├─ api/                     # Axios client, error normalization, SWR fetcher/config
│  │  ├─ config/                  # typed env parsing (API base URL), constants, routes
│  │  ├─ hooks/                   # useIsMobile, useScrollContainer, useReducedMotion
│  │  ├─ lib/                     # pure utils, formatters
│  │  ├─ i18n/fa.ts               # ONLY place for Persian UI copy
│  │  └─ types/                   # shared types
│  ├─ providers/                  # AppRouter AntD registry, SWR, ConfigProvider (RTL + theme)
│  └─ styles/                     # tokens.css (@theme), base.css, typography.css, antd-bridge.css, components/
├─ tests/
│  ├─ e2e/                        # Playwright: mobile/tablet/desktop projects + page objects
│  ├─ fixtures/                   # API payloads copied from API.md (Persian allowed, real payloads)
│  ├─ mocks/                      # MSW handlers for /api/* endpoints
│  └─ setup/                      # Vitest setup (jsdom, RTL, MSW worker)
├─ public/                        # favicon, og image, android-chrome icons
├─ scripts/                       # check-no-persian.mjs, etc.
├─ .opencode/, docs/, visuals/
├─ Dockerfile, .dockerignore, docker-compose.yml, .env.example
├─ eslint.config.mjs, vitest.config.ts, playwright.config.ts,
├─ next.config.ts, proxy.ts (only if a rewrite/proxy is needed — see §5.4)
└─ AGENTS.md, README.md, API.md
```

Feature shape (example `hero-banner/`): `api/` (endpoint fn + SWR keys),
`hooks/` (SWR + effect hooks), `components/HeroBanner/{HeroBanner.tsx, useHeroBanner.ts,
HeroBanner.types.ts, HeroBanner.test.tsx}`, `lib/` (mapper), `types/` (DTOs),
`index.ts` (public API). One component per file, one default export per file.
Import rules: `@/` alias, features import only `shared` + peers through `index.ts`, no cycles.

## 2. Component pattern (confirmed)

- View file = pure render of a typed view-model; logic lives in a `useX` hook file (or a pure
  function/mapper). Matches `D-002` and step B of the brief.
- Server Components by default; `'use client'` only on the leaf that needs state/effects/browser APIs
  (SWR hooks, scroll/intersection behaviour). Data flows server→hydrated via SWR fallback data.
- No manual memoization or `forwardRef` by habit (React 19: `forwardRef` unnecessary; use `ref` as prop).

## 3. Styling strategy (confirmed)

Per `docs/architecture/04`: tokens in `src/styles/tokens.css` `@theme` (single source of truth,
seeded from `Design.md` + `css-variables.css` + audit colors). Semantic component classes in
`@layer components` via short `@apply`; `@utility` for repeated one-purpose helpers; variants through
`data-state`/`data-variant`/`aria-*`. At most 3 local layout utilities in page composition; no long
`className` strings; grid stays 4 columns per viewport (76 / 178 / 219 px cells from the audit).
RTL-first logical utilities only (`ms/me/ps/pe/start/end`, `rtl:-scale-x-100` for directional icons).
Mobile-first, `md:`/`lg:` upwards. Animations only on `transform`+`opacity`, respecting
`prefers-reduced-motion` (header -80px shrink 200ms, footer slide-in 200/100ms from the audit).
Typography loaded via `next/font/local` from `fonts.md` (IRANSans 400/500/700), fluid token scale,
one `h1` per page.

## 4. Testing tools

| Level | Tool | Tradeoffs (3 lines) |
| --- | --- | --- |
| Unit | **Vitest** | Vite-native, instant watch, TypeScript/ESM out of the box; a fraction of the fuss of Jest config. Needs jsdom/happy-dom environment and RTL set up per component test. Pairs with the mappers/swr keys as pure logic units. |
| Integration | **React Testing Library + MSW** | Asserts user-visible behavior (roles, accessible names), not implementation details. MSW intercepts the same `/api/*` paths used by the app, so feature tests run against the same payloads as e2e. Additional setup for the worker in jsdom; async flows need `waitFor` discipline. |
| End-to-end | **Playwright** | Real Chromium at 360×768×1440, exactly matching the audit viewports; network/console assertions and screenshots mirror the reference QA loop. Heaviest to run/CI; needs the dev server as webServer; scroll animations can flake only if unguarded (reduced-motion path used in tests). |

Vitest 5.0.3, Playwright 1.64.0 are the verified latest; MSW is pinned in Step C scaffold.

## 5. Decisions to confirm

Verified latest on the configured mirror: Next 16.4.0, React 19.3.0, AntD 6.6.5,
Tailwind 4.3.3, Zustand 5.0.15, SWR 2.5.1, Axios 1.20.0, TS listed 7.0.2 (verify at scaffold —
prefer the TypeScript version `create-next-app` pins for Next 16). Local toolchain: Node v22.13.1, pnpm 8.15.1.

| # | Decision | Recommendation (default) | Alternative |
| --- | --- | --- | --- |
| 5.1 | Package manager / Node | **pnpm (upgrade to pnpm 10), Node 22 LTS** — matches local, strict and fast; Node 22 is current LTS | pnpm 8 already present; Node 24 LTS also viable |
| 5.2 | Icons | **`iconsax-react@0.0.8`** — the package behind the brief link `iconsax-react.pages.dev`; peer `react:*` → OK on React 19; ESM+CJS shipping fles | `iconsax-reactjs@0.0.8` (2025 republish, no prop-types); if a needed glyph is missing, map it to the closest Iconsax variant in a local `Icon` wrapper |
| 5.3 | Carousel | **Custom CSS scroll-snap carousel** — ~0 kb extra, native RTL scrolling, swipe/touch, full a11y control (arrows + bullets, focusable slides); matches the reference swiper feel | AntD `Carousel` (react-slick): feature-rich but adds significant bundle and needs RTL tuning; kept as fallback if fade/auto-play demanded later |
| 5.4 | Auth | **Public homepage, no login flow.** Mock endpoints are public and the audit shows `/home` renders for guests; wallet chip links to `/wallet` | Adding the OTP flow is out of scope for a homepage recreation and the mock has no auth endpoints |
| 5.5 | Runtime validation | **Opt out of `zod` by default** — keeps the stack to the brief's list; API types are hand-really mappable | `zod` at the API boundary only if mapper complexity proves it necessary; proposed but not installed by default |
| 5.6 | SEO | **Indexable** — full Metadata/OG/robots/sitemap/structured-data; this is a quality criterion of the brief. `robots` configurable via env | `noindex` if the deployment is a throwaway demo |
| 5.7 | Persian copy | **Only `src/shared/i18n/fa.ts` + test fixtures** (all API-driven copy is Persian data, allowed) | — (per `D-004`) |

### 5.8 API base and mock backend

The provided mock (MSW) serves `API.md` paths `/api/main-page/apps-nested?platform=pwa` and
`/api/banners?type=mainPage&platform=pwa`. The live site prefixes these `/base/api/v2|v3`.
Our app hits **one base URL from `NEXT_PUBLIC_API_BASE` (default `/api`)** and a single Axios client;
the endpoint functions carry the exact path+query from `API.md`. `proxy.ts` is only considered if the
deployment needs to forward `/api` to a remote backend — otherwise MSW handles it in-browser.

### 5.9 Content contract mapping (audit → rebuild)

- `main` (22 tiles) → desktop+mobile tile grid; `services` (10 groups) → section titles + tiles on the
  "همه خدمات" surface; `navBar` (2) → bottom-nav items (کیف پول/خدمات); `wallet` (1) → header wallet chip.
- Banner `data[]` length: 1 → static image; `>1` → scroll-snap carousel (arrows + bullets).
- `parent_tile` tiles render as a tile with a popover/flyout of `child` tiles (reference behavior).

## 6. Next step after approval

`Step C — Scaffold` (with the owner watching output): `pnpm dlx create-next-app@latest`, apply tokens/
styles/antd-bridge, add Axios+SWR+MSW fixture pipeline, Vitest+Playwright configs, first vertical slice
(`hero-banner`) and `pnpm verify`. Then `Step D — Homepage implementation` etc.