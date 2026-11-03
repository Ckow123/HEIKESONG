// V0.3 核心流程冒烟：两条核心端到端流程 + 隐私负向用例。
// 用法：先启动 npm run dev（5173 端口），再执行 `node scripts/smoke-v03.mjs`
//
// 流程A：创建 Portrait → 预览 → 确认公开 → 公开列表可见 → 撤回公开 → 消失
// 流程B：打招呼 → 切换身份到接收方 → 信息中心出现待处理邀请 → 接受 → 进入会话
// 流程C：申请报名 → 待组织者确认 → 切换身份到组织者 → 确认 → 申请者看到已确认
// 负向：未公开 Portrait 直达提示；重复打招呼不产生第二条邀请
// 独立浏览器上下文；开始前清空 localStorage 恢复出厂合成数据。每步截图留证。
// 断言失败计入 FAIL 并使进程非零退出。
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = process.env.OUT_DIR
  ? resolve(process.env.OUT_DIR)
  : resolve(fileURLToPath(new URL('../../evidence/next-iteration/2026-11-03/flows/', import.meta.url)))
mkdirSync(OUT, { recursive: true })

const NICK = '测试同学小K'
let failures = 0
const records = []

function record(name, ok, reason = '') {
  if (!ok) failures += 1
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` :: ${reason}`}`)
  records.push({ name, ok, reason })
}

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true })
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page = await context.newPage()
page.on('pageerror', (e) => record(`pageerror@${page.url()}`, false, e.message))

try {
  // 初始化：清空持久化状态，恢复出厂合成数据
  await page.goto(`${BASE}/discover`, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })

  // ---------- 流程A：创建 → 公开 → 撤回 ----------
  await page.goto(`${BASE}/me/portrait/edit`, { waitUntil: 'networkidle' })
  await page.getByPlaceholder('同学将看到的名字（请勿使用真实姓名）').fill(NICK)
  await page.getByRole('button', { name: '羽毛球', exact: true }).first().click()
  await page.getByRole('button', { name: '交朋友', exact: true }).first().click()
  await shot(page, 'A1-edit-filled')
  await page.getByRole('button', { name: '去预览' }).click()
  await page.waitForURL(/\/me\/portrait\/preview/)
  record('A1 编辑后进入预览页', true)
  await shot(page, 'A2-preview')
  const previewHasNick = (await page.getByText(NICK).count()) > 0
  record('A2 预览页显示草稿昵称', previewHasNick, 'nickname not found in preview')
  await page.getByRole('button', { name: '确认公开' }).click()
  await page.waitForTimeout(500)
  await shot(page, 'A3-after-publish')

  await page.goto(`${BASE}/discover/people`, { waitUntil: 'networkidle' })
  const inList = (await page.getByText(NICK).count()) > 0
  record('A3 公开后出现在找同频的人列表', inList, 'nickname not in people list')
  await shot(page, 'A3-people-list')

  // ---------- 流程B：打招呼 → 对方接受 ----------
  await page.goto(`${BASE}/people/p-qian`, { waitUntil: 'networkidle' })
  const greetBtn = page.getByRole('button', { name: /打招呼/ })
  record('B1 千屿详情页存在打招呼入口', (await greetBtn.count()) > 0, 'greet button missing')
  await greetBtn.first().click()
  await page.waitForTimeout(300)
  const greetSent = (await page.getByText(/等待对方回应/).count()) > 0
  record('B2 打招呼后出现待回应提示', greetSent, 'no pending hint after greet')
  await shot(page, 'B2-greet-sent')

  // 负向：重复访问不出现可再次发送的打招呼按钮（已发送过）
  await page.reload({ waitUntil: 'networkidle' })
  const greetBtnAfter = await page.getByRole('button', { name: /打招呼/ }).count()
  record('B3 重复访问不再出现可发送的打招呼按钮', greetBtnAfter === 0, `greet button still present x${greetBtnAfter}`)

  // 切换身份到千屿（接收方）
  await page.goto(`${BASE}/me`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: '千屿', exact: true }).click()
  await page.waitForTimeout(300)
  await page.goto(`${BASE}/messages`, { waitUntil: 'networkidle' })
  const pendingFromMe = (await page.getByText(NICK).count()) > 0
  record('B4 千屿信息中心出现来自新同学的待处理邀请', pendingFromMe, 'invitation not found')
  await shot(page, 'B4-qian-messages')

  const acceptBtn = page.getByRole('button', { name: '接受', exact: true }).first()
  await acceptBtn.click()
  await page.waitForURL(/\/messages\/conv-/, { timeout: 5000 })
  record('B5 接受邀请后进入会话页', true)
  await shot(page, 'B5-conversation')

  // ---------- 流程C：报名 → 组织者确认 ----------
  // 切回"我"
  await page.goto(`${BASE}/me`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: '我（演示身份）', exact: true }).click()
  await page.waitForTimeout(300)

  await page.goto(`${BASE}/activities/a-badminton`, { waitUntil: 'networkidle' })
  const enrollBtn = page.getByRole('button', { name: '申请报名', exact: true })
  record('C1 活动详情存在申请报名入口', (await enrollBtn.count()) > 0, 'enroll button missing')
  await enrollBtn.first().click()
  await page.waitForTimeout(300)
  const pendingShown = (await page.getByText('待组织者确认').count()) > 0
  record('C2 报名后状态为待组织者确认', pendingShown, 'pending status not shown')
  await shot(page, 'C2-enroll-pending')

  // 切换到组织者阿柚（u-you 是 a-badminton 组织者）
  await page.goto(`${BASE}/me`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: '阿柚', exact: true }).click()
  await page.waitForTimeout(300)
  await page.goto(`${BASE}/activities/a-badminton`, { waitUntil: 'networkidle' })
  const confirmBtn = page.getByRole('button', { name: '确认', exact: true }).first()
  const organizerSees = (await confirmBtn.count()) > 0
  record('C3 组织者面板可见待确认申请', organizerSees, 'no confirm button in organizer panel')
  await shot(page, 'C3-organizer-panel')
  if (organizerSees) {
    await confirmBtn.click()
    await page.waitForTimeout(300)
  }

  // 切回"我"查看状态
  await page.goto(`${BASE}/me`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: '我（演示身份）', exact: true }).click()
  await page.waitForTimeout(300)
  await page.goto(`${BASE}/activities/a-badminton`, { waitUntil: 'networkidle' })
  const confirmedShown = (await page.getByText('已确认').count()) > 0
  record('C4 申请者看到已确认状态', confirmedShown, 'confirmed status not shown')
  await shot(page, 'C4-enroll-confirmed')

  // ---------- 流程A 收尾：撤回公开 ----------
  await page.goto(`${BASE}/me`, { waitUntil: 'networkidle' })
  const withdrawBtn = page.getByRole('button', { name: /撤回公开/ })
  record('A4 我的页存在撤回公开入口', (await withdrawBtn.count()) > 0, 'withdraw button missing')
  await withdrawBtn.first().click()
  await page.waitForTimeout(300)
  await page.goto(`${BASE}/discover/people`, { waitUntil: 'networkidle' })
  const goneFromList = (await page.getByText(NICK).count()) === 0
  record('A5 撤回公开后从找同频的人列表消失', goneFromList, 'nickname still in people list')
  await shot(page, 'A5-people-after-withdraw')

  // ---------- 负向：未公开 Portrait 直达 ----------
  await page.goto(`${BASE}/people/p-yizhou`, { waitUntil: 'networkidle' })
  const notPublicShown = (await page.getByText(/未公开/).count()) > 0
  record('N1 未公开 Portrait 直达显示未公开提示', notPublicShown, 'no not-public hint')
  await shot(page, 'N1-not-public')
} catch (e) {
  record('unhandled exception', false, e.message)
}

await context.close()
await browser.close()
console.log(`done -> ${OUT}`)
console.log(`summary: ${records.filter((r) => r.ok).length}/${records.length} pass, ${failures} fail`)
process.exit(failures === 0 ? 0 : 1)
