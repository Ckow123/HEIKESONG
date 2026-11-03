// V0.3 浏览器回归：12 路由 × 4 视口（375/390/1280/1440）截图 + 健康检查。
// 用法：先启动 npm run dev（5173 端口），再执行 `node scripts/regression-v03.mjs`
//
// 每路由每视口检查：
//   1. 页面加载成功（goto 不抛错）
//   2. 关键文本出现（渲染到预期状态）
//   3. 无横向溢出（scrollWidth <= clientWidth + 1）
//   4. 无 console error / pageerror
// 另附：移动端 390px 底栏遮挡抽查（/discover 滚到底部）。
// 任一检查失败累积并使进程非零退出。截图即使失败也保留，便于人工复核。
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = process.env.OUT_DIR
  ? resolve(process.env.OUT_DIR)
  : resolve(fileURLToPath(new URL('../../evidence/next-iteration/2026-11-03/screenshots/', import.meta.url)))
mkdirSync(OUT, { recursive: true })

const routes = [
  { path: '/discover', name: 'P01-discover', expectText: '真正同频' },
  { path: '/discover/people', name: 'P02-people', expectText: '找同频的人' },
  { path: '/people/p-lin', name: 'P03-portrait-detail', expectText: '林间风' },
  { path: '/discover/activities', name: 'P04-activities', expectText: '找活动搭子' },
  { path: '/activities/a-badminton', name: 'P05-activity-detail', expectText: '活动详情' },
  { path: '/nebula', name: 'P06-nebula', expectText: '星云探索' },
  { path: '/square', name: 'P07-square', expectText: '捞人' },
  { path: '/messages', name: 'P08-messages', expectText: '信息中心' },
  { path: '/messages/conv-1', name: 'P09-conversation', expectText: '林间风' },
  { path: '/me', name: 'P10-me', expectText: '演示身份切换' },
  { path: '/me/portrait/edit', name: 'P11-portrait-edit', expectText: /创建 Portrait|编辑 Portrait/ },
  { path: '/me/portrait/preview', name: 'P12-portrait-preview', expectText: '预览 Portrait' },
]
const viewports = [
  { name: '375', width: 375, height: 844 },
  { name: '390', width: 390, height: 844 },
  { name: '1280', width: 1280, height: 900 },
  { name: '1440', width: 1440, height: 900 },
]

let failures = 0
const records = []
const browser = await chromium.launch()

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
  for (const r of routes) {
    const consoleErrors = []
    const pageErrors = []
    const onConsole = (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) }
    const onError = (e) => pageErrors.push(e.message)
    page.on('console', onConsole)
    page.on('pageerror', onError)

    const reasons = []
    try {
      await page.goto(`${BASE}${r.path}`, { waitUntil: 'networkidle' })
    } catch (e) {
      reasons.push(`navigate failed: ${e.message}`)
    }

    if (reasons.length === 0) {
      await page.screenshot({ path: `${OUT}/${r.name}@${vp.name}.png`, fullPage: true })

      const bodyText = await page.locator('body').textContent().catch(() => '')
      const textOk = r.expectText instanceof RegExp
        ? r.expectText.test(bodyText ?? '')
        : (bodyText ?? '').includes(r.expectText)
      if (!textOk) reasons.push(`expect text "${r.expectText}" not found`)

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      )
      if (overflow) reasons.push('horizontal overflow')

      if (pageErrors.length > 0) reasons.push(`pageerror: ${pageErrors.join(' | ')}`)
      // 忽略 Vite dev 环境下的 favicon 404 等无关 console error 由人工复核；这里全部记录
      if (consoleErrors.length > 0) reasons.push(`console error: ${consoleErrors.join(' | ')}`)
    }

    const ok = reasons.length === 0
    if (!ok) failures += 1
    console.log(`${ok ? 'PASS' : 'FAIL'} ${r.name}@${vp.name}${ok ? '' : ` :: ${reasons.join('; ')}`}`)
    records.push({ name: r.name, vp: vp.name, ok, reason: reasons.join('; ') })
    page.off('console', onConsole)
    page.off('pageerror', onError)
  }
  await page.close()
}

// 底栏遮挡抽查（390px，/discover 滚到底部）
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const reasons = []
  try {
    await page.goto(`${BASE}/discover`, { waitUntil: 'networkidle' })
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await page.waitForTimeout(300)
    const nav = page.locator('nav').last()
    const navBox = await nav.boundingBox()
    if (!navBox) {
      reasons.push('bottom nav not found at 390px')
    } else {
      // 视口底部中心点应落在底部导航上（而不是被遮挡的内容）
      const hit = await page.evaluate(() => {
        const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight - 20)
        return el ? el.closest('nav') !== null : false
      })
      if (!hit) reasons.push('element at viewport bottom is not the bottom nav')
      // 主内容容器应有足够底部留白，避免内容被固定底栏遮住
      const padOk = await page.evaluate(() => {
        const main = document.querySelector('main')
        if (!main) return false
        return parseFloat(getComputedStyle(main).paddingBottom) >= 48
      })
      if (!padOk) reasons.push('main content bottom padding < 48px (possible nav overlap)')
    }
    await page.screenshot({ path: `${OUT}/bottom-nav-check@390.png` })
  } catch (e) {
    reasons.push(`bottom-nav check failed: ${e.message}`)
  }
  const ok = reasons.length === 0
  if (!ok) failures += 1
  console.log(`${ok ? 'PASS' : 'FAIL'} bottom-nav@390${ok ? '' : ` :: ${reasons.join('; ')}`}`)
  records.push({ name: 'bottom-nav', vp: '390', ok, reason: reasons.join('; ') })
  await page.close()
}

await browser.close()
console.log(`done -> ${OUT}`)
console.log(`summary: ${records.length - failures}/${records.length} pass, ${failures} fail`)
process.exit(failures === 0 ? 0 : 1)
