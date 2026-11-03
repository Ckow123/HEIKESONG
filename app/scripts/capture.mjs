// T1 验收截图脚本：对关键路由在 390px（手机）与 1440px（桌面）视口截图。
// 用法：先启动 npm run dev（5173 端口），再执行 `node scripts/capture.mjs`
//
// V0.2 改进（QA-B1）：
// - 输出目录默认改为 evidence/next-iteration/<YYYY-MM-DD>/，可用 OUT_DIR 环境变量覆盖
// - 每路由每视口独立检查：h1 存在、关键文本出现、横向溢出、阻断页面错误（pageerror）
// - 截图成功不自动判页面正确；任一检查失败累积并使进程非零退出
// - 逐页逐视口写单项记录到 console，便于机器判定
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'

// 输出目录：优先 OUT_DIR，否则用今天的日期目录
function defaultOutDir() {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD（UTC）
  return resolve(fileURLToPath(new URL('../../evidence/next-iteration/', import.meta.url)), today)
}
const OUT = process.env.OUT_DIR ? resolve(process.env.OUT_DIR) : defaultOutDir()
mkdirSync(OUT, { recursive: true })

// 每路由的预期检查：h1 文本（部分匹配）或关键文本（任一出现即通过）
// 注意：截图成功 ≠ 检查通过；这里把"页面渲染到预期状态"与截图分开判定
const shots = [
  { path: '/discover', name: 'P01-discover', expectH1: /在校园里|同频/, expectText: '发现同好' },
  { path: '/discover/people', name: 'P02-people', expectH1: /找同频的人/, expectText: null },
  { path: '/people/p-lin', name: 'P03-portrait-detail', expectH1: /Portrait 详情/, expectText: '林间风' },
  { path: '/discover/activities', name: 'P04-activities', expectH1: /找活动搭子/, expectText: null },
  { path: '/activities/a-badminton', name: 'P05-activity-detail', expectH1: /羽毛球/, expectText: null },
  { path: '/nebula', name: 'P06-nebula', expectH1: /星云探索/, expectText: null },
  { path: '/square', name: 'P07-square', expectH1: /校园广场/, expectText: null },
  { path: '/messages', name: 'P08-messages', expectH1: /信息中心/, expectText: null },
  { path: '/messages/conv-1', name: 'P09-conversation', expectH1: /与 .* 的会话/, expectText: '林间风' },
  { path: '/me', name: 'P10-me', expectH1: /我的/, expectText: null },
  { path: '/me/portrait/edit', name: 'P11-portrait-edit', expectH1: /创建 Portrait|编辑 Portrait/, expectText: null },
  { path: '/me/portrait/preview', name: 'P12-portrait-preview', expectH1: /预览 Portrait/, expectText: null },
]
const viewports = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'desktop-1440', width: 1440, height: 900 },
]

let failures = 0
const records = []

const browser = await chromium.launch()
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
  for (const s of shots) {
    // 每页独立收集 pageerror，避免上一页的错误被算到下一页
    const pageErrors = []
    const onError = (e) => pageErrors.push(e.message)
    page.on('pageerror', onError)

    try {
      await page.goto(`${BASE}${s.path}`, { waitUntil: 'networkidle' })
    } catch (e) {
      const msg = `navigate failed: ${e.message}`
      console.log(`FAIL ${s.name}@${vp.name} :: ${msg}`)
      records.push({ name: s.name, vp: vp.name, ok: false, reason: msg })
      failures += 1
      page.off('pageerror', onError)
      continue
    }

    // 截图：即使后续检查失败也保留截图，便于人工复核
    await page.screenshot({ path: `${OUT}/${s.name}@${vp.name}.png`, fullPage: true })

    // 检查 1：h1 存在且文本匹配预期
    const h1Text = await page.locator('h1').first().textContent().catch(() => null)
    const h1Ok = h1Text !== null && s.expectH1.test(h1Text.trim())

    // 检查 2：关键文本出现（若定义了 expectText）
    const textOk = s.expectText === null || (await page.getByText(s.expectText).count()) > 0

    // 检查 3：横向溢出（documentElement.scrollWidth > clientWidth）
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)

    // 检查 4：阻断页面错误（pageerror 事件）
    const hasPageError = pageErrors.length > 0

    const ok = h1Ok && textOk && !overflow && !hasPageError
    if (!ok) {
      failures += 1
      const reasons = []
      if (!h1Ok) reasons.push(`h1 mismatch (got "${h1Text ?? '<none>'}", expect ${s.expectH1})`)
      if (!textOk) reasons.push(`expect text "${s.expectText}" not found`)
      if (overflow) reasons.push('horizontal overflow')
      if (hasPageError) reasons.push(`pageerror: ${pageErrors.join(' | ')}`)
      const reason = reasons.join('; ')
      console.log(`FAIL ${s.name}@${vp.name} :: ${reason}`)
      records.push({ name: s.name, vp: vp.name, ok: false, reason })
    } else {
      console.log(`PASS ${s.name}@${vp.name}`)
      records.push({ name: s.name, vp: vp.name, ok: true })
    }
    page.off('pageerror', onError)
  }
  await page.close()
}
await browser.close()
console.log(`done -> ${OUT}`)
console.log(`summary: ${records.length - failures}/${records.length} pass, ${failures} fail`)
process.exit(failures === 0 ? 0 : 1)
