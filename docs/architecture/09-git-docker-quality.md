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

## CI (GitHub Actions, optional but recommended)
Jobs: install (cache pnpm) → lint → typecheck → test → build → e2e (Playwright container) → docker build (no push). Fail on warnings from the build.

## README (final deliverable)
Sections: overview and screenshots; features; improvements over the original site; tech stack and why; architecture (folder map, component pattern, data flow diagram); run locally; run with Docker (and compose); environment variables table; scripts; testing (3 levels, how to run); performance and SEO results; decisions (link to `docs/DECISIONS.md`); limitations; **AI tools used and the full process** (which tools, for what, how outputs were verified, what was rejected); license/credits.
