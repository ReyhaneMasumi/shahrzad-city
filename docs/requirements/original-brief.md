# Original Brief (condensed, authoritative)

Source: the official challenge PDF. This file is always loaded into context. Do not weaken any line.

## Task
Recreate the **complete homepage** of Shahrzad: `https://web.shahrzadcity.ir/home`.
Build it as a **production-ready frontend**.

## Required stack
Next.js 16, React, TypeScript (mandatory), Tailwind CSS, Ant Design, Zustand, SWR, Axios.
Icons: Iconsax (`https://iconsax-react.pages.dev/`).
Font: choose an appropriate one; investigate the reference app and its available resources.

## Scope of the homepage
- Layout and visual design
- Header and navigation
- Tiles
- Banners
- Footer
- Responsive behavior
- Interactions and states
- Motions and animations

## Data and behavior
- Use the **provided mock backend** (given in the technical interview) and reproduce the required homepage behavior with it.
- The reference app contains information and behavior that is not documented. **Investigate and determine what is required.**

## Quality (all mandatory)
- Performance
- SEO
- Responsive design
- Type safety
- Maintainability
- Error and loading states
- Testing

## Docker
- Provide a `Dockerfile` that builds and runs the app in an isolated environment.
- **No secrets in the image.**

## AI usage
- AI coding tools are allowed.
- The author is responsible for all submitted code and must be able to explain implementation and technical decisions.
- The README must name the AI tools used and how they were used, and explain the whole process.

## Submission (Git repository)
- Source code
- `Dockerfile`
- `.env.example` (if required)
- `README.md`: how to run locally and with Docker, required environment variables, important decisions, known limitations

## Evaluation criteria
Visual fidelity, functionality, architecture, TypeScript, performance, SEO, Docker, engineering judgment.

## Interpretation notes (added by the project owner)
- Site is Persian (fa) and RTL. Mobile first. Mobile, tablet and desktop all implemented.
- Desktop: header animates on scroll; footer slides up and is revealed on scroll.
- Mobile: no footer; bottom navigation bar; back-to-top button; header becomes shorter with a short animation.
- Home sections and their content are decided by an API response (`API.md`). Hero banner comes from a second API; one banner is static, several banners form a carousel.
- Three test levels: unit, integration, end-to-end.
- README must also list improvements over the original site.

## Compliance checklist (tick in `docs/PLAN.md` and in the final README)
- [ ] Next.js 16 + React + TypeScript strict + Tailwind + Ant Design + Zustand + SWR + Axios
- [ ] Iconsax icons only
- [ ] Font investigated and justified
- [ ] Header, navigation, tiles, banners, footer
- [ ] Responsive: mobile, tablet, desktop
- [ ] States: hover, focus, active, loading, empty, error
- [ ] Motion: header/footer scroll animation, carousel, reduced-motion support
- [ ] Provided mock backend used
- [ ] Undocumented behavior investigated and written down
- [ ] Performance budget met (see `docs/architecture/07`)
- [ ] SEO: metadata, OG, robots, sitemap, structured data
- [ ] Type safety: no `any`
- [ ] Tests: unit, integration, end-to-end
- [ ] Dockerfile, no secrets in image, `.env.example`
- [ ] README: run locally, run in Docker, env vars, decisions, limitations, AI tools and process, improvements
