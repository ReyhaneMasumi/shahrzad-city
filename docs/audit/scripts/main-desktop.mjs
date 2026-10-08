// Full ordered dump of the /home main content with geometry, classes, and key styles.
export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4500)

  const d = await page.evaluate(() => {
    const bx = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
    const st = (el, props) => { const s = getComputedStyle(el); const o = {}; for (const p of props) o[p] = s.getPropertyValue(p); return o }
    const root = document.querySelector('.breakpoint__large-up') || document.body
    const main = root.children[1]

    const sections = []
    for (const child of main.querySelectorAll('*')) {
      if (child.children.length === 0) continue
      const s = getComputedStyle(child)
      const r = child.getBoundingClientRect()
      if (r.width < 20 || r.height < 20) continue
      const txt = (child.innerText || '').replace(/\s+/g, ' ').trim()
      if (!txt) continue
      sections.push({
        cls: (typeof child.className === 'string' ? child.className : '').slice(0, 55),
        box: bx(child), txt: txt.slice(0, 110),
        bg: s.backgroundImage.slice(0, 70), font: s.fontSize + '/' + s.fontWeight,
      })
    }

    // tiles in the "خدمات شهرزاد" area — closest visuals
    const gridEls = [...main.querySelectorAll('a')].slice(0, 30).map((a) => {
      const img = a.querySelector('img')
      const lbl = a.querySelector('p') || a.querySelector('span')
      const s = getComputedStyle(a)
      return {
        txt: a.innerText.replace(/\s+/g, ' ').trim().slice(0, 22), href: a.getAttribute('href'),
        box: bx(a), bg: s.backgroundColor, shadow: !!s.boxShadow && s.boxShadow !== 'none',
        gridCol: s.gridColumn, radius: s.borderRadius,
        img: img ? { http: img.currentSrc.slice(0, 60), box: bx(img) } : null,
        label: lbl ? { size: getComputedStyle(lbl).fontSize, w: getComputedStyle(lbl).fontWeight, color: getComputedStyle(lbl).color } : null,
      }
    })

    // wallet card near top
    const wallet = [...main.querySelectorAll('*')].find((e) => (e.innerText || '').includes('مشاهده موجودی'))
    const walletInfo = wallet ? (() => {
      const w = wallet.closest('a') || wallet.closest('div')
      const box = bx(w)
      const s = getComputedStyle(w)
      return { cls: (typeof w.className === 'string' ? w.className : '').slice(0, 60), box, bg: s.backgroundImage.slice(0, 80), radius: s.borderRadius, txt: w.innerText.replace(/\s+/g, ' ').slice(0, 60) }
    })() : null

    // "مشاهده همه" link
    const seeAll = [...main.querySelectorAll('a')].find((a) => /مشاهده همه/.test(a.innerText))
    const seeAllInfo = seeAll ? { href: seeAll.getAttribute('href'), box: bx(seeAll), color: getComputedStyle(seeAll).color, size: getComputedStyle(seeAll).fontSize } : null

    // section titles h2/h3 within main
    const heads = [...main.querySelectorAll('h1,h2,h3,h4,h5,h6,span,div')].filter((e) => {
      const t = (e.innerText || '').trim()
      return t === 'خدمات شهرزاد' || t === 'بیشتر از شهرزاد' || /^[^،.\n]{3,24}$/.test(t) && e.children.length < 2
    }).slice(0, 20).map((e) => ({ txt: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 30), cls: (typeof e.className === 'string' ? e.className : '').slice(0, 40), box: bx(e), f: getComputedStyle(e).fontSize + '/' + getComputedStyle(e).fontWeight }))

    return { sections, gridEls, walletInfo, seeAllInfo, heads }
  })

  return d
}