# Step A — Reference Investigation Findings (2026-10-08)

Method: authenticated session on `https://web.shahrzadcity.ir/home`; Playwright-driven
DOM + computed-style extraction (this model has no image input, so every number below
was measured from the render tree, not guessed from pixels). Screenshots are captured
under `visuals/` for the vision model to confirm the open visual questions in section 10.

## 1. Document shell

| Property | Value | Notes |
| --- | --- | --- |
| `<html lang>` | `en` | Bug in reference app; rebuilt site must use `fa` |
| `<html dir>` | empty | `direction: rtl` applied on `body` only; rebuilt site uses `dir="rtl"` |
| viewport meta | `width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no` | rebuilt site: drop `user-scalable` / `maximum-scale` |
| body font | IRANSans 14px / 400 / line-height 22px | color `#1C1C1C` |
| Document scroll | disabled (`overflow:hidden` on `body`) | single inner scroll container per breakpoint |
| Headings | mobile: one `H3` (`خدمات شهرزاد`); desktop: **none** | rebuilt site must add `H1` + `H2` hierarchy |

## 2. Breakpoint shells

### `large-up` (desktop, 1440)
- Header `height:136px` (`padding:0 24px 64px`), background image `background-header-desktop.svg`.
- Header row: `max-w-1200 mx-auto h-18.5` (=74px), white text, Ant `ant-row` space-between, RTL.
- Main content card `.sc-ehSCVy` at `[270,88,900,810]`, white→`#FFF` gradient background, **this element scrolls** (`overflowY:auto`, max scroll 621px).
- Content column `[282,100,876,…]` (`max-w-1200 mx-auto`).
- Footer `position:fixed`, `height:278px`, `z-index:1000`. Hidden state `translateY(300px); opacity:0`. Revealed at content scroll bottom `translateY(0); opacity:1` (transition `transform .2s, opacity .1s`). Visible top edge `y=622`.

### `medium-down` (mobile 360 + tablet 768)
- Shell: `flex h-screen flex-col`, bg `h-[200px] rounded-b-2xl` with `bg-primary-brand` (`#307FE2`) plus `background-header.svg`.
- **Header shrink on scroll:** background is translated up `80px` (`translate-y-[-80px]`, 200ms ease-in-out) while the top row's `padding-bottom` collapses `20px → 0` (row height `84px → 64px`). Trigger threshold ≈ 120px of inner scroll.
- Content pulled up over the header via `-mb-7xl` (negative 40px), producing the rounded-header hero overlap.
- Inner scroller: `mx-16 rounded-40 p-12 flex-1` (mobile `[17,152,734,872]` at tablet, max scroll 735px; mobile max 541px).
- Bottom navigation bar (see §7).

## 3. Header

**Desktop**
- Start: logo (`logo.svg`, `<a href=/home>`), then nav list:
  `خدمات شهرزاد ▾` (dropdown trigger) · `سوالات متداول` → `/faq` · `درباره شهرزاد` → `/about-shahrzad`.
- End (`gap-xl`): wallet module `کیف پول:` + `مشاهده ▸` (chevron 20px, links to `/wallet`), then a glass card `rounded-12 min-h-7xl border-white/20 bg-white/10` with notification icon (paper-glass gradient overlay `linear-gradient(135deg, white .1 …)`).

**Mobile / tablet** (RTL)
- Start: person icon (24px, white).
- Center: logo (absolute center).
- End (`gap-m`): notification bell (24px) + QR-code icon (24px).
- Below: wallet module `کیف پول` + `مشاهده موجودی ▸` at `[21,84,318,48]`.

## 4. Hero banner

- Data: `GET /base/api/v2/banners?type=mainPage&platform=pwa` → `data[]` with `{id,name,order,image,url,bannerType,pageChoice,position,target,linkedTile,authMethod}`. Currently **one** banner (id 49, traffic-plan, `static.shahrzadcity.ir/base/banner/B1LyrIbcRf.jpg`, → `/app/vehicle/traffic-plan`).
- Rendered as a **Swiper** (`swiper-horizontal swiper-rtl swiper-initialized`).
- Desktop: `[282,100,876,353]` (image 876 wide), 1 slide, 1 bullet, **2 nav arrows** present.
- Mobile: `[29,164,302,150]`, image height 122px; container radius 8px/30px at different wrappers.
- **Static when 1 banner; carousel whenever the endpoint returns >1.** No autoplay observed with a single item.

## 5. Services section ("خدمات شهرزاد")

Data: `GET /base/api/v3/main-page/apps-nested?platform=pwa` → `{data:{navBar[], services[], main[], wallet[]}}`.
- `main`: 22 flat tiles (fields `id, categoryId, title, type (pwa|shahrzad_pwa|parent_tile), url, icon, order, …`).
- `services`: 10 groups (title + nested tiles) — used by the "services" subpage.
- `navBar` (2) and `wallet` (1) feed the bottom nav and wallet module.

Section header row:
- Desktop title `خدمات شهرزاد` 14px/700 `#1C1C1C`; separator `h-px bg-stroke-neutral-2`; `مشاهده همه` **span** 12px/500 `#307FE2`, pointer → services page.
- Mobile title is `H3` 14px/700; `مشاهده همه` is a **button** 12px/500 `#307FE2` (bg-transparent).

Grid:
- Desktop `[282,535,876,672]`, `grid-template-columns: 219px ×4` (no gap), 22 tiles → 6 rows of `112px`.
- Desktop tile: row layout (icon start / label) ; icon circle `64×64 rounded-16 bg-neutral-3`(`#F7F7F7`) with `corner-shape:squircle`; icon `<img>` 40×40; label 14px/500 `#1C1C1C`; cell margin-bottom `40px`.
- Mobile/tablet: 4 columns; cells `76×86` (mobile) / `178×86` (tablet); column pitch `101px` (mobile) / `102px` (tablet); icon circle 64×64 rounded-16 `#F7F7F7`; `<img>` 40×40; label **10px**/500 `#000` under icon; tile `mb-m`.
- Every tile is an `<a href>` into the matching Shahrzad route (`type` decides client navigation behavior when a page is rebuilt).
- Hover: tile image has `transition-[opacity,filter] duration-200` (dim on hover).

## 6. Footer (desktop only)

- Fixed, `h:278px`, hidden via `translateY(300px)`+`opacity:0`.
- Top content band (165px): brand/app info, social icons; `background-footer` asset.
- Bottom band `[0,787,1440,113]` solid `#307FE2`; 5 white 12px links:
  `درباره شهرزاد`(/about-shahrzad) · `قوانین سایت`(/privacy) · `تماس با ما`(shahrzadcity.ir/contact) · `پرسش های متداول`(/faq) · `اپلیکیشن موبایل`(shahrzadcity.ir/download-app).
- **Mobile/tablet have no footer** — a 221px invisible `footer-spacer` pads the scroller instead.

## 7. Bottom navigation (mobile + tablet only)

- Fixed bar, `height:92px`, `z-index:2000`.
- Inner pill `[23,732,312,48]` white, rounded.
- Items (RTL): `کیف پول` (wallet icon 24 + label; page `/wallet`) · center **QR button** circle `70×70`, `bg #EAF2FC`, QR svg 32×32 `#307FE2` → `/qr-payment` · `خدمات` (icon + label; `/shahrzad-services`).

## 8. Back-to-top (mobile + tablet only)

- **Not a floating button.** An in-flow Ant button `بازگشت به بالا` placed after the grid (`rounded-12`, 40px high), sits above the footer-spacer; clicking it scrolls the inner container back to top. Desktop has none.

## 9. Data & third parties

- `apps-nested` auth: `refresh-token` call to `/user/api/v1/refresh-token` precedes it.
- Wallet balance: `/finance/api/v1/wallet/` plus an external `srv190-apigateway.tehran.ir …/wallet/Balance`.
- Third-party: GTM (`G-S0CK91MHE6`), GA4, Clarity, Sentry.
- Console: 0 errors on all probes; only warnings about a service-worker preload mismatch and an unused `vendor-forms` preload (reference-app noise).
- API paths in `API.md` differ from the live endpoints (`/api/main-page/apps-nested` vs `/base/api/v3/…`, `/api/banners` vs `/base/api/v2/banners`). Decision needed in Step B: keep mock paths and alias, or follow live paths.

## 10. Open visual questions (need a vision model — files ready)

1. `visuals/home--desktop--top.png` — exact hero banner carousel styling, badge/gradient overlays, and the white→? gradient behind the content.
2. `visuals/home--mobile--top.png` — header 200px treatment, hero rounding (8 vs 30px), and whether the wallet card overlaps the hero.
3. `visuals/bottomnav--mobile--shown.png` — pill radius, active-tab color, QR button shadow.
4. `visuals/home--mobile--header-shrink.png` — the 80px header shrink aesthetic (does the logo scale/move?).
5. `visuals/footer--desktop--revealed.png` — footer visual: app icons, divider lines, blue band details.
6. `visuals/home--tablet--top.png` — tile label readability at 10px / 178px cells.

## 11. Screenshots captured (naming: `<section>--<viewport>--<state>.png`)

`home--desktop--top`, `home--desktop--footer-revealed`, `header--desktop--top`,
`footer--desktop--revealed`, `home--tablet--top`, `home--mobile--top`,
`header--mobile--top`, `home--mobile--header-shrink`, `home--mobile--scrolled-bottom`,
`bottomnav--mobile--shown`. (Legacy `shot-home-*.png` removed.)

## 12. Confirmed reference bugs to avoid (see `SHAHRZAD-UI-AUDIT.md`)

Missing landmarks/heading hierarchy, `lang="en"` app shell, user-scalable=no, tiles with
no `alt`, 10px labels, `#307FE2` contrast on white (3.99:1 for 12px links), focus rings removed,
42 of the integer links dead (redirect to `/home` silently).