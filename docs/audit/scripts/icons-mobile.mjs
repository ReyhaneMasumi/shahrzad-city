export default async function run(page, ui) {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4200)
  return await page.evaluate(() => {
    const row = [...document.querySelectorAll('div')].find((e) => /pt-m gap-s pb-l/.test(e.className))
    const cluster = [...row.querySelectorAll('div')].find((e) => /gap-m flex items-center/.test(e.className))
    const out = []
    for (const c of cluster.children) {
      const svg = c.querySelector('svg')
      const p = svg ? svg.querySelector('path') : null
      out.push({ cls: c.className.slice(0, 40), w: svg?.getAttribute('width'), viewBox: svg?.getAttribute('viewBox'), d0: svg ? (svg.innerHTML.match(/d="([^"]{0,60})/) || [, ''])[1].slice(0, 60) : null, fill: p?.getAttribute('fill') })
    }
    return out
  })
}
