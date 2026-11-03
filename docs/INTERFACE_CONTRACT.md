# 接口契约 — 供子 Agent A/B 读取（批次 1 + 批次 3 冻结版）

> 冻结时间：2026-11-03；负责人：主 Agent
> 基准 Commit：`1a580a19d13b9719c134c6f367ff09d49ce2d483` + P0 修复 + Q1~Q5 决策确认
> 更新记录：批次 1（PR-1/2/3 + 基础契约）→ 批次 3（Q1~Q5 获批后新增接口契约）

本文档定义 DataProvider 对外接口的语义不变量。子 Agent A/B 在开发页面和测试脚本时必须遵守这些契约，不得自行绕过。

---

## 1. 公开读取（publicPortraits / getPublicView）

**不变量**：公共入口只返回用户已明确确认公开的内容（publicSnapshot），编辑草稿不混入。

- `publicPortraits: Portrait[]` — 返回的 Portrait 对象中，公共字段（nickname, interestTags, socialIntents, bio, mbti, zodiac, relationshipStatus）来自 `publicSnapshot` 而非草稿字段。
- `getPublicView(portrait: Portrait): PublicPortraitView` — 优先返回 `portrait.publicSnapshot`；如果 publicSnapshot 不存在（旧数据/未公开），回退到当前字段投影。
- **子 Agent A 注意**：DiscoveryPage、PeoplePage 直接读 `publicPortraits` 的字段是安全的（已经是公共投影）。但如果需要读取 Portrait 的其他字段（如 isPublic、ownerId），这些字段不在 publicSnapshot 中，仍来自原始 Portrait。
- **禁止**：子 Agent A 不得直接使用 `getPortraitById` 获取原始 Portrait 后在公共页面展示其草稿字段。

## 2. 草稿读取（getDraftView）

**不变量**：预览页面看到的是编辑中的草稿内容（B 版本），而非已确认公开的 A 版本。

- `getDraftView(portrait: Portrait): PublicPortraitView` — 始终从 Portrait 当前字段投影，不考虑 publicSnapshot。
- **用途**：仅用于 PortraitPreviewPage（本人预览自己的草稿）。
- **禁止**：不得在公共入口使用 getDraftView。

## 3. 定向读取（canViewBasicPortrait）

**不变量**：授权必须有真实的合成互动来源及正确方向，普通人不能借 URL 获取未公开资料。

- `canViewBasicPortrait(viewerId: string, portraitId: string): boolean` — 返回 true 的条件：
  1. Portrait 已公开（isPublic=true），或
  2. viewer 是 Portrait 本人（ownerId=viewerId），或
  3. 存在有效的 InteractionAccess 且 source 对应关系校验通过

- **source 校验规则（PR-3）**：

| 来源 | 校验条件 |
| --- | --- |
| invitation | invitation 存在，fromId=portrait.ownerId，toId=viewerId |
| conversation | conversation 存在，关联 invitation 已 accepted，portrait.ownerId 和 viewerId 都是 participantIds 且不同 |
| enrollment | enrollment 存在，关联 activity 存在，enrolleeId=portrait.ownerId，organizerId=viewerId |

- **禁止**：不得给每个用户全局通行；source 断链或角色方向错误时必须返回 false。

## 4. 会话读取（参与者+accepted 校验）

**不变量**：会话列表和详情仅展示当前身份参与且关联邀请已接受的会话。

- **MessagesPage**：会话列表过滤 `participantIds.includes(currentUserId)`，非参与者不可见。
- **ConversationPage**：直达 URL 时检查 `participantIds.includes(currentUserId)`，非参与者显示拒绝访问。
- **invitation.status**：必须为 `accepted` 才能查看会话内容；`pending` 时显示"邀请尚未被接受"。

## 5. 接受邀请动作（acceptInvitation）

**不变量**：只允许当前身份等于 toId 且 pending；返回成功/失败和 conversationId。

```typescript
acceptInvitation: (invitationId: string) => {
  success: boolean
  conversationId?: string  // 成功时返回实际会话 ID
  reason?: string          // 失败时返回原因：'not_found' | 'not_recipient' | 'invalid_status'
}
```

- **幂等**：已接受的邀请再次调用返回 `{ success: true, conversationId: existingId }`，不新建多个会话。
- **PR-3 副作用**：接受后自动建立 InteractionAccess（source: conversation），让接收方可从会话记录查看发送者基础 Portrait。
- **禁止**：页面不得自行拼接 `conv-${id}` 作为 conversationId 导航，必须使用返回值。

## 6. Portrait 保存与公开（PR-1 公开内容隔离）

**不变量**：编辑态 B 不得替换已确认的公共内容 A；确认后才原子替换。

- `savePortrait(draft, options?)` — 保存草稿到 Portrait 字段，**不更新 publicSnapshot**。编辑期间公共入口继续读 A。
- `publishPortrait()` — 将当前草稿内容快照为 publicSnapshot（A 版本），同时设置 isPublic=true。
- `withdrawPortrait()` — 设置 isPublic=false，保留 publicSnapshot（以便重新公开时恢复）。
- **候选 A/B 未定**：当前实现为候选 A 的结构基础（草稿分离），但未强制选择。候选 B（暂撤）如获批准，只需在 savePortrait 中清除 publicSnapshot。

## 7. 数据模型变更（Portrait.publicSnapshot）

```typescript
interface Portrait {
  // ... 原有字段 ...
  /** PR-1：已确认公开的内容快照；公共入口优先读取此字段 */
  publicSnapshot?: PublicPortraitView
}
```

- **旧数据兼容（Q5c 已确认）**：旧 localStorage 数据（`tongpin-campus-v1` key）没有 publicSnapshot。公共投影回退到当前字段（等于把当前草稿当作已确认版本）。**此策略已获团队确认（Q5c 选 A：直接当确认版）**，不做特殊迁移提示。
- **fixtures 数据**：DEMO_PORTRAITS 中的已公开 Portrait 没有 publicSnapshot。用户首次公开自己的 Portrait 时会创建 publicSnapshot。

---

## 8. Q1~Q5 获批后新增接口契约（批次 3 冻结）

> 以下接口在批次 4 实现时落地，当前为契约定义。子 Agent A/B 可预先编写对应用例（标 blocked）。

### 8.1 身份切换演示控制器（Q1：合成身份切换）

```typescript
switchIdentity(identityId: IdentityId): void
```

- **语义**：切换 `state.currentUserId` 到指定合成身份。仅用于演示，非真实登录。
- **约束**：不改造为登录系统；清楚显示当前合成身份标注；换设备不共享（localStorage 局部）。
- **闭环终点定义**：
  - 认识人流程：接受后会话入口可见 = 闭环完成
  - 活动流程：申请者可见明确处理结果（confirmed/rejected） = 闭环完成

### 8.2 发送招呼动作（Q2：固定礼貌招呼）

```typescript
sendInvitation(targetPortraitId: PortraitId): {
  success: boolean
  invitationId?: string  // 新建或已有 pending 的 ID
  conversationId?: string // 已有 accepted 关联会话时返回
  reason?: string         // 'not_public' | 'self' | 'already_pending' | 'already_accepted' | 'no_portrait'
}
```

- **门槛**：发送方必须基础完整 + 已公开（canGreet=true）。
- **内容**：固定礼貌招呼文本（不含自由文字）。
- **重复规则**：
  - 同方向已有 pending：返回 `{ success: true, invitationId: existingId, reason: 'already_pending' }`，不新建。
  - 同方向已有 accepted：返回 `{ success: true, conversationId: existingConvId, reason: 'already_accepted' }`，进入已有会话。
- **禁止目标**：给自己（self）、撤回目标（not_public）、未公开目标（not_public）。
- **副作用**：落入 pending 状态，生成接收者的基础资料访问关系（InteractionAccess source: invitation）。

### 8.3 接受邀请资料补全门槛（Q3：先补全再接受）

- **acceptInvitation 增加前置检查**：接收方（toId）若无基础 Portrait（nickname + interestTags + socialIntents 三项必填），返回 `{ success: false, reason: 'need_basic_profile' }`，引导先补全（不强制公开）。
- **撤回后接受**：撤回者（isPublic=false）仍可从已有记录接受邀请，接受门槛不变（基础完整即可）。
- **拒绝**：本轮不实现拒绝动作。

### 8.4 活动申请与报名状态机（Q4：申请→确认→结果）

```typescript
enrollActivity(activityId: ActivityId): {
  success: boolean
  enrollmentId?: string
  status?: 'pending' | 'confirmed' | 'rejected' | 'cancelled'
  reason?: string  // 'no_basic_profile' | 'already_enrolled' | 'not_found'
}

confirmEnrollment(enrollmentId: string): {
  success: boolean
  status?: 'confirmed' | 'rejected'
  reason?: string  // 'not_organizer' | 'not_found' | 'already_processed'
}

cancelEnrollment(enrollmentId: string): {
  success: boolean
  reason?: string  // 'not_owner' | 'not_found' | 'already_cancelled'
}
```

- **报名门槛**：申请者基础完整即可（canEnroll=true），不强制公开。
- **组织者处理**：只有 activity.organizerId === currentUserId 可 confirm/reject。
- **状态机**：`pending → confirmed | rejected`；本人可 `cancelled`（从 pending 或 confirmed）。
- **不自动入队**：confirmed 不修改 capacityText，不默认群聊，不公开成员名单。
- **取消规则**：本人单独触发；取消阶段 = pending 或 confirmed 均可；终态 = cancelled；不回补名额（本轮最小规则）。
- **快照策略**：申请时固定申请者的基础资料快照（Q5b），后续编辑不影响已提交申请。

### 8.5 基础定向资料字段范围（Q5a：只取三项必填）

```typescript
interface BasicPortraitView {
  portraitId: PortraitId
  nickname: string
  interestTags: string[]
  socialIntents: string[]
}
```

- **定向查看返回**：canViewBasicPortrait 校验通过后，返回 BasicPortraitView（仅三项必填）。
- **不包含**：bio, mbti, zodiac, relationshipStatus 等选填字段。
- **快照策略（Q5b）**：互动提交时（发招呼/申请活动）固定当时的 BasicPortraitView 快照，后续编辑不影响已提交记录。

---

## 子 Agent A 可用的数据接口

| 接口 | 用途 | 注意事项 |
| --- | --- | --- |
| `publicPortraits` | 公开列表/推荐/找人 | 字段已隔离，安全读取 |
| `nebulaProjections` | 星云投影 | 从 publicPortraits 派生 |
| `state.activities` | 活动列表 | 无变更 |
| `state.currentUserId` | 当前身份 | 无变更 |
| `getPublicView(portrait)` | 获取公共视图 | 优先返回 publicSnapshot |
| **禁止使用** | `getPortraitById` 在公共页面展示草稿字段 | 会泄露编辑中的内容 |

## 子 Agent B 可用的测试接口

| 接口 | 用途 | 测试要点 |
| --- | --- | --- |
| `acceptInvitation` | 接受邀请 | 返回值包含 success/conversationId/reason；Q3 资料补全门槛 |
| `sendInvitation`（批次4新增） | 发送招呼 | Q2 固定招呼/重复规则/禁止目标；标 blocked 直到批次4实现 |
| `enrollActivity`（批次4新增） | 活动申请 | Q4 状态机 pending→confirmed/rejected；标 blocked 直到批次4实现 |
| `confirmEnrollment`（批次4新增） | 组织者确认 | 只有 organizerId 可操作；标 blocked |
| `cancelEnrollment`（批次4新增） | 取消报名 | 本人可取消，终态 cancelled；标 blocked |
| `switchIdentity`（批次4新增） | 身份切换 | Q1 合成身份切换；标 blocked |
| `state.conversations` | 会话列表 | 需在测试中过滤 participantIds |
| `state.interactionAccess` | 授权记录 | source 校验可通过 canViewBasicPortrait 间接测试 |
| `state.invitations` | 邀请记录 | toId/currentUserId 校验 |
| `canViewBasicPortrait` | 定向授权 | 需测试无效 source、第三人直达、角色方向错误；Q5a 返回 BasicPortraitView 仅三项必填 |
