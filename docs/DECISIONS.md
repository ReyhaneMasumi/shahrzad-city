# Decision Log

Record every non-obvious choice. Keep entries short. The author must be able to explain each one.

Format:

## D-000 Title
- Date: YYYY-MM-DD
- Status: proposed | accepted | superseded by D-xxx
- Context: why a decision was needed (2-3 lines)
- Options: A, B, C with one-line tradeoffs
- Decision: chosen option and the main reason
- Consequences: what becomes easier, harder, or is a known limitation

---

## D-001 Package manager
- Status: accepted 2026-10-08 (→ D-011)
- Decision: pnpm (fast, strict, Docker-friendly).

## D-002 Component logic/UI split
- Status: accepted 2026-10-08
- Decision: each component is a pure view file plus a `useX` hook file that owns state, effects and derived values.

## D-003 Tailwind class strategy
- Status: accepted 2026-10-08
- Decision: semantic classes in `@layer components` using `@apply`; tokens in `@theme`; `data-*` attributes for variants.

## D-004 Persian copy location
- Status: accepted 2026-10-08
- Decision: static UI copy only in `src/shared/i18n/fa.ts`; all other files English.

## D-010 Reference-site audit (Step A) completed
- Date: 2026-10-08
- Status: accepted
- Context: PROMPT.md Step A requires an investigation of the reference site before planning.
- Decision: performed an authenticated DOM/computed-style audit at 360/768/1440 px. Recorded
  structure, geometry, typography, colors, fonts, network calls and scroll behavior in
  `docs/audit/STEP-A-FINDINGS.md` and `docs/audit/visual-findings.md`; kept the existing a11y
  backlog in `docs/audit/SHAHRZAD-UI-AUDIT.md`. Screenshots renamed to `<section>--<viewport>--<state>.png`.
- Consequences: rebuild can be driven by measured numbers; six open pixel-level questions are
  listed in STEP-A-FINDINGS §10 for a vision model.

## D-011 Package manager and Node version
- Date: 2026-10-08
- Status: accepted
- Context: Step B requires a package manager and Node LTS decision.
- Options: pnpm 10 + Node 22 (recommended, matches local v22.13.1); pnpm 8 already installed; Node 24 LTS.
- Decision: pnpm 10 (via corepack) on Node 22 LTS.
- Consequences: fast strict installs; `--frozen-lockfile` in CI/Docker.

## D-012 Icon package
- Date: 2026-10-08
- Status: accepted
- Context: the brief links `iconsax-react.pages.dev`; two npm packages exist: `iconsax-react` (last modified 2022) and `iconsax-reactjs` (republished 2025-04-13). Both are v0.0.8 with peer `react:*`.
- Options: `iconsax-react@0.0.8` (the package behind the brief link); `iconsax-reactjs@0.0.8`.
- Decision: `iconsax-react@0.0.8`, consumed only through a single `Icon` primitive.
- Consequences: if a glyph is missing, map to the closest Iconsax variant inside the primitive.

## D-013 Carousel
- Date: 2026-10-08
- Status: accepted
- Context: several banners must become a carousel; Ant Design `Carousel` (react-slick) vs custom CSS scroll-snap.
- Options: custom CSS scroll-snap (0kb, native RTL, full a11y, matches reference swiper); AntD Carousel (feature-rich, adds bundle, needs RTL tuning).
- Decision: custom scroll-snap carousel for the hero.
- Consequences: single-banner path ships no carousel JavaScript at all.

## D-014 Authentication scope
- Date: 2026-10-08
- Status: accepted
- Context: whether the rebuilt homepage includes login.
- Options: public homepage, no login flow (mock endpoints are public; reference renders for guests); add OTP flow (out of scope, mock has no auth endpoints).
- Decision: public homepage; wallet module links to `/wallet`.
- Consequences: no tokens in the app; simpler Docker and SWR story.

## D-015 Runtime response validation
- Date: 2026-10-08
- Status: accepted
- Context: whether to validate API responses at runtime (zod) or rely on strict TS types.
- Options: no zod (lean stack per brief, strict types cover the contract); zod at the API boundary.
- Decision: no zod by default; revisit only if mapper complexity demands it.
- Consequences: risk of silent drift if the mock backend changes — mitigated by MSW fixtures tied to `API.md`.

## D-016 SEO indexability
- Date: 2026-10-08
- Status: accepted
- Context: the reference is behind login; the rebuild is public. Index or noindex?
- Options: indexable (SEO is a quality criterion); noindex for a throwaway demo.
- Decision: indexable with full metadata/OG/robots/sitemap/structured data; canonical from `NEXT_PUBLIC_SITE_URL`.
- Consequences: `robots.ts`/`sitemap.ts` required in P10.

## D-017 Mock backend contract
- Date: 2026-10-08
- Status: proposed (owner to confirm location)
- Context: `API.md` documents `/api/main-page/apps-nested` and `/api/banners` served by the provided mock backend; the mock is not in this repository.
- Options: in-browser MSW from `API.md` fixtures + slim standalone mock service in compose (default); official mock backend started by the owner.
- Decision: default to MSW + standalone mock service; base URL from `NEXT_PUBLIC_API_BASE_URL` (default `/api`).
- Consequences: swapping the real mock is a one-line env change; documented in README.

## D-018 Mock backend runs in-process via MSW, dev and production
- Date: 2026-10-08
- Status: accepted
- Context: the owner chose MSW as the mock backend and requires it to be active at application runtime in
  both development and production builds.
- Options: separate mock-api container in compose (extra moving part, breaks SSR); MSW only in dev builds
  (production would have no data).
- Decision: MSW serves the mock in-process always — browser `setupWorker` on the client plus `msw/node`
  started from `instrumentation.ts` on the server (SSR, build-time prerender, standalone production).
- Consequences: single self-contained image; `API.md` paths work unchanged; verify `instrumentation.ts`
  runs during `next build` prerender before relying on it (see PLAN P5 risk).

## D-019 P1 tooling choices
- Date: 2026-10-09
- Status: accepted
- Context: bootstrap lint, formatting, type-checking and git tooling for the scaffolded app.
- Options: ESLint 9 flat config (Next 16 style) vs legacy `.eslintrc`; ESLint 10 (latest on the package
  mirror) vs 9.39.5 pinned by create-next-app; `@vitest/eslint-plugin` vs deprecated `eslint-plugin-vitest`.
- Decision: ship the create-next-app pins (ESLint 9, TS 5.9) and build a flat config on top of
  `eslint-config-next` — type-aware `typescript-eslint` rules (no-explicit-any, no-non-null-assertion,
  no-floating-promises, switch-exhaustiveness-check, no-unnecessary-condition), `react/no-multi-comp`,
  `import/no-cycle`, banned legacy Next imports, `@vitest/eslint-plugin` + `eslint-plugin-testing-library`
  + `eslint-plugin-playwright` for test files, `eslint-config-prettier` last, and a `scripts/check-no-persian.mjs`
  gate wired into `pnpm lint`.
- Consequences: `pnpm verify` = lint + typecheck + vitest + build; Husky pre-commit runs lint-staged
  (eslint --fix + prettier); prettier formatting is scoped to code + `src|scripts|tests` markdown so it never
  rewrites docs. Deprecated plugins (`eslint-plugin-vitest`, ESLint 10) are intentionally avoided.

## D-020 Cache Components deferred (antd v6 + prerender incompatibility)
- Date: 2026-10-09
- Status: accepted
- Context: the scaffold enabled `cacheComponents` and `partialPrefetching`. With Cache Components, Next 16 treats
  `Date.now()`/`Math.random()` in Client Components during prerender as build-breaking errors. Ant Design v6's
  CSS-in-JS runtime reads wall-clock time in render-phase hooks (`@ant-design/cssinjs-utils` `useUniqueMemo`,
  `@ant-design/cssinjs` `createCache`/`supportSelector`), so a statically prerendered `<html>` shell that mounts
  antd providers cannot pass the guard. A `patches/@ant-design__cssinjs` pnpm patch fixed one occurrence, but the
  read recurs across antd internals (`useUniqueMemo`, StockStyle `Spin`, `App` holders) and would keep breaking as
  components are added.
- Options: (a) keep Cache Components + ship a growing set of pnpm patches over antd; (b) wrap the whole provider
  tree in `<Suspense>`/`connection()`, making `/` stream at request time and losing static HTML; (c) disable Cache
  Components and keep classic static prerendering.
- Decision: **(c)**. `cacheComponents` and `partialPrefetching` are off; `reactCompiler`, `output: standalone`, RTL,
  SSR style extraction (own `AntdRegistry` with a deterministic cache id) and `next/image` remote patterns are kept.
- Consequences: `/` and `/_not-found` prerender as static HTML (verified: `○ (Static)`), which is what the
  homepage needs for SEO/first paint. The self-hosted font, antd RTL/locale and SWR providers remain. Cache
  Components and Partial Prefetching can be re-evaluated later with the `next-cache-components-adoption` /
  `next-partial-prefetching-adoption` skills once antd publishes prerender-safe internals.

## D-021 Responsive shell breakpoint and header structure branching
- Date: 2026-10-09
- Status: accepted
- Context: the reference defines two shells — a mobile/tablet shell and a desktop shell — but was only
  measured at 768 (mobile shell) and 1440 (desktop shell). The rebuild needs one breakpoint at which the
  shell switches, and a rule for how `AppHeader` chooses its (structurally different) desktop vs mobile markup.
- Options: (a) split at `md` 768 (tablet gets the desktop shell); (b) split at `lg` 1024 (tablet keeps the
  mobile shell); header markup via JS `useMediaQuery` vs CSS `hidden lg:flex` visibility toggling.
- Decision: desktop shell at Tailwind `lg` (≥64rem = 1024px); mobile + tablet (<1024, including 768) keep the
  mobile shell. 1024 is the midpoint between the two measured viewports. `AppHeader` branches its structure in
  JS with `useMediaQuery('(min-width: 64rem)')`; the server snapshot is `false`, so the mobile markup is the
  hydration render and desktop markup is applied by `useSyncExternalStore` after hydration (no mismatch).
- Consequences: the desktop nav links are absent from the mobile SSR/initial HTML and only appear on desktop
  (client-side re-render) — acceptable because this is an interactive shell, and it keeps a single header
  structure in the DOM instead of two duplicate trees. The tablet (768) shell stays mobile until/unless the
  reference is re-measured; changing the split is a single `lg`/`64rem` constant.

## D-022 Ant Design is the base of shared/ui primitives
- Date: 2026-10-09
- Status: accepted
- Context: the early `shared/ui` primitives were hand-rolled Tailwind, so the required Ant Design base was only
  configured (registry + `ConfigProvider`) but never exercised. Two definitions of the same brand values (CSS
  `@theme` vs `ConfigProvider` tokens) could drift silently.
- Decision: `Button`, `Empty`, `ErrorState` (`Result`), `Spinner` (`Spin`) and `Skeleton` (`Skeleton.Node`) now
  wrap Ant Design v6 primitives and keep their previous public props and a11y roles (`status`/`alert`). Tailwind
  stays for geometry/layout; antd owns component skins. Brand colors/radius/control heights are defined once in
  `src/shared/design/palette.ts`, consumed by `ConfigProvider`, and mirrored in `tokens.css` guarded by
  `palette.test.ts`.
- Consequences: sections built from `shared/ui` get antd look-and-feel and its keyboard/focus behavior. The
  custom `.btn` CSS is deleted. `Icon`/`Image`/`Container`/`Carousel` stay bespoke: icons are Iconsax-specific,
  images use `next/image`, and the carousel was already decided custom in D-013. Any remaining visual deltas vs
  the audited reference must be tuned via antd theme tokens, not bespoke CSS.

## D-023 Mock backend served as in-process Next API routes
- Date: 2026-10-10
- Status: accepted
- Context: PLAN D-018 said the mock should run in-process via MSW at all times, but the MSW worker was never
  wired into the app — only into tests — so the homepage SWR hooks hit `/api/...` and got 404 in the running
  browser. Wiring the MSW browser worker now would conflict with the PWA service worker: setupWorker and Serwist
  both claim scope `/`, the last registration (Serwist, `clientsClaim`) wins, and mocked requests stop being
  intercepted.
- Decision: serve the mock directly from the Next server as real routes — `GET /api/main-page/apps-nested` and
  `GET /api/banners` — returning the same `{ statusCode, message, data }` envelope over the same
  `src/mocks/data/*.json` fixtures the MSW handlers use (`src/shared/api/mockEnvelope.ts`). No separate service,
  no env gating, works in dev, standalone and after install; no second service worker.
- Consequences: MSW stays only in tests (unchanged). The service worker never sees API traffic, so offline is
  represented by SWR's normal error state, not stale mock data. Real-backend migration later is just pointing
  `NEXT_PUBLIC_API_BASE_URL` at it or adding a `proxy.ts` rewrite over these routes.

## D-024 Semantic component classes and a hard 3-token className rule
- Date: 2026-10-11
- Status: accepted
- Context: feature components accumulated long `className` strings (up to 14 utilities) mixing layout,
  brand color, motion and state. Several were silently broken: `text-body-xs` (no such utility),
  `rounded-[var(--radius-8)]` (token deleted, so no radius), `background-white` (invalid property) and
  `w-[360]` (emits the invalid `width:360`). Reviewers could not see which utilities actually applied.
- Decision: every element uses at most 3 className tokens (static tokens plus the widest branch of each
  `${...}`). Anything longer becomes a semantic class in `src/styles/components/*.css` via `@apply`, with
  interactive/scroll state expressed through `data-*` attributes (`data-scrolled`, `data-revealed`,
  `data-state`, `data-active`) instead of conditional utility soup. Antd + Tailwind share one `@layer`
  declaration (in `index.css`; the duplicate `antd-bridge.css` is deleted). `scripts/check-class-count.mjs`
  enforces the rule in `pnpm lint`, counting template-literal branches by their widest alternative.
- Consequences: components read as `className="app-header"`, and Tailwind's utility layer still overrides the
  component layer for the few conditional utilities that remain (e.g. `h-[64px]`). The rule is mechanical, so
  it cannot rot; adding a genuinely new pattern means adding a component class, not a longer string.

## D-025 PWA icons generated from public/brand/favicon.png
- Date: 2026-10-11
- Status: accepted
- Context: favicons and PWA icons previously pointed at files that did not exist (`.ico`, 16/32, apple-touch)
  or were derived from `logo.svg`. The owner replaced the brand art with `public/brand/favicon.png` (opaque
  192px source, transparent 1px corners).
- Decision: one reproducible generator, `scripts/generate-pwa-assets.mjs` (`pnpm generate:icons`, sharp +
  png-to-ico), emits favicon.ico (16/32), favicon-16x16/32x32, apple-touch-icon (180), and `/icons/icon-{192,512}`
  in `any` plus `/icons/icon-maskable-{192,512}` with the artwork centered in the central 80% safe zone. The
  manifest lists both purposes and adds `id: '/'`; metadata now serves real favicon links plus `appleWebApp`.
- Consequences: installability is satisfied (an `any` icon exists) and Android adaptive launchers get a safe
  maskable render. Regenerating the set after a brand change is one command; committed PNGs stay the build-time
  source of truth for standalone/Docker, where `public/` travel with the image (Dockerfile already copies it).
