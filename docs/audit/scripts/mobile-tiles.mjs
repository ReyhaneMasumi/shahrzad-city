// Mobile: per-tile boxes, hero banner detail, back-to-top element behavior, section header.
export default async function run(page, ui) {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4500)

  const top = await page.evaluate(() => {
    const bx = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
    const st = (el, props) => { const s = getComputedStyle(el); const o = {}; for (const p of props) o[p] = s.getPropertyValue(p); return o }
    const sc = [...document.querySelectorAll('*')].find((el) => {
      const s = getComputedStyle(el)
      return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 5 && Math.abs(el.scrollTop) < 500
    })
    const tiles = [...sc.querySelectorAll('a[class*="col-span-6"]')].slice(0, 12).map((a) => {
      const img = a.querySelector('img')
      const lbl = a.querySelector('p')
      const iconBox = a.querySelector('[class*="rounded-16"]')
      return {
        txt: (a.innerText || '').replace(/\s+/g, ' ').slice(0, 16), href: a.getAttribute('href'),
        box: bx(a), iconBox: iconBox ? bx(iconBox) : null, iconBg: iconBox ? getComputedStyle(iconBox).backgroundColor : null,
        iconRounded: iconBox ? getComputedStyle(iconBox).borderRadius : null,
        img: img ? { size: [img.naturalWidth, img.naturalHeight], box: bx(img) } : null,
        label: lbl ? { size: getComputedStyle(lbl).fontSize, weight: getComputedStyle(lbl).fontWeight, color: getComputedStyle(lbl).color, box: bx(lbl) } : null,
      }
    })
    // hero banner on mobile
    const hero = [...sc.querySelectorAll('a,div')].filter((e) => e.getBoundingClientRect().height > 100 && e.querySelector('img') && e.getBoundingClientRect().width > 200).slice(0, 3).map((e) => ({
      cls: (typeof e.className === 'string' ? e.className : '').slice(0, 60), box: bx(e), bg: getComputedStyle(e).backgroundImage.slice(0, 60), radius: getComputedStyle(e).borderRadius,
      img: e.querySelector('img') ? { src: e.querySelector('img').currentSrc.slice(0, 70), box: bx(e.querySelector('img')) } : null,
    }))
    // section header row
    const sh = [...sc.querySelectorAll('div')].find((e) => /خدمات شهرزاد/.test(e.innerText || '') && e.getBoundingClientRect().height < 40)
    const shInfo = sh ? { box: bx(sh), html: sh.outerHTML.slice(0, 700) } : null
    // mt-xl element + back-to-top + footer-spacer
    const extra = [...sc.children].filter((c) => c.getBoundingClientRect().y > 990).map((c) => ({ cls: (typeof c.className === 'string' ? c.className : '').slice(0, 70), box: bx(c), txt: (c.innerText || '').replace(/\s+/g, ' ').slice(0, 40), html: c.outerHTML.slice(0, 500), bg: getComputedStyle(c).backgroundImage.slice(0, 50) }))
    // inner scroller padding/bg/radius
    const scStyle = st(sc, ['padding', 'background-color', 'border-radius', 'margin', 'box-shadow'])
    return { scCls: sc.className.slice(0, 60), scStyle, tiles, hero, shInfo, extra, scrollMax: sc.scrollHeight - sc.clientHeight, tilesLen: sc.querySelectorAll('a[class*="col-span-6"]').length }
  })

  // now scroll the inner scroller to bottom to trigger back-to-top; watch bottom nav transform + backToTop
  await page.evaluate(() => {
    const sc = [...document.querySelectorAll('*')].find((el) => {
      const s = getComputedStyle(el)
      return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 5 && Math.abs(el.scrollTop) < 500
    })
    sc.scrollTop = sc.scrollHeight
  })
  await page.waitForTimeout(1500)
  const bottom = await page.evaluate(() => {
    const bx = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
    const nav = [...document.querySelectorAll('div')].find((e) => (e.innerText || '').includes('کیف پول') && (e.innerText || '').includes('خدمات') && e.children.length < 8 && e.getBoundingClientRect().height < 120)
    const btt = [...document.querySelectorAll('button')].find((e) => /بازگشت به بالا/.test(e.innerText || ''))
    const headerBg = document.querySelector('[class*="h-[200px]"]')
    const root = document.querySelector('.breakpoint__medium-down')
    return {
      nav: nav ? { box: bx(nav), transform: getComputedStyle(nav).transform } : null,
      btt: btt ? { box: bx(btt), visible: getComputedStyle(btt).visibility, html: btt.outerHTML.slice(0, 300) } : null,
      headerBg: headerBg ? { box: bx(headerBg), transform: getComputedStyle(headerBg).transform } : null,
      rootH: root ? root.getBoundingClientRect().height : null,
    }
  })

  // back-to-top click behavior
  let afterClick = null
  try {
    afterClick = await page.evaluate(async () => {
      const btn = [...document.querySelectorAll('button')].find((e) => /بازگشت به بالا/.test(e.innerText || ''))
      if (!btn) return null
      btn.click()
      await new Promise((r) => setTimeout(r, 1500))
      const sc = [...document.querySelectorAll('*')].find((el) => {
        const s = getComputedStyle(el)
        return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 5 && Math.abs(el.scrollTop) < 500
      })
      return { scrollTop: sc.scrollTop }
    })
  } catch (e) { afterClick = String(e).slice(0, 120) }

  return { top, bottom, afterClick }
}