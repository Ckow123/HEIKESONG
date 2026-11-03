# STATUS_ADDENDUM — 同频 Campus V0.2 状态补充报告

- **报告时间**：2026-11-03
- **作者**：WorkBuddy 子 Agent B（QA）
- **基准 commit**：`1a580a19d13b9719c134c6f367ff09d49ce2d483`（V0.1 交接基线）
- **本次范围**：批次 1 P0 安全修复（PR-1/PR-2/PR-3）后的状态纠偏与四项独立结论
- **不修改范围**：`docs/03_HANDOFF_STATUS.md`、`README.md`、`docs/01_DECISION_LEDGER.md`、`docs/02_OPEN_QUESTIONS.md`、`docs/07_WORKBUDDY_HANDOFF_V0.md`、`evidence/v0.1/**`、`AGENTS.md`

> 本报告是补充，不覆盖旧文档。旧文档与当前真实状态的差异在下方"差异清单"列出；旧文档保留原文，由主 Agent 在获授权后另行小范围更新。

---

## 一、旧文档与当前真实状态差异清单

来源：`Phase02/04_TESTS_AND_HANDOFF.md:30-42` 的最小纠偏清单，结合批次 1 修复后的源码现状复核。

| 旧文档位置 | 真实差异 | 补充报告应如何写 |
| --- | --- | --- |
| `docs/03_HANDOFF_STATUS.md:4,8,18,28` | 还把 T3/T4 基础写入列为"下一步"；`app/src/data/DataProvider.tsx` 与 Portrait 页面已实现，且批次 1 已补 PR-1/PR-2/PR-3 | 基础创建/预览/公开/撤回已实现且有 P0 修复；两条业务闭环（DEC-001 A/B）仍未实现；不称 T3/T4 全量安全通过 |
| `README.md:21-24` | 基础流程描述大体正确，但定向资料完整性、已公开后编辑隔离此前未说明 | 批次 1 已补 publicSnapshot 隔离；列修复前缺口、修复后验证版本、剩余未决 |
| `README.md:32-38` | 报名未实现如实；主动招呼发送缺口未单列；线上未发 | 明确区分预置接受、主动新发送、样例报名与新申请处理；未部署仍待执行 |
| `README.md:85` | `base: './'` 不等于 BrowserRouter 已支持任意子路径；`app/src/app/router.tsx` 未配置 basename | 根路径托管与子路径托管分别验证；不无证据承诺"任意路径" |
| `README.md:111,161,163`、`evidence/v0.1/验收记录.md:20-26` | 写 22 张/11 路由；实际 24 张 P 类 + 8 张 T 类；逐页溢出声明过宽 | 实际文件数、脚本列表、状态和检测粒度分别列；截图有无与自动断言通过不是同一项 |
| `evidence/v0.1/验收记录.md:16` | 分包描述与当前 singlefile 配置不同 | 说明历史阶段表述，不覆盖旧条目；当前产物结构用新构建日志/目录清单实证 |
| `docs/02_OPEN_QUESTIONS.md:8,13,33,36`、`docs/07_WORKBUDDY_HANDOFF_V0.md:166-179,296` | 仍写栈/存储/桌面导航待定、原图未附；DEC-006 已确认工程选择，`refer-picture/` 原图实际存在 | 最新工程事实以 DEC-006 为准；后端/最终联机/部署权限仍待定，不因 localStorage 确认自动获批 |

---

## 二、修复前缺口（PR-1/PR-2/PR-3 的 P0 缺陷）

来源：`Phase02/01_PRIVACY_STATE.md:16-25` 的基准代码证据。

### PR-1 公共内容与编辑内容共用对象（已修复）
- 旧缺口：`app/src/domain/portrait.ts` 只有 `isPublic`，`PublicPortraitView` 是类型而非已确认版本存储；`DataProvider.tsx` 直接投影当前字段
- 旧缺口：去预览时已覆盖公共字段；公共详情也读取原对象；发现/找人/星云依赖同一份可变对象
- 风险：编辑态 B 在再次确认前会替换已确认的公共内容 A，违反 DEC-003.1

### PR-2 会话参与者检查缺失（已修复）
- 旧缺口：`acceptInvitation` 只按 id+pending 转换并加会话，无 `currentUserId`/`toId` 校验、无 interactionAccess 更新、没有返回实际会话 ID
- 旧缺口：`MessagesPage` 会话列表全量展示（不过滤参与者）；`ConversationPage` 只核"存在与 accepted"，无参与者守卫
- 旧缺口：`router.tsx` 直接挂载页面，无其他授权守卫
- 风险：任何身份直达 URL 即可读取他人会话名字/摘要/消息

### PR-3 定向授权没有来源校验（已修复）
- 旧缺口：`DataProvider.tsx` 只校验目标/本人/ACL 匹配；`portrait.ts` source 字段已存在却未使用
- 旧缺口：`fixtures.ts` 三条固定样例并非运行时完整授权系统
- 风险：无关用户可借 URL 获取未公开资料；ACL 篡改后无来源一致性校验

---

## 三、批次 1 修复后验证版本（源码证据）

来源：`app/src/data/DataProvider.tsx`、`app/src/features/messages/**`、`app/src/domain/portrait.ts` 当前内容。

### PR-1 公开内容隔离（publicSnapshot）
- `Portrait` 类型新增 `publicSnapshot?: PublicPortraitView` 字段（草稿与已确认版本分离）
- `toPublicPortrait(p)`：公共投影用 `publicSnapshot` 替换 nickname/interestTags/socialIntents/bio/mbti/zodiac/relationshipStatus；无 snapshot 时回退（向后兼容旧数据）
- `publicPortraits`/`nebulaProjections`/`getPublicView` 均使用 `publicSnapshot`；`getDraftView` 使用当前草稿字段
- `savePortrait`：保留 `existing.publicSnapshot`，编辑草稿不更新公共内容
- `publishPortrait`：确认公开时把当前草稿快照为 `publicSnapshot`
- `withdrawPortrait`：仅改 `isPublic`，保留 `publicSnapshot`（以便重新公开）
- 验证版本：`DataProvider.tsx:47-60,123-124,147-148,204-225,226-237,238-246`

### PR-2 会话参与者检查
- `acceptInvitation(id)` 返回 `{ success, conversationId?, reason? }`：
  - `inv.toId !== state.currentUserId` → `{ success: false, reason: 'not_recipient' }`
  - `inv.status === 'accepted'` → `{ success: true, conversationId: inv.conversationId }`（幂等，不新建多个会话）
  - 接受后建立会话授权（`InteractionAccess`，source=conversation）
- `MessagesPage`：`myConversations = state.conversations.filter((c) => c.participantIds.includes(state.currentUserId))`
- `ConversationPage`：
  - 会话/邀请不存在 → "没有找到这个会话"
  - 非参与者直达 → "无法查看此会话" + "你不是这个会话的参与者"
  - 邀请仍 pending → "邀请尚未被接受" + DEC-003.5 说明
- 验证版本：`DataProvider.tsx:165-203`、`MessagesPage.tsx:19,21,47-57`、`ConversationPage.tsx:20-29,31-43,48-59`

### PR-3 定向授权来源校验（isValidAccessSource）
- 三类 source 校验：
  - `invitation`：`inv.fromId === portrait.ownerId && inv.toId === viewerId`（接收者查看发送者）
  - `conversation`：会话存在、关联邀请 `accepted`、`portrait.ownerId` 与 `viewerId` 都是 participantIds 且不同
  - `enrollment`：`enr.enrolleeId === portrait.ownerId && activity.organizerId === viewerId`（组织者查看报名者）
- `canViewBasicPortrait` 调用 `isValidAccessSource`，不仅检查 ACL 存在
- 验证版本：`DataProvider.tsx:10-45,149-159`

---

## 四、本次 QA 脚本改进（B1/B2/B3）

### B1 capture.mjs / capture-portrait.mjs
- 输出目录默认 `evidence/next-iteration/<YYYY-MM-DD>/`，支持 `OUT_DIR` 环境变量覆盖
- 每路由每视口独立检查：h1 存在+文本匹配、关键文本出现、横向溢出（`scrollWidth > clientWidth`）、pageerror 事件
- 截图成功不自动判页面正确；失败累积并使进程非零退出（`process.exit(1)`）
- 逐页逐视口写 PASS/FAIL 单项记录到 console

### B2 smoke-accept.mjs
- 把初始待处理/接受后入口/列表/刷新等预期变为实际断言（不再只打印）
- 累积失败非零退出（参考 smoke-portrait.mjs 的 failures 计数模式）
- 补负向用例（独立上下文 + 合成夹具）：
  - 无关会话直达 URL：导航到 me 不是参与者的会话 → 应显示"无法查看此会话"
  - pending 直达会话：导航到 pending 邀请关联的会话 → 应显示"邀请尚未被接受"
  - 不存在的会话 ID → 应显示"没有找到这个会话"
  - 非法接收者：别人收到的邀请不出现在我的待处理列表（MessagesPage.toId 过滤）
- 用独立上下文（`browser.newContext()`）+ 合成夹具，每次状态可复现
- 断言前刷新以验证持久化
- 注：当前演示 currentUserId 固定为 me，无法切换身份调用 acceptInvitation API；负向用例通过直达 URL 测试会话越权（符合任务描述限定）

### B3 smoke-portrait.mjs
- 增强三项必填各自断言：分别断言"请填写昵称""请至少选择 1 个兴趣标签""请至少选择 1 项社交意图"
- 补 01 矩阵 PR-02：公开 A → 编辑改为唯一 B → 去预览 → 检查公共入口（找人列表/星云）仍显示 A 不显示 B；刷新后仍一致；预览页显示 B 不显示 A
- 补 01 矩阵 PR-07：撤回公开后活动已有报名记录数量不变（DEC-003.3 不变量），刷新后仍一致
- 保留既有 10 项 check，累积失败非零退出
- 不能只换名字复刻实现：PR-02 直接验证 publicSnapshot 隔离在公共入口生效

### 未运行的脚本（待主 Agent 冻结源码后由 QA 执行）
- `verify-file-proto.mjs`：本次未改（可选改进），保留原实现
- 上述四个脚本本次只完成代码改进与语法校验（`node --check` 通过），**未实际运行**；运行结果待主 Agent 冻结被测源码后由 B 在新 run 目录执行并补 REPORT.md

---

## 五、剩余未决

### Q1~Q5 决策门（`Phase02/02_CORE_FLOW_DECISIONS.md:30-38`）
| ID | 状态 | 待确认内容 | 局部阻塞 |
| --- | --- | --- | --- |
| Q1 | 待确认 | 两条流程由谁实际扮演对方并操作？怎样定义比赛"闭环完成"？ | 身份切换产品入口、端到端演示口径；01 负向授权夹具测试不受影响 |
| Q2 | 待确认 | 主动招呼内容与重复发送的最小规则？ | 新 `sendInvitation` 动作、发送表单与相应状态 |
| Q3 | 待确认 | 接受已有邀请是否要求接收方先创建基础 Portrait？撤回后怎样接受？是否本轮加入拒绝？ | 接受前资料引导与撤回后的操作体验；接收者身份校验不受影响 |
| Q4 | 待确认 | 活动采用申请制还是直接加入？组织者如何处理、结果是什么？ | 新报名状态、组织者处理入口、结果页与取消动作 |
| Q5 | 待确认 | 基础定向字段、互动资料当前/提交版本、编辑中旧公开版处理及旧存储策略？ | 定向资料实际输出、申请提交资料和后续编辑验收 |

### 两条核心流程未实现（DEC-001 A/B）
- **A. Portrait 认识人闭环**：从发现页主动发起招呼→接收方明确接受→会话入口。当前只有预置邀请的接受路径，无主动 `sendInvitation` 动作；聊天收发未实现
- **B. 活动搭子与组队闭环**：浏览活动→提交申请→组织者处理→申请者看到结果。当前活动详情页只做门槛说明，无报名提交/审核/名额占用动作
- 证据：`app/src/features/portrait/PortraitDetailPage.tsx:94-101`（只有说明，无发送接口）、`app/src/features/activities/ActivityDetailPage.tsx:58-91`（无申请动作）

### 部署未执行
- 平台、域名、账号/部署权限、服务端数据、持久化、登录/聊天、现场网络均待确认（`docs/02_OPEN_QUESTIONS.md:29-37`）
- 本次不创建账号、不部署、不推送
- 线上访问结论见下方第六节

### 其他未决
- 拒绝邀请操作（最后一个未回答问题，`docs/02_OPEN_QUESTIONS.md:45`）
- 星云最低交互组合（搜索/点击/拖缩放，`docs/02_OPEN_QUESTIONS.md:20`）
- 广场四类模块实装深度（`docs/02_OPEN_QUESTIONS.md:23`）
- 演示设备、网络依赖、是否必须单机离线运行（`docs/02_OPEN_QUESTIONS.md:22`）

---

## 六、四项独立结论

> 每项分别判定，不互相默认通过。本地通过不等于线上通过；线上可访问不等于跨设备联机。

### 1. 本地源码启动：已验证
- `npm run dev`：Vite dev server 启动，`http://localhost:5173/`（历史验收通过，`docs/03_HANDOFF_STATUS.md:7`）
- `npm run build`：`tsc -b && vite build`，退出码 0（历史验收通过）
- `npx tsc -b`：类型检查通过（历史验收通过）
- 本次未重跑构建；如需最新构建日志/产物哈希绑定，待主 Agent 冻结源码后由 B 执行并补 REPORT.md
- 不凭 HTTP 200 判断页面内容；脚本本次改进后包含 h1/关键文本/pageerror 检查

### 2. 生产预览：已验证
- `npm run preview`：本地预览生产产物，`http://localhost:4173/`（历史验收通过）
- 构建产物为单文件 HTML（`vite-plugin-singlefile`，`app/vite.config.ts`）
- 退出码 0（历史验收）
- 本次未重跑；如需最新预览主流程证据，待 B 执行

### 3. 线上访问：未执行
- 平台/账号/域名/发布权限未确认（`docs/02_OPEN_QUESTIONS.md:29-31`）
- 本次不部署、不创建账号、不推送
- 待 T9 部署授权后，B 用手机/电脑普通浏览器及至少另一设备/独立上下文打开真实 URL，入口/子路由直达刷新/资源/控制台/关键流程逐项实测
- 不填示例地址；不因单浏览器模拟可公网托管称真实多用户联机

### 4. 数据联机模式：不适用
- DEC-006 已确认第一阶段采用 localStorage（`docs/03_HANDOFF_STATUS.md` DEC-006 条目）
- 不接后端、不接认证、不接实时聊天、不接云数据库
- localStorage 仅当前浏览器上下文有效，刷新后保留，不是跨设备同步
- 此项不阻塞本地源码启动与生产预览；线上访问若需要真实跨设备联机须团队另行决定并改造架构

---

## 七、文件所有权与禁止范围（B 视角）

- **B 独占可写**：`app/scripts/**`、`evidence/next-iteration/<run-id>/**`
- **禁止修改**：业务源码（`app/src/**`）、`domain/data/router/shared`、配置、依赖/锁、AGENTS.md、DEC-001~006、README、所有交接文档、`evidence/v0.1/**`、原图、Skill
- **失败处理**：失败报给主 Agent 或 A，不顺手改产品代码
- **未授权不修改旧文档**：本报告只补充纠偏；旧文档同步须后续单独授权

---

## 八、下一步

1. 主 Agent 冻结被测源码（记录 commit + 工作树差异/内容哈希）
2. B 在新 run 目录执行改进后的 capture / smoke-accept / smoke-portrait / verify-file-proto
3. B 汇总运行日志、退出码、截图、产物 SHA256 到 `evidence/next-iteration/2026-11-03/REPORT.md`
4. 主 Agent 复核报告与源码一致，签收 T8；T9 未部署不签线上通过
5. Q1~Q5 决策门逐项确认后，主 Agent 实现 DEC-001 A/B 两条流程，B 补对应回归

---

## 九、2026-11-03 V0.3 回归补充（追加）

> 本节为追加内容，不覆盖上文。执行者：WorkBuddy 主 Agent（QA 子 Agent 因额度限制未能启动，由主 Agent 按既定 B 范围执行，仅写 `app/scripts/**` 与本目录）。

### 本轮已完成（相对上文的进展）
- **DEC-001 两条核心流程已实现并回归通过**：
  - A. Portrait 认识人闭环：主动打招呼（固定礼貌招呼）→ 接收方信息中心待处理 → 明确接受 → 进入会话页（smoke B1~B5 PASS）。聊天收发仍未实现，会话入口即终点。
  - B. 活动搭子闭环：申请报名 → 待组织者确认 → 组织者确认/拒绝 → 申请者看到结果（smoke C1~C4 PASS）。
- 隐私负向用例通过：未公开 Portrait 直达提示（N1）、重复打招呼不产生第二条邀请（B3）、撤回公开后退出公开列表（A5）。
- 第五~八节中"两条核心流程未实现（DEC-001 A/B）"条目因此**已过时**，以此节为准；Q1~Q5 决策门条目仍为"待项目负责人独立确认"（当前实现为演示口径）。

### 本地构建与本地浏览器回归结论
- `npx tsc -b` / `npm run lint` / `npm run build`：退出码均为 0（`logs/build-checks.log`）。
- 12 路由 × 4 视口（375/390/1280/1440）共 49 项检查全部 PASS，无横向溢出、无 console/pageerror、底栏无遮挡（`REPORT.md` 第二节）。
- 核心流程冒烟 15/15 PASS（`REPORT.md` 第三节）。
- 受控失败演练：错误端口下 49/49 FAIL 且退出码 1，脚本失败语义有效。

### 线上访问：待执行（不变）
- 平台/账号/域名/发布权限仍未确认；本轮未部署、未创建账号、未推送。线上可访问结论不能由本地结果推定。
