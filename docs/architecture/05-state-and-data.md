# 05 — State and Data (Zustand v5, SWR 2, Axios 1)

## Who owns what
| Kind of state | Owner |
| --- | --- |
| Server data (banners, home sections) | **SWR** (hydrated from server fetch) |
| Client/UI state shared by distant components (menu open, header collapsed, theme) | **Zustand** |
| Local component state (hover, input text) | `useState` inside the component's hook |
| URL state | Next.js router/search params |
Never copy server data into Zustand.

## Request pipeline (use the skill `add-api-endpoint`)
```
API.md contract
  → types/        DTO (wire) + domain types
  → api/          endpoint function (Axios) + SWR key factory
  → hooks/        SWR hook returning a view-model
  → lib/          mapper DTO → domain
  → components/   UI consumes the hook only
  → tests         mapper unit, hook integration with MSW, e2e flow
```

## Axios (`src/shared/api`)
- One factory `createHttpClient(config)`; two instances: browser (`NEXT_PUBLIC_API_BASE_URL` or same-origin proxy) and server (`API_BASE_URL`).
- Typed wrapper functions return `data`, never `AxiosResponse`.
- Interceptors: request (headers, correlation id), response (normalize to `ApiError`). No business logic in interceptors.
- Cancellation with `AbortController` (`signal`). Do not use the removed `CancelToken`.
- Timeout set (for example 10 s). Retries only for idempotent GETs, with a small bounded backoff, in one place.
- Use `axios.isAxiosError` to narrow. UI sees only `ApiError`.

## SWR (`swr` 2.x)
- Key factories per feature: `homeKeys.sections()` returns a stable tuple. Never inline string keys in components.
- Fetcher receives the key and calls the endpoint function with `{ signal }`.
- Global `SWRConfig`: sensible `dedupingInterval`, `revalidateOnFocus` decided per data type (banners: low frequency), `shouldRetryOnError` with bounded `errorRetryCount`, global `onError` for logging only.
- Hooks return a typed view-model `{ data, status, error, isRefreshing, retry }`, not the raw SWR object. This keeps UI independent from SWR (Dependency Inversion).
- Mutations: `useSWRMutation` or Server Actions, with optimistic updates only when the UI benefits.
- Server hydration: `SWRConfig` `fallback` with the same key. Cached server data and SWR share keys.
- Do not use `useEffect` + `fetch/axios` for data.

## Zustand (`zustand` 5)
- Curried create: `create<State>()((set, get) => ({ ... }))`. Named import `{ create }`.
- Selectors always. Use `useShallow` (from `zustand/react/shallow`) when a selector returns a new object/array, otherwise infinite re-render loops happen in v5.
- Keep stores small and by concern (`ui.store.ts`), actions inside the store, state typed with an interface that separates `State` and `Actions`.
- **SSR safety:** do not keep a module-level singleton that stores per-request data. For anything that is initialized on the server, create the store per provider with `createStore` (vanilla) + React context, and pass initial state through props.
- `persist`: only for true preferences, with `skipHydration` and manual rehydrate in an effect to avoid hydration mismatch. Never persist server data or tokens.
- `devtools` only in development.
- Test: reset the store between tests.

## Loading, empty and error states
Every data-driven component renders four states from a discriminated union:
`loading` (skeleton matching final layout, no layout shift), `empty` (explanatory empty state), `error` (message + retry), `success`.
Skeleton dimensions must equal the final content dimensions.

## Configuration and secrets
- `API_BASE_URL` (server), `NEXT_PUBLIC_API_BASE_URL` (browser, non-secret), `NEXT_PUBLIC_SITE_URL` (canonical/OG). Parse in `src/shared/config/env.ts`. Fail fast on invalid env at startup.
- `NEXT_PUBLIC_*` values are inlined at **build** time. For Docker, prefer server-only variables read at runtime, or document build args for public ones.
- Maintain `.env.example` with every variable and a comment. No real values.
