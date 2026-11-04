// B1 P0 隐私负向测试（run-id: B1-20261103-01）
// 断言目标为「修复后的安全行为」：修复前运行应产生 FAIL（即 before 失败证据），修复后应全部 PASS。
// 用法：先启动 npm run dev（5173 端口），再执行
//   OUT_DIR=../../evidence/b1/B1-20261103-01/before node scripts/privacy-b1.mjs
//
// 覆盖：
//   P0-04 跨身份 Portrait ID 冲突与资料覆盖（含双身份创建/编辑/刷新数据完整性）
//   P0-01 无可信 Snapshot 的旧公开资料降级 + 未确认草稿不得提前公开
//   P0-02 活动报名者名单与状态不得向无关访客暴露
//   P0-03 活动发起人署名不得绕过公开投影（草稿 B / 撤回后兜底「活动发起人」）
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = process.env.OUT_DIR
  ? resolve(process.env.OUT_DIR)
  : resolve(fileURLToPath(new URL('../../evidence/b1/B1-20261103-01/after/', import.meta.url)))
const KEY = 'tongpin-campus-v1'
mkdirSync(OUT, { recursive: true })

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

/** 清空 localStorage，恢复出厂合成数据，并通过一次身份切换触发持久化以捕获完整初始状态 */
async function freshState(page) {
  await page.goto(`${BASE}/discover`, { waitUntil: 'networkidle' })
  await page.evaluate((k) => localStorage.removeItem(k), KEY)
  await page.reload({ waitUntil: 'networkidle' })
  await page.goto(`${BASE}/me`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: '林间风', exact: true }).click()
  await page.waitForTimeout(250)
  const raw = await page.evaluate((k) => localStorage.getItem(k), KEY)
  const state = JSON.parse(raw)
  state.currentUserId = 'me'
  return state
}

/** 以出厂数据为基础写入自定义种子（mutate 在 Node 侧执行），随后重载生效 */
async function seed(page, mutate) {
  const state = await freshState(page)
  if (mutate) mutate(state)
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, JSON.stringify(state)])
  await page.goto(`${BASE}/discover`, { waitUntil: 'networkidle' })
}

async function readState(page) {
  const raw = await page.evaluate((k) => localStorage.getItem(k), KEY)
  return JSON.parse(raw)
}

async function switchTo(page, displayName) {
  await page.goto(`${BASE}/me`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: displayName, exact: true }).click()
  await page.waitForTimeout(250)
}

/** 通过 UI 创建/保存 Portrait（去预览 = 保存草稿，但不确认公开） */
async function createPortrait(page, nick) {
  await page.goto(`${BASE}/me/portrait/edit`, { waitUntil: 'networkidle' })
  await page.locator('#nickname').fill(nick)
  await page.getByRole('button', { name: '羽毛球', exact: true }).first().click()
  await page.getByRole('button', { name: '交朋友', exact: true }).first().click()
  await page.getByRole('button', { name: '去预览' }).click()
  await page.waitForURL(/\/me\/portrait\/preview/)
  await page.goto(`${BASE}/me`, { waitUntil: 'networkidle' })
}

/** 修改昵称并保存草稿（去预览后不确认公开，直接离开） */
async function editNickname(page, nick) {
  await page.goto(`${BASE}/me/portrait/edit`, { waitUntil: 'networkidle' })
  await page.locator('#nickname').fill(nick)
  await page.getByRole('button', { name: '去预览' }).click()
  await page.waitForURL(/\/me\/portrait\/preview/)
  await page.goto(`${BASE}/me`, { waitUntil: 'networkidle' })
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page = await context.newPage()
page.on('pageerror', (e) => record(`pageerror@${page.url()}`, false, e.message))

try {
  // ================= P0-04：跨身份 ID 冲突与资料覆盖 =================
  await seed(page, (s) => {
    s.identities.push({ id: 'u-test2', displayName: '测试乙', isDemoContext: true })
  })
  await createPortrait(page, '甲同学')
  await switchTo(page, '测试乙')
  await createPortrait(page, '乙同学')
  let st = await readState(page)
  const pMe = st.portraits.filter((p) => p.ownerId === 'me')
  const pT2 = st.portraits.filter((p) => p.ownerId === 'u-test2')
  record('P04-1 两个无 Portrait 身份各自成功创建', pMe.length === 1 && pT2.length === 1,
    `me x${pMe.length}, u-test2 x${pT2.length}`)
  record('P04-2 两份 Portrait ID 不同', Boolean(pMe[0] && pT2[0] && pMe[0].id !== pT2[0].id),
    `me.id=${pMe[0]?.id}, u-test2.id=${pT2[0]?.id}`)
  record('P04-3 owner 绑定正确', Boolean(pMe[0]?.ownerId === 'me' && pT2[0]?.ownerId === 'u-test2'),
    `owners: ${pMe[0]?.ownerId}, ${pT2[0]?.ownerId}`)
  await shot(page, 'P04-1-two-portraits-created')

  await switchTo(page, '我（演示身份）')
  await editNickname(page, '甲同学改')
  st = await readState(page)
  const t2After = st.portraits.find((p) => p.ownerId === 'u-test2')
  const meAfter = st.portraits.find((p) => p.ownerId === 'me')
  record('P04-4 甲编辑后乙的记录未被覆盖', Boolean(t2After && t2After.nickname === '乙同学'),
    `u-test2 nickname=${t2After?.nickname ?? '记录丢失'}`)
  record('P04-5 甲的编辑正常生效', Boolean(meAfter && meAfter.nickname === '甲同学改'),
    `me nickname=${meAfter?.nickname}`)

  await page.reload({ waitUntil: 'networkidle' })
  const stReload = await readState(page)
  const t2Reload = stReload.portraits.find((p) => p.ownerId === 'u-test2')
  record('P04-6 刷新后双身份数据保持一致', Boolean(
    t2Reload && t2Reload.nickname === '乙同学' &&
    stReload.portraits.find((p) => p.ownerId === 'me')?.nickname === '甲同学改',
  ), 'reload mismatch')

  const refsOk = stReload.invitations.some((i) => i.id === 'inv-1' && i.basicSnapshot?.portraitId === 'p-xia') &&
    stReload.enrollments.some((e) => e.id === 'enr-1' && e.basicSnapshot?.portraitId === 'p-yizhou')
  record('P04-7 既有邀请/报名引用保持有效', refsOk, 'fixture references broken')
  await shot(page, 'P04-2-after-cross-edit')

  // ================= P0-01a：无可信 Snapshot 的旧公开资料应暂停公共展示 =================
  await seed(page, (s) => {
    const pl = s.portraits.find((p) => p.id === 'p-lin')
    delete pl.publicSnapshot // 模拟旧 localStorage：isPublic=true 但无确认快照
    pl.isPublic = true
  })
  await page.goto(`${BASE}/discover/people`, { waitUntil: 'networkidle' })
  let body = (await page.locator('body').textContent()) ?? ''
  record('P01a-1 无快照旧公开资料不出现在找同频的人', !body.includes('林间风'), 'nickname visible in people list')
  await shot(page, 'P01a-1-people-list')

  await page.goto(`${BASE}/nebula`, { waitUntil: 'networkidle' })
  body = (await page.locator('body').textContent()) ?? ''
  record('P01a-2 无快照旧公开资料不出现在星云', !body.includes('林间风'), 'nickname visible in nebula')
  await shot(page, 'P01a-2-nebula')

  await page.goto(`${BASE}/people/p-lin`, { waitUntil: 'networkidle' })
  body = (await page.locator('body').textContent()) ?? ''
  record('P01a-3 公共详情不展示未确认内容（无 bio）', !body.includes('喜欢在代码'), 'draft bio visible on public detail')
  record('P01a-4 公共详情给出待重新确认提示', /重新确认公开|未公开/.test(body), 'no re-confirm hint')
  await shot(page, 'P01a-3-detail')

  // ================= P0-01b：编辑草稿未再次确认前，他人只能看到旧确认版 A =================
  await seed(page)
  await switchTo(page, '林间风')
  await editNickname(page, '林间风B') // 保存草稿 B，未确认
  await switchTo(page, '我（演示身份）')
  await page.goto(`${BASE}/discover/people`, { waitUntil: 'networkidle' })
  body = (await page.locator('body').textContent()) ?? ''
  record('P01b-1 未确认草稿昵称不进入公共列表', !body.includes('林间风B'), 'draft nickname B in people list')
  await shot(page, 'P01b-1-people-list')
  await page.goto(`${BASE}/people/p-lin`, { waitUntil: 'networkidle' })
  const h2Texts = await page.evaluate(() => [...document.querySelectorAll('h2')].map((h) => h.textContent.trim()))
  record('P01b-2 公共详情仍显示已确认版本 A', h2Texts.includes('林间风'), `h2=${JSON.stringify(h2Texts)}`)
  body = (await page.locator('body').textContent()) ?? ''
  record('P01b-3 公共详情不显示草稿昵称 B', !body.includes('林间风B'), 'draft nickname B on detail')
  await shot(page, 'P01b-2-detail')

  // ================= P0-02：报名者名单与状态不得向无关访客暴露 =================
  await seed(page)
  await createPortrait(page, '甲同学')
  await page.goto(`${BASE}/activities/a-hackathon`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: '申请报名', exact: true }).first().click()
  await page.waitForTimeout(300)
  body = (await page.locator('body').textContent()) ?? ''
  record('P02-1 申请者可见自己的报名状态', body.includes('待组织者确认'), 'own pending status missing')
  record('P02-2 申请者看不到其他报名者（一舟）', !body.includes('一舟'), 'other enrollee visible to applicant')
  await shot(page, 'P02-1-applicant-view')

  await switchTo(page, '云栖') // 无关访客：非组织者、未报名
  await page.goto(`${BASE}/activities/a-hackathon`, { waitUntil: 'networkidle' })
  body = (await page.locator('body').textContent()) ?? ''
  record('P02-3 无关访客看不到报名者一舟', !body.includes('一舟'), 'enrollee visible to stranger')
  record('P02-4 无关访客看不到报名者甲同学', !body.includes('甲同学'), 'enrollee visible to stranger')
  record('P02-5 无关访客看不到报名记录名单', !body.includes('报名记录'), 'enrollment list visible to stranger')
  await shot(page, 'P02-2-stranger-view')

  await switchTo(page, '千屿') // 组织者：合法可见
  await page.goto(`${BASE}/activities/a-hackathon`, { waitUntil: 'networkidle' })
  body = (await page.locator('body').textContent()) ?? ''
  record('P02-6 组织者可见申请者记录', body.includes('一舟'), 'organizer cannot see applicant')
  const confirmCount = await page.getByRole('button', { name: '确认', exact: true }).count()
  record('P02-7 组织者保留处理入口', confirmCount > 0, 'organizer confirm button missing')
  await shot(page, 'P02-3-organizer-view')

  // ================= P0-03：活动发起人署名不得绕过公开投影 =================
  await seed(page)
  await switchTo(page, '阿柚')
  await editNickname(page, '阿柚B') // 草稿 B 未确认
  await switchTo(page, '我（演示身份）')
  await page.goto(`${BASE}/activities/a-badminton`, { waitUntil: 'networkidle' })
  body = (await page.locator('body').textContent()) ?? ''
  record('P03-1 活动页不展示未确认草稿昵称 B', !body.includes('阿柚B'), 'draft nickname B shown as organizer')
  record('P03-2 活动页展示已确认昵称 A', body.includes('阿柚'), 'confirmed nickname A missing')
  await shot(page, 'P03-1-organizer-draft')

  await switchTo(page, '阿柚')
  await page.goto(`${BASE}/me`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /撤回公开/ }).first().click()
  await page.waitForTimeout(300)
  await switchTo(page, '我（演示身份）')
  await page.goto(`${BASE}/activities/a-badminton`, { waitUntil: 'networkidle' })
  body = (await page.locator('body').textContent()) ?? ''
  record('P03-3 撤回公开后署名兜底为「活动发起人」', body.includes('活动发起人'), 'no neutral fallback label')
  record('P03-4 撤回公开后不再展示任何昵称', !body.includes('阿柚'), 'nickname still shown after withdraw')
  record('P03-5 活动本身仍可访问', body.includes('羽毛球 · 校园约球局'), 'activity not accessible')
  await shot(page, 'P03-2-organizer-withdrawn')
} catch (e) {
  record('unhandled exception', false, e.message)
}

await context.close()
await browser.close()
console.log(`done -> ${OUT}`)
console.log(`summary: ${records.filter((r) => r.ok).length}/${records.length} pass, ${failures} fail`)
process.exit(failures === 0 ? 0 : 1)
