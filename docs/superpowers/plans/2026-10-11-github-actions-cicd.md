# GitHub Actions CI/CD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a two-tier GitHub Actions CI/CD setup — a fast PR gate on every non-main branch and a full, maximally-parallel pipeline on `main` that gates a Vercel production deploy behind tests and a hard Web Vitals budget.

**Architecture:** A reusable `checks.yml` (`workflow_call`) owns the shared lint/unit/integration jobs so the PR gate and main can never drift. `ci-pr.yml` calls it and exposes a single required check `pr-ok`. `ci-main.yml` calls it, adds `build` -> (`e2e`, `web-vitals`) plus a parallel `prebuild` (Vercel) step, gates everything behind `main-ok`, then deploys only `main-ok`-green runs to Vercel. A composite action `.github/actions/setup` centralizes Node+pnpm+install.

**Tech Stack:** GitHub Actions, pnpm 10.34.6, Node 22 (.nvmrc), Vitest, Playwright, Lighthouse CI (`@lhci/cli`), Vercel CLI.

**Spec:** This document. Source prompt: `docs/prompts/github-actions-cicd.md`. Repo rules: `AGENTS.md`, `docs/architecture/09-git-docker-quality.md`.

## Global Constraints

- Package manager: **pnpm 10.34.6** (`packageManager` field), lockfile `pnpm-lock.yaml`, always `--frozen-lockfile`.
- Node: **22** from `.nvmrc`.
- Scripts that exist and are reused verbatim: `lint`, `typecheck`, `test:unit`, `test:int`, `build`, `start`, `test:e2e`.
- Integration tests need **no external services** (in-process MSW + jsdom). No DB, no docker service.
- Public routes today: `/` only (`/~offline` is a PWA fallback). No other user-facing routes exist.
- Least-privilege `permissions`; no secrets on PR gate; fork PRs never receive secrets.
- Third-party actions pinned to a major version.
- Never `git push`; commits only, Conventional Commits, one logical change each.

## Review Focus

- **`main` can go red after merge:** e2e and Web Vitals do not run on the PR gate, so a break reaches `main`. Deploy is blocked, but `main` is red until fixed. Mitigation documented in Risks (Task 9).
- **Required check that never reports blocks merge forever:** any `paths:` filter on the `pr-ok` workflow. Avoid; gate inside steps instead.
- **Web Vitals flakiness on shared runners:** median-of-N + fixed preset must be real, not aspirational. A hard fumble here blocks every deploy.
- **Vercel auto-deploy left on:** if `vercel.json` `git.deploymentEnabled` is not disabled, Vercel deploys on every push regardless of CI.
- **Cancel-in-progress killing a production deploy:** `main` concurrency must set `cancel-in-progress: false`.

---

## 1. Findings from repo inspection

| Item              | Detected value                                                                 |
| ----------------- | ------------------------------------------------------------------------------ |
| Package manager   | pnpm 10.34.6 (Corepack-era `packageManager` field); `pnpm install --frozen-lockfile` |
| Node              | 22 (`.nvmrc` = `22`; Dockerfile `node:22-alpine`)                               |
| Lint job          | `pnpm lint` = `eslint && node scripts/check-no-persian.mjs && node scripts/check-class-count.mjs`; `pnpm typecheck` = `tsc --noEmit` |
| Unit tests        | `pnpm test:unit` = `vitest run --project unit`                                  |
| Integration tests | `pnpm test:int` = `vitest run --project integration`                            |
| Full test         | `pnpm test` = `vitest run` (both projects); 21 test files                       |
| Build             | `pnpm build` = `next build` (`output: 'standalone'`, React Compiler, Turbopack, Serwist PWA) |
| Start             | `pnpm start` = `next start` (port 3000)                                         |
| E2E               | `pnpm test:e2e` = `playwright test`; 1 spec, 3 tests, 6 projects (chromium/firefox/webkit/mobile-chrome/mobile-safari/tablet); CI `workers: 1`, `retries: 2`, reporters github+html |
| E2E web server    | `playwright.config.ts` -> `pnpm build && pnpm start`, `reuseExistingServer: !CI`, timeout 180s |
| Health route      | `GET /api/health` returns `{status:'ok'}` (used for readiness probes)           |
| Existing CI/CD    | **None.** No `.github/`, no `vercel.json`, no Lighthouse dependency            |
| Env vars          | `NEXT_PUBLIC_API_BASE_URL` (default `/api`), `NEXT_PUBLIC_SITE_URL` (default `https://web.shahrzadcity.ir`) |
| Repo              | `github.com/ReyhaneMasumi/shahrzad-city`; default branch `main`; Vercel project already connected (per brief) |

**Assumptions to confirm:** Vercel project is linked and the user can create a token; the app needs no runtime secrets (only public env vars); shared GitHub-hosted `ubuntu-latest` runners.

**Decision from Q&A:** Lighthouse CI (blocking, error-level), measured against a local `next start` build in parallel with e2e, and a single shard-aware e2e job today.

---

## 2. Job graphs and critical path

### A) Non-main / PR gate — `ci-pr.yml`

```
              (pull_request -> main)
                        |
      +-----------------+------------------+
      |                 |                  |
   [lint]           [unit]           [integration]
  (eslint+tsc)   (vitest unit)    (vitest integration)
      |                 |                  |
      +-----------------+------------------+
                        |
                     [pr-ok]   <-- ONLY required check
                     if: always()
```

Critical path ≈ install(25s) + heaviest of the three (~45s) + gate(5s) ≈ **~75–90s**.
All three run concurrently; each reuses the pnpm cache via the composite action.

### B) Main — `ci-main.yml`

```
                         (push -> main)
                               |
        +-----------+----------+-----------+-----------+
        |           |          |           |           |
     [checks]    [build]   [prebuild]     |           |
   lint/unit/   next build  vercel pull  |           |
   integration  +.next art  +vercel      |           |
        |           |       build art    |           |
        |           +----+------+        |           |
        |                |      |        |           |
        |             [e2e]  [web-vitals]|           |
        |             shard  lhci x3     |           |
        |                |      |        |           |
        +----------------+------+--------+-----------+
                               |
                           [main-ok]  if: always()
                               |
                           [deploy]  needs: [main-ok, prebuild]
                           vercel deploy --prebuilt --prod
```

Hard dependencies only: `build -> e2e`, `build -> web-vitals`, `checks/build/e2e/web-vitals -> main-ok`, `main-ok -> deploy`.
`prebuild` runs in parallel with the test jobs and is hidden behind them, so it adds **zero** critical-path time.

Estimated critical path: install(25s) + **build(90s)** + **max(e2e ~4min, web-vitals ~2.5min)** + main-ok(5s) + deploy-with-prebuilt(60s) ≈ **~7 min**.
(Without `prebuild`, deploy would add ~2 min of `vercel pull`+`vercel build`.)

Jobs ordered/sized so the slow stages start first and nothing short blocks them:
- `build` and `prebuild` start immediately after install (longest non-test stage first).
- `e2e` is the single longest job (~4 min) and is the real critical path; it is shard-ready (`matrix.shard: [1]`) so it can later be cut to ≈ build length without touching anything else.
- `web-vitals` (3 runs) finishes before e2e; it never gates deploy on its own.

---

## 3. File-by-file changes

| File                                    | Action  | Responsibility |
| --------------------------------------- | ------- | -------------- |
| `.github/actions/setup/action.yml`      | create  | Composite: `pnpm/action-setup@v4` -> `actions/setup-node@v4` (node-version-file `.nvmrc`, `cache: pnpm`) -> `pnpm install --frozen-lockfile` |
| `.github/workflows/checks.yml`          | create  | Reusable `on: workflow_call`; jobs `lint` (eslint + typecheck), `unit`, `integration`; no gate |
| `.github/workflows/ci-pr.yml`           | create  | `on: pull_request -> main`; job `checks` calls `checks.yml`; job `pr-ok` (`if: always()`, needs `checks`); `concurrency` per ref, `cancel-in-progress: true` |
| `.github/workflows/ci-main.yml`         | create  | `on: push -> main`; `checks` + `build` + `e2e` + `web-vitals` + `prebuild` + `main-ok` + `deploy`; `concurrency` `main`, `cancel-in-progress: false` |
| `.github/actions/setup`                 | —       | (same as first row) |
| `playwright.config.ts`                  | modify  | `webServer.command`: `process.env.CI ? 'pnpm start' : 'pnpm build && pnpm start'` so CI reuses the downloaded `.next` artifact instead of rebuilding |
| `lighthouserc.json`                     | create  | LHCI collect (url `/`, `startServerCommand: pnpm start`, `numberOfRuns: 3`, desktop preset, fixed settings) + `assert` error-level thresholds + filesystem upload |
| `vercel.json`                           | create  | `{ "git": { "deploymentEnabled": false } }` — disables Vercel auto Git deploys |
| `package.json` / `pnpm-lock.yaml`       | modify  | add devDependency `@lhci/cli` (pinned) |
| `.gitignore`                            | modify  | add `.lighthouseci/` |
| `docs/architecture/09-git-docker-quality.md` | modify | document the CI/CD pipeline, required checks, and secrets |
| `docs/DECISIONS.md`                     | modify  | one entry: trigger choice, gate design, LHCI vs Playwright, prebuild-vs-inline deploy |
| `README.md`                             | modify  | new "CI/CD" section: pipeline diagram, required checks, Vercel secrets, manual setup |

---

## 4. Manual setup steps (outside the repo)

1. **Vercel token:** Vercel dashboard -> Account Settings -> Tokens -> Create, scope to the project. Store as GitHub secret `VERCEL_TOKEN`.
2. **Vercel IDs:** locally run `vercel link` in the repo, then read `.vercel/project.json` for `orgId` and `projectId`. Store as repo secrets `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`. (`.vercel/` is already gitignored.)
3. **Where to store:** repository secrets (not environment-scoped) so both `prebuild` and `deploy` can read them. Attach GitHub Environment `production` to the `deploy` job for audit/rollback tracking only; do not attach required reviewers to it (that would also gate `prebuild` if env-scoped secrets were used, and would block every deploy behind a manual click).
4. **Disable Vercel auto-deploy:** commit `vercel.json` (`git.deploymentEnabled: false`) **or** set it in Vercel project settings -> Git -> Ignored Build Step / Production Branch. This also stops automatic PR previews; see Risks for how to re-enable previews later.
5. **Vercel project env vars:** ensure `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_SITE_URL` exist in the Vercel project (Production). `vercel pull` fetches them into `vercel build`.
6. **Branch ruleset for `main`** (Settings -> Rules -> Rulesets, or Branches):
   - Require a pull request before merging.
   - Require status checks to pass: select **only `pr-ok`**.
   - Block force pushes (and deletions).
   - "Require branches to be up to date before merging": **off** (see Risks).
7. **GitHub Environment `production`** (Settings -> Environments): create it; add deployment branch rule `main` only.

---

## 5. Risks, trade-offs, decisions

| Decision | Choice | One-line justification |
| -------- | ------ | ---------------------- |
| Trigger | `pull_request` -> `main` (not `push: branches-ignore: [main]`) | Runs only when a PR exists (no wasted minutes on branches with no PR), attaches checks to the PR head commit (what a required check needs), and works for fork PRs (which get no secrets). Using both triggers would double-run. |
| Reusable checks | One `checks.yml` via `workflow_call` | PR and main cannot drift apart; the three jobs stay parallel inside it. |
| Gate job | `pr-ok` / `main-ok` with `if: always()` + `needs.*.result` check | One stable required check; fails on `failure` or `cancelled` of any dependency. |
| Path filters | none | A required check that never reports blocks merges forever. If filters are ever added, keep `pr-ok` always-running. |
| "Up to date" branch requirement | off | For a near-solo repo it re-runs the whole gate after every main merge, for little safety gain. Turn on if contributors grow. |
| Failure-triggered cancel of slow jobs | **not implemented** | Needs elevated `actions: write` and can kill production-path jobs on a trivial failure; minutes saved are small at this suite size. `fail-fast: false` keeps e2e meaningful. |
| e2e shards | single shard now, `matrix.shard: [1]` | Only 1 spec (3 tests x 6 projects) exists; 4 shards would be all startup, no work. Bumping to `[1,2,3,4]` later is a one-line change; command already uses `strategy.job-total`. |
| Web Vitals tool | Lighthouse CI (`@lhci/cli`), `assert` level `error` | First-class strict assertions, median aggregation, HTML report artifact, mature flakiness controls. |
| INP | proxied by Lighthouse `total-blocking-time` <= 200ms | Lab cannot measure INP. **Honest limitation:** TBT is a proxy, not INP; real INP needs field data or an interaction test. Future task: Playwright + `web-vitals` interaction scenario on the home banner carousel. |
| Web Vitals preset | Lighthouse `desktop` preset, `numberOfRuns: 3`, median | Mobile+CPU throttling on 2-core shared runners makes LCP<=2.5s flaky. Google's thresholds are field/mobile figures; desktop lab is a stable proxy. Documented as a known gap. |
| Web Vitals target | local `next start` in parallel with e2e (option a) | Fast, parallel, no Vercel dependency or bypass token. Numbers differ from Vercel's CDN — accepted; a post-deploy synthetic check is a future task. |
| Pages tested | `/` (primary). `/~offline` optional | Only `/` is a public route; `/~offline` is a rarely-hit PWA fallback. |
| Deploy build | separate parallel `prebuild` job (option 1) | `vercel build` emits `.vercel/output` (Build Output API), not reusable from plain `.next`, so reuse is not possible; running it in parallel hides it entirely behind the test jobs. Costs ~1 extra build's runner minutes for ~2 min less wall clock. |
| `main` concurrency | `cancel-in-progress: false` | Cancelling a main run could kill an in-flight production deploy. |
| PR concurrency | `cancel-in-progress: true`, group `pr-${{ github.ref }}` | A newer push makes the older gate stale; cancel it. |

**"e2e and Web Vitals only run on main" consequence:** a merge that breaks them leaves `main` red and blocks deploy until fixed, with no pre-merge signal. Mitigations (documented, not implemented unless asked): (1) add a desktop-only e2e smoke job + a fast LHCI desktop run to the PR gate as a follow-up (slower PR gate, catches it early); (2) rely on Vercel instant rollback + `git revert` for recovery; (3) enable GitHub merge queue (Team/public repos) so the gate runs against the merged result. Recommendation: ship as specified first; add the PR smoke e2e if `main` goes red more than once.

---

## 6. Verification plan

1. **Static lint of workflows:** `actionlint .github/workflows/*.yml` (install: `brew install actionlint`). Expected: no output.
2. **PR gate happy path:** push a throwaway branch, open a PR to `main`. Expected: `lint`, `unit`, `integration`, `pr-ok` all green; `pr-ok` listed as the only required status.
3. **Failure drills on the PR (one at a time, in a scratch PR):**
   - break lint (`console.log` / a Persian literal) -> `lint` red -> `pr-ok` red -> merge button blocked.
   - break a unit test -> `unit` red -> `pr-ok` red -> blocked.
   - break an integration test -> `integration` red -> `pr-ok` red -> blocked.
   - Verify with `gh pr checks <n>` and by attempting the merge (expect "required statuses must pass").
4. **Cancellation proof:** push two commits quickly to a PR branch. Expected: the first run is cancelled by `cancel-in-progress`; the second completes. On `main`, push twice quickly: expected both run to completion (no cancel) and never a partially-deployed state.
5. **Main pipeline + deploy:** merge a green PR. Expected order: `build` finishes -> `e2e` and `web-vitals` start; `prebuild` finishes early; `main-ok` green; `deploy` runs `vercel deploy --prebuilt --prod` and writes the deployment URL to the job summary.
6. **Web Vitals hard-fail drill:** on a scratch main run, temporarily set `largest-contentful-paint` maxNumericValue to `100`. Expected: `web-vitals` fails -> `main-ok` red -> `deploy` skipped (`gh run view` shows deploy not started; no new Vercel deployment). Revert.
7. **e2e hard-fail drill:** temporarily break an e2e assertion. Expected: `e2e` fails -> `main-ok` red -> no deploy.
8. **"Cancelled never deploys":** start a main run, cancel it mid-`e2e`. Expected: `main-ok` is `cancelled` -> `deploy` never runs (guarded by `needs: [main-ok]` and `if: github.event_name == 'push'`), and Vercel shows no new deployment.
9. **No secrets leak:** confirm `deploy`/`prebuild` never echo tokens; `grep` the run logs for the token value.

---

## 7. Ordered implementation tasks

Each task ends with one Conventional Commit. Work on branch `ci/github-actions`.

### Task 1: Add Lighthouse CI dependency and config

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`
- Create: `lighthouserc.json`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `lighthouserc.json` consumed by the `web-vitals` job via `pnpm exec lhci autorun`.

- [ ] **Step 1:** `pnpm add -D @lhci/cli` (pinned in `package.json`).
- [ ] **Step 2:** Create `lighthouserc.json`:
  ```json
  {
    "ci": {
      "collect": {
        "url": ["http://localhost:3000/"],
        "startServerCommand": "pnpm start",
        "startServerReadyPattern": "Ready in",
        "numberOfRuns": 3,
        "settings": { "preset": "desktop", "chromeFlags": "--no-sandbox --headless" }
      },
      "assert": {
        "assertions": {
          "categories:performance": ["error", { "minScore": 0.9 }],
          "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
          "first-contentful-paint": ["error", { "maxNumericValue": 1800 }],
          "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
          "total-blocking-time": ["error", { "maxNumericValue": 200 }],
          "server-response-time": ["error", { "maxNumericValue": 800 }]
        }
      },
      "upload": { "target": "filesystem", "outputDir": ".lighthouseci" }
    }
  }
  ```
- [ ] **Step 3:** Add `.lighthouseci/` to `.gitignore`.
- [ ] **Step 4 (verify):** `pnpm build && pnpm exec lhci autorun`. Expected: 3 runs against `/`, assertions pass or fail with a median table; `.lighthouseci/` populated.
- [ ] **Step 5:** Commit `build(ci): add lighthouse ci config and dependency`.

### Task 2: Composite setup action

**Files:**
- Create: `.github/actions/setup/action.yml`

**Interfaces:**
- Produces: `uses: ./.github/actions/setup` — installs Node 22 + pnpm 10.34.6 + deps with the pnpm store cache. No inputs.

- [ ] **Step 1:** Write the composite action: `pnpm/action-setup@v4` (`run_install: false`), then `actions/setup-node@v4` (`node-version-file: .nvmrc`, `cache: pnpm`), then `run: pnpm install --frozen-lockfile` (`shell: bash`).
- [ ] **Step 2 (verify):** `actionlint .github/actions/setup/action.yml`.
- [ ] **Step 3:** Commit `ci: add pnpm/node setup composite action`.

### Task 3: Reusable checks workflow

**Files:**
- Create: `.github/workflows/checks.yml`

**Interfaces:**
- Produces: reusable workflow callable as `uses: ./.github/workflows/checks.yml`. Jobs: `lint` (`pnpm lint` + `pnpm typecheck`), `unit` (`pnpm test:unit`), `integration` (`pnpm test:int`). Each job: `runs-on: ubuntu-latest`, `timeout-minutes: 10`, `permissions: { contents: read }`, steps = `actions/checkout@v4` -> `.github/actions/setup` -> the script.
- Consumes: Task 2's composite action.

- [ ] **Step 1:** Write `checks.yml` with `on: { workflow_call: {} }` and the three jobs.
- [ ] **Step 2 (verify):** `actionlint .github/workflows/checks.yml`.
- [ ] **Step 3:** Commit `ci: add reusable lint/unit/integration checks workflow`.

### Task 4: PR gate workflow + branch ruleset

**Files:**
- Create: `.github/workflows/ci-pr.yml`
- Manual: repository ruleset (section 4.6)

**Interfaces:**
- Produces: required check name **`pr-ok`**.
- Consumes: Task 3's `checks.yml`.

- [ ] **Step 1:** Write `ci-pr.yml`:
  - `on: pull_request: { branches: [main] }`
  - `concurrency: { group: pr-${{ github.ref }}, cancel-in-progress: true }`
  - `permissions: { contents: read }`
  - job `checks`: `uses: ./.github/workflows/checks.yml`
  - job `pr-ok`:
    ```yaml
    pr-ok:
      if: always()
      needs: [checks]
      runs-on: ubuntu-latest
      timeout-minutes: 5
      steps:
        - name: Fail if any check failed or was cancelled
          if: ${{ contains(needs.*.result, 'failure') || contains(needs.*.result, 'cancelled') }}
          run: exit 1
    ```
- [ ] **Step 2 (verify):** `actionlint .github/workflows/ci-pr.yml`; push the branch, open a PR, confirm `pr-ok` reports.
- [ ] **Step 3:** Apply the `main` ruleset requiring only `pr-ok` (section 4.6).
- [ ] **Step 4:** Commit `ci: add PR gate with required pr-ok check`.

### Task 5: Make e2e reusable against a prebuilt app

**Files:**
- Modify: `playwright.config.ts`

- [ ] **Step 1:** Change `webServer.command` to `process.env.CI ? 'pnpm start' : 'pnpm build && pnpm start'`.
- [ ] **Step 2 (verify):** Local: `pnpm build && CI=1 pnpm test:e2e` uses the existing `.next` (no rebuild) and passes. Without `CI`, still builds+starts.
- [ ] **Step 3:** Commit `test(e2e): start from prebuilt .next in CI`.

### Task 6: Main pipeline — checks, build, e2e shard-ready

**Files:**
- Create: `.github/workflows/ci-main.yml`

**Interfaces:**
- Consumes: `checks.yml` (Task 3), composite action (Task 2), modified Playwright config (Task 5), `.next` cache key.
- Produces: `build` uploads artifact `next-build` (paths `.next`, `public`; `include-hidden-files: true`; `retention-days: 1`). `e2e` consumes it via `actions/download-artifact@v4`.
- Produces: gate job `main-ok`.

- [ ] **Step 1:** Write `ci-main.yml`:
  - `on: push: { branches: [main] }`
  - `concurrency: { group: main, cancel-in-progress: false }`
  - `permissions: { contents: read }`
  - job `checks`: `uses: ./.github/workflows/checks.yml`
  - job `build`: `actions/cache@v4` for `.next/cache` (key `${{ runner.os }}-next-${{ hashFiles('pnpm-lock.yaml') }}-${{ github.sha }}`, restore-keys `...-${{ hashFiles('pnpm-lock.yaml') }}-`, `...-`), then `pnpm build`, then `actions/upload-artifact@v4` (`name: next-build`, `path: | .next\npublic`, `include-hidden-files: true`, `retention-days: 1`).
  - job `e2e`:
    ```yaml
    e2e:
      needs: [build]
      runs-on: ubuntu-latest
      timeout-minutes: 20
      strategy:
        fail-fast: false
        matrix:
          shard: [1]          # bump to [1,2,3,4] when the suite grows
    ```
    steps: `actions/checkout@v4`; `actions/cache@v4` for `~/.cache/ms-playwright` (key on `hashFiles('pnpm-lock.yaml')`); `.github/actions/setup`; `pnpm exec playwright install --with-deps chromium firefox webkit`; `actions/download-artifact@v4` (`name: next-build`); `pnpm exec playwright test --shard=${{ matrix.shard }}/${{ strategy.job-total }}`; on failure `actions/upload-artifact@v4` of `playwright-report/`.
  - job `main-ok`: `if: always()`, `needs: [checks, build, e2e]`, same failure/cancelled guard as `pr-ok`.
- [ ] **Step 2 (verify):** `actionlint .github/workflows/ci-main.yml`.
- [ ] **Step 3:** Commit `ci: add main pipeline with build and shard-ready e2e`.

### Task 7: Web Vitals job wired into the main gate

**Files:**
- Modify: `.github/workflows/ci-main.yml`

**Interfaces:**
- Consumes: `build` artifact `next-build`, Task 1's `lighthouserc.json`.
- Produces: job `web-vitals`; `main-ok.needs` gains `web-vitals`.

- [ ] **Step 1:** Add job `web-vitals`: `needs: [build]`, `timeout-minutes: 15`; checkout, `.github/actions/setup`, `actions/download-artifact@v4` (`next-build`), optional warm-up (`for i in 1 2 3; do curl -sf localhost:3000/ >/dev/null || true; done` after a background start, or rely on `startServerReadyPattern`), `pnpm exec lhci autorun`; on failure upload `.lighthouseci/` (`if: failure()`, `retention-days: 5`); append the LHCI median summary to `$GITHUB_STEP_SUMMARY`.
- [ ] **Step 2:** Add `web-vitals` to `main-ok.needs`.
- [ ] **Step 3 (verify):** `actionlint`; run the deliberate-threshold failure drill (section 6.6) on a scratch branch.
- [ ] **Step 4:** Commit `ci: add blocking web vitals gate`.

### Task 8: Vercel deploy — prebuild + production deploy

**Files:**
- Create: `vercel.json`
- Modify: `.github/workflows/ci-main.yml`

**Interfaces:**
- Produces: job `prebuild` (artifact `vercel-output`, path `.vercel/output`, `include-hidden-files: true`, `retention-days: 1`); job `deploy` (`needs: [main-ok, prebuild]`, `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`, `environment: production`, own `concurrency: deploy-production` with `cancel-in-progress: false`).
- Consumes: secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

- [ ] **Step 1:** Create `vercel.json` = `{ "git": { "deploymentEnabled": false } }`.
- [ ] **Step 2:** Add job `prebuild` in parallel with `checks`/`build`: checkout + `.github/actions/setup` + `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` env + `pnpm dlx vercel@latest pull --yes --environment=production --token=$VERCEL_TOKEN` + `vercel build --prod --token=$VERCEL_TOKEN` + upload `.vercel/output`.
- [ ] **Step 3:** Add job `deploy`: download `vercel-output`; `pnpm dlx vercel@latest deploy --prebuilt --prod --token=$VERCEL_TOKEN | tee deploy-url.txt`; write the URL to `$GITHUB_STEP_SUMMARY`; delete `deploy-url.txt`.
- [ ] **Step 4 (verify):** `actionlint`; push a green main; confirm deploy URL in the summary and a new production deployment in Vercel.
- [ ] **Step 5:** Commit `ci: deploy prebuilt vercel output after main gate`.

### Task 9: Documentation

**Files:**
- Modify: `docs/architecture/09-git-docker-quality.md`, `docs/DECISIONS.md`, `README.md`

- [ ] **Step 1:** Add a CI/CD section to `docs/architecture/09-git-docker-quality.md`: pipeline diagram, required check `pr-ok`, secrets, ruleset.
- [ ] **Step 2:** Add one `docs/DECISIONS.md` entry summarizing the decisions table (section 5) and the "main can go red" limitation.
- [ ] **Step 3:** Add a README "CI/CD" section: required checks, Vercel secrets setup, how to read Web Vitals failures, how to add PR previews later (set `deploymentEnabled` back or add a preview workflow).
- [ ] **Step 4:** Commit `docs(ci): document github actions pipeline and deploy`.

### Task 10: Verification pass and cleanup

- [ ] **Step 1:** Run the full section-6 verification plan end to end on the branch/PR.
- [ ] **Step 2:** Fix any `actionlint` or run-log issues.
- [ ] **Step 3:** Commit `chore(ci): verify pipeline drills` (only if changes were needed).

---

## Self-review

- **Spec coverage:** all sections A–E map to tasks: A -> Tasks 2–4; B -> Tasks 3, 5, 6; C -> Tasks 1, 7; D -> Task 8; E spread across all (composite, caching, concurrency, timeouts, permissions, artifacts, pinning).
- **Type consistency:** check names (`pr-ok`, `main-ok`), artifact names (`next-build`, `vercel-output`), and script names match across tasks.
- **Proportion:** plan includes only the decisions and the critical YAML; bodies of trivial steps left to the implementer.
