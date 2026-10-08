// Probe the reference /home DOM: top-level structure, fonts, network, sections.
export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4000)

  return await page.evaluate(() => {
    const box = (el) => {
      const r = el.getBoundingClientRect()
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
    }
    const style = (el) => {
      const s = getComputedStyle(el)
      return {
        font: s.fontFamily, size: s.fontSize, weight: s.fontWeight, lh: s.lineHeight,
        color: s.color, bg: s.backgroundColor, bgi: s.backgroundImage.slice(0, 90),
        display: s.display, position: s.position, radius: s.borderRadius, gap: s.gap,
      }
    }
    const html = document.documentElement
    const outline = []
    const walk = (el, depth) => {
      if (depth > 3) return
      const kids = [...el.children]
      outline.push({
        d: depth, tag: el.tagName, id: el.id || undefined,
        cls: (el.className && typeof el.className === 'string' ? el.className : '').slice(0, 80) || undefined,
        ...box(el),
        kids: kids.length,
        text: (el.innerText || '').replace(/\s+/g, ' ').slice(0, 60) || undefined,
      })
      for (const k of kids) {
        if (k.tagName === 'SCRIPT' || k.tagName === 'STYLE' || k.tagName === 'NOSCRIPT') continue
        walk(k, depth + 1)
      }
    }
    walk(document.body, 0)

    const resources = performance.getEntriesByType('resource').map((r) => ({
      name: r.name.replace(location.origin, ''), type: r.initiatorType,
      dur: Math.round(r.duration), size: r.transferSize,
    }))

    const fontsLoaded = []
    document.fonts.forEach((f) => fontsLoaded.push(`${f.family}|${f.weight}|${f.style}|${f.status}`))

    const imgs = [...document.images].map((i) => ({
      src: i.currentSrc.replace(location.origin, '').slice(0, 70),
      w: i.naturalWidth, h: i.naturalHeight, alt: i.alt, loading: i.loading,
      vw: Math.round(i.getBoundingClientRect().width), vh: Math.round(i.getBoundingClientRect().height),
    }))

    return {
      htmlLang: html.lang, htmlDir: html.dir, metaViewport:
        document.querySelector('meta[name=viewport]')?.content || null,
      fontsLoaded, fontDefs: [...document.fonts].map((f) => `${f.family}|${f.weight}|${f.style}`),
      bodyStyle: style(document.body),
      outline: outline.slice(0, 90),
      apiCalls: resources.filter((r) => r.name.includes('/api/')),
      fontRequests: resources.filter((r) => /\.(ttf|woff2?|otf)/i.test(r.name)),
      imgCount: imgs.length, imgs: imgs.slice(0, 60),
      linkCount: document.links.length,
      headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => h.tagName + ':' + h.innerText.trim().slice(0, 40)),
      landmarks: [...document.querySelectorAll('header,nav,main,footer,[role]')].map((e) => e.tagName + (e.getAttribute('role') ? '[' + e.getAttribute('role') + ']' : '')),
      scrollH: document.documentElement.scrollHeight,
      hasBottomNav: !!document.querySelector('[class*=bottom],[class*=Bottom]'),
      resourcesTotal: resources.length,
      others: resources.filter((r) => !r.name.includes('/api/') && !/\.(ttf|woff2?|otf|png|jpg|svg|webp|css|js)/i.test(r.name)).slice(0, 20),
    }
  })
}
