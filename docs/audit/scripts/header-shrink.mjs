// Precise header-shrink behavior on scroll (mobile).
export default async function run(page, ui) {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4500)

  const sample = () => page.evaluate(() => {
    const root = document.querySelector('.breakpoint__medium-down')
    const bg = root.querySelector('[class*="bg-primary-brand"]')
    const content = root.querySelector('[class*="px-l"][class*="h-["]')
    const topRow = root.querySelector('[class*="pt-m"][class*="pb-l"]')
    const scroller = [...root.querySelectorAll('*')].find((el) => {
      const s = getComputedStyle(el)
      return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 5
    })
    const bx = (el) => { const r = el.getBoundingClientRect(); return { y: Math.round(r.y), h: Math.round(r.height) } }
    return {
      scrollTop: scroller ? Math.round(scroller.scrollTop) : null,
      bg: bg ? { ...bx(bg), transform: getComputedStyle(bg).transform, cls: bg.className.slice(0, 40) } : null,
      content: content ? { ...bx(content), cls: content.className.slice(0, 30), paddingBottom: getComputedStyle(content).paddingBottom } : null,
      topRow: topRow ? { ...bx(topRow), padB: getComputedStyle(topRow).paddingBottom } : null,
    }
  })

  const atTop = await sample()
  // scroll a little
  await page.evaluate(() => {
    const root = document.querySelector('.breakpoint__medium-down')
    const sc = [...root.querySelectorAll('*')].find((el) => {
      const s = getComputedStyle(el)
      return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 5
    })
    sc.scrollTop = 120
  })
  await page.waitForTimeout(700)
  const mid = await sample()
  await page.evaluate(() => {
    const root = document.querySelector('.breakpoint__medium-down')
    const sc = [...root.querySelectorAll('*')].find((el) => {
      const s = getComputedStyle(el)
      return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 5
    })
    sc.scrollTop = sc.scrollHeight
  })
  await page.waitForTimeout(700)
  const bottom = await sample()

  // check for inline style / data attributes that drive shrink
  const wiring = await page.evaluate(() => {
    const root = document.querySelector('.breakpoint__medium-down')
    const bg = root.querySelector('[class*="bg-primary-brand"]')
    return { bgStyle: bg.getAttribute('style'), bgCls: bg.className, rootEvents: '__reactProps stored?', hasObserver: !!window.ResizeObserver }
  })

  return { atTop, mid, bottom, wiring }
}