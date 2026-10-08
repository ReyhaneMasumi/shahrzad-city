// Fetch API responses + detailed hero & tiles structure.
export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4000)

  const banners = await page.evaluate(async () => {
    const r = await fetch('/api/banners?type=mainPage&platform=pwa').then((x) => x.text()).catch((e) => 'ERR ' + e)
    return r.slice(0, 6000)
  })
  // probe the real endpoint that fed the network log
  const bannersReal = await page.evaluate(async () => {
    const r = await fetch('https://api.shahrzadcity.ir/base/api/v2/banners?type=mainPage&platform=pwa').then((x) => x.text()).catch((e) => 'ERR ' + e)
    return r.slice(0, 6000)
  })
  const apps = await page.evaluate(async () => {
    const r = await fetch('https://api.shahrzadcity.ir/base/api/v3/main-page/apps-nested?platform=pwa').then((x) => x.text()).catch((e) => 'ERR ' + e)
    return r
  })

  const hero = await page.evaluate(() => {
    const s = document.querySelector('.sc-hZOyXb') || document.querySelector('.swiper')
    const info = s ? {
      cls: s.className, slides: s.querySelectorAll('.swiper-slide').length,
      bullets: s.querySelectorAll('.swiper-pagination-bullet').length,
      imgs: [...s.querySelectorAll('img')].map((i) => ({ src: i.currentSrc.replace(location.origin, '').slice(0, 80), box: (() => { const r = i.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] })() })),
      autoplayOn: /swiper-autoplay/.test(s.className),
    } : null
    // any horizontal scrollers (carousels) in main
    const horizontals = []
    for (const el of document.querySelectorAll('.scrollable, [class*=horizontal-pages], [class*=carousel]')) {
      const r = el.getBoundingClientRect()
      horizontals.push({ cls: (typeof el.className === 'string' ? el.className : '').slice(0, 60), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], scrollW: el.scrollWidth, clientW: el.clientWidth, ovx: getComputedStyle(el).overflowX })
    }
    return { hero: info, horizontals }
  })

  return { bannersPublic: banners.slice(0, 500), bannersReal: bannersReal.slice(0, 3000), appsLen: apps.length, apps: apps.slice(0, 4000), hero }
}