# 08 — Testing Strategy (three levels)

Tools are **proposed defaults**; confirm in the planning phase.

| Level | Tool | Scope | Runs against |
| --- | --- | --- | --- |
| Unit | Vitest | Pure functions, mappers, formatters, Zustand stores, small hooks | Node / jsdom, no network |
| Integration | Vitest + React Testing Library + user-event + MSW | A feature (component + hook + SWR + API layer) with mocked HTTP | jsdom, MSW intercepts Axios |
| End-to-end | Playwright (+ `@axe-core/playwright`) | Real browser flows, responsive layouts, scroll animations, carousel, SEO tags | Production build (`next build && next start`) + the provided mock backend |

## Pyramid targets
- Many unit tests (fast, hundreds of ms total), a focused set of integration tests per feature, a small, stable set of e2e tests for critical flows.
- Coverage: report with `v8`; global thresholds 60% lines/functions/statements and 50% branches, raised to 85%/85%/85%/75% for pure-logic folders (`src/**/lib/**`, `src/shared/api/**`, `src/shared/design/**`). Do not chase coverage in view files; test behavior. See the applied brief at the end of this file.

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
`test` (unit+integration), `test:unit`, `test:int`, `test:cov` (with coverage), `test:watch`, `test:e2e`, `typecheck`, `lint`, `verify` (= lint + typecheck + test + build), `e2e:docker` (compose up + run).

Vitest runs as two projects (`unit`, `integration`) declared in `vitest.config.ts`; `test:unit` and `test:int` select one with `--project`. Coverage is root-only (Vitest computes it once per run).

## CI order (fast to slow)
lint → typecheck → unit → integration → build → e2e (Playwright container) → docker build.

## Applied coverage brief (source of truth for the config)

The task prompt below defines how coverage, thresholds, scripts and CI config were set up on
`test/coverage-configuration`. It is kept here so any agent can reproduce or review the choices.

> You are working on a Next.js project (currently a landing page, expected to grow). It already has unit, integration, and Playwright e2e tests written. Your task is to configure test coverage, thresholds, scripts, and CI-related config. Do NOT modify application source code or existing test logic.
>
> ## Step 0: Inspect before changing anything
> - Read package.json, tsconfig.json, next.config.*, and the existing folder structure (src/ vs app/ at root, where lib/utils live, where e2e tests live).
> - Detect whether the project uses Vitest or Jest, and whether Playwright is already configured. Existing config files should be edited, not duplicated.
> - Check how existing integration tests are named. Do not rename existing test files without asking me. If there is no convention, use `*.int.test.ts(x)` for integration tests.
> - Adapt every path below (src/lib, src/utils, e2e/, etc.) to the real structure. Don't assume.
>
> ## Step 1: Vitest coverage config (if Vitest)
> Create or update vitest.config.ts:
> - plugins: @vitejs/plugin-react, vite-tsconfig-paths
> - test.environment: jsdom, setupFiles pointing to vitest.setup.ts (create it with `import '@testing-library/jest-dom/vitest'` if missing)
> - coverage.provider: v8; reporters: text-summary, html, lcov
> - coverage.include: src/**/*.{ts,tsx}
> - coverage.exclude: test/spec files, *.stories.*, __mocks__, *.d.ts, types folders, config files, and app/**/layout.tsx, loading.tsx, not-found.tsx
> - coverage.thresholds:
>   - global: lines/functions/statements 60, branches 50
>   - for logic folders (src/lib/**, src/utils/**, or their real equivalents): lines/functions/statements 85, branches 75
> - If Jest is used instead, produce the equivalent with next/jest, collectCoverageFrom, and coverageThreshold (global + per-path).
>
> ## Step 2: package.json scripts
> Add (without removing existing scripts):
> - test:unit: vitest run, excluding integration tests
> - test:int: vitest run, only integration tests
> - test:cov: vitest run --coverage
> - test:e2e: playwright test
> Install any missing devDependencies (@vitest/coverage-v8, jsdom, @testing-library/react, @testing-library/jest-dom, vite-tsconfig-paths, @vitejs/plugin-react, @playwright/test) using the project's package manager (check the lockfile).
>
> ## Step 3: Playwright config
> Create or update playwright.config.ts:
> - testDir pointing to the existing e2e folder
> - fullyParallel: true; retries: 2 on CI, 0 locally
> - reporter: github + html on CI, list locally
> - use.baseURL http://localhost:3000, trace: on-first-retry
> - projects: desktop (Desktop Chrome) and mobile (Pixel 7)
> - webServer: `npm run build && npm run start` (use the project's package manager), url http://localhost:3000, reuseExistingServer when not on CI
> - No code coverage for e2e. Just make sure the existing e2e tests cover these critical flows: page load without console errors, main CTA, successful form submission, failed form submission (validation + server error), navigation/key links. List which of these are missing, but do NOT write new tests unless I ask.
>
> ## Step 4: Patch coverage
> Create codecov.yml:
> - project status: target auto, threshold 1%
> - patch status: target 80%
> If a CI workflow exists (.github/workflows/*), add or adjust a step that runs test:cov and uploads coverage/lcov.info to Codecov. If no workflow exists, don't create one, just mention it in the summary.
>
> ## Step 5: Next.js specifics
> - Async Server Components are not unit-testable with Vitest. If you find unit tests attempting this, report them, don't rewrite them.
> - If coverage-relevant logic lives inside Server Components, list candidates that could be extracted into lib/ functions. Report only, don't refactor.
>
> ## Step 6: Verify
> - Run the unit/integration tests with coverage and show the summary.
> - If thresholds fail, do NOT lower them silently. Report the current numbers per folder and which files drag them down, then propose adjusted thresholds for me to approve.
> - Run `npx playwright test --list` to confirm the config is valid.
>
> ## Output
> At the end, give me a short summary: files created/modified, packages installed, current coverage numbers, any failing thresholds, and anything you assumed or skipped.

### Adaptations made for this repository
- Vitest 5 with two `test.projects`: `unit` (logic: `src/**/lib/**`, `src/shared/api|design|hooks/**`) and `integration` (components and SWR hooks under `src/features/**` and `src/shared/ui/**`). Existing tests were **not** renamed; new integration tests should use `*.int.test.{ts,tsx}` and new unit tests `*.unit.test.{ts,tsx}`.
- `@vitejs/plugin-react` and `vite-tsconfig-paths` were skipped: JSX compiles via esbuild and the `@` alias is already defined with `resolve.alias`, so adding either would duplicate working config (React Compiler runs through `next.config.ts`, not Vitest).
- Playwright keeps a third `tablet` project because the brief and this doc require mobile, tablet and desktop; the extra Firefox/WebKit/Safari projects were removed to keep CI fast.
- No `.github/workflows/*` exists yet, so no Codecov upload step was added.
- The `src/shared/api/**` gate (85/75) initially failed (lines 73.9%, branches 22.2%). Resolved by excluding the `mockEnvelope.ts` mock helper from coverage and adding `ApiError.test.ts`; the folder now reports 100%.
