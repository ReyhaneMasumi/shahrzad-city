// Colors, grid template, header dropdown menu, wallet card style.
export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4500)

  const base = await page.evaluate(() => {
    const bx = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
    const st = (el, props) => { const s = getComputedStyle(el); const o = {}; for (const p of props) o[p] = s.getPropertyValue(p); return o }
    const main = (document.querySelector('.breakpoint__large-up') || document.body).children[1]

    const title = [...main.querySelectorAll('p')].find((e) => (e.innerText || '').trim() === 'خدمات شهرزاد')
    const seeAll = [...main.querySelectorAll('span')].find((e) => (e.innerText || '').trim() === 'مشاهده همه')
    const grid = main.querySelector('.sc-cNulEV') || (title && title.parentElement.parentElement.nextElementSibling)
    const firstTile = main.querySelector('a[class*="text-inherit"] a, a[class*="text-inherit"]') // desktop anchor
    // desktop tile container = hidden lg:block of first desktop tile
    const desktopTile = grid ? grid.querySelector('.hidden.lg\\:block') || null : null
    const mobileTile = grid ? grid.querySelector('.block.lg\\:hidden') || null : null

    const walletSearch = [...document.querySelectorAll('div')].find((e) => /کیف پول:/.test(e.innerText || ''))
    let walletCard = walletSearch
    // ascend to the card with background image
    for (let i = 0; i < 5 && walletCard; i++) {
      const s = getComputedStyle(walletCard)
      if (s.backgroundImage !== 'none' || s.borderRadius !== '0px') break
      walletCard = walletCard.parentElement
    }

    return {
      title: title ? { ...st(title, ['font-size', 'font-weight', 'color']) , box: bx(title)} : null,
      seeAll: seeAll ? { ...st(seeAll, ['font-size', 'font-weight', 'color', 'cursor']) , box: bx(seeAll)} : null,
      grid: grid ? { cls: grid.className, grid: st(grid, ['display', 'grid-template-columns', 'gap', 'row-gap']), box: bx(grid) } : null,
      desktopTile: desktopTile ? { box: bx(desktopTile), style: st(desktopTile, ['height', 'display', 'padding']) } : null,
      mobileTile: mobileTile ? { box: bx(mobileTile), html: mobileTile.outerHTML.slice(0, 500) } : null,
      walletCard: walletCard ? { cls: walletCard.className.slice(0, 60), box: bx(walletCard), style: st(walletCard, ['background-image', 'background-color', 'border-radius', 'padding', 'height', 'box-shadow']), txt: walletCard.innerText.replace(/\s+/g, ' ').slice(0, 50), html: walletCard.outerHTML.slice(0, 700) } : null,
      topStrip: (() => {
        const root = (document.querySelector('.breakpoint__large-up') || document.body).children[0]
        return root ? { html: root.outerHTML.slice(0, 2600) } : null
      })(),
      cssVars: (() => {
        const cs = getComputedStyle(document.documentElement)
        const want = ['--color-primary', '--color-primary-dark', '--color-neutral-3', '--radius-16', '--color-white', '--color-neutral-1', '--color-neutral-2', '--color-neutral-4', '--color-neutral-5']
        const o = {}
        for (const v of want) o[v] = cs.getPropertyValue(v).trim()
        return o
      })(),
    }
  })

  // hover the "خدمات شهرزاد" dropdown and capture the opened menu
  const hover = await page.evaluate(() => {
    const el = [...document.querySelectorAll('div')].find((e) => (e.innerText || '').trim() === 'خدمات شهرزاد' && e.children.length === 0)
    if (!el) return { ok: false }
    el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    return { ok: true }
  })
  await page.waitForTimeout(1200)
  const menu = await page.evaluate(() => {
    const dropdowns = [...document.querySelectorAll('.ant-dropdown, [class*="dropdown-menu"], [role="menu"]')].filter((d) => {
      const s = getComputedStyle(d)
      return s.display !== 'none' && s.visibility !== 'hidden' && d.getBoundingClientRect().width > 50
    }).map((d) => ({ cls: d.className.slice(0, 60), box: (() => { const r = d.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] })(), txt: d.innerText.replace(/\s+/g, ' ').slice(0, 120) }))
    return dropdowns
  })

  return { base, menu }
}