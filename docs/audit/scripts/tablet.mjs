// Tablet layout probe.
export default async function run(page, ui) {
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4500)

  const base = await page.evaluate(() => {
    const bx = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
    const st = (el, props) => { const s = getComputedStyle(el); const o = {}; for (const p of props) o[p] = s.getPropertyValue(p); return o }
    const html = document.documentElement
    const breakpoints = [...document.querySelectorAll('[class*="breakpoint"]')].map((e) => ({ cls: (typeof e.className === 'string' ? e.className : '').slice(0, 50), visible: e.getBoundingClientRect().width > 0 }))
    // which breakpoint wrapper is visible
    const visibleRoot = [...document.querySelectorAll('[class*="breakpoint__"]')].filter((e) => e.getBoundingClientRect().width > 100 && e.getBoundingClientRect().height > 300)[0]
    const scrollers = [...document.querySelectorAll('*')].filter((el) => {
      const s = getComputedStyle(el)
      return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 5
    }).map((el) => ({ cls: (typeof el.className === 'string' ? el.className : '').slice(0, 55), box: bx(el), max: el.scrollHeight - el.clientHeight, top: Math.round(el.scrollTop) }))
    // nav present?
    const nav = [...document.querySelectorAll('div')].find((e) => (e.innerText || '').includes('کیف پول') && (e.innerText || '').includes('خدمات') && e.getBoundingClientRect().height < 130 && e.children.length < 8)
    const headerCandidates = [...document.querySelectorAll('div')].filter((e) => {
      const r = e.getBoundingClientRect()
      return r.y < 10 && r.width > 600 && r.height < 200
    }).map((e) => ({ cls: (typeof e.className === 'string' ? e.className : '').slice(0, 55), box: bx(e), bg: getComputedStyle(e).backgroundImage.slice(0, 60), pos: getComputedStyle(e).position })).slice(0, 6)
    const tiles = [...document.querySelectorAll('a[class*="col-span"]')].filter((a) => a.getBoundingClientRect().width > 30 && a.getBoundingClientRect().height > 50).slice(0, 8).map((a) => {
      const lbl = a.querySelector('p')
      const icon = a.querySelector('[class*="rounded-16"]')
      return { txt: (a.innerText || '').replace(/\s+/g, ' ').slice(0, 16), box: bx(a), icon: icon ? bx(icon) : null, label: lbl ? { size: getComputedStyle(lbl).fontSize, weight: getComputedStyle(lbl).fontWeight } : null }
    })
    return { vp: [innerWidth, innerHeight], breakpoints: breakpoints.slice(0, 14), visibleRootCls: visibleRoot ? visibleRoot.className.slice(0, 40) : null, scrollers, nav: nav ? nav.className.slice(0, 40) : null, headerCandidates, tiles, htmlLang: html.lang, docH: document.documentElement.scrollHeight }
  })

  // scroll to bottom, footer behavior
  await page.evaluate(() => {
    const sc = [...document.querySelectorAll('*')].find((el) => {
      const s = getComputedStyle(el)
      return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 5
    })
    if (sc) sc.scrollTop = sc.scrollHeight
    else window.scrollTo(0, document.documentElement.scrollHeight)
  })
  await page.waitForTimeout(1200)
  const bottom = await page.evaluate(() => {
    const bx = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
    const footerish = [...document.querySelectorAll('div')].filter((e) => {
      const r = e.getBoundingClientRect()
      const s = getComputedStyle(e)
      return (s.position === 'fixed') && r.width > 600
    }).map((e) => ({ cls: (typeof e.className === 'string' ? e.className : '').slice(0, 55), box: bx(e), transform: getComputedStyle(e).transform, opacity: getComputedStyle(e).opacity, txt: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 60) }))
    const nav = [...document.querySelectorAll('div')].find((e) => (e.innerText || '').includes('کیف پول') && (e.innerText || '').includes('خدمات') && e.getBoundingClientRect().height < 130 && e.children.length < 8)
    const tiles = [...document.querySelectorAll('a[class*="col-span"]')].filter((a) => a.getBoundingClientRect().width > 30 && a.getBoundingClientRect().height > 50).slice(0, 8).map((a) => (() => { const r = a.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] })())
    return { footerish, nav: nav ? bx(nav) : null, tiles }
  })

  return { base, bottom }
}