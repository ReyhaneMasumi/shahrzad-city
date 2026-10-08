# 08 — Testing Strategy (three levels)

Tools are **proposed defaults**; confirm in the planning phase.

| Level | Tool | Scope | Runs against |
| --- | --- | --- | --- |
| Unit | Vitest | Pure functions, mappers, formatters, Zustand stores, small hooks | Node / jsdom, no network |
| Integration | Vitest + React Testing Library + user-event + MSW | A feature (component + hook + SWR + API layer) with mocked HTTP | jsdom, MSW intercepts Axios |
| End-to-end | Playwright (+ `@axe-core/playwright`) | Real browser flows, responsive layouts, scroll animations, carousel, SEO tags | Production build (`next build && next start`) + the provided mock backend |

## Pyramid targets
- Many unit tests (fast, hundreds of ms total), a focused set of integration tests per feature, a small, stable set of e2e tests for critical flows.
- Coverage: report with `v8`; thresholds start at 80% lines for `src/features/**/lib`, `src/shared/**`, and 70% overall. Do not chase coverage in view files; test behavior.

## Conventions
- Names describe behavior: `it('shows the retry button when the banner request fails')`.
- Arrange / Act / Assert. One behavior per test. No logic in tests.
- Query by role, label, text. `data-testid` only as a last resort.
- No snapshots of large trees. Small inline snapshots only for serialized data.
- Time is controlled (`vi.useFakeTimers`) for carousel auto-advance and animations.
- Fixtures: `tests/fixtures/*.json` copied from `API.md` (Persian allowed here). Builders for variants (`buildBannerResponse({ count: 3 })`).
- MSW handlers in `tests/mocks/handlers`, shared by integration tests. Default handlers return success; each test overrides for error/empty/slow.
- SWR cache is isolated per test: wrap with `<SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>`.
- Reset Zustand stores in `afterEach`.

## What is not unit-testable
Async Server Components cannot be rendered by Vitest. Cover them with e2e and with tests of the pure functions they call (cached data function, mappers).

## Integration specifics
- Environment `jsdom` (or `happy-dom` if faster and sufficient); include `matchMedia`, `ResizeObserver`, `IntersectionObserver` mocks in `tests/setup`.
- Render with the same providers as the app (`TestProviders`: SWR, Ant Design `ConfigProvider direction="rtl"`).
- Always assert the four states: loading, success, empty, error (+ retry).
- Assert RTL where it matters (`dir="rtl"` on the document, carousel order, icon mirroring class).

## E2E specifics
- `playwright.config.ts`: `webServer` runs the production build; projects `mobile` (for example Pixel 7), `tablet` (iPad), `desktop` (1440x900); `baseURL` from env; traces on first retry; screenshots on failure.
- Auth: log in once in a setup project, store state in `.auth/` (git-ignored). Never commit it.
- Must cover:
  1. Homepage renders sections from the API response (including a variant with a missing/empty section).
  2. Hero: single banner has no carousel controls; multiple banners show carousel, next/prev, pagination, keyboard operation.
  3. Desktop: header animates on scroll; footer is revealed by scroll.
  4. Mobile: no footer, bottom nav visible and navigates, back-to-top appears after scrolling and scrolls to top, header shrinks.
  5. Error states: API 500 on banners and on sections show error UI with retry; slow API shows skeletons without layout shift.
  6. SEO: title, description, canonical, OG tags, `lang="fa"`, `dir="rtl"`, robots, sitemap respond.
  7. Accessibility: axe has no serious/critical violations on 3 viewports.
  8. Visual regression (`toHaveScreenshot`) of key sections with animations disabled and dynamic regions masked.
- Playwright Test Agents (planner, generator, healer) can bootstrap tests: `npx playwright init-agents --loop=opencode`. Back up `opencode.json` before running; the command writes OpenCode config and prompts under `.opencode/`. Review every generated plan and test; never accept blindly.

## Scripts (package.json)
`test` (unit+integration), `test:unit`, `test:int`, `test:e2e`, `test:coverage`, `typecheck`, `lint`, `verify` (= lint + typecheck + test + build), `e2e:docker` (compose up + run).

## CI order (fast to slow)
lint → typecheck → unit → integration → build → e2e (Playwright container) → docker build.
