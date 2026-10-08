// Precise visuals: tile card internals, wallet module, header right side, bottom teaser.
export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4500)

  const d = await page.evaluate(() => {
    const bx = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
    const st = (el, props) => { const s = getComputedStyle(el); const o = {}; for (const p of props) o[p] = s.getPropertyValue(p); return o }
    const root = document.querySelector('.breakpoint__large-up') || document.body
    const main = root.children[1]

    // 1) exact tile cell: the desktop tile wrapper
    const tileA = main.querySelector('a[class*="text-inherit"]')
    const tileDepth = tileA ? (() => {
      const parent = tileA.parentElement
      const wrap = parent ? parent.parentElement : null
      const img = tileA.querySelector('img')
      const lbl = tileA.querySelector('p') || tileA.querySelector('span')
      return {
        anchor: { box: bx(tileA), cls: tileA.className, style: st(tileA, ['padding', 'gap', 'background-color', 'border-radius', 'box-shadow']) },
        parentCls: parent?.className, parentBox: parent && bx(parent),
        wrapCls: wrap?.className, wrapBox: wrap && bx(wrap),
        img: img ? { box: bx(img), cls: img.className, size: [img.naturalWidth, img.naturalHeight] } : null,
        label: lbl ? { text: lbl.innerText, box: bx(lbl), f: getComputedStyle(lbl).fontSize, w: getComputedStyle(lbl).fontWeight, c: getComputedStyle(lbl).color } : null,
        html: tileA.parentElement.parentElement.outerHTML.slice(0, 900),
      }
    })() : null

    // 2) wallet module
    const walletRoot = (document.querySelector('.breakpoint__large-up') || document.body).children[0]
    const walletSearch = [...document.querySelectorAll('a,div')].find((e) => /مشاهده موجودی/.test(e.innerText || ''))
    const wallet = walletSearch ? (() => {
      let w = walletSearch
      while (w.parentElement && !/مشاهده موجودی/.test(w.parentElement.innerText) === false) { w = w.parentElement; if (w.children.length > 8) break }
      const holder = walletSearch.closest('[class*="large-up"] section, [class*="large-up"] > div > div, [class*="large-up"]')
      return {
        el: bx(walletSearch), cls: walletSearch.className,
        holder: holder ? { cls: holder.className.slice(0, 70), box: bx(holder), style: st(holder, ['background-image', 'background-color', 'border-radius', 'padding']) } : null,
        txt: walletSearch.innerText.replace(/\s+/g, ' ').slice(0, 80),
        html: walletSearch.outerHTML.slice(0, 800),
        linksInside: walletSearch.querySelectorAll('a').length,
      }
    })() : null

    // 3) header full
    const header = root.children[0]
    const headerRight = header.innerHTML.slice(0, 2500)

    // 4) bottom teaser card
    const bottom = [...main.querySelectorAll('*')].filter((e) => {
      const r = e.getBoundingClientRect()
      return r.y > 1150 && r.width > 400
    }).slice(0, 6).map((e) => ({ cls: (typeof e.className === 'string' ? e.className : '').slice(0, 60), box: bx(e), txt: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 40), bg: getComputedStyle(e).backgroundImage.slice(0, 70), html: e.outerHTML.slice(0, 500) }))

    // 5) section header row (title + see all)
    const title = [...main.querySelectorAll('*')].find((e) => (e.innerText || '').trim() === 'خدمات شهرزاد')
    const sectionHead = title ? (() => {
      let row = title
      while (row.parentElement && row.parentElement.getBoundingClientRect().height < 60) row = row.parentElement
      return { rowCls: row.className, rowBox: bx(row), rowHTML: row.outerHTML.slice(0, 1200), titleStyle: st(title, ['font-size', 'font-weight', 'color', 'line-height']) }
    })() : null

    return { tileDepth, wallet, headerRight: headerRight.replace(/\s+/g, ' ').slice(0, 1800), bottom, sectionHead }
  })
  return d
}