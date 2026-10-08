export default async function run(page, ui) {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4200)
  return await page.evaluate(() => {
    const row = [...document.querySelectorAll('div')].find((e) => /pt-m gap-s pb-l/.test(e.className))
    if (!row) return null
    const bx = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
    const out = []
    const collect = (el, depth) => {
      if (depth > 3) return
      for (const c of el.children) {
        const r = c.getBoundingClientRect()
        if (r.width >= 20 && r.height >= 20 && c.children.length <= 4) {
          out.push({ cls: (typeof c.className === 'string' ? c.className : '').slice(0, 45), box: bx(c), svgs: c.querySelectorAll('svg').length, imgs: c.querySelectorAll('img').length, txt: (c.innerText || '').trim().slice(0, 14), a: c.querySelector('a') ? c.querySelector('a').getAttribute('href') : undefined })
        }
        collect(c, depth + 1)
      }
    }
    collect(row, 0)
    return out.filter((x, i, a) => a.findIndex((y) => y.cls === x.cls && y.box.join() === x.box.join()) === i).slice(0, 14)
  })
}
