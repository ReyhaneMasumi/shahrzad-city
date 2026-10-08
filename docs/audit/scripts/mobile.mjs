// Mobile layout probe: header, hero, tiles, bottom nav, back-to-top, header shrink, scroll.
export default async function run(page, ui) {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4500)

  const grab = () => page.evaluate(() => {
    const bx = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
    const st = (el, props) => { const s = getComputedStyle(el); const o = {}; for (const p of props) o[p] = s.getPropertyValue(p); return o }
    const root = document.querySelector('.breakpoint__small-down') || document.querySelector('.breakpoint__tablet') || document.querySelector('[class*="breakpoint"]') || document.body
    const html = document.documentElement
    const bodyOverflow = getComputedStyle(document.body).overflow
    // find scroll container
    const scrollers = [...document.querySelectorAll('*')].filter((el) => {
      const s = getComputedStyle(el)
      return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 5
    }).map((el) => ({ cls: (typeof el.className === 'string' ? el.className : '').slice(0, 50), box: bx(el), scrollH: el.scrollHeight, clientH: el.clientHeight, top: Math.round(el.scrollTop) }))

    // header
    const header = [...document.querySelectorAll('header,[class*="header"],[class*="Header"]')].find((e) => e.getBoundingClientRect().width > 50) || root.children[0]
    return {
      vpWait: { w: innerWidth, h: innerHeight },
      rootCls: root.className,
      htmlLang: html.lang, htmlDir: html.dir,
      bodyOverflow, scrollers, docScrollH: document.documentElement.scrollHeight,
      header: header ? { cls: header.className.slice(0, 60), box: bx(header), style: st(header, ['position', 'height', 'background-color', 'background-image', 'z-index', 'transition', 'transform']), html: header.outerHTML.slice(0, 700) } : null,
      fixedBottom: [...document.querySelectorAll('div,nav,a,button')].filter((el) => {
        const s = getComputedStyle(el)
        const r = el.getBoundingClientRect()
        return s.position === 'fixed' && r.top > innerHeight - 140 && r.width > 100
      }).map((el) => ({ cls: (typeof el.className === 'string' ? el.className : '').slice(0, 60), box: bx(el), txt: (el.innerText || '').replace(/\s+/g, ' ').slice(0, 60), z: getComputedStyle(el).zIndex, html: el.outerHTML.slice(0, 700) })),
      headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => h.tagName + ':' + (h.innerText || '').replace(/\s+/g, ' ').slice(0, 30)),
      text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 500),
    }
  })

  const top = await grab()

  // scroll down to trigger header shrink + reveal back-to-top
  await page.evaluate(() => {
    const sc = [...document.querySelectorAll('*')].find((el) => {
      const s = getComputedStyle(el)
      return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 5
    })
    if (sc) sc.scrollTop = sc.scrollHeight
    else window.scrollTo(0, document.documentElement.scrollHeight)
  })
  await page.waitForTimeout(1200)
  const scrolled = await grab()

  // middle scroll (to check header shrink state)
  await page.evaluate(() => {
    const sc = [...document.querySelectorAll('*')].find((el) => {
      const s = getComputedStyle(el)
      return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 5
    })
    if (sc) sc.scrollTop = Math.round(sc.scrollHeight * 0.5)
  })
  await page.waitForTimeout(1200)
  const middle = await grab()

  return { top, middle, scrolled }
}