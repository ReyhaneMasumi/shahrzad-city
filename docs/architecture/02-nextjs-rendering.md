# 02 — Next.js 16 Rendering (Cache Components, PPR, dynamic)

Read the bundled docs before coding: `node_modules/next/dist/docs/`. Rules below are a checklist, not a replacement.

## Mental model
- When the installed Next.js version supports Cache Components and the project adopts it, routes can combine prerendered/cached content with request-time content behind Suspense. Treat this as an architectural choice to verify against the installed docs, not a blanket requirement before planning.
- Nothing is cached unless you opt in with `'use cache'`.
- Anything that reads **runtime data** (`cookies()`, `headers()`, `searchParams`, uncached `fetch`/network, `Math.random`, `Date.now`) must be inside a `<Suspense>` boundary, or be moved into a `'use cache'` function. Otherwise the build errors.

## Configuration
```ts
// next.config.ts (shape only; confirm options in the current docs)
const nextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  output: 'standalone',           // for the Docker image
  images: { remotePatterns: [/* hosts from images.md */] },
};
export default nextConfig;
```
Do **not** add: `experimental.ppr`, `experimental.dynamicIO`, `export const dynamic`, `export const revalidate`, `export const fetchCache`, `runtime = 'edge'`.

## Decision table for each piece of UI
| Question | Answer → pattern |
| --- | --- |
| Same for every visitor, changes rarely (static chrome, footer links) | Server Component in the static shell |
| Same for every visitor, changes sometimes (home sections, banners from the mock API) | `'use cache'` function + `cacheLife` + `cacheTag`, called from a Server Component, wrapped in `<Suspense>` |
| Depends on the request (auth cookie, user) | Read inside `<Suspense>`; never at layout top level |
| Needs live refresh, focus revalidation, client interactivity | Server fetch for first paint, pass `fallback` to SWR, SWR revalidates on the client |
| Needs browser APIs, state, effects, event handlers | Small `'use client'` leaf |

## Pattern: cached server data + SWR hydration
1. `getHomeSections()` (server only) is a `'use cache'` function that calls the shared Axios server instance.
2. The page renders `<Suspense fallback={<HomeSectionsSkeleton />}>` around a Server Component that awaits the data.
3. The Server Component renders `<SWRConfig value={{ fallback: { [key]: data } }}>` and a client section tree.
4. Client hooks use the same SWR key, so there is no second request at hydration and revalidation still works.

## Required route files
`layout.tsx` (async-safe, RTL `<html lang="fa" dir="rtl">`), `page.tsx`, `loading.tsx`, `error.tsx` (client), `not-found.tsx`, `global-error.tsx`.

## Async request APIs
`params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` are async. Always `await` them. Type props with the generated `PageProps`/`LayoutProps` helpers when available (check docs).

## Network boundary
`middleware.ts` is gone. Use `proxy.ts` (Node runtime) only if request-level logic (redirects, auth gate, headers) is needed.

## Invalidation
`cacheTag` on cached functions. In Server Actions use `updateTag` (read-your-writes) or `revalidateTag(tag, profile)` (second argument is required). Never use `unstable_cache`.

## Verification
- `pnpm build` prints the route table. The homepage must show as partially prerendered.
- With `next-devtools` MCP: `get_errors`, route listing, logs while the dev server runs.
- If the build says "Uncached data was accessed outside of Suspense", fix the boundary. Do not silence it.
