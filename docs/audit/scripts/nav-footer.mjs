// Bottom nav (mobile) + footer (desktop) computed styles & active-state details.
export default async function run(page, ui) {
  const out = {}
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4000)
  out.nav = await page.evaluate(() => {
    const nav = [...document.querySelectorAll('div')].find((e) => (e.innerText || '').includes('کیف پول') && (e.innerText || '').includes('خدمات') && e.children.length < 8 && e.getBoundingClientRect().height < 130)
    const bx = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
    if (!nav) return null
    const s = getComputedStyle(nav)
    return {
      box: bx(nav), bg: s.backgroundColor, borderTop: s.borderTopWidth + ' ' + s.borderTopStyle + ' ' + s.borderTopColor, radius: s.borderRadius, shadow: s.boxShadow, z: s.zIndex, display: s.display,
      children: [...nav.querySelectorAll('div,a')].filter((c) => c.getBoundingClientRect().height > 20).slice(0, 6).map((c) => ({
        tag: c.tagName, cls: (typeof c.className === 'string' ? c.className : '').slice(0, 45), box: bx(c), txt: (c.innerText || '').replace(/\s+/g, ' ').slice(0, 14),
        color: getComputedStyle(c).color, bg: getComputedStyle(c).backgroundColor, cursor: getComputedStyle(c).cursor,
      })),
    }
  })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4000)
  // scroll footer in
  await page.evaluate(() => {
    const sc = [...document.querySelectorAll('*')].find((el) => { const s = getComputedStyle(el); return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 5 })
    if (sc) sc.scrollTop = sc.scrollHeight
  })
  await page.waitForTimeout(900)
  out.footer = await page.evaluate(() => {
    const root = document.querySelector('.breakpoint__large-up') || document.body
    const f = root.children[2]
    const bx = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
    const s = getComputedStyle(f)
    return {
      box: bx(f), bg: s.backgroundColor, bgi: s.backgroundImage.slice(0, 90), transform: s.transform, opacity: s.opacity,
      inner: [...f.querySelectorAll('*')].filter((e) => e.getBoundingClientRect().height > 12).slice(0, 12).map((e) => ({ cls: (typeof e.className === 'string' ? e.className : '').slice(0, 45), box: bx(e), txt: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 26), color: getComputedStyle(e).color, size: getComputedStyle(e).fontSize, bg: getComputedStyle(e).backgroundColor })),
    }
  })
  return out
}