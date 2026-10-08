// Identify the real scroll container, its overflow, and how the fixed footer reveals.
export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4500)

  const info = await page.evaluate(() => {
    const out = []
    const all = [...document.querySelectorAll('*')]
    for (const el of all) {
      const s = getComputedStyle(el)
      if ((s.overflowY === 'auto' || s.overflowY === 'scroll' || s.overflow === 'auto' || s.overflow === 'scroll')
        && el.scrollHeight > el.clientHeight + 5) {
        const r = el.getBoundingClientRect()
        out.push({
          cls: (typeof el.className === 'string' ? el.className : '').slice(0, 60),
          box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
          scrollH: el.scrollHeight, clientH: el.clientHeight, overflowY: s.overflowY,
          scrollTopMax: el.scrollHeight - el.clientHeight,
        })
      }
    }
    // ancestors chain of body
    const chain = []
    let e = document.body
    while (e && chain.length < 8) {
      const s = getComputedStyle(e)
      chain.push({ tag: e.tagName, cls: (typeof e.className === 'string' ? e.className : '').slice(0, 50), pos: s.position, ov: s.overflow + '/' + s.overflowY, h: s.height, minH: s.minHeight })
      e = e.parentElement
    }
    return { containers: out, chain, docScrollH: document.documentElement.scrollHeight, bodyScrollH: document.body.scrollHeight, innerH: innerHeight }
  })

  // scroll the inner container to bottom and observe footer
  const steps = []
  const container = await page.evaluateHandle(() => {
    const all = [...document.querySelectorAll('*')]
    return all.find((el) => {
      const s = getComputedStyle(el)
      return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 5
    }) || document.scrollingElement
  })

  for (let i = 0; i < 6; i++) {
    const state = await page.evaluate((el) => {
      if (el) el.scrollTop = el.scrollHeight
      return null
    }, container).catch(() => null)
    await page.waitForTimeout(400)
    steps.push(await page.evaluate(() => {
      const root = document.querySelector('.breakpoint__large-up') || document.body
      const bx = (e) => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
      const scrollers = [...document.querySelectorAll('*')].filter((el) => {
        const s = getComputedStyle(el)
        return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 5
      }).map((el) => ({ cls: (typeof el.className === 'string' ? el.className : '').slice(0, 40), top: Math.round(el.scrollTop), max: el.scrollHeight - el.clientHeight }))
      return {
        footer: root.children[2] ? { box: bx(root.children[2]), transform: getComputedStyle(root.children[2]).transform, opacity: getComputedStyle(root.children[2]).opacity } : null,
        header: root.children[0] ? { box: bx(root.children[0]), cls: root.children[0].className } : null,
        scrollers,
      }
    }))
  }

  // top-of-page state again
  await page.evaluate(() => {
    document.querySelectorAll('*').forEach((el) => {
      const s = getComputedStyle(el)
      if (s.overflowY === 'auto' || s.overflowY === 'scroll') el.scrollTop = 0
    })
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(700)
  const topState = await page.evaluate(() => {
    const root = document.querySelector('.breakpoint__large-up') || document.body
    const bx = (e) => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
    return {
      footer: root.children[2] ? { box: bx(root.children[2]), transform: getComputedStyle(root.children[2]).transform, opacity: getComputedStyle(root.children[2]).opacity } : null,
      header: root.children[0] ? { box: bx(root.children[0]), h: getComputedStyle(root.children[0]).height } : null,
    }
  })

  // is there a mobile-only bottom nav in DOM at desktop? search for candidate nodes
  const navSearch = await page.evaluate(() => {
    const cands = []
    for (const el of document.querySelectorAll('div,nav,ul')) {
      const s = getComputedStyle(el)
      if (s.position === 'fixed' && s.bottom !== 'auto' && s.display !== 'none') {
        const r = el.getBoundingClientRect()
        cands.push({ cls: (typeof el.className === 'string' ? el.className : '').slice(0, 60), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], z: s.zIndex, txt: (el.innerText || '').replace(/\s+/g, ' ').slice(0, 60) })
      }
    }
    return cands
  })

  return { info, steps, topState, navSearch }
}
