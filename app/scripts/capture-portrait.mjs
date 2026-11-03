// T3/T4 证据截图：编辑填写 → 预览 → 公开后的「我的」→ 撤回后的「我的」（手机 + 桌面）。
//
// V0.2 改进（QA-B1）：
// - 输出目录默认改为 evidence/next-iteration/<YYYY-MM-DD>/，可用 OUT_DIR 环境变量覆盖
// - 增加横向溢出与 pageerror 检查（流程脚本仍保留最低限度质量门）
// - 截图成功不自动判页面正确；失败累积并使进程非零退出
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'

function defaultOutDir() {
  const today = new Date().toISOString().slice(0, 10)
  return resolve(fileURLToPath(new URL('../../evidence/next-iteration/', import.meta.url)), today)
}
const OUT = process.env.OUT_DIR ? resolve(process.env.OUT_DIR) : defaultOutDir()
mkdirSync(OUT, { recursive: true })
const NAME = '测试小同'

let failures = 0
const records = []
const check = (label, ok, reason = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${reason ? ' :: ' + reason : ''}`)
  records.push({ label, ok, reason })
  if (!ok) failures += 1
}

const browser = await chromium.launch()
for (const vp of [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'desktop-1440', width: 1440, height: 900 },
]) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
  const pageErrors = []
  page.on('pageerror', (e) => pageErrors.push(e.message))

  // 1. 编辑页填写
  await page.goto(`${BASE}/me/portrait/edit`, { waitUntil: 'networkidle' })
  await page.getByLabel('昵称').fill(NAME)
  await page.getByRole('button', { name: '羽毛球', exact: true }).click()
  await page.getByRole('button', { name: '交朋友', exact: true }).click()
  await page.getByLabel('一句话介绍').fill('喜欢羽毛球和自习，也想认识新朋友。')
  await page.screenshot({ path: `${OUT}/T3-edit-filled@${vp.name}.png`, fullPage: true })
  const editH1 = await page.locator('h1').first().textContent().catch(() => null)
  check(`T3-edit-filled@${vp.name} h1`, editH1 !== null && /创建 Portrait|编辑 Portrait/.test(editH1.trim()), `got "${editH1 ?? '<none>'}"`)

  // 2. 进入预览
  await page.getByRole('button', { name: '去预览' }).click()
  await page.waitForURL('**/me/portrait/preview')
  await page.getByRole('heading', { name: NAME }).waitFor({ state: 'visible' })
  await page.screenshot({ path: `${OUT}/T3-preview@${vp.name}.png`, fullPage: true })
  const previewNameVisible = (await page.getByText(NAME).count()) > 0
  check(`T3-preview@${vp.name} shows nickname`, previewNameVisible)

  // 3. 确认公开 → 跳到 /me
  await page.getByRole('button', { name: '确认公开', exact: true }).click()
  await page.waitForURL('**/me')
  await page.screenshot({ path: `${OUT}/T4-me-public@${vp.name}.png`, fullPage: true })
  const publicTagVisible = (await page.getByText('已公开', { exact: true }).count()) > 0
  check(`T4-me-public@${vp.name} shows 已公开`, publicTagVisible)

  // 4. 撤回公开
  await page.getByRole('button', { name: '撤回公开' }).click()
  await page.getByText('未公开', { exact: true }).first().waitFor({ state: 'visible' })
  await page.screenshot({ path: `${OUT}/T4-me-withdrawn@${vp.name}.png`, fullPage: true })
  const withdrawnTagVisible = (await page.getByText('未公开', { exact: true }).count()) > 0
  check(`T4-me-withdrawn@${vp.name} shows 未公开`, withdrawnTagVisible)

  // 5. 流程级横向溢出与 pageerror 检查（基于最后页面状态）
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  check(`T4-flow@${vp.name} no horizontal overflow`, !overflow, overflow ? 'scrollWidth > clientWidth' : '')
  check(`T4-flow@${vp.name} no pageerror`, pageErrors.length === 0, pageErrors.length ? pageErrors.join(' | ') : '')

  console.log(`T3/T4 evidence captured @ ${vp.name}`)
  await page.close()
}
await browser.close()
console.log(`done -> ${OUT}`)
console.log(`summary: ${records.length - failures}/${records.length} pass, ${failures} fail`)
process.exit(failures === 0 ? 0 : 1)
