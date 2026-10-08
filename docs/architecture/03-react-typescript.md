# 03 — React 19.2 and TypeScript

## React
- Function components only. No class components.
- **React Compiler status must be verified.** If the project enables React Compiler, avoid manual memoization by habit and follow the installed compiler guidance. If it is not enabled, use `useMemo`, `useCallback`, or `memo` only when API semantics or measured performance justify them.
- `ref` is a normal prop in React 19: do not use `forwardRef`.
- Context is its own provider: `<ThemeContext value={...}>` (no `.Provider`).
- Prefer `use(promise)` / Suspense for async in client trees only when the docs recommend it; SWR is the standard for client data here.
- Use `useActionState`, `useOptimistic`, `useTransition` for mutations and pending UI.
- Use `useEffectEvent` for effect callbacks that must read latest props without re-subscribing (verify availability in the installed React docs).
- Effects are for synchronizing with external systems only (scroll observers, media queries). Not for data fetching, not for derived state.
- Keys: stable ids, never array index for dynamic lists.
- Metadata (`<title>`, `<meta>`) comes from the Next.js Metadata API, not from components.

## TypeScript (`tsconfig`)
`strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, `noImplicitOverride: true`, `verbatimModuleSyntax: true`, `isolatedModules: true`, `noFallthroughCasesInSwitch: true`. Path alias `@/*` → `src/*`.

## Rules
- No `any`. Use `unknown` and narrow. No non-null `!` assertions. No `as` casts except `as const` and narrowly documented boundary casts.
- Discriminated unions for states: `{ status: 'loading' } | { status: 'error'; error: ApiError } | { status: 'empty' } | { status: 'success'; data: T }`. Use exhaustive `switch` with a `never` check.
- Separate wire types (`Dto`) from domain types. A mapper converts one to the other.
- Use `satisfies` for config objects. Use `readonly` and `as const` for constant tables.
- Props: explicit interfaces named `XProps`. Prefer small, focused props. No boolean prop explosions: use a `variant` union.
- Export types with `export type`. Import types with `import type`.
- Env access goes through one typed module `src/shared/config/env.ts`. No `process.env` elsewhere.
- Public functions have TSDoc. Comments explain why.

## Error handling
- `ApiError` class normalizes Axios errors (status, code, message, retryable). UI never inspects raw Axios errors.
- Error boundaries per section so one failing section does not blank the page.
