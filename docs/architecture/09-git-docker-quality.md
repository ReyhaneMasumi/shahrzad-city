# 09 — Git, ESLint, Docker, Environment, CI

## Git
- First action of the project: `git init`, add `.gitignore`, make the first commit.
- **One meaningful Conventional Commit per completed task**: `type(scope): imperative summary`.
  - Types: `feat fix refactor perf test docs build ci chore style revert`.
  - Scope = feature or area (`hero-banner`, `api`, `docker`, `styles`).
  - Body (when useful) explains why, not what. Reference `docs/DECISIONS.md` ids.
- Examples: `feat(hero-banner): render carousel when API returns several banners`, `test(api): cover banner mapper empty and malformed input`.
- Commit after: bootstrap, each primitive group, each feature, each test layer, Docker, README. Never batch unrelated work.
- Before every commit run `pnpm verify` (or the fast subset `lint typecheck test`). Never use `--no-verify`.
- Never push, force-push, or rewrite history without asking.
- Hooks: Husky + lint-staged (lint/format staged files) and optionally commitlint (config-conventional).
- `.gitignore` must include: `node_modules`, `.next`, `out`, `coverage`, `playwright-report`, `test-results`, `.auth`, `.env*` except `.env.example`, `*.log`, `.DS_Store`, `.next-docs`.

## ESLint (flat config `eslint.config.mjs`)
Do not use `next lint` (removed). Run `eslint .` directly.
Base: `eslint-config-next` (core-web-vitals + typescript), `typescript-eslint` with type-checked strict + stylistic configs, `eslint-plugin-react-hooks` (includes React Compiler rules), `jsx-a11y`, import ordering/cycles (`eslint-plugin-import-x` or `simple-import-sort`), `eslint-plugin-vitest`, `eslint-plugin-testing-library`, `eslint-plugin-playwright`, a Tailwind class-order/validity plugin that supports Tailwind v4 (verify support first), `eslint-config-prettier` last.

Project rules to enforce:
- `@typescript-eslint/no-explicit-any: error`, `no-non-null-assertion: error`, `consistent-type-imports`, `no-floating-promises`, `switch-exhaustiveness-check`, `no-unnecessary-condition`.
- `react/no-multi-comp: ['error', { ignoreStateless: false }]` and `react/jsx-no-useless-fragment`.
- `import/no-default-export` off for components, pages and config; on for hooks, utils, types (hooks/utils use named exports).
- `import/no-cycle: error`, `no-restricted-imports` to block deep cross-feature imports and `shared → features`.
- `max-lines: ['warn', 200]`, `complexity: ['warn', 10]`.
- `no-console` (allow `warn`/`error`), `eqeqeq`, `prefer-const`.
- Engineering prose must be English. Do not ban Persian from runtime UI or API fixtures because the product itself is Persian. If a repository language check is added, scope it to comments/docs/identifiers rather than user-facing content and API fixtures.
- Do not enforce an arbitrary maximum number of Tailwind tokens. Review className readability, repetition, semantic reuse, and component ownership instead. Add custom lint only for demonstrably harmful patterns.
- Next.js: forbid `middleware.ts`, `unstable_cache`, `next/legacy/image` through `no-restricted-imports`/syntax.

Also: Prettier (with `prettier-plugin-tailwindcss` if compatible), EditorConfig, `.nvmrc`.

## Docker
Goals: reproducible, small, secure, no secrets.

```
Dockerfile (multi-stage)
1. base:   node:<current LTS>-alpine, enable corepack, set WORKDIR
2. deps:   copy package.json + lockfile only, `pnpm install --frozen-lockfile` (BuildKit cache mount)
3. builder: copy source, `pnpm build` (Next `output: 'standalone'`)
4. runner: non-root user, copy `.next/standalone`, `.next/static`, `public`;
           ENV NODE_ENV=production, HOSTNAME=0.0.0.0, PORT=3000; EXPOSE 3000;
           HEALTHCHECK against `/api/health` (or `/`); CMD ["node","server.js"]
```
- `.dockerignore`: `.git node_modules .next coverage playwright-report test-results .env* !.env.example visuals docs .auth`.
- **No secrets in the image.** No `COPY .env`. Configuration comes at run time: `docker run --env-file .env` or compose `environment`.
- `NEXT_PUBLIC_*` are compile-time. Prefer server-only env read at runtime; if a public variable is needed at build, document `--build-arg` and keep it non-secret.
- Pin the Node major, use lockfile, `--frozen-lockfile`, no `latest` base tags in the final Dockerfile.
- `docker-compose.yml`: services `web` (this app) and `mock-api` (the provided mock backend), shared network, `web` depends on `mock-api` health, env from `.env`.
- Verify with the skill `docker-verify`: clean build, run, health, homepage responds, image has no `.env`, runs as non-root.

## Environment
- `.env.example` lists every variable with comments and safe placeholders. `.env*` real files are git-ignored.
- Typed parsing in `src/shared/config/env.ts` that throws on startup if invalid.

## CI/CD (GitHub Actions)

Two pipelines share one reusable checks workflow so the PR gate and `main` can never drift.
Node 22 comes from `.nvmrc`; pnpm is installed by `pnpm/action-setup@v4` and every install uses
`pnpm install --frozen-lockfile`. The composite action `.github/actions/setup` centralizes
Node + pnpm + dependency install (with the pnpm store cache) for every job.

### PR gate — `.github/workflows/ci-pr.yml`
Runs on `pull_request` targeting `main` only (no wasted minutes on branches without a PR, and no
secrets are exposed to fork PRs). `cancel-in-progress: true` on group `pr-${{ github.ref }}`, so a
newer push makes the older run stale.

```
[pull_request -> main]
        |
   +----+----+
 [lint] [unit] [integration]        <- reusable checks.yml, run in parallel
   |      |        |
   +------+--------+
        |
     [pr-ok]                        <- the ONLY required status check (if: always())
```

`checks.yml` (`on: workflow_call`) owns the three jobs: `lint` (`pnpm lint` + `pnpm typecheck`),
`unit` (`pnpm test:unit`), `integration` (`pnpm test:int`). Each is `ubuntu-latest`,
`timeout-minutes: 10`, `permissions: { contents: read }`. `pr-ok` is a thin `if: always()` job that
fails when any dependency's result is `failure` or `cancelled` — one stable check name for the
branch ruleset.

### Main — `.github/workflows/ci-main.yml`
Runs on `push` to `main`. `concurrency: { group: main, cancel-in-progress: false }` — a running
success wave is never interrupted (cancelling could kill an in-flight production deploy).

```
[push -> main]
      |
 +----+----+----------------------+
[checks] [build] [prebuild]         <- checks = reusable; prebuild = vercel pull + vercel build
  |        |         |
  |     +--+--+      |
  |   [e2e] [web-vitals]            <- both need build; run in parallel
  |     |      |      |
  +-----+------+------+
               |
           [main-ok]                 <- if: always(); fail if any of checks/build/e2e/web-vitals failed
               |
           [deploy]                 <- needs: [main-ok, prebuild]; environment: production
                                       vercel deploy --prebuilt --prod
```

- `build`: caches `.next/cache`, runs `pnpm build`, uploads artifact `next-build` (`.next` +
  `public`, hidden files included, 1-day retention).
- `e2e`: shard-ready matrix `shard: [1]` (single shard today; bump to `[1,2,3,4]` in one line).
  Downloads `next-build`, installs Playwright browsers (cached), runs
  `playwright test --shard=${{ matrix.shard }}/${{ strategy.job-total }}`, and uploads
  `playwright-report-${{ matrix.shard }}` on failure. The Playwright `webServer` starts `pnpm start`
  in CI (no rebuild) so the prebuilt `.next` is reused.
- `web-vitals`: downloads `next-build`, runs `pnpm exec lhci autorun` against a local `next start`
  (see `lighthouserc.json`), tees the median report into the job summary, and uploads `.lighthouseci`
  on failure.
- `prebuild`: `vercel pull --yes --environment=production` then `vercel build --prod`, uploading
  `vercel-output` (`.vercel/output` + `.vercel/project.json`). It runs in parallel with the tests,
  so it adds no critical-path time.
- `deploy`: `needs: [main-ok, prebuild]`, `if: github.ref == 'refs/heads/main'`,
  `environment: production`, own `concurrency: { group: deploy-production, cancel-in-progress: false }`.
  Downloads `vercel-output` and runs `vercel deploy --prebuilt --prod`, writing the URL to the job
  summary.

The Web Vitals and e2e gates are **blocking**: a red gate fails `main-ok` and `deploy` never runs.

### Required status check and ruleset (manual, repository settings)
- **Required check: `pr-ok` only.** Add it in Settings → Rules → Rulesets for `main` (require a PR
  before merging, require status checks, block force pushes/deletions). Do **not** require the
  individual `lint`/`unit`/`integration` jobs — `pr-ok` aggregates them.
- "Require branches to be up to date before merging": **off** (near-solo repo; re-runs the whole
  gate after every merge for little gain).
- GitHub Environment `production`: deployment branch rule `main` only; no required reviewers
  (a manual click would block every deploy).

### Secrets
Repository-level secrets, read by `prebuild` and `deploy`:
`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`. `vercel.json`
(`{ "git": { "deploymentEnabled": false } }`) disables Vercel's own Git auto-deploys, so the only
path to production is this workflow.

### Web Vitals budget (`lighthouserc.json`)
Chrome **desktop** preset, `numberOfRuns: 3` (median), local `next start`. Error-level thresholds:
performance score ≥ 0.9, LCP ≤ 2500 ms, FCP ≤ 1800 ms, CLS ≤ 0.1, TBT ≤ 200 ms,
server-response-time ≤ 800 ms. Read a failure in the job log / `lhci` diff line, e.g.
`Performance 0.82 (un) -> 0.9 (un)`. TBT proxies INP (a lab run cannot measure interaction).

### Known limitation
The single `main-ok` fail-if-any gate is conservative: if any main job fails (say only `lint`),
`web-vitals` and `deploy` are skipped and `main` shows red. e2e and Web Vitals do not run on the PR
gate, so a break reaches `main` before it is caught. Deliberate trade-off; the later refinement is
explicit per-job edges (`if: needs.<job>.result == 'success'`) instead of one OR-gate.

## README (final deliverable)
Sections: overview and screenshots; features; improvements over the original site; tech stack and why; architecture (folder map, component pattern, data flow diagram); run locally; run with Docker (and compose); environment variables table; scripts; testing (3 levels, how to run); performance and SEO results; decisions (link to `docs/DECISIONS.md`); limitations; **AI tools used and the full process** (which tools, for what, how outputs were verified, what was rejected); license/credits.
