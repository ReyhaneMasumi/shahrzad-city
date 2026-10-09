# Decision Log

Record every non-obvious choice. Keep entries short. The author must be able to explain each one.

Format:

## D-000 Title
- Date: YYYY-MM-DD
- Status: proposed | accepted | superseded by D-xxx
- Context: why a decision was needed (2-3 lines)
- Options: A, B, C with one-line tradeoffs
- Decision: chosen option and the main reason
- Consequences: what becomes easier, harder, or is a known limitation

---

## D-001 Package manager
- Status: accepted 2026-10-08 (→ D-011)
- Decision: pnpm (fast, strict, Docker-friendly).

## D-002 Component logic/UI split
- Status: accepted 2026-10-08
- Decision: each component is a pure view file plus a `useX` hook file that owns state, effects and derived values.

## D-003 Tailwind class strategy
- Status: accepted 2026-10-08
- Decision: semantic classes in `@layer components` using `@apply`; tokens in `@theme`; `data-*` attributes for variants.

## D-004 Persian copy location
- Status: accepted 2026-10-08
- Decision: static UI copy only in `src/shared/i18n/fa.ts`; all other files English.

## D-010 Reference-site audit (Step A) completed
- Date: 2026-10-08
- Status: accepted
- Context: PROMPT.md Step A requires an investigation of the reference site before planning.
- Decision: performed an authenticated DOM/computed-style audit at 360/768/1440 px. Recorded
  structure, geometry, typography, colors, fonts, network calls and scroll behavior in
  `docs/audit/STEP-A-FINDINGS.md` and `docs/audit/visual-findings.md`; kept the existing a11y
  backlog in `docs/audit/SHAHRZAD-UI-AUDIT.md`. Screenshots renamed to `<section>--<viewport>--<state>.png`.
- Consequences: rebuild can be driven by measured numbers; six open pixel-level questions are
  listed in STEP-A-FINDINGS §10 for a vision model.

## D-011 Package manager and Node version
- Date: 2026-10-08
- Status: accepted
- Context: Step B requires a package manager and Node LTS decision.
- Options: pnpm 10 + Node 22 (recommended, matches local v22.13.1); pnpm 8 already installed; Node 24 LTS.
- Decision: pnpm 10 (via corepack) on Node 22 LTS.
- Consequences: fast strict installs; `--frozen-lockfile` in CI/Docker.

## D-012 Icon package
- Date: 2026-10-08
- Status: accepted
- Context: the brief links `iconsax-react.pages.dev`; two npm packages exist: `iconsax-react` (last modified 2022) and `iconsax-reactjs` (republished 2025-04-13). Both are v0.0.8 with peer `react:*`.
- Options: `iconsax-react@0.0.8` (the package behind the brief link); `iconsax-reactjs@0.0.8`.
- Decision: `iconsax-react@0.0.8`, consumed only through a single `Icon` primitive.
- Consequences: if a glyph is missing, map to the closest Iconsax variant inside the primitive.

## D-013 Carousel
- Date: 2026-10-08
- Status: accepted
- Context: several banners must become a carousel; Ant Design `Carousel` (react-slick) vs custom CSS scroll-snap.
- Options: custom CSS scroll-snap (0kb, native RTL, full a11y, matches reference swiper); AntD Carousel (feature-rich, adds bundle, needs RTL tuning).
- Decision: custom scroll-snap carousel for the hero.
- Consequences: single-banner path ships no carousel JavaScript at all.

## D-014 Authentication scope
- Date: 2026-10-08
- Status: accepted
- Context: whether the rebuilt homepage includes login.
- Options: public homepage, no login flow (mock endpoints are public; reference renders for guests); add OTP flow (out of scope, mock has no auth endpoints).
- Decision: public homepage; wallet module links to `/wallet`.
- Consequences: no tokens in the app; simpler Docker and SWR story.

## D-015 Runtime response validation
- Date: 2026-10-08
- Status: accepted
- Context: whether to validate API responses at runtime (zod) or rely on strict TS types.
- Options: no zod (lean stack per brief, strict types cover the contract); zod at the API boundary.
- Decision: no zod by default; revisit only if mapper complexity demands it.
- Consequences: risk of silent drift if the mock backend changes — mitigated by MSW fixtures tied to `API.md`.

## D-016 SEO indexability
- Date: 2026-10-08
- Status: accepted
- Context: the reference is behind login; the rebuild is public. Index or noindex?
- Options: indexable (SEO is a quality criterion); noindex for a throwaway demo.
- Decision: indexable with full metadata/OG/robots/sitemap/structured data; canonical from `NEXT_PUBLIC_SITE_URL`.
- Consequences: `robots.ts`/`sitemap.ts` required in P10.

## D-017 Mock backend contract
- Date: 2026-10-08
- Status: proposed (owner to confirm location)
- Context: `API.md` documents `/api/main-page/apps-nested` and `/api/banners` served by the provided mock backend; the mock is not in this repository.
- Options: in-browser MSW from `API.md` fixtures + slim standalone mock service in compose (default); official mock backend started by the owner.
- Decision: default to MSW + standalone mock service; base URL from `NEXT_PUBLIC_API_BASE_URL` (default `/api`).
- Consequences: swapping the real mock is a one-line env change; documented in README.
