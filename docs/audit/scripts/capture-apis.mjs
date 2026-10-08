// Capture exact API response bodies via request interception (in-memory only).
export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 })
  const hits = {}
  const all = []
  const onRes = (res) => {
    const u = res.url()
    if (u.includes('/main-page/apps-nested') || u.includes('/banners?') || u.includes('/wallet/')) {
      all.push({ url: u.replace('https://api.shahrzadcity.ir', ''), ok: res.ok(), status: res.status() })
      if (res.ok()) {
        hits[u] = res.text().then((t) => t).catch(() => null)
      }
    }
  }
  page.on('response', onRes)
  await page.goto('https://web.shahrzadcity.ir/home', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(5000)
  page.off('response', onRes)

  const bodies = {}
  for (const [u, p] of Object.entries(hits)) {
    bodies[u.replace('https://api.shahrzadcity.ir/base/api', '')] = await p.catch(() => null)
  }
  // also find auth-ish info used by the app WITHOUT printing token value
  const auth = await page.evaluate(() => {
    const has = (k) => localStorage.getItem(k)
    return {
      authHints: Object.keys(localStorage).filter((k) => /token|auth/i.test(k)).join(','),
      storageKeys: Object.keys(localStorage),
    }
  }).catch(() => null)

  return { requests: all, bodies, auth }
}