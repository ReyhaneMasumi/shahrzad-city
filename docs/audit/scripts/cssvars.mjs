// CSS custom properties (--color-primary-brand etc.) + full header right/tail HTML.
export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4500)
  const d = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement)
    const all = {}
    for (const sheet of document.styleSheets) {
      let rules
      try { rules = sheet.cssRules } catch { continue }
      for (const r of rules) {
        if (r.selectorText === ':root' || r.selectorText === 'html') {
          for (const p of r.style) if (p.startsWith('--')) all[p] = r.style.getPropertyValue(p).trim()
        }
      }
    }
    const want = ['--color-primary-brand', '--color-primary', '--color-primary-dark', '--color-neutral-1', '--color-neutral-2', '--color-neutral-3', '--color-neutral-4', '--color-neutral-5', '--color-content-neutral', '--color-content-primary-brand', '--color-stroke-neutral-2', '--radius-16', '--radius-xl']
    const selected = {}
    for (const v of Object.keys(all)) if (want.includes(v)) selected[v] = all[v]
    // header right tail
    const row = [...document.querySelectorAll('div')].find((e) => /کیف پول:/.test(e.innerText || '') && e.getBoundingClientRect().y < 60 && e.getBoundingClientRect().width < 400)
    let rightParent = row
    for (let i = 0; i < 5 && rightParent; i++) {
      if ((rightParent.innerText || '').includes('کیف پول') && /اطلاع|اعلام|زنگوله|پول/.test('') === false) {}
      rightParent = rightParent.parentElement
    }
    const wallet = [...document.querySelectorAll('div')].find((e) => /کیف پول:/.test(e.innerText || '') && e.getBoundingClientRect().y < 70)
    // find the sibling card (notification) after wallet
    const walletAnc = wallet ? wallet.parentElement : null
    const rightCluster = row ? row.closest('.ant-row') : null
    return {
      varCount: Object.keys(all).length,
      selected,
      headerRightFull: rightCluster ? rightCluster.outerHTML.slice(700, 2600) : null,
      themeVars: { primaryBrand: cs.getPropertyValue('--color-primary-brand').trim(), primary: cs.getPropertyValue('--color-primary').trim() },
    }
  })
  return d
}