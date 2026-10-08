# Visual Findings — Shahrzad Homepage (measured, 2026-10-08)

Computed-style measurements from the reference site (`/home`, authenticated) taken
from the render tree at 360×800 (mobile), 768×1024 (tablet), 1440×900 (desktop).
All values are pixels and RGB from `getComputedStyle`. Screenshots that back these
numbers live in `visuals/`.

> This model has no image input; the layout is reconstructed from element bounding
> boxes and computed styles. Open the listed screenshots in a vision model to
> confirm shading, gradients, shadows and illustration details.

## Color tokens (reference)

| Token | Value | Used for |
| --- | --- | --- |
| `--color-primary-brand` / `--color-primary` | `#307FE2` | header bg, bottom band, bottom-nav item accents, "see all" |
| content text | `#1C1C1C` | titles, body, desktop tile labels |
| tile label (mobile) | `#000000` | 10px tile labels |
| tile icon circle | `#F7F7F7` (`neutral-5`/`neutral-3`) | 64×64 rounded-16 squircle |
| bottom nav QR button bg | `#EAF2FC` | 70×70 circle |
| section divider | `bg-stroke-neutral-2` (`h-px`) | between title and "see all" |
| body background | `#FFFFFF` | with white→transparent gradient on desktop content |

## Typography

| Element | Size / Weight / Color | Line-height |
| --- | --- | --- |
| body | 14px / 400 / #1C1C1C | 22px |
| section title (خدمات شهرزاد) | 14px / 700 / #1C1C1C | 22px |
| "مشاهده همه" (desktop span / mobile button) | 12px / 500 / #307FE2 | 19px |
| desktop tile label | 14px / 500 / #1C1C1C | — |
| mobile tile label | 10px / 500 / #000000 | — |
| footer links | 12px / 400 / #FFFFFF | — |
| header links (desktop) | — white | — |

Fonts loaded by the reference site: IRANSans FaNum Regular (400), Medium (500),
Bold (700) `.ttf` files — matches `fonts.md` exactly. Plus Swiper-icons.

## Desktop (1440×900)

| Section | Bounding box | Notes |
| --- | --- | --- |
| Header | `[0,0,1440,136]` | bg `background-header-desktop.svg`; inner row max-w 1200 h74, white |
| Hero swiper slide | `[282,100,876,353]` | 1 slide (static), RTL, 2 arrows, 1 bullet |
| Section head | `[282,497,876,22]` | title y497; see-all `[282,499,62,19]` |
| Tile grid | `[282,535,876,672]` | `grid-template-columns:219px×4`; 6 rows ×112 |
| Tile cell | 219×112 | icon-circle 64, img 40, label 14/500 |
| Footer spacer | `[282,1207,876,300]` | empty (footer is fixed) |
| Footer | fixed `[0,922,1440,278]` hidden (translateY 300/op 0) → shown y622 | blue bottom band `[0,787,1440,113]` #307FE2 |
| Scroll container | `[270,88,900,810]` | overflowY auto, max 621 |

## Tablet (768×1024)

| Section | Bounding box | Notes |
| --- | --- | --- |
| Header | h-200 bg + top row `[21,0,726,84]` | same medium-down shell as mobile |
| Scroll container | `[17,152,734,872]` | rounded-40, max 735 |
| Tile grid | 4 cols, cells 178×86 | x: 29, 207, 384, 562; pitch 102 |
| Bottom nav | fixed h92, white pill `[23,~,~,48]` | z 2000 |

## Mobile (360×800)

| Section | Bounding box | Notes |
| --- | --- | --- |
| Header bg | `[0,0,360,200]` #307FE2 + svg, rounded-b-2xl | translateY −80 on scroll |
| Top row | h 84→64 | person-icon / logo / bell+QR; pb 20→0 |
| Wallet module | `[21,84,318,48]` | کیف پول / مشاهده موجودی ▸ |
| Hero | `[29,164,302,150]` | img h122 |
| Section head | `[29,330,302,20]` | H3 + divider + button |
| Tile grid | `[29,366,302,610]` | 4 cols, cells 76×86, x: 29/105/180/256, pitch 101 |
| Tile | 76×86 | icon 64, img 40, label 10px below |
| Misc swiper strip | `[29,1000,302,28]` | thin banner slot |
| Back-to-top | `[29,1044,113,40]` | in-flow ant-btn rounded-12 |
| Footer spacer | `[29,1108,302,221]` | invisible |
| Bottom nav | fixed `[-1,708,360,92]` | pill `[23,732,312,48]` white + QR circle 70 |

## Interactions / animation

- Desktop footer reveal: translateY 300→0 + opacity, `transform .2s ease-in-out`, `opacity .1s`.
- Mobile header shrink: `translate-y-[-80px]` 200ms ease-in-out on the bg + padding-bottom collapse on the top row.
- Tile hover: image `transition-[opacity,filter] .2s` (dims/filter).
- Back-to-top: instant scroll of the inner container to top.

## Definition-of-done checkpoints for the rebuild (visual)

1. 4-column tile grid at all 3 viewports (76px mobile / 178px tablet / 219px desktop cells) — grid stays 4 columns.
2. 10px mobile tile labels must be raised to ≥12px (a11y `M1`), keeping the same centered layout.
3. Primary color decisions: reference uses `#307FE2` everywhere; fix contrast with `#1C66C1` for text-on-white per audit `M2/M4`.
4. Header: desktop 136px svg backdrop; mobile 200px colored header + 80px shrink animation.
5. Footer only on desktop, fixed, slides up on scroll; bottom nav + back-to-top only on mobile/tablet.