# 06 — Component Design

## The pattern: view + hook
Every non-trivial component is two files in one folder:

```
HeroBanner/
├─ HeroBanner.tsx        # VIEW: receives props or calls its own hook, renders markup only
├─ useHeroBanner.ts      # LOGIC: data hooks, derived values, handlers, effects
├─ HeroBanner.types.ts   # props and view-model types
└─ HeroBanner.test.tsx   # integration test
```

- The view contains **no** data fetching, no effects, no business conditions beyond choosing which state to render.
- The hook returns a **view-model**: ready-to-render values and handlers (`{ status, banners, activeIndex, goTo, next, prev }`).
- Pure presentational children take props only and never call data hooks. They are reusable and easy to test.
- Pure logic with no React (formatters, mappers, reducers) lives in `lib/` as plain functions.

### Template (view)
```tsx
// HeroBanner.tsx
import type { HeroBannerProps } from './HeroBanner.types';
import { useHeroBanner } from './useHeroBanner';
import HeroBannerSkeleton from './HeroBannerSkeleton';

/** Hero area at the top of the homepage. Renders a single banner or a carousel. */
export default function HeroBanner({ className }: HeroBannerProps) {
  const vm = useHeroBanner();
  switch (vm.status) {
    case 'loading': return <HeroBannerSkeleton />;
    case 'error':   return <HeroBannerError onRetry={vm.retry} />;
    case 'empty':   return null;
    case 'success': return <HeroBannerContent banners={vm.banners} className={className} />;
  }
}
```
(Server-rendered sections may receive data as props from a Server Component instead of calling a client hook; keep the same split: one file renders, another prepares.)

## Primitive vs composite vs feature
| Level | Knows about | Example | Location |
| --- | --- | --- | --- |
| Primitive | design tokens only | `Button`, `Text`, `Skeleton` | `shared/ui` |
| Composite | primitives, generic behavior | `Carousel`, `Drawer`, `Tile` | `shared/ui` or `shared/layout` |
| Feature component | business data and hooks | `HeroBanner`, `AppHeader` | `features/*/components` |
| Page | composition of features | `HomePage` | `features/home` + `app/page.tsx` |

## SOLID applied
- **S** — one reason to change per file: view, hook, mapper, endpoint, store are separate files.
- **O** — extend by composition and variants (`variant`, `slots` via `children`), not by editing primitives for each feature.
- **L** — components with the same props contract are interchangeable (for example `Banner` implementations).
- **I** — small props interfaces; do not pass whole objects when two fields are needed.
- **D** — UI depends on view-model types and hooks, not on SWR or Axios; endpoint functions depend on a typed HTTP client interface.

## Props rules
- Interface named `XProps`, exported with `export type`.
- Accept `className` only when the component is a layout primitive. Prefer variants over arbitrary classes.
- No more than about 7 props; split the component otherwise.
- Event handler props start with `on`. Handlers inside the hook start with `handle`.
- Use `children` and named slot props (`icon`, `actions`) for composition.
- Do not spread unknown props onto DOM nodes unless the primitive is explicitly a wrapper (`ComponentPropsWithoutRef<'button'>`).

## Accessibility baseline
- Landmarks: `header`, `nav` (labelled), `main`, `footer`. Mobile bottom bar is a labelled `nav`.
- Interactive elements are real `button`/`a`. Visible focus ring from tokens. Keyboard operable.
- Carousel: pause on hover/focus, prev/next buttons with accessible names, `aria-roledescription="carousel"`, slide labels `n of m`, no auto-advance when reduced motion is requested.
- Images: meaningful `alt`, decorative images `alt=""`.
- Color contrast at least AA. Do not convey state by color alone.
- Announce async states with `aria-live="polite"` where content changes.

## Client boundary
- Put `'use client'` at the top of the smallest file that needs it (usually the hook consumer or a leaf like the scroll observer).
- Do not mark a whole feature client-side for one `onClick`. Extract the interactive leaf.

## Error and loading
- Each data-driven section has its own `Suspense` + `ErrorBoundary` (`error.tsx` at route level plus component-level boundary for isolated sections).
- Skeletons mirror final geometry. Use the `Skeleton` primitive.

## Anti-patterns (reject in review)
Multiple components in one file; logic in JSX; `useEffect` for fetching or derived state; prop drilling across more than 2 levels (use composition or a small context); long `className` strings; inline styles for static values; index as key; magic numbers (use tokens or named constants); god hooks that do three things.
