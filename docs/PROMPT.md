# Shahrzad Homepage Rebuild — Planning Session Prompt

> Paste everything below the line into opencode (use the **Plan** agent, switch with `Tab`).
> Fill the two placeholders in section 3 first. Everything else is ready to send.

---

## 0. READ THIS FIRST

- **Current phase: PLANNING ONLY.** Do NOT write application code, do NOT install packages, do NOT scaffold the project. You may only: read files, browse the reference site, take screenshots, and write documentation files (`docs/**`, `visuals/**`).
- Talk to me in **Persian** in chat. Write **every file, comment, commit message and identifier in English**. (Exception: see section 7, rule L2.)
- Work **step by step**. After each step, stop and wait for my confirmation. Never jump ahead.
- If something is ambiguous, ask. Propose a default for every question so I can answer with "ok".
- Your context window is limited (about 200K tokens). Do not load every doc at once. Read `AGENTS.md` first, then only the docs a step needs.

## 1. Mission

Recreate the **complete homepage** of Shahrzad (`https://web.shahrzadcity.ir/home`) as a **production-ready frontend** that is judged on: visual fidelity, functionality, architecture, TypeScript quality, performance, SEO, Docker, and engineering judgment.

The site is **Persian (fa) and right-to-left (RTL)**, and must be **fully responsive, mobile-first** (mobile, tablet, desktop).

The reference app may contain behavior that nobody documented. You are expected to **investigate and decide** what is required, then write it down.

## 2. Files already in the repository (read, do not recreate)

| File / folder                         | Purpose                                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| `AGENTS.md`                           | Your standing rules. Read first.                                                  |
| `docs/requirements/original-brief.md` | The official challenge brief (always loaded).                                     |
| `docs/architecture/*.md`              | Architecture rules, read on demand (index in `docs/README.md`).                   |
| `.opencode/skills/*`                  | Reusable procedures. Load with the `skill` tool before doing the matching task.   |
| `API.md`                              | Mock API contract and sample responses. Source of truth for data.                 |
| `images.md`                           | URLs of background images.                                                        |
| `fonts.md`                            | URLs of fonts.                                                                    |
| `Design.md`, `css-variables.css`      | Existing design notes and tokens. You may improve, rename or move them.           |
| `visuals/`                            | Screenshots of the reference site. File names tell you the section and viewport.  |
| `SHAHZAD-UI-AUDIT.md` (old name)      | Earlier audit. Rename to `docs/audit/SHAHRZAD-UI-AUDIT.md` and keep its findings. |
| Old `AGENTS.md` (if it differs)       | Replaced by the new one. Move its useful audit notes into the audit doc.          |

The provided **mock backend** (from the technical interview) must be used. Find out how it is started and document it. If you cannot find it, ask me.

## 3. Session inputs (fill before sending)

- Ask me for login phone number
- I will give you the OTP **in chat** when you ask. Stop and ask for it. Do not guess it.

**Credential safety:** never write the phone number, OTP, cookies, tokens or Playwright auth state into any tracked file or commit. Keep auth state in `.auth/` (git-ignored).

## 4. Step A — Refresh the reference investigation (only if needed)

Skip this step if `docs/audit/SHAHRZAD-UI-AUDIT.md` and `visuals/` already cover all sections at 3 viewports. Otherwise load the skill `audit-reference-site` and:

1. Log in with the phone above and my OTP. Do not audit the login page.
2. Capture mobile (360x800), tablet (768x1024) and desktop (1440x900), top of page and scrolled states.
3. Record, per section: structure, spacing, typography, colors, icons, images, animations, hover/focus/active/loading/empty/error states, and the network requests that feed it.
4. Record scroll behavior:
   - Desktop: footer slides up and is revealed while scrolling.
   - Mobile: no footer, a bottom navigation bar, a back-to-top button, and the header becomes shorter with a short animation.
5. Record hero banner behavior: one banner is static, several banners form a carousel.
6. Record which font family and weights the site really loads, and compare with `fonts.md`.
7. Save findings to `docs/audit/SHAHRZAD-UI-AUDIT.md`. Save screenshots to `visuals/` named `<section>--<viewport>--<state>.png`.

**Model limitation:** you may not be able to see images. Do not rely on screenshots alone. Use Playwright MCP accessibility snapshots and `browser_evaluate` to read computed styles, bounding boxes and CSS custom properties. If an image really must be interpreted, tell me which file and I will switch to a vision model for that single question.

Commit the audit with a meaningful message. Then stop.

## 5. Step B — Propose structure and tooling (stop for my approval)

Write `docs/PLAN-structure.md` and show me a summary in chat. It must contain:

1. **Folder structure.** Feature-based, matching `docs/architecture/01-project-structure.md`. Show the real tree for this homepage (header, hero banner, home sections/tiles, footer, bottom navigation, back-to-top, shared UI, API layer, styles, tests).
2. **Component pattern.** Logic separated from UI. Confirm the "view component + `useX` hook" pattern, one component per file, one default export per file.
3. **Tailwind class strategy.** No long utility strings in `className`. Confirm the `@layer components` semantic-class approach from `docs/architecture/04-styling-design-system.md`.
4. **Testing tools** for unit, integration and end-to-end. Recommended defaults: Vitest, React Testing Library + MSW, Playwright. Explain tradeoffs in 3 lines each.
5. **Decisions to confirm** (propose defaults, ask me only to confirm):
   - Package manager (default `pnpm`) and Node LTS version.
   - Icon package: the brief links `iconsax-react.pages.dev`, I wrote `iconsax-reactjs`. Run `npm view` on both, check React 19 peer dependency support, and recommend one.
   - Carousel: Ant Design `Carousel` vs a small custom CSS scroll-snap carousel. Judge by bundle size, RTL, and accessibility.
   - Whether authentication is part of the rebuilt app or the homepage can be public (read `API.md`).
   - Whether to add runtime response validation (for example `zod`). It is outside the listed stack, so only propose it.
   - Indexable or `noindex` for SEO.
   - Allowed locations for Persian UI copy (default: only `src/shared/i18n/fa.ts` and test fixtures).

Stop here and wait for my answer.

## 6. Step C — Write the full plan (stop for my approval)

After I confirm Step B, write `docs/PLAN.md`:

1. Findings summary (max 15 lines).
2. Final decisions (table: decision, choice, reason).
3. Phases in execution order. For each phase give: goal, tasks, files touched, skills to load, verification command, commit message, risks. Suggested order:
   1. Repository bootstrap: `git init`, `.gitignore`, `.nvmrc`, tooling, ESLint flat config, Prettier, strict TypeScript.
   2. Next.js 16 app, `cacheComponents`, RTL root layout, fonts (`next/font`), providers.
   3. Design system: tokens, typography, Tailwind layers, Ant Design theme and RTL config.
   4. Primitive components, then composite components.
   5. API layer: Axios client, error normalization, SWR keys, MSW handlers.
   6. Header and footer, including scroll animations and mobile bottom nav and back-to-top.
   7. Hero banner (single and carousel).
   8. Home sections/tiles driven by the API response.
   9. Loading, empty and error states everywhere.
   10. SEO: metadata, Open Graph, robots, sitemap, manifest, structured data.
   11. Tests: unit, integration, end-to-end.
   12. Performance pass (Lighthouse, bundle analysis, LCP image, CLS).
   13. Dockerfile, `.dockerignore`, `.env.example`, compose file with the mock backend.
   14. README, `docs/DECISIONS.md`, AI-usage section.
4. Risk list and open questions.
5. A "brief compliance matrix": every requirement in `docs/requirements/original-brief.md` mapped to the phase that satisfies it.

Stop and wait. Implementation will be requested in a separate message.

## 7. Hard rules (summary; details are in `AGENTS.md`)

- **L1** Latest stable versions of every tool in the stack. Verify with `npm view <pkg> version`. Before using any API, read the current docs (skill `lookup-latest-docs`). If docs and your memory disagree, the docs win. Never use deprecated or removed APIs.
- **L2** No Persian characters anywhere in code, comments, docs, commit messages or tests, except `src/shared/i18n/fa.ts`, test fixtures copied from API responses, and `API.md`.
- **L3** Logic is separated from UI. One component per file. One default export per file. Feature-based folders.
- **L4** Tailwind: no long utility strings in `className`. Use semantic classes in `@layer components`, `@utility`, and tokens from `@theme`. Use logical properties (`ms-*`, `pe-*`, `text-start`) because the site is RTL.
- **L5** Next.js 16 and React 19: follow Cache Components and Partial Prerendering rules. Dynamic data lives inside `<Suspense>`. Server Components by default; `'use client'` only at leaves.
- **L6** Every repeated task has a skill. Use it. If you find a new repeated task, propose a new skill.
- **L7** One meaningful Conventional Commit after every completed task. Never commit secrets. Never push.
- **L8** Must-haves for every change: performance, SEO, responsive design, type safety, maintainability, error and loading states, tests at three levels.
- **L9** Everything runs in Docker with no secrets in the image.
- **L10** The README must credit AI tools and describe the whole process, because I must be able to explain every decision.

## 8. Things you must not do

- Do not implement, scaffold, or install anything in this phase.
- Do not skip a stop point.
- Do not invent API fields. If `API.md` is silent, ask.
- Do not copy the reference site's code or assets blindly. Rebuild from observed behavior.
- Do not paste secrets or personal data into files.
- Do not load all of `docs/` into context. Load on demand.

## 9. Start now

Begin with Step A. First tell me, in Persian and in at most 8 lines, whether the existing audit and screenshots are sufficient, and list the exact gaps you will fill.

**Reminder: PLAN ONLY. Stop after each step.**
