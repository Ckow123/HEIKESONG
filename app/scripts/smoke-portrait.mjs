// T3/T4 全流程冒烟：必填校验 → 预览不自动公开 → 确认公开进列表与星云 → 撤回排除且互动保留。
// 用法：先启动 dev 服务器，再执行 `node scripts/smoke-portrait.mjs`
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const NAME = '测试小同'
let failures = 0
const check = (label, ok) => {
  console.log(`${label}: ${ok ? 'PASS' : 'FAIL'}`)
  if (!ok) failures += 1
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

// 1. 必填校验：直接提交应出现 3 条错误
await page.goto(`${BASE}/me/portrait/edit`, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: '去预览' }).click()
await page.getByText('请填写昵称').waitFor({ state: 'visible' })
check('必填校验（昵称/兴趣/社交意图）', (await page.getByText('请至少选择 1 个兴趣标签').count()) === 1)

// 2. 填写必填 + 选填，进入预览
await page.getByLabel('昵称').fill(NAME)
await page.getByRole('button', { name: '羽毛球', exact: true }).click()
await page.getByRole('button', { name: '交朋友', exact: true }).click()
await page.getByLabel('一句话介绍').fill('喜欢羽毛球和自习，也想认识新朋友。')
await page.getByRole('button', { name: '去预览' }).click()
await page.waitForURL('**/me/portrait/preview')
await page.getByRole('heading', { name: NAME }).waitFor({ state: 'visible' })
check('预览展示填写内容', (await page.getByText('喜欢羽毛球和自习').count()) === 1)

// 3. 预览不自动公开（DEC-002.3）
await page.goto(`${BASE}/discover/people`, { waitUntil: 'networkidle' })
check('预览后未进入公开找人列表', (await page.getByText(NAME).count()) === 0)

// 4. 确认公开（DEC-002.3）
await page.goto(`${BASE}/me/portrait/preview`, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: '确认公开', exact: true }).click()
await page.waitForURL('**/me')
await page.goto(`${BASE}/discover/people`, { waitUntil: 'networkidle' })
check('公开后进入找人列表', (await page.getByText(NAME).count()) >= 1)
await page.goto(`${BASE}/nebula`, { waitUntil: 'networkidle' })
check('公开后进入星云', (await page.getByText(NAME).count()) >= 1)

// 5. 撤回公开（DEC-003.2）
await page.goto(`${BASE}/me`, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: '撤回公开' }).click()
await page.getByText('未公开', { exact: true }).first().waitFor({ state: 'visible' })
await page.goto(`${BASE}/discover/people`, { waitUntil: 'networkidle' })
check('撤回后退出找人列表', (await page.getByText(NAME).count()) === 0)
await page.goto(`${BASE}/nebula`, { waitUntil: 'networkidle' })
check('撤回后退出星云', (await page.getByText(NAME).count()) === 0)

// 6. 已有邀请与会话保留（DEC-003.3）
await page.goto(`${BASE}/messages`, { waitUntil: 'networkidle' })
check('撤回后待处理邀请保留', (await page.getByText('夏一川').count()) >= 1)
check('撤回后已有会话保留', (await page.locator('a[href="/messages/conv-1"]').count()) === 1)

// 7. 刷新后未公开状态保留（localStorage）
await page.goto(`${BASE}/me`, { waitUntil: 'networkidle' })
await page.reload({ waitUntil: 'networkidle' })
check('刷新后未公开状态保留', (await page.getByText('未公开', { exact: true }).count()) >= 1)

await browser.close()
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
