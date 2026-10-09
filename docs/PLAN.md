# PLAN — Shahrzad Homepage Rebuild (Step C)

> Status: proposed — awaiting project owner approval.
> Structure and tooling decisions are ratified in `docs/PLAN-structure.md` (Step B).
> Reference facts come from `docs/audit/STEP-A-FINDINGS.md` and `docs/audit/visual-findings.md`.

## 1. Findings summary

1. The live app is an authenticated SPA; the homepage renders for guests too, so our rebuild is public.
2. Desktop shell: 136px header with SVG backdrop; content in one inner scroll container; footer is fixed at
   the bottom, hidden, and slides up on scroll; no bottom nav; an in-flow back-to-top only on mobile/tablet.
3. Mobile/tablet shell: `h-screen flex-col`, 200px blue (`#307FE2`) rounded header that shrinks to 120px
   (`translate-y-[-80px]`, 200ms); 4-column icon-tile grid (76/178/219px cells); bottom nav with a pill and
   a center QR button (70px circle, `#EAF2FC`); section head = title + divider + "مشاهده همه".
4. Data: `GET /api/main-page/apps-nested?platform=pwa` returns `{ navBar[2], services[10], main[22], wallet[1] }`;
   `GET /api/banners?type=mainPage&platform=pwa` returns 1 banner now; >1 banners become a carousel (grid with
   arrows + bullets, no autoplay observed with a single item).
5. Reference loads IRANSans FaNum 400/500/700 (three TTFs) — we self-host them with `next/font/local`.
6. Reference defects we must NOT copy (audit): `lang="en"`, no `dir`, `user-scalable=no`, zero headings, 10px
   mobile tile labels, low-contrast `#307FE2` links on white (use `#1C66C1`), missing focus indicators.
7. Live API base on the reference is `/base/api/v2|v3`, older than `API.md`'s `/api`; our app uses one
   `NEXT_PUBLIC_API_BASE_URL` (default `/api`, served by MSW or the provided mock backend).
8. A11y backlog items M1–M4 (labels ≥12px, contrast, semantics, focus) are folded into the phases below.

## 2. Final decisions

| # | Decision | Choice | Reason |
| --- | --- | --- | --- |
| 1 | Package manager / Node | pnpm 10, Node 22 LTS (local v22.13.1) | fast, strict, matches local toolchain |
| 2 | Icons | `iconsax-react@0.0.8` via a single `Icon` primitive | the package behind the brief link; peer `react:*` |
| 3 | Carousel | custom CSS scroll-snap | 0kb, native RTL, full a11y, matches reference swiper |
| 4 | Auth | public homepage, no login flow | mock endpoints are public; audit shows guest rendering |
| 5 | Runtime validation | no `zod` by default | keep to the brief's stack; strict types cover the contract |
| 6 | SEO | indexable | SEO is a quality criterion of the brief |
| 7 | Persian copy | only `src/shared/i18n/fa.ts` + fixtures | D-004 |
| 8 | Rendering | Cache Components + Partial Prerendering, SWR hydration | fastest shell, no client waterfalls (see phases 2, 5) |
| 9 | Version pins | Next 16.4, React 19.3, AntD 6.6, Tailwind 4.3, Vitest 5.0, Playwright 1.64 | verified on registry; TS pin follows the `create-next-app` scaffold |

## 3. Phases (execution order)

Legend — **goal / tasks / files / skills / verify / commit / risks.**

### P1 — Repository bootstrap
- **Goal:** toolchain and quality gates before any code.
- **Tasks:** keep existing history; add `.gitignore`, `.nvmrc` (22), EditorConfig, Prettier,
  upgrade pnpm to 10 (corepack), ESLint flat config (`eslint.config.mjs`) per architecture §09,
  strict `tsconfig`, Husky + lint-staged, scripts (`lint`, `typecheck`, `test`, `build`, `verify`).
- **Files:** `.gitignore`, `.nvmrc`, `.editorconfig`, `prettier.config.mjs`, `eslint.config.mjs`,
  `package.json`, `tsconfig.json`, `husky/`, `docs/DECISIONS.md`.
- **Skills:** `airbnb-react-conventions` (review conventions early).
- **Verify:** `pnpm lint && pnpm typecheck`.
- **Commit:** `chore: bootstrap lint, formatting and type tooling`
- **Risks:** ESLint plugin versions lag Next 16 (`eslint-config-next`); resolve before moving on.

### P2 — Next.js 16 app + RTL shell
- **Goal:** runnable empty App Router app, RTL root, fonts, Cache Components policy.
- **Tasks:** `pnpm dlx create-next-app@latest .` (Turbopack, Tailwind v4, TS); set `lang="fa" dir="rtl"`;
  fiber AntD App Router registry + `ConfigProvider` (RTL + Persian locale) and SWR provider;
  self-host IRANSans 400/500/700 via `next/font/local` in `@theme`; `next.config.ts` with `cacheComponents`,
  `reactCompiler`, `output: standalone`, `images.remotePatterns` (hosts from `images.md`);
  `loading.tsx`, `error.tsx`, `not-found.tsx`, `global-error.tsx`; confirm Cache Components + Partial
  Prefetching defaults against installed docs.
- **Files:** `src/app/layout.tsx`, `src/providers/*`, `src/shared/i18n/fa.ts` (seed), `public/fonts/*`,
  `next.config.ts`, `src/app/{loading,error,not-found,global-error}.tsx`.
- **Skills:** `lookup-latest-docs`, `next-cache-components-adoption`, `next-dev-loop`.
- **Verify:** `pnpm dev` (no console errors), `pnpm build` prints a partially prerendered `/`.
- **Commit:** `feat: scaffold next 16 app with rtl root, fonts and providers`
- **Risks:** Cache Components semantics vs training data — docs win; font license for IRANSans TTFs.

### P3 — Design system
- **Goal:** tokens + layers + AntD theme that match the audit exactly.
- **Tasks:** `src/styles/tokens.css` `@theme` from `Design.md`/`css-variables.css` + audit colors;
  `base.css`, `typography.css` (fluid scale), `antd-bridge.css` layer order
  (`theme, base, antd, components, utilities`); Map tokens → AntD `theme.token`; breakpoints
  verified against reference; reduced-motion tokens.
- **Files:** `src/styles/*.css`, `src/styles/components/*.css` (empty placeholders).
- **Skills:** `style-with-tailwind`, `lookup-latest-docs` (AntD v6 tokens).
- **Verify:** `pnpm lint && pnpm typecheck` + dev visual check at 360/768/1440.
- **Commit:** `feat(styles): design tokens, typography scale and antd theming`
- **Risks:** AntD v6 CSS-in-JS vs Tailwind layer specificity; dark/light token drift.

### P4 — Primitives then composites
- **Goal:** reusable building blocks in `src/shared/ui`, then composite widgets.
- **Tasks:** `Container`, `SectionHead` (title/divider/see-all), `Tile`, `Image` (next/image wrapper),
  `Icon` (Iconsax wrapper: size/variant/currentColor, `aria-hidden` or label), `Skeleton` (final-dimension),
  `Button`, `Spinner`, `Empty`, `ErrorState` + `Section states` composables. Composites: `Carousel`
  (scroll-snap, arrows + bullets, RTL), `NavItem`, `Drawer`/dropdown primitives if header needs them.
  Every state keyed by `data-state`.
- **Files:** `src/shared/ui/**`, `src/shared/hooks/{useMediaQuery,useReducedMotion,...}.ts`.
- **Skills:** `create-ui-component`, `style-with-tailwind`.
- **Verify:** `pnpm lint && pnpm typecheck && pnpm test` (a11y of `Carousel` + `SectionHead`).
- **Commit:** `feat(ui): shared primitives and carousel composite`
- **Risks:** over-engineering primitives; keep ≤150 lines per file, split early.

### P5 — API layer + SWR keys
- **Goal:** one request pipeline and testable backend boundary.
- **Tasks:** `src/shared/api` Axios factory (browser + server instances, `AbortController` signals,
  timeout 10s, response interceptor → `ApiError`, GET retry backoff); typed env parsing in
  `src/shared/config/env.ts`; DTO + domain types from `API.md`; endpoint functions + SWR key factories
  for `main-page/apps-nested` and `banners`; mappers DTO → domain; SWR hooks returning typed view-models;
  global `SWRConfig` (deduping, bounded retry, focus policy); MSW handlers served from structured fixtures;
  server fetch + `SWRConfig.fallback` hydration pattern (architecture §05).
- **Files:** `src/shared/api/**`, `src/shared/config/env.ts`, `src/features/{hero-banner,home-sections}/api|types|lib|hooks`,
  `tests/fixtures/*.json`, `tests/mocks/*`.
- **Skills:** `add-api-endpoint`, `add-swr-hook`, `add-zustand-store` (only if a store is justified).
- **Verify:** `pnpm test` (mapper unit), MSW integration smoke.
- **Commit:** `feat(api): axios client, swr keys and msw handlers`
- **Risks:** MSW worker under Turbopack/standalone; Next fetch caching interfering — keep Axios path exclusive.

### P6 — Header, footer, bottom nav, back-to-top
- **Goal:** the responsive shell with the measured animations.
- **Tasks:** `app-header` (logo/nav/wallet chip + person/QR/bell; desktop 136px; mobile 200px header,
  `-80px` shrink on scroll via IntersectionObserver sentinel, transform/opacity only);
  `app-footer` (desktop fixed, hidden → slide-up reveal); `bottom-nav` (pill + center QR 70px, safe-area);
  `back-to-top` (Ant-Button style, scrolls the inner container); RTL icon mirroring; reduced-motion.
- **Files:** `src/features/{app-header,app-footer,bottom-nav,back-to-top}/**`.
- **Skills:** `create-ui-component`, `next-dev-loop`.
- **Verify:** manual 360/768/1440 + `pnpm test`; focus order keyboard pass.
- **Commit:** `feat(shell): header, footer, bottom-nav and back-to-top with scroll motion`
- **Risks:** matching the desktop inner-scroll-container + fixed footer offsets (audit numbers used as fixtures).

### P7 — Hero banner
- **Goal:** single static banner **or** carousel, LCP-priority image.
- **Tasks:** `hero-banner` feature; render static image with `priority` when `data.length===1`; scroll-snap
  carousel (arrows + bullets, lazy slides after the first) when >1; `alt` from banner name; loading skeleton
  sized to the measured hero box; error state + retry; empty state.
- **Files:** `src/features/hero-banner/**`.
- **Skills:** `add-api-endpoint` (banners), `create-ui-component`, `add-seo-metadata` (image OG later).
- **Verify:** `pnpm verify` + dev check of both branches via fixture count.
- **Commit:** `feat(hero-banner): static banner and scroll-snap carousel`
- **Risks:** LCP image must come from `next/image` optimizer with correct `sizes`; carousel a11y (focusable slides).

### P8 — Home sections and tiles
- **Goal:** API-driven tile grid + section heads, exactly 4 columns per viewport.
- **Tasks:** `home-sections` feature; render `main` tiles (and `services` groups on the full list surface);
  `parent_tile` children as flyout/popover; 4-column grid (76/178/219), 64px icon circle `#F7F7F7`,
  labels ≥12px (improvement over the 10px reference); "see all" header row per section; every state
  skeleton (same dimensions, no CLS), empty, error+retry; links target the tile `url`
  (external in `_blank` where cross-origin).
- **Files:** `src/features/home-sections/**`, `src/features/home/page.tsx` composition.
- **Skills:** `create-ui-component`, `style-with-tailwind`.
- **Verify:** `pnpm verify` + e2e tile count assertions at 3 viewports.
- **Commit:** `feat(home-sections): api-driven tile grid with states`
- **Risks:** `parent_tile` UX not fully observable in the reference → documented behavior decision.

### P9 — States everywhere (loading/empty/error)
- **Goal:** no data section without its three states; skins match final geometry (no CLS).
- **Tasks:** shared `SectionStates` composable; audit every feature for `loading|empty|error` + retry wiring;
  global `error.tsx` + `global-error.tsx`; add integration tests for each state.
- **Files:** `src/shared/ui/States*`, touched feature files, `tests/`.
- **Skills:** `write-integration-test`.
- **Verify:** `pnpm test`.
- **Commit:** `feat(ui): loading, empty and error states for all data sections`
- **Risks:** skeleton size drift vs measured geometry.

### P10 — SEO
- **Goal:** indexable, structured, shareable homepage.
- **Tasks:** Metadata API (title template, fa description, canonical, alternates, OG/Twitter, icons,
  `themeColor`); `robots.ts`, `sitemap.ts`, `manifest.ts`; geo/telephone-safe Organization + WebSite
  JSON-LD; one logical `h1`, landmarks (header/nav/main/footer), descriptive link text; confirm
  indexable vs noindex with owner (decision #6).
- **Files:** `src/app/{robots,sitemap,manifest}.ts`, `src/app/layout.tsx`, `public/` favicons/og.
- **Skills:** `add-seo-metadata`.
- **Verify:** build + `npx next info`/route inspection; Lighthouse SEO = 100.
- **Commit:** `feat(seo): metadata, robots, sitemap, manifest and structured data`
- **Risks:** canonical URL needs `NEXT_PUBLIC_SITE_URL`.

### P11 — Tests (unit, integration, e2e)
- **Goal:** three levels green and meaningful.
- **Tasks:** unit (mappers, hook view-models, formatters); integration (each feature with MSW: success,
  empty, error, retry); e2e (Playwright mobile/tablet/desktop projects, RTL assertions, routing on tile
  links, scroll animations end-state, `@axe-core/playwright` scan, console-error watchdog);
  page objects + fixtures alignment.
- **Files:** `tests/e2e/**`, `tests/setup/**`, co-located `*.test.ts(x)`.
- **Skills:** `write-unit-test`, `write-integration-test`, `write-e2e-test`.
- **Verify:** `pnpm test && pnpm test:e2e` (webServer from the standalone build).
- **Commit:** `test: cover unit, integration and e2e across features`
- **Risks:** animation flakiness — run e2e with reduced-motion; MSW vs e2e mismatch (alias `NEXT_PUBLIC_API_BASE_URL`).

### P12 — Performance pass
- **Goal:** meet the architecture §07 budgets.
- **Tasks:** Lighthouse mobile+desktop (LCP ≤2.5s, CLS ≤0.05, TBT ≤200ms, ≥90/100/100/100); bundle
  analysis (small first-load JS, no full antd/iconsax import); hero LCP preload math; `content-visibility`
  for below-fold sections; preconnect to image host; record numbers in `docs/PERFORMANCE.md`.
- **Files:** `docs/PERFORMANCE.md`, minor `next.config.ts`/component tweaks.
- **Skills:** `browser-automation` + `chrome-devtools` MCP (traces), `next-devtools`.
- **Verify:** Lighthouse CI numbers as above.
- **Commit:** `perf: meet lighthouse and bundle budgets`
- **Risks:** third-party remote images (optimizer load); if a budget is missed, document why.

### P13 — Docker
- **Goal:** reproducible image, no secrets, compose with the mock backend.
- **Tasks:** multi-stage `Dockerfile` (base deps builder runner, non-root, `output: standalone`, healthcheck);
  `.dockerignore`; `.env.example`; `docker-compose.yml` with `web` + `mock-api` sharing a network,
  health dependency, env passed at runtime (no image secrets); document mock backend start (open question §4).
- **Files:** `Dockerfile`, `.dockerignore`, `docker-compose.yml`, `.env.example`.
- **Skills:** `docker-verify`.
- **Verify:** `docker build` clean; `docker-verify`; compose up + homepage responds.
- **Commit:** `build(docker): standalone image and compose with mock api`
- **Risks:** offline npm mirror in the image build (use `--offline`-sensitive lockfile), `NEXT_PUBLIC_*`
  build-time inlining.

### P14 — README + decision log + AI usage
- **Goal:** submission-grade documentation.
- **Tasks:** rewrite `README.md` (overview, screenshots, features, improvements over the reference,
  stack/rationale, folder map, data-flow diagram, run local + Docker, env table, scripts, testing,
  performance numbers, decisions, limitations, **AI tools and full process**, credits);
  finalize `docs/DECISIONS.md`; compliance checklist checkboxes ticked.
- **Files:** `README.md`, `docs/DECISIONS.md`, `docs/PLAN.md` checklists.
- **Skills:** `commit-changes`.
- **Verify:** `pnpm verify` green; README checklist fully ticked.
- **Commit:** `docs: finalize readme, decisions and compliance checklist`
- **Risks:** AI-usage section must be complete and honest.

## 4. Risks and open questions

- **Mock backend location (open):** the provided mock backend is not in this repository. Default plan:
  in-browser MSW with fixtures from `API.md` plus a slim standalone mock server service in compose, base
  URL from env. **Ask the owner: where/how is the official mock backend started?**
- **Cache Components / Partial Prefetching in Next 16.4:** behavior verified during P2 against installed docs; tests may relax if defaults differ.
- **TypeScript 7.0.2 on the registry:** TS pin follows the `create-next-app` scaffold; upgrade consciously later.
- **Iconsax availability:** icon set is v0.0.8, unmaintained; missing glyphs get the closest Iconsax variant in the `Icon` primitive.
- **RTL carousel scroll origin:** verified by e2e at all viewports.
- **Persian vs Latin digits:** single formatter decision recorded in DECISIONS.
- **`parent_tile` flyout behavior:** observable only partially; site decision documented in DECISIONS.
- **Images:** tile banners come from `static.shahrzadcity.ir`; remotePatterns pinned; offline builds use local fixtures.

## 5. Brief compliance matrix

| Requirement (original-brief) | Satisfied by |
| --- | --- |
| Next.js 16 + React + TS strict + Tailwind + AntD + Zustand + SWR + Axios | P1, P2, P3, P5 |
| Iconsax icons only | P2 (Icon primitive), P4 |
| Font investigated and justified | Step A + P2 |
| Header, navigation, tiles, banners, footer | P6, P7, P8 |
| Responsive mobile / tablet / desktop | P6–P8, P12 |
| States: hover, focus, active, loading, empty, error | P4, P9 |
| Motion: header/footer scroll, carousel, reduced-motion | P6, P7 |
| Provided mock backend used | P5, P13 |
| Undocumented behavior investigated and written down | Step A, P8 (parent_tile), DECISIONS |
| Performance budget met | P12 |
| SEO: metadata, OG, robots, sitemap, structured data | P10 |
| Type safety: no `any` | P1, P4, P5 + lint gates |
| Tests: unit, integration, end-to-end | P11 |
| Dockerfile, no secrets in image, `.env.example` | P13 |
| README: run, env, decisions, limitations, AI tools, improvements | P14 |