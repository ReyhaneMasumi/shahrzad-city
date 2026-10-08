// Mobile detail dump: top area, inner scroller sections, bottom nav, back-to-top.
export default async function run(page, ui) {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4500)

  const top = await page.evaluate(() => {
    const bx = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
    const root = document.querySelector('.breakpoint__medium-down') || document.body
    return {
      rootHTML: root.outerHTML.slice(0, 3200),
      // direct descendants of root
      kids: [...root.children].map((c) => ({ cls: (typeof c.className === 'string' ? c.className : '').slice(0, 70), box: bx(c), txt: (c.innerText || '').replace(/\s+/g, ' ').slice(0, 40), bg: getComputedStyle(c).backgroundImage.slice(0, 60), position: getComputedStyle(c).position })),
    }
  })

  // The inner scroller
  const scrollSnap = await page.evaluate(() => {
    const bx = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
    const sc = [...document.querySelectorAll('*')].find((el) => {
      const s = getComputedStyle(el)
      return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 5 && Math.abs(el.scrollTop) < 500
    })
    if (!sc) return { found: false }
    const out = { found: true, cls: sc.className, scrollH: sc.scrollHeight, clientH: sc.clientHeight }
    out.children = [...sc.children].map((c) => ({
      cls: (typeof c.className === 'string' ? c.className : '').slice(0, 70), box: bx(c),
      txt: (c.innerText || '').replace(/\s+/g, ' ').slice(0, 40), bg: getComputedStyle(c).backgroundImage.slice(0, 60),
    }))
    return out
  })

  // bottom nav full detail
  const nav = await page.evaluate(() => {
    const bx = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
    const el = [...document.querySelectorAll('div')].find((e) => (e.innerText || '').includes('کیف پول') && (e.innerText || '').includes('خدمات') && e.children.length < 8 && e.getBoundingClientRect().height < 120)
    if (!el) return null
    return { cls: el.className, box: bx(el), html: el.outerHTML.slice(0, 2400), style: (() => { const s = getComputedStyle(el); return { display: s.display, position: s.position, bg: s.backgroundColor, bt: s.borderTop, radius: s.borderRadius, shadow: s.boxShadow.slice(0, 60) } })(), items: [...el.querySelectorAll('a,button,div')].filter((i) => i.getBoundingClientRect().width > 30 && i.getBoundingClientRect().height > 20).slice(0, 12).map((i) => ({ tag: i.tagName, cls: (typeof i.className === 'string' ? i.className : '').slice(0, 50), box: bx(i), txt: (i.innerText || '').replace(/\s+/g, ' ').slice(0, 20) })) }
  })

  // back-to-top
  const btt = await page.evaluate(() => {
    const bx = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
    const el = [...document.querySelectorAll('div,button,a')].find((e) => {
      const r = e.getBoundingClientRect()
      const s = getComputedStyle(e)
      return s.position === 'fixed' && r.bottom < 700 && r.height < 60 && r.width < 60 && e.children.length <= 3
    })
    return el ? { cls: el.className.slice(0, 60), box: bx(el), html: el.outerHTML.slice(0, 400), style: (() => { const s = getComputedStyle(el); return { bg: s.backgroundColor, radius: s.borderRadius, shadow: s.boxShadow.slice(0, 60), z: s.zIndex } })() } : null
  })

  return { top, scrollSnap, nav, btt }
}