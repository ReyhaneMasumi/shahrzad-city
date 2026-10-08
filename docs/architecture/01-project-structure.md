# 01 — Project Structure (feature-based)

> This is the **proposed** layout. It must be confirmed with the project owner in the planning phase before any implementation.

## Top level

```
.
├─ src/
│  ├─ app/                  # Routing only: layouts, pages, loading/error/not-found, metadata files
│  ├─ features/             # Business features (vertical slices)
│  ├─ shared/               # Code reused by 2+ features
│  ├─ styles/               # Tokens, Tailwind layers, Ant Design bridge
│  └─ providers/            # App-level providers (SWR, Ant Design, theme)
├─ tests/
│  ├─ e2e/                  # Playwright specs and page objects
│  ├─ fixtures/             # API payloads copied from API.md (Persian allowed here)
│  ├─ mocks/                # MSW handlers shared by integration tests
│  └─ setup/                # Vitest setup files
├─ public/                  # Static assets (favicons, og image)
├─ scripts/                 # Repo scripts (check-no-persian.mjs, etc.)
├─ docs/                    # Architecture, plan, decisions, audit
├─ visuals/                 # Reference screenshots
├─ .opencode/               # Skills, commands, prompts for the agent
├─ Dockerfile, .dockerignore, docker-compose.yml, .env.example
├─ eslint.config.mjs, vitest.config.ts, playwright.config.ts, next.config.ts, proxy.ts
└─ AGENTS.md, README.md, API.md
```

## Features for this homepage (proposal)

```
src/features/
├─ app-header/        # Header, nav, shrink-on-scroll
├─ bottom-nav/        # Mobile bottom navigation
├─ back-to-top/       # Mobile back-to-top button
├─ app-footer/        # Desktop footer with reveal-on-scroll
├─ hero-banner/       # Banner API, single banner, carousel
├─ home-sections/     # API-driven sections and tiles
└─ home/              # Page composition only (no data logic of its own)
```

## Inside a feature

```
src/features/hero-banner/
├─ api/            # endpoint functions + SWR keys        (hero-banner.endpoint.ts, hero-banner.keys.ts)
├─ hooks/          # SWR hooks and UI hooks               (useHeroBanners.ts, useHeroCarousel.ts)
├─ components/     # one folder per component
│  └─ HeroBanner/
│     ├─ HeroBanner.tsx          # view only, default export
│     ├─ useHeroBanner.ts        # logic only, named export
│     ├─ HeroBanner.types.ts     # props and view-model types
│     └─ HeroBanner.test.tsx     # integration test next to the component
├─ lib/            # pure helpers and mappers             (hero-banner.mapper.ts)
├─ store/          # Zustand store if client state needed (heroBanner.store.ts)
├─ types/          # DTOs and domain types                (hero-banner.types.ts)
└─ index.ts        # public API of the feature (exports only what others may use)
```

Create only the folders a feature needs. Use the skill `create-feature`.

## `src/shared`

```
src/shared/
├─ ui/            # Primitives: Button, IconButton, Container, Skeleton, Image, Heading, Text, Spinner...
├─ layout/        # Page shell pieces used by many features
├─ api/           # Axios client, error normalization, base fetcher, SWR config
├─ config/        # env parsing (typed), constants, routes
├─ hooks/         # Generic hooks: useMediaQuery, useScrollDirection, useReducedMotion
├─ lib/           # Pure utils: cn-free helpers, formatters, guards
├─ i18n/          # fa.ts (the only place for Persian UI copy) and typed accessors
└─ types/         # Global utility types
```

## Naming

| Thing | Convention | Example |
| --- | --- | --- |
| Component file and folder | PascalCase | `HeroBanner.tsx` |
| Hook file | camelCase starting with `use` | `useHeroBanner.ts` |
| Other files | kebab-case with role suffix | `hero-banner.endpoint.ts`, `hero-banner.mapper.ts` |
| Types | PascalCase, DTO suffix for wire types | `HeroBannerDto`, `HeroBanner` |
| Zustand store | `useXStore` in `x.store.ts` | `useUiStore` |
| Test | next to source, `.test.ts(x)` | `hero-banner.mapper.test.ts` |
| CSS component class | block name in kebab-case, BEM-lite | `.hero-banner`, `.hero-banner__title` |
| Constants | `SCREAMING_SNAKE_CASE` | `HEADER_SHRINK_OFFSET` |

## Import rules

1. Use the `@/` alias for `src/`.
2. Features may import from `shared`. `shared` never imports from `features`.
3. A feature imports another feature only through that feature's `index.ts`.
4. `app/` imports from `features` public APIs and `shared` only.
5. No circular imports (enforced by lint).
6. Avoid barrel files except the feature `index.ts`. Barrels slow Turbopack and hurt tree-shaking.

## One-component rule

- One component per file. One `export default` per file.
- Hooks, helpers, constants and types use named exports and live in their own files.
- Small private presentational pieces that are used by only one component still get their own file in the same folder.
