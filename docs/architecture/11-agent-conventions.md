# 11. Agent Conventions and External Standards

## Source hierarchy

1. Challenge requirements and repository contracts.
2. Version-matched Next.js bundled docs.
3. Official documentation for installed libraries.
4. Project architecture documents.
5. Airbnb React/JSX conventions as a secondary style reference.
6. General engineering judgment.

## Airbnb React baseline

Use the current Airbnb React/JSX guide for naming, JSX readability, one-primary-component-per-file, props, spacing, and component structure. Modern React and this project's TypeScript/Next.js rules override legacy class-component recommendations.

Source: https://github.com/airbnb/javascript/tree/master/react

## Next.js agent workflow

The official Next.js AI Agents guidance says agents should use the version-matched docs bundled inside `node_modules/next/dist/docs/`. Skills should contain workflows that are too detailed for always-loaded rules, while AGENTS.md keeps concise guardrails.

Source: https://nextjs.org/docs/app/guides/ai-agents
Source: https://github.com/vercel/next.js/tree/canary/skills

## Local OpenCode skills

- `airbnb-react-conventions`
- `next-dev-loop`
- `next-cache-components-adoption`
- `next-cache-components-optimizer`
- `next-partial-prefetching-adoption`

These are adaptations for this project. They reference the official Next.js skills and must be rechecked after Next.js upgrades.
