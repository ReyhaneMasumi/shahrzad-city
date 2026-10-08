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
- Status: proposed
- Decision: pnpm (fast, strict, Docker-friendly). Confirm in plan.

## D-002 Component logic/UI split
- Status: proposed
- Decision: each component is a pure view file plus a `useX` hook file that owns state, effects and derived values.

## D-003 Tailwind class strategy
- Status: proposed
- Decision: semantic classes in `@layer components` using `@apply`; tokens in `@theme`; `data-*` attributes for variants.

## D-004 Persian copy location
- Status: proposed
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
