// DEC-003.5 交互冒烟：待处理邀请接受前会话不可用；接受后会话开启。
// 用法：先启动 dev 服务器，再执行 `node scripts/smoke-accept.mjs`
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

await page.goto(`${BASE}/messages`, { waitUntil: 'networkidle' })

// 接受前：会话列表中没有「夏一川」
const before = await page.getByText('夏一川').count()
console.log('接受前「夏一川」出现次数（应在待处理区=1）:', before)

// 点击「接受」
await page.getByRole('button', { name: '接受' }).click()
await page.waitForURL('**/messages/conv-inv-1')

// 接受后：进入新会话页（页面为懒加载，需等待渲染完成）
const headingLocator = page.getByRole('heading', { name: /与 夏一川 的会话/ })
await headingLocator.waitFor({ state: 'visible', timeout: 10000 })
console.log('接受后会话页打开:', (await headingLocator.count()) === 1 ? 'PASS' : 'FAIL')

// 回到信息中心：待处理应为空，已有会话应有夏一川
await page.goto(`${BASE}/messages`, { waitUntil: 'networkidle' })
const pendingEmpty = await page.getByText('暂无待处理邀请').count()
const convExists = await page.locator('a[href="/messages/conv-inv-1"]').count()
console.log('待处理邀请已清空:', pendingEmpty === 1 ? 'PASS' : 'FAIL')
console.log('已有会话含夏一川:', convExists === 1 ? 'PASS' : 'FAIL')

// 刷新后状态保留（localStorage）
await page.reload({ waitUntil: 'networkidle' })
const afterReload = await page.locator('a[href="/messages/conv-inv-1"]').count()
console.log('刷新后已接受状态保留:', afterReload === 1 ? 'PASS' : 'FAIL')

await browser.close()
