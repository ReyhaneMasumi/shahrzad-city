# Shahrzad Homepage

Production-ready recreation of the Shahrzad homepage ([https://web.shahrzadcity.ir/home](https://web.shahrzadcity.ir/home)).

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

| Variable                   | Required | Default                       | Description                                          |
| -------------------------- | -------- | ----------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | No       | `/api`                        | Base URL for API calls (relative for in-process MSW) |
| `NEXT_PUBLIC_SITE_URL`     | No       | `https://web.shahrzadcity.ir` | Canonical site URL for SEO (sitemap, OG, manifest)   |

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

| Feature                                                | Status | Notes                                                |
| ------------------------------------------------------ | ------ | ---------------------------------------------------- |
| Header (desktop + mobile)                              | ✅     | Scroll shrink on mobile, responsive nav              |
| Hero Banner (static + carousel)                        | ✅     | Priority image, preload, scroll-snap carousel        |
| Services Grid (tiles)                                  | ✅     | 4-col grid, skeleton loading, empty/error states     |
| Footer (desktop)                                       | ✅     | Fixed, scroll-reveal animation                       |
| Bottom Navigation (mobile)                             | ✅     | Wallet / QR / Services                               |
| Back-to-Top (mobile)                                   | ✅     | In-flow button above footer spacer                   |
| SEO (metadata, OG, sitemap, robots, manifest, JSON-LD) | ✅     | WebSite structured data                              |
| Global error boundaries                                | ✅     | `error.tsx`, `global-error.tsx`                      |
| Accessibility                                          | ✅     | Landmarks, focus-visible, ARIA labels, RTL icons     |
| Unit + Integration tests                               | ✅     | 86 tests, coverage gates enforced                    |
| E2E tests                                              | ✅     | Playwright (desktop / mobile / tablet)               |
| PWA (metadata, SW, favicons)                           | ✅     | Manifest, Serwist service worker, generated icon set |

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

## CI/CD

Two GitHub Actions pipelines share one reusable checks workflow (`.github/workflows/checks.yml`:
`lint`, `unit`, `integration`), so the PR gate and `main` can never drift. Node 22 (from `.nvmrc`)
and pnpm installs use `--frozen-lockfile` through the composite action `.github/actions/setup`.

### PR gate (`ci-pr.yml`)

Runs on every pull request to `main`:

```
[lint] [unit] [integration]   ->  [pr-ok]   <- the only required status check
```

Failing any job fails `pr-ok`, which blocks the merge. A newer push cancels the older run.

### Main pipeline (`ci-main.yml`)

Runs on every push to `main`:

```
[checks] [build] [prebuild]
   |        |
 [e2e] [web-vitals]
   |        |
     [main-ok]  ->  [deploy]   (vercel deploy --prebuilt --prod)
```

- `web-vitals` and `e2e` are **blocking**: if either fails, `main-ok` fails and `deploy` never runs.
- `prebuild` (Vercel pull + build) runs in parallel with the tests and adds no critical-path time.
- The main pipeline does not cancel itself, so a running production deploy is never interrupted.

### Required check (manual, once per repository)

In GitHub → Settings → Rules → Rulesets for `main`: require a pull request before merging and require
the status check **`pr-ok`** only (do not add `lint`/`unit`/`integration` — `pr-ok` aggregates them).
Leave "require branches to be up to date before merging" off.

### Secrets and Vercel setup (manual, once)

Add these **repository secrets** (Settings → Secrets and variables → Actions); `prebuild` and
`deploy` read them:

| Secret              | Where to get it                                                                  |
| ------------------- | -------------------------------------------------------------------------------- |
| `VERCEL_TOKEN`      | Vercel → Account Settings → Tokens → Create (scope to the project)               |
| `VERCEL_ORG_ID`     | `.vercel/project.json` `orgId` after running `vercel link` locally               |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` `projectId` after running `vercel link` locally           |

Also create a GitHub Environment named `production` (deployment branch rule `main`, no required
reviewers) and make sure `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_SITE_URL` exist in the Vercel
project. Vercel's own Git auto-deploy is disabled by `vercel.json`
(`{ "git": { "deploymentEnabled": false } }`), so production is only reachable through this pipeline.

### Reading a Web Vitals failure

The `web-vitals` job runs Lighthouse CI (desktop, median of 3 runs) against a local production
server. Thresholds live in `lighthouserc.json` (performance ≥ 0.9, LCP ≤ 2500 ms, FCP ≤ 1800 ms,
CLS ≤ 0.1, TBT ≤ 200 ms, server-response-time ≤ 800 ms). On failure, open the job log or the
`lhci` diff line, e.g. `Performance 0.82 (un) -> 0.9 (un)`, and the `.lighthouseci` artifact.

### Re-enabling Vercel PR previews

Auto-deploy is off on purpose. To get preview deployments again, either set `deploymentEnabled` to
`true` in `vercel.json` (Vercel then deploys every branch) or add a separate preview workflow that
runs `vercel deploy` without `--prod` on pull requests.

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

## Project Planning, Development, and Quality Assurance

### 1. Requirements Gathering and AI-Assisted Planning

I started by writing an informal prompt in plain language, describing the project, its technology stack, required tools, visual specifications, functional requirements, essential features, and constraints defining what should and should not be implemented.

I provided this description separately to ChatGPT and Claude, asking them to transform it into professional prompts and structured instructions for the OpenCode AI agent. I also incorporated publicly available guidelines for styling, React development, and component design, along with relevant agent instructions and skills.

I then shared ChatGPT's output with Claude for comparison and refinement. This iterative process resulted in a consolidated set of instructions, skills, and a development plan, which I provided to OpenCode to begin implementation.

### 2. Visual Analysis and Implementation

Since no Figma designs or design files were available, I used Chrome extensions to inspect the existing website and extract its visual properties. I also provided screenshots of different pages and responsive layouts as references.

OpenCode leveraged vision-capable models and browser automation to inspect the website through a headless browser, log in, explore relevant pages, and generate scripts to identify interface elements.

Given the lack of detailed design specifications, the implementation was primarily based on screenshots and visual references rather than precise design files. As a result, some minor visual discrepancies may remain, which are expected under these constraints. We prioritized core functionality and overall visual consistency rather than spending excessive time on pixel-perfect details. These minor differences can be addressed through further refinement as the implementation becomes more precise.

Some features and integrations from the original website were intentionally excluded due to resource constraints or the scope of the implementation. These included Sentry, Google Tag Manager and Analytics, and certain map API requests that were not required on the homepage.

### 3. CI/CD and Quality Assurance

I established a deployment pipeline designed to run tests in parallel wherever possible to minimize pipeline execution time. Before code can be merged into the main branch, all required tests must pass, including unit, integration, and end-to-end tests. Defined test coverage thresholds must also be met.

Additionally, Core Web Vitals must achieve acceptable performance scores before a merge is allowed. These checks serve as quality gates, preventing code from being merged when testing or performance requirements are not satisfied.

Together, these processes establish a structured workflow for AI-assisted planning and development while maintaining code quality, visual consistency, test coverage, and application performance.

## License

Private - Shahrzad project.
