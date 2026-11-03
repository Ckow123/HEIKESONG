// 验证 dist/index.html 可通过 file:// 直接打开并正常路由
import { chromium } from 'playwright'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const url = pathToFileURL(resolve('dist/index.html')).href
console.log('打开:', url)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)

const r = []
r.push(['首页渲染(发现)', (await page.locator('h1').count()) >= 1 && (await page.getByText('发现同好').count()) >= 1])
await page.getByRole('link', { name: /找同频的人/ }).first().click()
await page.waitForTimeout(500)
r.push(['跳转找人列表', page.url().includes('#/discover/people')])
await page.getByRole('link', { name: '星云探索' }).first().click().catch(async () => {
  await page.goto(url + '#/nebula')
})
await page.waitForTimeout(500)
await page.goto(url + '#/nebula')
await page.waitForTimeout(800)
r.push(['星云页渲染', (await page.locator('text=星云探索').count()) >= 1])
await page.goto(url + '#/me/portrait/edit')
await page.waitForTimeout(500)
await page.getByLabel('昵称').fill('本地双击用户')
await page.getByRole('button', { name: '羽毛球', exact: true }).click()
await page.getByRole('button', { name: '交朋友', exact: true }).click()
await page.getByRole('button', { name: '去预览' }).click()
await page.waitForTimeout(800)
r.push(['编辑→预览跳转', page.url().includes('#/me/portrait/preview')])
await page.getByRole('button', { name: '确认公开' }).click()
await page.waitForTimeout(800)
await page.goto(url + '#/discover/people')
await page.waitForTimeout(500)
r.push(['公开后进入找人列表', (await page.getByText('本地双击用户').count()) >= 1])

let failures = 0
for (const [name, ok] of r) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`)
  if (!ok) failures += 1
}
if (errors.length) {
  console.log(`FAIL pageerror: ${errors.join(' | ')}`)
  failures += 1
} else {
  console.log('PASS no pageerror')
}
await browser.close()
const total = r.length + 1
console.log(`summary: ${total - failures}/${total} pass, ${failures} fail`)
process.exit(failures === 0 ? 0 : 1)
