# 同频 Campus B1 P0 修复报告

- run-id：`B1-20261103-01`
- 执行方：朋友端 WorkBuddy（主体开发）
- 起点 HEAD：`67716d6fea5dab1e665bca7607e1da293f5d9365`（Tree `d38d5466a48bbb541432be30662e9037994ab40d`，已核验一致）
- 修复代码 HEAD（commit 1）：`96fc7f113ef16fcc51f4a71b73f5ad1d55d83b99`
- 最终 HEAD：见本报告提交后的 `git log`（分支 `fix/b1-p0-20261103`）
- 隔离工作区：`D:\WorkBuddy Datebase\HEIKESONG-B1-isolated-20261103`（Git Worktree，分支 `fix/b1-p0-20261103`）
- 原工作区 `D:\WorkBuddy Datebase\HEIKESONG`（`review/v0.3-20261103`）全程未改动；65 个未跟踪历史文件（61 截图 + 4 交接 Markdown）原样保留
- 未执行：push / PR / merge / Cloudflare 部署（待另行审批）

## 1. 三项业务决策实施记录（Gate B，Owner 已批准）

| 决策 | 实施 | 状态 |
|---|---|---|
| 1. 旧公开资料无可信 Snapshot 降级 | fixtures 种子 Portrait 以原始种子建立可信 `publicSnapshot`（`withSeedSnapshot`）；旧 localStorage 无快照公开资料由投影层暂停展示，草稿/邀请/会话/报名全保留；本人端（/me 与详情页）提示重新预览确认；不回填伪造快照 | 已实施 |
| 2. 活动发起人署名 | 有有效公开 Snapshot → Snapshot 昵称；否则（无快照/已撤回/未授权）统一「活动发起人」；活动正常展示；所有公共入口不再读取草稿昵称 | 已实施 |
| 3. 重复 Portrait ID 迁移 | 迁移前原始 localStorage 原文备份至 `tongpin-campus-v1-backup-b1`（只写一次）；仅 owner 唯一可判且全部引用可唯一解析时确定性重 ID（`p-<ownerId>`）并同步修正 interactionAccess/invitation/enrollment 引用；歧义时原样保留并写入 `tongpin-campus-v1-conflicts`，/me 页展示恢复提示 | 已实施 |

## 2. 四项 P0 修复说明

### P0-04 跨身份 Portrait ID 冲突与资料覆盖
- 原因：`savePortrait` 新建固定分配 `p-me`，且更新仅按 ID 匹配（`p.id === existing.id`），两名无 Portrait 身份会得到同 ID；一方再编辑时按 ID 全表替换，覆盖另一人记录。
- 修复：`allocatePortraitId()` 生成唯一稳定 ID（`p-<ownerId>`，冲突时确定性后缀）；`savePortrait`/`publishPortrait`/`withdrawPortrait` 更新均同时匹配 ID 与 ownerId；`storageAdapter.load` 接入 `migrateDuplicatePortraitIds()`（备份→检测→确定性迁移/冲突记录）。
- 文件：`app/src/data/DataProvider.tsx`、`app/src/data/migrations/b1Legacy.ts`（新增）、`app/src/data/adapters/storageAdapter.ts`。

### P0-01 未确认草稿提前公开
- 原因：`toPublicPortrait` 在无 `publicSnapshot` 时回退草稿字段；`getPublicView` 同样回退；fixtures 公开记录无快照。
- 修复：公共投影（`publicPortraits`/`getPublicView`/`canViewBasicPortrait`/`canGreet`/`sendInvitation`）一律要求可信快照，无快照即暂停公共展示；fixtures 种子建立可信快照；`PortraitDetailPage` 对他人显示「等待本人重新确认公开」，本人显示重新确认引导；`MePage` 同样提示。
- 文件：`DataProvider.tsx`、`fixtures.ts`、`PortraitDetailPage.tsx`、`MePage.tsx`。

### P0-02 报名者名单越权展示
- 原因：`ActivityDetailPage` 对所有访问者渲染 `allEnrollments`（含他人昵称与状态）。
- 修复：报名记录名单仅组织者可见；申请者在「报名申请」卡查看自己的状态与取消入口；无关访客不展示任何可识别名单（活动本身照常可浏览）。汇总人数是否公开仍 OPEN，未实施。
- 文件：`ActivityDetailPage.tsx`。

### P0-03 发起人署名绕过公开投影
- 原因：活动详情直接读取 `organizer.nickname`（草稿字段），未确认的新昵称与撤回后的昵称均会泄露。
- 修复：署名仅取「isPublic 且有可信 Snapshot」的 `publicSnapshot.nickname`；否则统一「活动发起人」中性兜底；活动列表卡片本就不含署名，核查无泄露面。
- 文件：`ActivityDetailPage.tsx`。

### 统一读取层
公共暴露面集中在 `DataProvider` 的 `publicPortraits` / `getPublicView` / `canViewBasicPortrait` 与活动页署名/名单两处统一判定；发现、找人、星云、公共详情均消费同一投影，无逐页临时补丁。

## 3. 测试结果（实际退出码，本次运行真实执行）

| 项目 | before（@67716d6） | after（修复后） |
|---|---|---|
| TypeScript `tsc -b` | exit=0 | exit=0 |
| lint（oxlint） | exit=0，**0 errors / 14 warnings** | exit=0，**0 errors / 14 warnings**（与基线一致，无新增） |
| `npm run build` | exit=0 | exit=0 |
| 路由回归 regression-v03（49 项） | NOT-RUN（本批 before 仅要求四项 P0 复现） | **49/49 PASS，exit=0** |
| Smoke smoke-v03（15 项） | NOT-RUN | **15/15 PASS，exit=0** |
| 隐私负向 privacy-b1（26 项） | **10/26 pass，16 fail**（四项 P0 全部真实复现） | **26/26 PASS，exit=0** |
| 双身份创建/编辑/刷新完整性 | 含于 privacy-b1 P04 组（before：P04-2/4/6 FAIL） | 含于 P04 组，7/7 PASS |

## 4. 证据索引

- before 截图：`before/`（P04-1/2、P01a-1/2/3、P01b-1/2、P02-1/2/3、P03-1/2 等 12 张，对应失败现场）
- after 截图：`after/`（同条件复测 12 张）+ `after/regression/`（49 张路由回归）+ `after/smoke/`（冒烟流程图）
- 日志：`logs/before-tsc-lint-build.log`、`logs/before-privacy-b1.log`、`logs/after-lint-build.log`（含 tsc）、`logs/after-regression-v03.log`、`logs/after-smoke-v03.log`、`logs/after-privacy-b1.log`
- 测试脚本：`app/scripts/privacy-b1.mjs`（新增，断言安全行为；before FAIL / after PASS）

before 关键失败（真实复现，非伪造）：
- P04-2：`me.id=p-me, u-test2.id=p-me`（ID 撞车）；P04-4：`u-test2 nickname=记录丢失`（被覆盖）
- P01a-1/2/3：无快照旧公开资料出现在找人/星云/详情
- P01b-1/2/3：未确认草稿「林间风B」进入公共列表与详情
- P02-2/3/4/5：申请者与无关访客可见「一舟」「甲同学」及报名记录名单
- P03-1/3/4：活动页展示草稿昵称「阿柚B」；撤回后仍显示昵称、无兜底

## 5. 变更文件清单（commit 1: 96fc7f1）

```
M  app/src/data/DataProvider.tsx
M  app/src/data/adapters/storageAdapter.ts
M  app/src/data/fixtures.ts
M  app/src/features/activities/ActivityDetailPage.tsx
M  app/src/features/portrait/MePage.tsx
M  app/src/features/portrait/PortraitDetailPage.tsx
A  app/src/data/migrations/b1Legacy.ts
A  app/scripts/privacy-b1.mjs
```
（commit 2：docs/01_DECISION_LEDGER.md DEC-007、docs/02_OPEN_QUESTIONS.md B1 节、本证据目录）

## 6. 未解决问题 / 边界说明

- P1-A～P1-D 未处理（按授权书保留为后续问题）。
- 「报名汇总人数是否对公众展示」仍 OPEN，当前不向访客展示。
- 消息中心/会话页中互动对象头像取自既有邀请/会话关系内的 Portrait 昵称（定向授权上下文，非公共入口）；如需进一步收紧可列入 P1 评估。
- lint 14 个 warnings 为基线既有，未新增。
- 未执行 push/PR/merge/deploy；待 Owner 对 B1 独立验收与另行审批。
