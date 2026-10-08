// Capture standardized screenshots: <section>--<viewport>--<state>.png
import fs from 'node:fs'
const DIR = '/Users/reyhanemasumi/Documents/Shahrzad/visuals'
fs.mkdirSync(DIR, { recursive: true })

export default async function run(page, ui) {
  const shot = (path, opts = {}) => page.screenshot({ path: `${DIR}/${path}`, ...opts }).catch((e) => ({ err: String(e).slice(0, 90) }))
  const main = async () => (await page.evaluate(() => {
    const root = document.querySelector('.breakpoint__large-up') || document.querySelector('.breakpoint__medium-down') || document.body
    const sc = [...document.querySelectorAll('*')].find((el) => { const s = getComputedStyle(el); return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 5 })
    return { sc: sc || null }
  })).sc
  const scrollInner = async (frac) => page.evaluate((f) => {
    const sc = [...document.querySelectorAll('*')].find((el) => { const s = getComputedStyle(el); return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 5 })
    if (sc) sc.scrollTop = Math.round(sc.scrollHeight * f)
  }, frac)

  const results = {}

  // DESKTOP
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(5000)
  await scrollInner(0)
  await page.waitForTimeout(400)
  results.homeDesktopTop = await shot('home--desktop--top.png')
  results.headerDesktop = await shot('header--desktop--top.png', { clip: await page.evaluate(() => { const r = (document.querySelector('.breakpoint__large-up') || document.body).children[0].getBoundingClientRect(); return { x: 0, y: r.y, width: r.width, height: r.height } }) })
  await scrollInner(1)
  await page.waitForTimeout(900)
  results.footerDesktop = await shot('footer--desktop--revealed.png')
  results.homeDesktopFooter = await shot('home--desktop--footer-revealed.png')

  // TABLET
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(5000)
  await scrollInner(0)
  await page.waitForTimeout(400)
  results.homeTabletTop = await shot('home--tablet--top.png')

  // MOBILE
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(5000)
  await scrollInner(0)
  await page.waitForTimeout(400)
  results.homeMobileTop = await shot('home--mobile--top.png')
  results.headerMobile = await shot('header--mobile--top.png', { clip: await page.evaluate(() => { const r = document.querySelector('.breakpoint__medium-down').getBoundingClientRect(); return { x: 0, y: 0, width: r.width, height: 260 } }) })
  await scrollInner(0.25)
  await page.waitForTimeout(700)
  results.homeMobileShrink = await shot('home--mobile--header-shrink.png')
  await scrollInner(1)
  await page.waitForTimeout(900)
  results.bottomnavMobile = await shot('bottomnav--mobile--shown.png')
  results.homeMobileBottom = await shot('home--mobile--scrolled-bottom.png')

  return results
}