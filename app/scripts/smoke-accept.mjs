// DEC-003.5 交互冒烟 + PR-2 会话参与者边界负向用例（V0.2）。
// 用法：先启动 dev 服务器，再执行 `node scripts/smoke-accept.mjs`
//
// V0.2 改进（QA-B2）：
// - 把初始待处理/接受后入口/列表/刷新等预期变为实际断言（不再只打印）
// - 累积失败非零退出（参考 smoke-portrait.mjs 的 failures 计数模式）
// - 补负向用例（独立上下文 + 合成夹具）：
//   * 无关会话直达 URL：导航到 me 不是参与者的会话，应显示「无法查看此会话」
//   * pending 直达会话：导航到 pending 邀请关联的会话，应显示「邀请尚未被接受」
//   * 不存在的会话：导航到不存在的会话 ID，应显示「没有找到这个会话」
// - 用独立上下文（browser.newContext()）+ 合成夹具，每次状态可复现
// - 断言前刷新以验证持久化
//
// 注意：当前演示 currentUserId 固定为 me，无法切换身份调用 acceptInvitation API。
// 故负向用例通过直达 URL 测试会话越权（符合任务描述的限定）。
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'

let failures = 0
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${detail ? ' :: ' + detail : ''}`)
  if (!ok) failures += 1
}

// 合成夹具：在初始 state 基础上注入用于负向测试的会话/邀请
// 注意：这是 QA 测试夹具，只写入 localStorage 测试上下文，不修改全局 fixtures.ts
function buildNegativeState() {
  return {
    currentUserId: 'me',
    identities: [
      { id: 'me', displayName: '我（演示身份）', isDemoContext: true },
      { id: 'u-lin', displayName: '林间风', isDemoContext: true },
      { id: 'u-xia', displayName: '夏一川', isDemoContext: true },
    ],
    portraits: [
      {
        id: 'p-lin',
        ownerId: 'u-lin',
        nickname: '林间风',
        interestTags: ['羽毛球'],
        socialIntents: ['交朋友'],
        isPublic: true,
        updatedAt: '2026-11-01T10:00:00+08:00',
      },
    ],
    activities: [],
    invitations: [
      // inv-foreign：me 不是 toId 也不是 fromId 的无关邀请（pending）
      {
        id: 'inv-foreign',
        fromId: 'u-lin',
        toId: 'u-xia',
        status: 'pending',
        message: '合成无关邀请',
        createdAt: '2026-11-01T11:00:00+08:00',
      },
    ],
    conversations: [
      // conv-foreign：me 不是参与者的已接受会话 → 直达应被拒绝（无法查看此会话）
      {
        id: 'conv-foreign',
        invitationId: 'inv-foreign',
        participantIds: ['u-lin', 'u-xia'],
        demoMessages: [],
      },
      // conv-pending：me 是参与者但邀请仍 pending → 直达应显示「邀请尚未被接受」
      {
        id: 'conv-pending',
        invitationId: 'inv-pending-me',
        participantIds: ['u-lin', 'me'],
        demoMessages: [],
      },
    ],
    // 把 inv-pending-me 加到 invitations（pending 状态，关联 conv-pending）
    enrollments: [],
    interactionAccess: [],
  }
}

// 把 pending 邀请补进 invitations（buildNegativeState 里 conversations 引用了 inv-pending-me）
function buildFullNegativeState() {
  const s = buildNegativeState()
  s.invitations = [
    ...s.invitations,
    {
      id: 'inv-pending-me',
      fromId: 'u-lin',
      toId: 'me',
      status: 'pending',
      message: '合成 pending 邀请',
      createdAt: '2026-11-01T11:00:00+08:00',
    },
  ]
  return s
}

// 在独立上下文里注入 state 并导航到指定 URL
async function injectAndGoto(context, state, path) {
  const page = await context.newPage()
  // 先打开站点根，让 localStorage 写入生效（同源策略）
  await page.goto(`${BASE}/discover`, { waitUntil: 'networkidle' })
  await page.evaluate((payload) => {
    window.localStorage.setItem('tongpin-campus-v1', JSON.stringify(payload))
  }, state)
  // reload 让 DataProvider 重新 load
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
  return page
}

const browser = await chromium.launch()

// ============ 正向用例（独立上下文，初始状态） ============
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  // 清空 localStorage 以确保从初始 fixtures 加载（避免受上次运行残留影响）
  await page.goto(`${BASE}/discover`, { waitUntil: 'networkidle' })
  await page.evaluate(() => window.localStorage.removeItem('tongpin-campus-v1'))
  await page.goto(`${BASE}/messages`, { waitUntil: 'networkidle' })

  // 断言 1：接受前——待处理邀请区有「夏一川」（inv-1，fromId=u-xia）
  const beforeXiaCount = await page.getByText('夏一川').count()
  check('接受前「夏一川」出现在待处理区', beforeXiaCount >= 1, `count=${beforeXiaCount}`)

  // 断言 2：待处理区有「接受」按钮
  const acceptBtnCount = await page.getByRole('button', { name: '接受' }).count()
  check('接受前有「接受」按钮', acceptBtnCount >= 1, `count=${acceptBtnCount}`)

  // 点击「接受」（触发 acceptInvitation(inv-1)）
  await page.getByRole('button', { name: '接受' }).click()
  await page.waitForURL('**/messages/conv-inv-1', { timeout: 10000 })

  // 断言 3：接受后跳到 conv-inv-1（PR-2：使用 acceptInvitation 返回值导航，不自行拼接）
  check('接受后跳转到 conv-inv-1', page.url().endsWith('/messages/conv-inv-1'), page.url())

  // 断言 4：会话页 heading 可见
  const headingLocator = page.getByRole('heading', { name: /与 夏一川 的会话/ })
  await headingLocator.waitFor({ state: 'visible', timeout: 10000 })
  check('接受后会话页显示「与 夏一川 的会话」', (await headingLocator.count()) === 1)

  // 断言 5：回到 /messages，待处理清空，已有会话含 conv-inv-1
  await page.goto(`${BASE}/messages`, { waitUntil: 'networkidle' })
  const pendingEmpty = await page.getByText('暂无待处理邀请').count()
  const convExists = await page.locator('a[href="/messages/conv-inv-1"]').count()
  check('接受后待处理邀请已清空', pendingEmpty === 1, `count=${pendingEmpty}`)
  check('接受后已有会话含 conv-inv-1', convExists === 1, `count=${convExists}`)

  // 断言 6：刷新后状态保留（localStorage 持久化）
  await page.reload({ waitUntil: 'networkidle' })
  const afterReload = await page.locator('a[href="/messages/conv-inv-1"]').count()
  const pendingEmptyAfter = await page.getByText('暂无待处理邀请').count()
  check('刷新后已接受状态保留（conv-inv-1 仍在）', afterReload === 1, `count=${afterReload}`)
  check('刷新后待处理仍为空', pendingEmptyAfter === 1, `count=${pendingEmptyAfter}`)

  await context.close()
}

// ============ 负向用例 1：无关会话直达 URL（PR-2 participantIds 过滤） ============
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const state = buildFullNegativeState()
  const page = await injectAndGoto(context, state, '/messages/conv-foreign')

  // me 不是 conv-foreign 的参与者 → 应显示「无法查看此会话」
  const blockedVisible = await page.getByText('无法查看此会话').count()
  check('无关会话直达显示「无法查看此会话」', blockedVisible === 1, `count=${blockedVisible}`)
  // 同时不应显示对方昵称或消息内容
  const noHeading = (await page.getByRole('heading', { name: /与 .* 的会话/ }).count()) === 0
  check('无关会话不渲染正常会话 heading', noHeading)

  // 刷新后拒绝仍成立（持久化 + 守卫一致）
  await page.reload({ waitUntil: 'networkidle' })
  const blockedAfterReload = await page.getByText('无法查看此会话').count()
  check('刷新后无关会话仍被拒绝', blockedAfterReload === 1, `count=${blockedAfterReload}`)

  await context.close()
}

// ============ 负向用例 2：pending 直达会话（邀请尚未被接受） ============
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const state = buildFullNegativeState()
  const page = await injectAndGoto(context, state, '/messages/conv-pending')

  // conv-pending 的 invitation 仍 pending → 应显示「邀请尚未被接受」
  const pendingNotice = await page.getByText('邀请尚未被接受').count()
  check('pending 会话直达显示「邀请尚未被接受」', pendingNotice === 1, `count=${pendingNotice}`)
  // 不应显示消息内容
  const noMessages = (await page.getByText('会话已开启').count()) === 0
  check('pending 会话不渲染已开启内容', noMessages)

  // 刷新后仍拒绝
  await page.reload({ waitUntil: 'networkidle' })
  const pendingAfterReload = await page.getByText('邀请尚未被接受').count()
  check('刷新后 pending 会话仍显示尚未接受', pendingAfterReload === 1, `count=${pendingAfterReload}`)

  await context.close()
}

// ============ 负向用例 3：不存在的会话 ID（找不到） ============
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const state = buildFullNegativeState()
  const page = await injectAndGoto(context, state, '/messages/conv-nonexistent')

  // 会话不存在 → 应显示「没有找到这个会话」
  const notFound = await page.getByText('没有找到这个会话').count()
  check('不存在的会话显示「没有找到这个会话」', notFound === 1, `count=${notFound}`)

  await context.close()
}

// ============ 负向用例 4：非法接收者身份不会在待处理列表看到别人的邀请 ============
// 通过注入 currentUserId=me 但 inv-foreign 的 toId=u-xia，验证 MessagesPage.toId 过滤
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const state = buildFullNegativeState()
  const page = await injectAndGoto(context, state, '/messages')

  // inv-foreign 的 toId 是 u-xia，不是 me，所以不应出现在 me 的待处理列表
  // 这里用「合成无关邀请」这条 message 文本来判定它是否泄露到 me 的待处理区
  const leakedForeignInv = await page.getByText('合成无关邀请').count()
  check('非法接收者：别人收到的邀请不出现在我的待处理列表', leakedForeignInv === 0, `count=${leakedForeignInv}`)

  await context.close()
}

await browser.close()
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
