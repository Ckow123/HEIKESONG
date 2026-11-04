# 同频 Campus｜Phase02 视觉升级实施计划（PHASE02_VISUAL_POLISH）

- 版本：2026-11-04 · 编制：朋友端 WorkBuddy · 状态：**待 B1 独立验收通过后执行**
- 代码基线：分支 `fix/b1-p0-20261103`（起点 `67716d6` → B1 修复 `96fc7f1` → 证据/报告 `893ac11` → 日志 `8c10538`）
- 前置条件：Owner 对 B1（`evidence/b1/B1-20261103-01/`）独立验收通过。验收前本文件仅为计划，不动源码。

## 1. 范围与边界

**范围内（6 个界面 + 1 个横幅）**：
1. 发现首页（`/discover`，含星云横幅）
2. 找同频的人（`/discover/people`）
3. 活动搭子（`/discover/activities` + 活动详情 `/activities/:id` 的视觉层）
4. Portrait（`/people/:id`、`/me`、`/me/portrait/edit`、`/me/portrait/preview`）
5. 校园广场（`/square`）
6. 信息中心（`/messages`、`/messages/:id`）

**明确排除**：
- 星云独立页 `/nebula` 整页不改；只允许调整发现首页的星云探索横幅。
- 不推倒重做，不更换 React + Vite + TypeScript + Tailwind v3 + Lucide 技术栈。
- 不新增业务功能：通知铃、账号下拉、收藏、发起活动、拒绝邀请、热帖/点赞、学院/年级/相册等参考图字段均不实现（沿用 DEC-001～007 与 Q1～Q5 未定项）。
- 四个一级导航名称/语义/顺序固定（发现/广场/信息/我的），手机底部四栏、桌面顶部导航（DEC-006.3）不变；发现页双并列入口 + 整行星云横幅结构不变。
- 视觉调整不得改变 B1 已修复的公开投影/权限语义；未实现业务继续标注「演示/待实现」，不做装饰性假控件。

**参考依据**：`refer-picture/` 八文件（七份独立画面，`同频校园社区双页面设计-1.png` 与 `同频校园社区双页面设计.png` SHA256 相同）；既有差距分析见 `Phase02/03_FRONTEND_UI.md`（其星云部分本轮不适用）。参考图是视觉输入，不整图铺页、不照搬未批准字段。

## 2. 全局 Design System（在现有 tokens 上收敛，不换主题）

以 `app/tailwind.config.js` 现有体系为基础做精修，主色不变：

| 类别 | 规范 |
|---|---|
| 主色 | primary `#6C5CE7`（soft `#EFECFD`）、mint `#3ECFAD`（soft `#E5F9F3`）、pink `#F47FB0`（soft `#FDEAF3`） |
| 底色/墨色 | bg `#F6F5FB`、card `#FFFFFF`、ink `#2D2A3E` / sub `#8A87A0`；深色 `#1B1437` 仅星云横幅等局部 |
| 渐变 | 入口卡：primary-soft→mint-soft / mint-soft→primary-soft 柔和渐变；hero/星云横幅使用深紫系渐变（参考 `同频校园发现主页.png`）；全站不整体改深色 |
| 圆角 | 卡片 18px（`rounded-card`）；按钮/标签全圆角；头像圆形 |
| 阴影 | `shadow-card`（0 4px 16px rgba(108,92,231,.08)）为默认；hover 加深一档；底栏 `shadow-nav` |
| 字体层级 | 页标题 22–24px bold（带小装饰符号，参考图的标题星芒可用 Lucide 近似）；分区标题 16–18px bold + 副标题 12px ink-sub；卡片标题 14–15px semibold；元数据 12px；辅助说明 11px。字体栈沿用 PingFang SC / Microsoft YaHei / Noto Sans SC |
| 间距 | 页面纵向节奏 16px 卡间距；卡内边距移动 16px / 桌面 20px；分区标题与内容 10–12px |
| 图标 | 统一 Lucide；分类小图标与封面大图标分层（参考活动卡）；emoji 仅保留现有类别符号，不新增 |

共享组件精修点：`Card`（默认阴影/hover）、`Button`（primary/outline/ghost 三态统一高度与圆角）、`Tag`（tone 色板对齐 tokens）、`GradientAvatar`（首字/渐变种子不变）、`PageHeader`（标题层级与装饰位）、`AppShell/TopNav/BottomNav`（桌面品牌区加重、当前项 primary-soft 高亮；移动底栏安全区与激活态）。所有修改经主 Agent 统一实施，子 Agent 不另建同名组件。

## 3. 页面/组件修改映射

| 界面 | 目标文件 | 现状差距 → 修改要点 | 参考图 |
|---|---|---|---|
| 发现首页 | `features/discovery/DiscoveryPage.tsx` | 标题+白卡 → 校园感 hero 区（标题「在校园，找到和你真正同频的人」保留）、双入口卡渐变+图标+箭头、整行星云横幅（深紫渐变+行星装饰+箭头，仅此处涉及星云）、推荐 Portrait 卡与活动列表层次/「查看更多」 | 同频校园发现主页.png、同频 Campus 校园探索首页.png |
| 找同频的人 | `features/discovery/PeoplePage.tsx`、`PersonCard.tsx` | 统一人物卡：头像/渐变封面、昵称、标签组、MBTI/星座辅助行、查看入口；搜索/计数不变 | 同频校园发现主页.png（人物卡） |
| 活动搭子 | `features/activities/ActivitiesPage.tsx`、`ActivityCard.tsx`、`ActivityDetailPage.tsx` | 类别筛选按钮化视觉（选中态 primary）、活动卡封面层级（类别 badge、日期/地点/人数元数据行、CTA）；详情页主卡与报名卡视觉对齐，**不改 B1 权限逻辑** | 同频校园活动发现界面.png |
| Portrait | `features/portrait/PortraitDetailPage.tsx`、`MePage.tsx`、`PortraitEditPage.tsx`、`PortraitPreviewPage.tsx` | 资料区/兴趣/社交意图层次；封面渐变+头像重叠；编辑表单分组卡与预览卡统一；保留 B1 重新确认/撤回提示卡样式 | 同频 Campus 个人 Portrait 页面.png |
| 校园广场 | `features/square/SquarePage.tsx` | 四入口（捞人/测评地图/吐槽/求助帖）彩色辨识卡 + 待实现标注；不实现帖子流、点赞、拒绝 | 同频校园广场与信息中心界面-2.png、同频校园社区双页面设计.png |
| 信息中心 | `features/messages/MessagesPage.tsx`、`ConversationPage.tsx` | 待处理/已发出/会话三区标题与计数徽章、邀请行头像+标签+操作按钮层级、会话行摘要；仅视觉，不新增拒绝按钮 | 同频校园广场与信息中心界面-2.png |
| 全局壳 | `app/AppShell.tsx`、`TopNav.tsx`、`BottomNav.tsx`、`shared/ui/*`、`shared/styles/globals.css` | 桌面 max-w 与留白、导航激活态、底栏遮挡安全区复核 | 同频 Campus 校园探索首页.png |

## 4. 文件所有权

- **主 Agent（WorkBuddy 主会话）独占**：`app/src/app/**`、`app/src/shared/**`、`app/src/features/portrait/**`、`app/src/features/messages/**`、`app/src/features/activities/ActivityDetailPage.tsx`、`app/tailwind.config.js`、本计划与决策文档。
- **子 Agent A（如启用）独占**：`app/src/features/discovery/**`、`app/src/features/activities/ActivitiesPage.tsx` + `ActivityCard.tsx`、`app/src/features/square/**`、`app/public/workbuddy-ui/**`（新静态资产，注明合成来源）。
- **禁止任何一方修改**：`app/src/domain/**`、`app/src/data/**`（B1 数据层冻结）、路由表语义、`app/scripts` 既有回归逻辑、历史证据（`evidence/v0.1`、`evidence/next-iteration`、`evidence/b1`）、`refer-picture/`。
- **QA 独占**：`evidence/phase02/<run-id>/`，A 产出移交 QA 写入，不覆盖任何旧图。
- 子 Agent 与主 Agent 之间只通过本文件与视觉规格沟通；数据读取一律使用 `DataProvider` 公开投影（`publicPortraits` 等），禁止绕过读取 `state.portraits` 草稿做展示。

## 5. Frontend Design Skill 加载方式（必须先做并留证）

1. 开工第一步通过 Skill 工具调用 **`frontend-design`**；实际安装位置已核实：`C:\Users\ASUS\.workbuddy\skills\frontend-design-3__skillhub\SKILL.md`（注册名 `frontend-design`）。
2. 读取其 SKILL.md 后，把「采用的设计规范要点 + 实际调用时间 + 路径」记录到 `evidence/phase02/<run-id>/skill-usage.md`。
3. 其「避免通用 AI 美学」与本项目「沿用已确认校园浅色体系、不推倒重做」的关系：以参考图与现有 tokens 为最高约束，Skill 用于提升质感细节（层次/渐变/微交互），不得借 Skill 擅自改主题色、换技术栈或引入未批准布局。
4. 若执行环境找不到该 Skill：如实报告阻塞，不安装新 Skill、不凭记忆冒充已调用；视觉实施暂停，纯文档/测试工作可继续。

## 6. 实施顺序

| 步骤 | 内容 | 产出/关卡 |
|---|---|---|
| S0 | 调用 frontend-design Skill；逐一打开七份独立参考图；核对 B1 修复后截图作为 before | skill-usage.md + 参考图核对表 |
| S1 | 主 Agent：Design tokens 精修 + shared 组件 + AppShell/TopNav/BottomNav | tsc/lint/build 通过；49 路由回归不劣化 |
| S2 | 发现首页 + 星云横幅（仅此横幅涉及星云） | 双视口截图 |
| S3 | 找同频的人（PeoplePage/PersonCard） | 双视口截图 |
| S4 | 活动列表/卡片/详情视觉 | 双视口截图 + 筛选交互复测 |
| S5 | Portrait 四页 | 双视口截图 + 公开/撤回/重新确认流程复测 |
| S6 | 广场 + 信息中心 | 双视口截图 |
| S7 | 全量验收：tsc、lint、build、49 路由、15 Smoke、26 隐私负向、双视口人工对照 | 验收报告 |

每步只动所有权内文件；S2–S6 可并行度取决于子 Agent 启用与否，S1 必须先完成。

## 7. 验收标准

### 通用（每个界面都必须满足）
- **1440×900**：顶部导航不挤压换行；内容区左右留白均匀；卡片网格列数符合设计（人物 3 列、入口 2–4 列）；无横向溢出；无元素遮挡。
- **390×844**：底部四栏固定在视口底部且不遮挡最后一项内容（实滚到底，末项按钮完整可点，main padding-bottom ≥ 48px）；双入口卡并排不溢出；标签换行不碰撞；无横向溢出。
- 文字对比度可读（ink/sub 在浅底上）；可点区域 ≥ 32px；键盘可达、focus 可见。
- 与参考图为「视觉语言收敛」，逐项记录「已改善 / 保留差异及理由」，不宣称逐像素一致。

### 分页验收要点
- 发现首页：hero、双入口、整行星云横幅顺序与结构不变；搜索真实过滤仍只命中已确认公开内容；空态可恢复。
- 找同频的人：公开计数与卡片一致；无快照资料不出现（B1）。
- 活动搭子：四类筛选与全部恢复真实可用；报名/组织者/访客三视角展示符合 B1（名单仅组织者、署名兜底）。
- Portrait：A/B 版本规则不变；撤回后公共不可见；重新确认提示保留。
- 广场/信息：四入口保留；无新增未实现按钮；邀请接受流程不变。

### 工程验收（全部实际执行并记录退出码）
`tsc -b`=0；oxlint errors=0（warnings 不高于基线 14）；`npm run build`=0；路由回归 49/49；Smoke 15/15；隐私负向 26/26。截图与日志写入 `evidence/phase02/<run-id>/`，沿用 `OUT_DIR` 重定向，不覆盖 V0.3/B1 历史证据。

## 8. 交付物

- 视觉修改源码（按所有权分 commit，本地提交，不推送）。
- `evidence/phase02/<run-id>/`：skill-usage、参考图对照表、六界面双视口 before/after、回归/冒烟/隐私日志、验收报告。
- 更新 `docs/03_HANDOFF_STATUS.md` 与决策日志；Push/PR/部署仍须单独审批。
