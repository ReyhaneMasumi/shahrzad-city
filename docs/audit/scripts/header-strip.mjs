// Header top-strip details at mobile & desktop, secondary banner & back-to-top presence.
export default async function run(page, ui) {
  const results = {}
  for (const [name, w, h] of [['mobile', 360, 800], ['desktop', 1440, 900]]) {
    await page.setViewportSize({ width: w, height: h })
    await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(4500)
    results[name] = await page.evaluate(() => {
      const bx = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
      // top strip: search the header region (y<210)
      const cands = [...document.querySelectorAll('div')].filter((e) => {
        const r = e.getBoundingClientRect()
        return r.y < 205 && r.y >= 0 && r.width > 200 && r.height < 230
      })
      const topStrip = [...cands].reverse().find((e) => /کیف پول/.test(e.innerText || '') && e.children.length > 4) || cands[Math.floor(cands.length / 2)]
      return {
        cands: cands.slice(-6).map((e) => ({ cls: (typeof e.className === 'string' ? e.className : '').slice(0, 55), box: bx(e), txt: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 30) })),
        topStripHTML: topStrip ? topStrip.outerHTML.slice(0, 2600) : null,
        topStripCls: topStrip ? topStrip.className.slice(0, 60) : null,
        topStripBox: topStrip ? bx(topStrip) : null,
        btnPresent: [...document.querySelectorAll('button')].some((e) => /بازگشت به بالا/.test(e.innerText || '')),
        secondarySwiper: [...document.querySelectorAll('.swiper')].map((s) => ({ box: bx(s), slides: s.querySelectorAll('.swiper-slide').length, imgs: s.querySelectorAll('img').length, h: Math.round(s.getBoundingClientRect().height) })),
      }
    })
  }
  return results
}