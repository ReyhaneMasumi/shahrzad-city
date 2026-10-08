# 10 — Current Docs, MCP Servers, Deprecation Watchlist

Rule: **read the current docs before using an API.** Docs win over memory. Re-check after any dependency upgrade.

## Where to read (in priority order)
| Tool | 1st choice | 2nd choice | Notes |
| --- | --- | --- | --- |
| Next.js 16 | `node_modules/next/dist/docs/` (bundled, version-matched, Next 16.2+) | `https://nextjs.org/docs/app/...` (append `.md` for plain markdown); `next-devtools` MCP | If the bundled docs are missing: `npx @next/codemod@latest agents-md` |
| React 19.2 | `https://react.dev/reference/react` | `context7` | Check release blog for 19.2 additions |
| TypeScript | `https://www.typescriptlang.org/docs/` | `context7` | |
| Tailwind CSS v4 | `https://tailwindcss.com/docs` | `context7` | CSS-first config, `@theme`, `@utility`, logical utilities |
| Ant Design v6 | `antd` MCP (`@ant-design/cli mcp`) | `https://ant.design/llms.txt`, `https://ant.design/docs/react/migration-v6`, `https://ant.design/docs/react/use-with-next` | Community alternative MCP: `@jzone-mcp/antd-components-mcp` |
| Zustand v5 | `context7` | `https://zustand.docs.pmnd.rs` (incl. Next.js guide) | |
| SWR 2.x | `context7` | `https://swr.vercel.app/docs` | |
| Axios 1.x | `context7` | `https://axios-http.com/docs/intro` | |
| Iconsax | package README + icon browser (`https://iconsax-react.pages.dev/`) | `npm view` | Confirm React 19 support |
| Vitest | `https://vitest.dev/guide/` | `context7` | |
| Testing Library | `https://testing-library.com/docs/` | `context7` | |
| MSW | `https://mswjs.io/docs/` | `context7` | |
| Playwright | `https://playwright.dev/docs/intro` | Playwright MCP, test agents | |
| ESLint | `https://eslint.org/docs/latest/` | `context7` | Flat config only |
| Docker | `https://docs.docker.com/` | | |

How to use `context7`: first resolve the library id, then query the topic. Tool names may differ by version; list the tools exposed by the server and use them. Prefer a version-pinned library id that matches the installed version.

## MCP servers and what they give you
| Server | Config key | Use it for | Needs |
| --- | --- | --- | --- |
| Context7 | `context7` (remote `https://mcp.context7.com/mcp`) | Current library docs for any tool in the stack | Optional API key for higher limits: add header `CONTEXT7_API_KEY` = `{env:CONTEXT7_API_KEY}` |
| Next.js DevTools | `next-devtools` (`npx -y next-devtools-mcp@latest`) | Runtime errors, routes, logs, Cache Components guidance from the running dev server (Next 16+ exposes `/_next/mcp`) | Dev server running |
| Ant Design | `antd` (`npx -y @ant-design/cli mcp`) | Component docs, API, examples, changelog; supports `--version <x.y.z>` | none |
| Playwright | `playwright` (`npx -y @playwright/mcp@latest`) | Browser automation, accessibility snapshots (works without vision), screenshots | none |
| Chrome DevTools | `chrome-devtools` (disabled by default) | Performance traces, Lighthouse-style analysis, network and console inspection | Enable when doing the performance pass |

No official MCP exists for Tailwind, Zustand, SWR, Axios, Vitest, MSW or Iconsax. Use `context7` and the doc URLs above.

## Deprecation and removal watchlist (Never write these)
**Next.js 16**
- `middleware.ts` → `proxy.ts` (exported function `proxy`).
- `experimental.ppr`, `experimental.dynamicIO` → `cacheComponents: true`.
- `unstable_cache`, route segment configs `dynamic`, `revalidate`, `fetchCache`, `runtime='edge'` with Cache Components → `'use cache'`, `cacheLife`, `cacheTag`.
- `revalidateTag(tag)` without a profile → `revalidateTag(tag, profile)`; for read-your-writes in Server Actions use `updateTag`.
- Sync access to `params`, `searchParams`, `cookies()`, `headers()` → `await` them.
- `next lint` removed → run ESLint directly (flat config).
- `next/legacy/image`, `images.domains` → `next/image`, `images.remotePatterns`.
- `serverRuntimeConfig` / `publicRuntimeConfig`, AMP → removed.
- Webpack-only config assumptions → Turbopack is the default bundler.
- Parallel routes need explicit `default.tsx`.
- Node 18 unsupported: use a current LTS (Next 16 needs Node >= 20.9).

**React 19**
- `forwardRef`, `Context.Provider`, `defaultProps` on function components, `propTypes`, legacy `ReactDOM.render` → ref as prop, `<Context value>`, default parameters, TypeScript.
- Manual memoization by habit → avoid it when React Compiler is enabled; otherwise verify the installed React guidance and use memoization only when justified.

**Tailwind v4**
- `tailwind.config.js`, `@tailwind base/components/utilities`, `theme()` with dotted paths → `@import "tailwindcss"`, `@theme`, `theme(--breakpoint-xl)` / CSS variables.
- Physical direction utilities in RTL contexts → logical utilities.

**Ant Design v6**
- `@ant-design/v5-patch-for-react-19` → not needed.
- Props and APIs renamed or removed in v6 → read the migration page and fix every console deprecation warning (for example older `visible` → `open` style renames).
- Static `message` / `Modal` / `notification` methods without context → `App.useApp()`.

**Zustand v5**
- `import create from 'zustand'` default import, uncurried `create<T>(...)` → `import { create } from 'zustand'` and `create<T>()(...)`.
- Selectors returning new objects without `useShallow` → infinite loops.

**SWR / Axios**
- `useSWRInfinite`/`mutate` signature drift: read current docs. `CancelToken` in Axios → `AbortController` signal.

**Tooling**
- `jest` for this stack → Vitest. Enzyme → Testing Library. Cypress/Puppeteer → Playwright. `.eslintrc.*` → `eslint.config.mjs`.
- `create-react-app`, `pages/` router, `getServerSideProps` → App Router.

## Process when a deprecation is found
1. Stop and read the replacement docs. 2. Fix in the same task. 3. Add the lesson to this file if it was missing. 4. Mention it in the commit body.

## Official AI-agent guidance

Next.js provides version-matched documentation inside `node_modules/next/dist/docs/` and recommends that coding agents read those docs before coding. The project-level AGENTS.md should point agents at the bundled docs rather than relying on model memory.

Required guide when present:

`node_modules/next/dist/docs/01-app/02-guides/ai-agents.md`

Official guide: https://nextjs.org/docs/app/guides/ai-agents

The current Next.js repository also ships workflow skills. Relevant skills for this project are:

- `next-dev-loop`
- `next-cache-components-adoption`
- `next-cache-components-optimizer`
- `next-partial-prefetching-adoption`

Source: https://github.com/vercel/next.js/tree/canary/skills

Do not copy internal Next.js repository-maintainer skills such as `flags`, `react-vendoring`, `react-sync`, or `v8-jit` into this application project. Those target contributors working inside the Next.js framework repository, not application developers.
