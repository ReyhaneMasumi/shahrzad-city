// Deep per-section extraction: header, hero, service tiles, footer + scroll behavior.
export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4500)

  const snap = () => page.evaluate(() => {
    const bx = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
    const st = (el, props) => { const s = getComputedStyle(el); const o = {}; for (const p of props) o[p] = s.getPropertyValue(p); return o }
    const root = document.querySelector('.breakpoint__large-up') || document.body
    const kids = [...root.children].map((c) => ({ tag: c.tagName, cls: c.className.slice(0, 60), box: bx(c) }))

    // header
    const header = root.children[0]
    const headerInfo = header ? {
      cls: header.className, box: bx(header),
      style: st(header, ['position', 'background-color', 'background-image', 'box-shadow', 'z-index', 'height', 'padding']),
      html: header.outerHTML.slice(0, 1200),
      children: [...header.querySelectorAll('a,button,img,div')].slice(0, 25).map((e) => ({
        tag: e.tagName, cls: (typeof e.className === 'string' ? e.className : '').slice(0, 50),
        txt: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 30), box: bx(e),
        href: e.getAttribute?.('href') || undefined, src: e.getAttribute?.('src') || undefined,
      })),
    } : null

    // main content sections
    const main = root.children[1]
    const mainKids = main ? [...main.querySelectorAll(':scope > * , :scope > * > *')].slice(0, 40).map((e) => ({
      tag: e.tagName, cls: (typeof e.className === 'string' ? e.className : '').slice(0, 70),
      box: bx(e), txt: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 50),
      bg: getComputedStyle(e).backgroundImage.slice(0, 100),
      display: getComputedStyle(e).display, grid: getComputedStyle(e).gridTemplateColumns.slice(0, 80),
      gap: getComputedStyle(e).gap,
    })) : []

    // footer
    const footer = root.children[2]
    const footerInfo = footer ? {
      cls: footer.className, box: bx(footer),
      style: st(footer, ['position', 'background-color', 'background-image', 'transform', 'transition', 'height', 'padding', 'margin-top']),
      links: [...footer.querySelectorAll('a')].map((a) => ({ txt: a.innerText.replace(/\s+/g, ' ').trim().slice(0, 30), href: a.getAttribute('href'), box: bx(a) })),
      txt: (footer.innerText || '').replace(/\s+/g, ' ').slice(0, 300),
    } : null

    // hero banner: find swiper/slide containers
    const slides = [...document.querySelectorAll('.swiper-slide,[class*=slide],[class*=banner],[class*=Banner]')].slice(0, 20).map((s) => ({
      cls: (typeof s.className === 'string' ? s.className : '').slice(0, 60), box: bx(s),
      img: s.querySelector('img')?.currentSrc.replace(location.origin, '').slice(0, 60) || undefined,
    }))
    const swiper = document.querySelector('.swiper') ? {
      cls: document.querySelector('.swiper').className,
      autoplay: !!document.querySelector('.swiper-autoheight, .swiper[data-autoplay]'),
      slides: document.querySelectorAll('.swiper-slide').length,
      bullets: document.querySelectorAll('.swiper-pagination-bullet').length,
      nav: document.querySelectorAll('.swiper-button-next,.swiper-button-prev').length,
    } : null

    // service tiles: links with img inside main
    const tiles = (main ? [...main.querySelectorAll('a')] : []).slice(0, 40).map((a) => {
      const s = getComputedStyle(a)
      const label = a.querySelector('p,span,div')
      const ls = label ? getComputedStyle(label) : null
      return {
        txt: a.innerText.replace(/\s+/g, ' ').trim().slice(0, 30), href: a.getAttribute('href'),
        box: bx(a), bg: s.backgroundColor, radius: s.borderRadius, shadow: s.boxShadow.slice(0, 60),
        labelSize: ls?.fontSize, labelWeight: ls?.fontWeight, labelColor: ls?.color,
        imgSize: a.querySelector('img') ? bx(a.querySelector('img')) : undefined,
      }
    })

    // css custom props on :root
    const cs = getComputedStyle(document.documentElement)
    const vars = {}
    for (const sheet of document.styleSheets) {
      let rules
      try { rules = sheet.cssRules } catch { continue }
      for (const r of rules) {
        if (r.selectorText === ':root' || r.selectorText === 'html') {
          for (const p of r.style) if (p.startsWith('--')) vars[p] = r.style.getPropertyValue(p).trim()
        }
      }
    }

    return { scroll: { y: window.scrollY, h: document.documentElement.scrollHeight, vh: innerHeight },
      kids, headerInfo, mainKids, footerInfo, swiper, slides, tiles, vars: Object.keys(vars).length ? vars : null,
      bodyFont: st(document.body, ['font-family', 'font-size', 'line-height', 'color', 'background-color']) }
  })

  const before = await snap()

  // scroll to bottom, observe footer + header
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
  await page.waitForTimeout(900)
  const after = await page.evaluate(() => {
    const bx = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
    const root = document.querySelector('.breakpoint__large-up') || document.body
    return {
      y: window.scrollY,
      header: root.children[0] ? { box: bx(root.children[0]), transform: getComputedStyle(root.children[0]).transform, position: getComputedStyle(root.children[0]).position } : null,
      footer: root.children[2] ? { box: bx(root.children[2]), transform: getComputedStyle(root.children[2]).transform, position: getComputedStyle(root.children[2]).position } : null,
      backToTop: [...document.querySelectorAll('button,a')].filter((e) => /up|top|arrow/i.test(e.className || '')).map((e) => ({ cls: e.className, box: bx(e) })),
    }
  })

  return { before, after }
}
