// Mobile header top row (person icon, logo, wallet) + desktop right-side card detail.
export default async function run(page, ui) {
  const results = {}
  for (const [name, w, h] of [['mobile', 360, 800], ['desktop', 1440, 900]]) {
    await page.setViewportSize({ width: w, height: h })
    await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(4500)
    results[name] = await page.evaluate(() => {
      const bx = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
      if (innerWidth < 600) {
        const bg = document.querySelector('.bg-primary-brand')
        const headerInner = document.querySelector('div[class*="px-l"][class*="h-["]')
        const topRow = [...document.querySelectorAll('div')].find((e) => {
          const r = e.getBoundingClientRect()
          return r.y < 60 && r.y >= 0 && r.width > 300 && r.height < 60
        })
        return {
          bg: bg ? { box: bx(bg), cls: bg.className, h: getComputedStyle(bg).height } : null,
          headerInner: headerInner ? { box: bx(headerInner), cls: headerInner.className.slice(0, 60), html: headerInner.outerHTML.slice(0, 2000) } : null,
          topRow: topRow ? { box: bx(topRow), cls: topRow.className.slice(0, 70) } : null,
        }
      } else {
        const right = [...document.querySelectorAll('div')].find((e) => /کیف پول:/.test(e.innerText || '') && e.getBoundingClientRect().width > 200)
        let card = right
        for (let i = 0; i < 6 && card; i++) {
          const s = getComputedStyle(card)
          if (/border-white\/20|bg-white\/10/.test(card.className) || s.backgroundImage !== 'none' || s.borderRadius !== '0px') break
          card = card.parentElement
        }
        return {
          rightBox: right ? bx(right) : null,
          rightHTML: right ? right.outerHTML.slice(400, 2200) : null,
          card: card ? { cls: card.className.slice(0, 70), box: bx(card), html: card.outerHTML.slice(0, 800), style: (() => { const s = getComputedStyle(card); return { bg: s.backgroundColor, border: s.borderTopWidth + ' ' + s.borderTopColor, radius: s.borderRadius, h: s.height } })() } : null,
        }
      }
    })
  }
  return results
}