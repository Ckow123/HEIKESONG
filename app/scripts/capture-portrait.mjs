// T3/T4 证据截图：编辑填写 → 预览 → 公开后的「我的」→ 撤回后的「我的」（手机 + 桌面）。
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = fileURLToPath(new URL('../../evidence/v0.1/', import.meta.url))
mkdirSync(OUT, { recursive: true })
const NAME = '测试小同'

const browser = await chromium.launch()
for (const vp of [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'desktop-1440', width: 1440, height: 900 },
]) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
  await page.goto(`${BASE}/me/portrait/edit`, { waitUntil: 'networkidle' })
  await page.getByLabel('昵称').fill(NAME)
  await page.getByRole('button', { name: '羽毛球', exact: true }).click()
  await page.getByRole('button', { name: '交朋友', exact: true }).click()
  await page.getByLabel('一句话介绍').fill('喜欢羽毛球和自习，也想认识新朋友。')
  await page.screenshot({ path: `${OUT}/T3-edit-filled@${vp.name}.png`, fullPage: true })

  await page.getByRole('button', { name: '去预览' }).click()
  await page.waitForURL('**/me/portrait/preview')
  await page.getByRole('heading', { name: NAME }).waitFor({ state: 'visible' })
  await page.screenshot({ path: `${OUT}/T3-preview@${vp.name}.png`, fullPage: true })

  await page.getByRole('button', { name: '确认公开', exact: true }).click()
  await page.waitForURL('**/me')
  await page.screenshot({ path: `${OUT}/T4-me-public@${vp.name}.png`, fullPage: true })

  await page.getByRole('button', { name: '撤回公开' }).click()
  await page.getByText('未公开', { exact: true }).first().waitFor({ state: 'visible' })
  await page.screenshot({ path: `${OUT}/T4-me-withdrawn@${vp.name}.png`, fullPage: true })
  console.log(`T3/T4 evidence captured @ ${vp.name}`)
  await page.close()
}
await browser.close()
