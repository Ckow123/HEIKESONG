# 同频 Campus — Web 应用（V0.1 第一阶段）

面向温州医科大学黑客松赛题 6（兴趣社交与活动）的响应式 Web 网站。
**工程暂定**：技术栈、目录与数据契约为 WorkBuddy 第一阶段实施方案，已获团队确认的仅为「React + Vite + TypeScript + Tailwind CSS v3 + Lucide + React Router」选型本身；业务规则以 `../docs/01_DECISION_LEDGER.md`（DEC-001～005）为唯一依据。

## 环境与版本（2026-11-02 实测）

- Node.js v22.22.2（LTS，WorkBuddy 内置；本机另有 v24.22.1 可用）
- npm 10.9.7
- Git 2.55.0
- Vite 8 / React 19 / TypeScript 7 / Tailwind CSS 3.4 / React Router 7 / lucide-react 1.x

## 启动

```bash
cd app
npm ci          # 或 npm install（首次）
npm run dev     # 开发服务器，默认 http://localhost:5173/
npm run build   # 生产构建（tsc -b && vite build），输出 dist/
npm run preview # 本地预览生产产物，默认 http://localhost:4173/
```

## 数据运行方式（如实说明）

- 全部人物、活动、邀请、会话均为**合成演示数据**，不对应真实师生。
- 数据保存在**当前浏览器的 localStorage**（键：`tongpin-campus-v1`），刷新/重开浏览器后保留；**不会发送到任何服务器，不支持跨设备共享，不是真实联机**。
- 在「我的」页可一键重置为初始合成样例。
- 适配层接口（`src/data/adapters/`）内存版与 localStorage 版一致，未来如团队决定接入真实后端可整体替换。

## 已实现的确认规则（DEC-002/003）

- 未创建 Portrait 也可浏览公开 Portrait 与活动（先浏览）。
- 公共列表、公共详情、星云共用同一公开范围：未公开/已撤回的 Portrait 不出现在任何公共入口。
- 已有邀请接收方、会话对方、活动组织者仍可从互动记录查看对方基础 Portrait（定向可见样例）。
- 待处理邀请须「接受」后才开启会话入口；**不提供「拒绝」操作**（规则未确认）。
- Portrait 创建：昵称 + ≥1 兴趣 + ≥1 社交意图必填，其余选填；先预览再公开，预览不自动公开；可仅保存不公开；可随时撤回公开。
- 撤回公开后：退出公开列表与星云、暂停主动打招呼；已有邀请、会话、报名保留。
- 报名提交、审核、名额占用未实现、未冻结，活动详情页只做门槛说明与创建引导，不伪造「报名成功」。
- 一句话介绍保存前经基本内容过滤（有限词表初筛，见 `src/shared/lib/contentFilter.ts`，不等于完整审核）。

## 页面与路由

| ID | 路由 | 页面 |
| --- | --- | --- |
| P01 | `/discover` | 发现（双并列入口 + 全宽星云入口） |
| P02 | `/discover/people` | 找同频的人 |
| P03 | `/people/:portraitId` | Portrait 详情 |
| P04 | `/discover/activities` | 找活动搭子 |
| P05 | `/activities/:activityId` | 活动详情 |
| P06 | `/nebula` | 星云探索（深色视觉仅限此页） |
| P07 | `/square` | 广场（四类入口，待实现标注） |
| P08 | `/messages` | 信息（待处理邀请 / 已有会话） |
| P09 | `/messages/:conversationId` | 邀请/会话视图 |
| P10 | `/me` | 我的 |
| P11 | `/me/portrait/edit` | Portrait 编辑 |
| P12 | `/me/portrait/preview` | Portrait 预览 |

## 文件所有权（第一阶段）

| 负责人 | 独占范围 |
| --- | --- |
| WorkBuddy 主 Agent | `package*`、根配置、`src/app/**`、`src/domain/**`、`src/data/**`、`src/shared/**` |
| Portrait 子 Agent（可选） | `src/features/portrait/**` |
| 页面子 Agent（可选） | `src/features/discovery|activities|nebula|square/**` |
| 互动子 Agent（可选） | `src/features/messages/**` |

子 Agent 不得修改依赖、共享契约、导航；跨模块类型只从 `@/domain` 导入。

## 验收截图（T1）

`node scripts/capture.mjs`（需先启动 dev 服务器）会对 11 条关键路由分别截取 390px（手机）与 1440px（桌面）视口，输出到 `../evidence/v0.1/`。

## T9 部署准备（待执行）

- 构建产物：`dist/`（纯静态，无 localhost 专用依赖）；SPA 子路由需回退到 `index.html`（Vercel 用 `vercel.json` rewrites，Cloudflare Pages 用 `_redirects`）。
- 环境变量：当前**无**。
- 部署平台、账号/权限、域名：**待团队确认**；确认前不申请账号、不执行发布。
- 本地可运行与线上可访问为两项独立验收，线上部署后需按交接文档 11.3 做手机/电脑冒烟测试。
