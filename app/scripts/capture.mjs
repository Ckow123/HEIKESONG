// T1 验收截图脚本：对关键路由在 390px（手机）与 1440px（桌面）视口截图。
// 用法：先启动 npm run dev（5173 端口），再执行 `node scripts/capture.mjs`
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = fileURLToPath(new URL('../../evidence/v0.1/', import.meta.url))
mkdirSync(OUT, { recursive: true })

const shots = [
  { path: '/discover', name: 'P01-discover' },
  { path: '/discover/people', name: 'P02-people' },
  { path: '/people/p-lin', name: 'P03-portrait-detail' },
  { path: '/discover/activities', name: 'P04-activities' },
  { path: '/activities/a-badminton', name: 'P05-activity-detail' },
  { path: '/nebula', name: 'P06-nebula' },
  { path: '/square', name: 'P07-square' },
  { path: '/messages', name: 'P08-messages' },
  { path: '/messages/conv-1', name: 'P09-conversation' },
  { path: '/me', name: 'P10-me' },
  { path: '/me/portrait/edit', name: 'P11-portrait-edit' },
  { path: '/me/portrait/preview', name: 'P12-portrait-preview' },
]
const viewports = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'desktop-1440', width: 1440, height: 900 },
]

const browser = await chromium.launch()
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
  for (const s of shots) {
    await page.goto(`${BASE}${s.path}`, { waitUntil: 'networkidle' })
    await page.screenshot({ path: `${OUT}/${s.name}@${vp.name}.png`, fullPage: true })
    console.log(`captured ${s.name} @ ${vp.name}`)
  }
  // 检查横向滚动
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  console.log(`[${vp.name}] horizontal overflow on last page: ${overflow}`)
  await page.close()
}
await browser.close()
console.log(`done -> ${OUT}`)
