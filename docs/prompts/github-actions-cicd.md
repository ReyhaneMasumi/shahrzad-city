# Prompt — GitHub Actions CI/CD Plan (2026-10-11)

> Source prompt for the CI/CD planning session. Deliverable: an implementation plan only.

Use the superpowers skills for this task: start with the brainstorming skill, then the writing-plans skill. Your deliverable is an implementation PLAN ONLY. Do not create or modify any workflow files until I approve the plan.

## Goal
Plan a GitHub Actions CI/CD setup for this Next.js (App Router) repo with two distinct behaviors:
1. Every branch except main: fast gate (lint, unit, integration) that must pass before merging into main.
2. Main: full pipeline (all tests + Web Vitals gate), maximally parallel, and only if everything is green, deploy to the Vercel project already connected to this repo.


Speed is the top priority: maximum parallelism, minimal waiting, minimal wasted runner minutes.


## Step 0: Inspect the repo first
Before planning, read package.json, the lockfile, next.config.*, playwright/cypress config, test configs, any existing .github/ and vercel.json. Detect the package manager, Node version, script names (lint, typecheck, unit, integration, e2e, build), what services integration tests need (DB, etc.), and how e2e starts the app. Don't assume. If something is ambiguous, ask me at most 3 concise questions, then continue.


## A) Non-main branches (PR gate)
- Run ONLY: lint, unit tests, integration tests, as three parallel jobs. If the repo has a typecheck, run it inside the lint job (do not add a fourth job without telling me). No build, no e2e, no Web Vitals here.
- Trigger design: I want it to run on pushes to any branch except main. Evaluate `push: branches-ignore: [main]` versus `pull_request` (fork PRs, duplicate runs when both are used) and recommend one with justification. The result must attach to the PR's head commit so it can be a required check.
- A single gate job `pr-ok` (`if: always()`, `needs` all three jobs) that fails if any needed job failed or was cancelled. This is the ONLY required check.
- Merge protection: specify the exact GitHub branch protection rule or ruleset for main: require a PR, require status check `pr-ok`, block force pushes, and state whether "require branch up to date" is worth its cost here. Warn about path filters: a required check that never reports blocks merging forever, so avoid path filters or handle them with the gate job.
- Concurrency per ref with cancel-in-progress: true.


## B) Main branch (full pipeline)
- Reuse the same lint/unit/integration definitions through a reusable workflow (`workflow_call`) so the PR gate and main can't drift apart. Decide how to split files (e.g. checks.yml reusable, ci-pr.yml, ci-main.yml) and justify the split; split pipelines only where it genuinely helps.
- Start everything that doesn't depend on build simultaneously: lint(+typecheck), unit, integration, build. Everything that needs the build starts the moment build finishes: e2e (matrix shards) and Web Vitals run in parallel with each other. Only hard dependency: build -> e2e, build -> web-vitals.
- "Run in order of speed": GitHub starts independent jobs concurrently, so state how you will order/size jobs so the critical path (install -> build -> slowest of e2e shard / web-vitals) is as short as possible. Use measured or estimated durations from this repo, choose the e2e shard count so each shard takes about as long as the build, and consider cancelling slower still-running jobs when a fast one fails (evaluate; this is a failure-triggered cancel, not concurrency cancellation).
- e2e: matrix shards (start with 4, justify), fail-fast: false, runs against the built app via `next start`, not the dev server. Download the build artifact instead of rebuilding.
- Final gate job `main-ok` (`if: always()`, `needs` ALL jobs including web-vitals) that fails if anything failed or was cancelled.


## C) Web Vitals gate (main only, blocking)
- Add a job that measures Web Vitals against the production build served with `next start`, and FAILS the pipeline if ANY single metric is outside Google's "good" range. No warnings-only mode. Thresholds: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1, plus FCP <= 1.8s and TTFB <= 0.8s.
- Recommend and justify a tool (default proposal: Lighthouse CI with strict `assert` assertions of level "error"; alternative: Playwright + the `web-vitals` library).
- INP cannot be measured by a plain lab load test. Explicitly decide how you handle it (e.g. TBT as proxy in Lighthouse, and/or a Playwright interaction scenario on key flows using the web-vitals library) and tell me the limitation honestly.
- Pages to test: derive the key routes from the app (home plus the most important routes) and list them for my approval.
- Flakiness is the main risk of a hard-fail gate on shared runners: plan multiple runs per URL with median aggregation, fixed throttling/emulation settings, and a warm-up request. Describe how I'd diagnose a flaky failure (upload the Lighthouse report on failure).
- Evaluate and recommend one: (a) test the local `next start` build in parallel with e2e (fast, but lab numbers differ from Vercel's CDN), or (b) deploy a non-promoted deployment to Vercel and test its URL before promoting (more realistic, but serializes the pipeline and Vercel Deployment Protection needs a bypass token). Default expectation: (a) unless you find a strong reason.


## D) Deployment to Vercel (only when `main-ok` is green, only on main)
- Vercel's automatic Git deployments must be disabled for this project (e.g. `"git": { "deploymentEnabled": false }` in vercel.json or the equivalent project setting), otherwise it deploys on every push regardless of CI. Explain that this also turns off automatic PR previews; preview deployments are out of scope, but note how I could add them later.
- Deploy from GitHub Actions with the Vercel CLI: `vercel pull` -> `vercel build` -> `vercel deploy --prebuilt --prod`.
- `deploy` job: `needs: [main-ok]`, runs only on push to main, uses a GitHub Environment named `production`, and its own non-cancelling concurrency group.
- Latency optimization to evaluate: run `vercel pull` + `vercel build` as a separate job in parallel with the tests, uploading the prebuilt output, so the final deploy job only runs `vercel deploy --prebuilt`. Compare with reusing the existing `next build` artifact, recommend one, and note config/env-var differences between the two builds.
- Required secrets: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID. List exactly how I obtain them (`vercel link` -> .vercel/project.json) and where to store them. List build-time env vars the app needs and where they come from (`vercel pull`).
- Write the deployment URL to the job summary.


## E) Cross-cutting requirements (all mandatory)
- Reusable composite action (.github/actions/setup): setup-node with package-manager cache + frozen-lockfile install.
- Caching: package manager cache, `.next/cache` (key on lockfile + source hash, with restore-keys), Playwright browsers (key on lockfile, install only the browsers used).
- Concurrency: cancel-in-progress for non-main refs, but NEVER cancel in-progress runs on main (it could kill a production deploy).
- `timeout-minutes` on every job; least-privilege `permissions` (contents: read by default, widen per job only if needed).
- Artifacts: short retention, `include-hidden-files: true` for `.next`, upload e2e/Lighthouse reports only on failure.
- Pin third-party actions to major versions or SHAs; no secrets in logs; fork PRs never get secrets.
- State the trade-off of merging very short jobs to save the ~30-40s per-job startup overhead, and recommend based on this repo's durations.


## What the plan must contain
1. Findings from repo inspection (detected scripts, tools, assumptions).
2. Two ASCII job graphs (non-main and main) with the critical path and estimated wall-clock time for each.
3. File-by-file list of what will be created/changed (workflows, reusable workflow, composite action, vercel.json, lighthouse config, playwright config, etc.) with a short description of each.
4. Manual setup steps I must do outside the repo (Vercel token/IDs, secrets, disabling Vercel auto-deploy, branch ruleset requiring only `pr-ok`, GitHub environment).
5. Risks and trade-offs, and decisions made with a one-line justification each. Explicitly cover: e2e and Web Vitals run only after merge to main, so what happens if they fail on main (deploy is blocked but main is red), and your recommendation to mitigate it.
6. A verification plan: actionlint, a test branch/PR, proof that a failing lint/unit/integration blocks merge, proof that a failing e2e or a deliberately failing Web Vitals threshold blocks deploy, proof that cancelled runs never deploy.
7. Small, ordered implementation tasks (TDD-style where applicable) that I can approve one by one.


Stop after presenting the plan and wait for my approval.
