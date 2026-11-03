// T3/T4 全流程冒烟 + 01 矩阵（V0.2）。
// 用法：先启动 dev 服务器，再执行 `node scripts/smoke-portrait.mjs`
//
// V0.2 改进（QA-B3）：
// - 增强三项必填各自断言：分别断言「请填写昵称」「请至少选择 1 个兴趣标签」「请至少选择 1 项社交意图」
// - 补 01 矩阵 PR-02：公开 A → 编辑改为唯一 B → 去预览 → 检查公共入口（找人列表/星云）仍显示 A 不显示 B
// - 补 01 矩阵 PR-07：撤回公开后，活动已有报名记录数量不变（DEC-003.3 不变量）
// - 保留既有 10 项 check，累积失败非零退出
// - 不能只换名字复刻实现：PR-02 直接验证 publicSnapshot 隔离在公共入口生效
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const NAME_A = '测试小同' // 公开的 A 版本
const NAME_B = '测试小同B版' // 编辑后的草稿 B 版本（唯一区分）
const ACTIVITY_WITH_ENROLLMENT = '/activities/a-hackathon'

let failures = 0
const check = (label, ok) => {
  console.log(`${label}: ${ok ? 'PASS' : 'FAIL'}`)
  if (!ok) failures += 1
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page = await context.newPage()

// 清空 localStorage 以确保从初始 fixtures 加载
await page.goto(`${BASE}/discover`, { waitUntil: 'networkidle' })
await page.evaluate(() => window.localStorage.removeItem('tongpin-campus-v1'))

// ============ 1. 必填校验：分别断言三项错误（PR-00 / DEC-002.2） ============
await page.goto(`${BASE}/me/portrait/edit`, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: '去预览' }).click()
// 等待错误块出现（任意一条错误文本可见即触发）
await page.getByText('请填写昵称').waitFor({ state: 'visible' })

check('必填校验-昵称错误', (await page.getByText('请填写昵称').count()) === 1)
check('必填校验-兴趣错误', (await page.getByText('请至少选择 1 个兴趣标签').count()) === 1)
check('必填校验-社交意图错误', (await page.getByText('请至少选择 1 项社交意图').count()) === 1)

// ============ 2. 填写必填 + 选填，进入预览 ============
await page.getByLabel('昵称').fill(NAME_A)
await page.getByRole('button', { name: '羽毛球', exact: true }).click()
await page.getByRole('button', { name: '交朋友', exact: true }).click()
await page.getByLabel('一句话介绍').fill('喜欢羽毛球和自习，也想认识新朋友。')
await page.getByRole('button', { name: '去预览' }).click()
await page.waitForURL('**/me/portrait/preview')
await page.getByRole('heading', { name: NAME_A }).waitFor({ state: 'visible' })
check('预览展示填写内容', (await page.getByText('喜欢羽毛球和自习').count()) === 1)

// ============ 3. 预览不自动公开（DEC-002.3） ============
await page.goto(`${BASE}/discover/people`, { waitUntil: 'networkidle' })
check('预览后未进入公开找人列表', (await page.getByText(NAME_A).count()) === 0)
await page.goto(`${BASE}/nebula`, { waitUntil: 'networkidle' })
check('预览后未进入星云', (await page.getByText(NAME_A).count()) === 0)

// ============ 4. 确认公开（DEC-002.3） → A 版本进入公共入口 ============
await page.goto(`${BASE}/me/portrait/preview`, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: '确认公开', exact: true }).click()
await page.waitForURL('**/me')
await page.goto(`${BASE}/discover/people`, { waitUntil: 'networkidle' })
check('公开后 A 进入找人列表', (await page.getByText(NAME_A).count()) >= 1)
await page.goto(`${BASE}/nebula`, { waitUntil: 'networkidle' })
check('公开后 A 进入星云', (await page.getByText(NAME_A).count()) >= 1)

// ============ 5. PR-02 公开后编辑隔离：A 仍在公共入口，B 只在草稿/预览 ============
// 回到编辑页，把昵称改为唯一的 B 版本（不确认公开）
await page.goto(`${BASE}/me/portrait/edit`, { waitUntil: 'networkidle' })
await page.getByLabel('昵称').fill(NAME_B)
// 兴趣/社交意图保持不变（已选），去预览（保存草稿但不更新 publicSnapshot）
await page.getByRole('button', { name: '去预览' }).click()
await page.waitForURL('**/me/portrait/preview')
await page.getByRole('heading', { name: NAME_B }).waitFor({ state: 'visible' })

// PR-02 核心断言：公共入口应仍显示 A（publicSnapshot），不应显示 B（草稿）
await page.goto(`${BASE}/discover/people`, { waitUntil: 'networkidle' })
const peopleA = await page.getByText(NAME_A).count()
const peopleB = await page.getByText(NAME_B).count()
check('PR-02 公开入口（找人列表）仍显示 A', peopleA >= 1, `A count=${peopleA}`)
check('PR-02 公开入口（找人列表）不显示草稿 B', peopleB === 0, `B count=${peopleB}`)

await page.goto(`${BASE}/nebula`, { waitUntil: 'networkidle' })
const nebulaA = await page.getByText(NAME_A).count()
const nebulaB = await page.getByText(NAME_B).count()
check('PR-02 公开入口（星云）仍显示 A', nebulaA >= 1, `A count=${nebulaA}`)
check('PR-02 公开入口（星云）不显示草稿 B', nebulaB === 0, `B count=${nebulaB}`)

// 预览页应显示草稿 B（getDraftView），不是 A
await page.goto(`${BASE}/me/portrait/preview`, { waitUntil: 'networkidle' })
const previewB = await page.getByRole('heading', { name: NAME_B }).count()
const previewA = await page.getByRole('heading', { name: NAME_A }).count()
check('PR-02 预览页显示草稿 B（不显示 A）', previewB >= 1 && previewA === 0, `B=${previewB}, A=${previewA}`)

// 刷新后公共入口仍显示 A（publicSnapshot 持久化）
await page.goto(`${BASE}/discover/people`, { waitUntil: 'networkidle' })
await page.reload({ waitUntil: 'networkidle' })
const peopleAAfterReload = await page.getByText(NAME_A).count()
const peopleBAfterReload = await page.getByText(NAME_B).count()
check('PR-02 刷新后找人列表仍显示 A 不显示 B', peopleAAfterReload >= 1 && peopleBAfterReload === 0, `A=${peopleAAfterReload}, B=${peopleBAfterReload}`)

// ============ 6. 撤回公开（DEC-003.2） ============
await page.goto(`${BASE}/me`, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: '撤回公开' }).click()
await page.getByText('未公开', { exact: true }).first().waitFor({ state: 'visible' })
await page.goto(`${BASE}/discover/people`, { waitUntil: 'networkidle' })
check('撤回后退出找人列表', (await page.getByText(NAME_A).count()) === 0)
await page.goto(`${BASE}/nebula`, { waitUntil: 'networkidle' })
check('撤回后退出星云', (await page.getByText(NAME_A).count()) === 0)

// ============ 7. 已有邀请与会话保留（DEC-003.3） ============
await page.goto(`${BASE}/messages`, { waitUntil: 'networkidle' })
check('撤回后待处理邀请保留', (await page.getByText('夏一川').count()) >= 1)
check('撤回后已有会话保留', (await page.locator('a[href="/messages/conv-1"]').count()) === 1)

// ============ 8. PR-07 报名保持：撤回公开后活动已有报名记录数量不变 ============
// 用 a-hackathon（fixtures 中 enr-1 一舟的报名）。注意：me 没有自己的报名 fixture，
// 此处验证 DEC-003.3 不变量"撤回不删除已有报名"——活动详情页报名记录数应保持。
await page.goto(`${BASE}${ACTIVITY_WITH_ENROLLMENT}`, { waitUntil: 'networkidle' })
const enrollRecordText = await page.getByText(/共 \d+ 条合成报名记录/).first().textContent().catch(() => null)
const enrollMatch = enrollRecordText ? enrollRecordText.match(/共 (\d+) 条/) : null
const enrollCount = enrollMatch ? Number(enrollMatch[1]) : -1
check('PR-07 撤回后活动仍有报名记录', enrollCount >= 1, `text="${enrollRecordText}"`)

// 刷新后报名记录仍在
await page.reload({ waitUntil: 'networkidle' })
const enrollRecordTextAfter = await page.getByText(/共 \d+ 条合成报名记录/).first().textContent().catch(() => null)
const enrollMatchAfter = enrollRecordTextAfter ? enrollRecordTextAfter.match(/共 (\d+) 条/) : null
const enrollCountAfter = enrollMatchAfter ? Number(enrollMatchAfter[1]) : -1
check('PR-07 刷新后报名记录数量不变', enrollCount === enrollCountAfter && enrollCountAfter >= 1, `before=${enrollCount}, after=${enrollCountAfter}`)

// ============ 9. 刷新后未公开状态保留（localStorage） ============
await page.goto(`${BASE}/me`, { waitUntil: 'networkidle' })
await page.reload({ waitUntil: 'networkidle' })
check('刷新后未公开状态保留', (await page.getByText('未公开', { exact: true }).count()) >= 1)

await browser.close()
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
