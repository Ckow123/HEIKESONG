# 同频 Campus

面向温州医科大学黑客松**赛题 6（兴趣社交与活动）**的响应式 Web 网站原型。

产品主张：不做好看优先的滑卡配对，而是通过 **Portrait（兴趣与自我表达卡片）** 让同学互相认识，通过 **活动搭子** 把线上同频落到线下见面；**星云** 提供开放式探索，**广场** 承载校园长期内容蓝图。

> 本仓库为黑马松（Hackathon）阶段的 V0.1 可运行原型，**全部人物、活动、邀请、会话均为合成演示数据，不对应任何真实师生**。所有交互数据仅保存在当前浏览器的 localStorage，不发送到任何服务器，**不是真实联机产品**。

---

## 当前完成度（如实标注）

### 已实现（可真实操作）

| 能力 | 说明 |
| --- | --- |
| 响应式框架 | 手机端底部四栏导航、桌面端顶部导航；390 / 1440 双视口无横向滚动 |
| 四个一级模块 | 发现 / 广场 / 信息 / 我的，名称、语义、顺序固定 |
| 发现页 | 两个并列入口「找同频的人」「找活动搭子」+ 整行「星云探索」入口 |
| 找同频的人 | 仅展示已公开 Portrait 的列表 |
| Portrait 详情 | 公开资料完整展示；定向可见按互动关系判断 |
| Portrait 创建与编辑 | 昵称 + ≥1 兴趣 + ≥1 社交意图必填，其余选填；保存前经有限词表内容过滤 |
| Portrait 预览 → 公开 | 先预览后手动公开，预览不自动公开；也可仅保存不公开 |
| 撤回公开 | 立即退出公开列表与星云、暂停主动打招呼；已有邀请、会话、报名保留 |
| 活动列表 / 详情 | 展示活动信息、组织者与资料门槛说明 |
| 星云探索 | 独立深色子页，公开同学的合成星球按位置展示，可点击进入 Portrait |
| 信息 | 待处理邀请与已有会话两个分区 |
| 接受邀请 | 接受后开启会话入口；不提供「拒绝」（该规则尚未确认，不伪造功能） |
| 我的 | Portrait 状态、公开/未公开、重置演示数据 |
| 状态持久化 | localStorage（键 `tongpin-campus-v1`），刷新后保留 |

### 明确未实现（不冒充完成）

- **活动报名提交 / 审核 / 名额占用**：规则未冻结，详情页只做门槛说明，不伪造「报名成功」。
- **星云搜索、拖拽缩放、点击发起连接**：最低交互范围待团队确认（T7）。
- **广场内容**：捞人、测评地图、吐槽、求助帖属于长期蓝图，当前仅入口与「待实现」标注。
- **真实后端、登录、跨设备数据、在线聊天**：当前为纯前端 + localStorage。
- **公网部署**：构建产物已就绪，部署平台与账号待确认，尚未发布。

### 演示数据说明

`app/src/data/fixtures.ts` 提供合成的人物、活动、邀请、会话、报名与互动关系样例。数据经适配层（`app/src/data/adapters/`）读取，内存版与 localStorage 版接口一致，未来接入真实后端时可整体替换。

---

## 技术栈

| 层 | 选型 | 版本（实测） |
| --- | --- | --- |
| 构建 | Vite | 8.3.5 |
| 框架 | React / React DOM | 19.3.1 |
| 语言 | TypeScript | 7.0.2 |
| 路由 | React Router DOM | 7.18.5 |
| 样式 | Tailwind CSS + PostCSS + Autoprefixer | 3.4.19 / 8.5.x / 10.6.x |
| 图标 | lucide-react | 1.66.x |
| 代码检查 | oxlint | 1.89.x |
| 单文件产物 | vite-plugin-singlefile | 2.3.x |
| 验收截图 | Playwright | 1.64.x |

实测环境：Node.js v22.22.2（LTS）、npm 10.9.7、Git 2.55.0。

设计系统：蓝紫主色 + 薄荷绿辅色 + 浅紫灰底 + 大圆角卡片；深色宇宙视觉**仅限星云页**，不影响全站浅色主题。参考图见 `refer-picture/`。

---

## 快速开始

```bash
git clone https://github.com/linxuanjun97-eng/HEIKESONG.git
cd HEIKESONG/app

npm ci            # 按 package-lock.json 复现依赖
npm run dev       # 开发服务器，http://localhost:5173/
```

其他命令：

```bash
npm run build     # tsc -b && vite build，产出单文件 dist/index.html
npm run preview   # 本地预览生产产物，http://localhost:4173/
npm run lint      # oxlint
```

- **无环境变量依赖**，克隆后即可运行，不需要 `.env` 或任何密钥。
- 构建产物为**单文件 HTML**（JS/CSS 全部内联，`base: './'`），可直接双击用 `file://` 打开，也可部署到任意静态托管；部署到子路径时 SPA 子路由需回退到 `index.html`。

---

## 目录结构

```text
HEIKESONG/
├── app/                        # 前端应用（唯一可执行代码）
│   ├── src/
│   │   ├── app/                # 应用外壳：AppShell、底部/顶部导航、路由、导航项
│   │   ├── domain/             # 领域模型：portrait / activity / invitation / nebula / square / identity
│   │   ├── data/               # 数据层：DataProvider、fixtures、state、memory/storage 适配器
│   │   ├── features/           # 页面：discovery / activities / nebula / square / messages / portrait
│   │   ├── shared/             # 共享 UI（Button/Card/Tag/PageHeader/EmptyState）、样式、内容过滤
│   │   └── main.tsx            # 入口
│   ├── scripts/                # Playwright 验收截图与冒烟脚本
│   ├── public/                 # favicon、icons.svg
│   ├── index.html
│   └── package.json            # 脚本与依赖（package-lock.json 已锁定）
├── docs/                       # 决策与交接文档（团队事实来源，优先于代码注释）
│   ├── 01_DECISION_LEDGER.md   # 唯一正式决策增量日志（DEC-001～006）
│   ├── 02_OPEN_QUESTIONS.md    # 高优先级待确认问题队列
│   ├── 03_HANDOFF_STATUS.md    # 跨会话接力状态快照
│   ├── 04_CODEX_START_PROMPT.md
│   └── 07_WORKBUDDY_HANDOFF_V0.md   # V0.1 交接：页面/数据/任务/验收/文件所有权
├── evidence/v0.1/              # 真实验收截图（11 路由 × 390/1440）+ 验收记录
├── references/                 # 赛题与提交材料原文、UI 参考说明
├── refer-picture/              # 原始 UI 参考图（8 张）
├── .agents/, .grill/           # 访谈用 skill 与访谈留存
├── AGENTS.md                   # AI 协作根规则（事实优先级、不可擅改项、操作边界）
├── README_FIRST.md             # 历史启动包说明（早期阶段文档，现状以本 README 为准）
├── 00_CONTEXT_SOURCE.json      # 未修改的原始需求恢复文件，勿用摘要覆盖
└── prompt.txt                  # 历史启动提示词
```

---

## 页面与路由

| ID | 路由 | 页面 | 状态 |
| --- | --- | --- | --- |
| P01 | `/discover` | 发现 | 已实现 |
| P02 | `/discover/people` | 找同频的人 | 已实现 |
| P03 | `/people/:portraitId` | Portrait 详情 | 已实现 |
| P04 | `/discover/activities` | 找活动搭子 | 已实现 |
| P05 | `/activities/:activityId` | 活动详情 | 只读展示（报名未实现） |
| P06 | `/nebula` | 星云探索 | 定位展示（搜索/拖拽未实现） |
| P07 | `/square` | 广场 | 仅入口（内容未实现） |
| P08 | `/messages` | 信息 | 已实现 |
| P09 | `/messages/:conversationId` | 邀请 / 会话视图 | 已实现（接受后开启） |
| P10 | `/me` | 我的 | 已实现 |
| P11 | `/me/portrait/edit` | Portrait 编辑 | 已实现 |
| P12 | `/me/portrait/preview` | Portrait 预览 | 已实现 |

---

## 已确认的规则（DEC-001～005 摘要）

1. 比赛版优先打通「Portrait 认识同频的人」与「活动搭子与组队」两条端到端流程。
2. 先浏览，首次互动前创建基础 Portrait；公开前先预览。
3. 公开可撤回，撤回后退出公开入口并暂停主动打招呼，但已有互动与报名继续有效。
4. 邀请必须由接收方接受后才开启自由聊天。
5. 交付目标为可通过普通浏览器访问的响应式 Web 网站，手机优先、兼容桌面；本地可运行与线上可访问分别验收。

完整条目以 `docs/01_DECISION_LEDGER.md` 为准；未确认事项见 `docs/02_OPEN_QUESTIONS.md`，代码中不把建议当需求实现。

---

## 验收与截图

```bash
# 需先启动 dev 服务器
cd app && node scripts/capture.mjs
```

输出到 `evidence/v0.1/`：11 条关键路由 × 390px（手机）/ 1440px（桌面）共 22 张截图。冒烟脚本：`scripts/smoke-accept.mjs`、`scripts/smoke-portrait.mjs`、`scripts/verify-file-proto.mjs`。

当前验收结论（2026-11-02）：`npx tsc -b`、`npm run build`、`npm run dev`、`npm run preview` 全部通过；22 张截图无横向滚动；邀请接受冒烟 4 项 PASS（含刷新后状态保留）。详见 `evidence/v0.1/验收记录.md`。

---

## 数据与隐私

- 不含真实师生姓名、学号、照片或联系方式，所有内容为合成数据。
- 无用户系统、无埋点、无第三方分析脚本、无服务端请求。
- 清除数据：浏览器控制台执行 `localStorage.removeItem('tongpin-campus-v1')`，或在「我的」页重置演示数据。

---

## 开发协作

- 提交前请先阅读 `AGENTS.md`（事实优先级、不可擅改项、当前操作边界）。
- 四个一级导航名称、语义、顺序固定；发现页的「两个并列入口 + 整行星云入口」结构固定。
- 不做颜值优先的滑卡交互；Portrait 以兴趣标签 + 自由文字为主，MBTI / 星座仅作辅助，不作科学配对承诺。
- 业务规则变更须先写入 `docs/01_DECISION_LEDGER.md`，再改代码。
