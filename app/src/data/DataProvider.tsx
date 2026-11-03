import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import type { BasicPortraitView, Enrollment, EnrollmentStatus, InteractionAccess, Invitation, NebulaProjection, Portrait, PortraitDraft, PublicPortraitView } from '@/domain'

import { storageAdapter } from './adapters/storageAdapter'
import type { DataAdapter } from './adapters/memoryAdapter'
import type { DemoState } from './state'

/** PR-3：校验 InteractionAccess 的 source 对应关系是否真实有效且方向正确 */
function isValidAccessSource(access: InteractionAccess, state: DemoState): boolean {
  const portrait = state.portraits.find((p) => p.id === access.portraitId)
  if (!portrait) return false

  switch (access.source.kind) {
    case 'invitation': {
      const inv = state.invitations.find((i) => i.id === access.source.refId)
      if (!inv) return false
      // 接收者查看发送者基础 Portrait：fromId=portrait.ownerId, toId=viewerId
      return inv.fromId === portrait.ownerId && inv.toId === access.viewerId
    }
    case 'conversation': {
      const conv = state.conversations.find((c) => c.id === access.source.refId)
      if (!conv) return false
      const inv = state.invitations.find((i) => i.id === conv.invitationId)
      if (!inv || inv.status !== 'accepted') return false
      // 已接受会话的双方互看：portrait.ownerId 和 viewerId 都是 participantIds 且不同
      return (
        conv.participantIds.includes(portrait.ownerId) &&
        conv.participantIds.includes(access.viewerId) &&
        portrait.ownerId !== access.viewerId
      )
    }
    case 'enrollment': {
      const enr = state.enrollments.find((e) => e.id === access.source.refId)
      if (!enr) return false
      const activity = state.activities.find((a) => a.id === enr.activityId)
      if (!activity) return false
      // 组织者查看报名者：enrolleeId=portrait.ownerId, organizerId=viewerId
      return enr.enrolleeId === portrait.ownerId && activity.organizerId === access.viewerId
    }
    default:
      return false
  }
}

/** PR-1：构建公共投影 Portrait（用 publicSnapshot 替换公共字段，隔离编辑草稿） */
function toPublicPortrait(p: Portrait): Portrait {
  if (!p.publicSnapshot) return p
  return {
    ...p,
    nickname: p.publicSnapshot.nickname,
    interestTags: p.publicSnapshot.interestTags,
    socialIntents: p.publicSnapshot.socialIntents,
    bio: p.publicSnapshot.bio,
    mbti: p.publicSnapshot.mbti,
    zodiac: p.publicSnapshot.zodiac,
    relationshipStatus: p.publicSnapshot.relationshipStatus,
  }
}

interface DataContextValue {
  state: DemoState
  /** 当前演示身份的 Portrait（可能不存在 = 未创建） */
  myPortrait: Portrait | undefined
  /** 公开 Portrait 列表（仅 isPublic，公共列表/详情/星云共用）；PR-1：使用 publicSnapshot 隔离编辑草稿 */
  publicPortraits: Portrait[]
  /** 星云投影：从公开资料实时派生，未公开/撤回用户自动消失 */
  nebulaProjections: NebulaProjection[]
  getPortraitById: (id: string) => Portrait | undefined
  getPublicView: (portrait: Portrait) => PublicPortraitView
  /** PR-1：获取草稿视图（预览页面使用，看到的是编辑中的 B 版本而非已确认的 A） */
  getDraftView: (portrait: Portrait) => PublicPortraitView
  /** 撤回后，指定互动对方仍可查看基础 Portrait（DEC-003.4）；PR-3：校验 source 来源有效性 */
  canViewBasicPortrait: (viewerId: string, portraitId: string) => boolean
  /** 主动打招呼门槛（DEC-002.5）：需已公开 */
  canGreet: (identityId: string) => boolean
  /** 报名资料门槛（DEC-002.4）：基础完整即可，未公开也可 */
  canEnroll: (identityId: string) => boolean
  /** 接受邀请（DEC-003.5 + PR-2 + Q3）：检查 toId + pending + 接收方基础资料完整；返回成功/失败和 conversationId */
  acceptInvitation: (invitationId: string) => { success: boolean; conversationId?: string; reason?: string }
  /** Q2：发送固定礼貌招呼；同方向 pending 不新建、accepted 进入已有会话 */
  sendInvitation: (targetPortraitId: string) => { success: boolean; invitationId?: string; conversationId?: string; reason?: string }
  /** Q4：活动申请报名；基础完整即可，不强制公开 */
  enrollActivity: (activityId: string) => { success: boolean; enrollmentId?: string; status?: EnrollmentStatus; reason?: string }
  /** Q4：组织者确认/拒绝报名 */
  confirmEnrollment: (enrollmentId: string, decision: 'confirmed' | 'rejected') => { success: boolean; reason?: string }
  /** Q4：本人取消报名 */
  cancelEnrollment: (enrollmentId: string) => { success: boolean; reason?: string }
  /** Q1：切换合成身份（演示模式，非真实登录） */
  switchIdentity: (identityId: string) => void
  /** Q5a：获取基础定向视图（仅三项必填） */
  getBasicPortraitView: (portraitId: string) => BasicPortraitView | undefined
  /** 当前身份的报名记录列表 */
  myEnrollments: Enrollment[]
  /** 当前身份作为组织者的待处理报名 */
  pendingEnrollmentsForOrganizer: Enrollment[]
  /** 创建/更新当前演示身份的 Portrait（T3）：默认保留既有公开状态，新建默认为未公开；PR-1：不更新 publicSnapshot */
  savePortrait: (draft: PortraitDraft, options?: { isPublic?: boolean }) => void
  /** 明确确认后才公开（DEC-002.3）；预览不自动公开；PR-1：同时更新 publicSnapshot */
  publishPortrait: () => void
  /** 撤回公开（DEC-003.2/3/4）：退出公共列表与星云、暂停主动打招呼；已有互动保留；PR-1：保留 publicSnapshot 以便重新公开 */
  withdrawPortrait: () => void
  resetDemo: () => void
}

const DataContext = createContext<DataContextValue | null>(null)

function toPublicView(p: Portrait): PublicPortraitView {
  return {
    portraitId: p.id,
    nickname: p.nickname,
    interestTags: p.interestTags,
    socialIntents: p.socialIntents,
    bio: p.bio,
    mbti: p.mbti,
    zodiac: p.zodiac,
    relationshipStatus: p.relationshipStatus,
  }
}

function isBasicComplete(p: Portrait | undefined): p is Portrait {
  return Boolean(p && p.nickname.trim() && p.interestTags.length >= 1 && p.socialIntents.length >= 1)
}

/** Q5a：从 Portrait 提取基础定向视图（仅三项必填） */
function toBasicView(p: Portrait): BasicPortraitView {
  return {
    portraitId: p.id,
    nickname: p.nickname,
    interestTags: p.interestTags,
    socialIntents: p.socialIntents,
  }
}

/** Q2：固定礼貌招呼文本 */
const GREETING_TEXT = '你好！看到你的 Portrait，想认识一下，一起交流吧～'

export function DataProvider({ children, adapter = storageAdapter }: { children: ReactNode; adapter?: DataAdapter }) {
  const [state, setState] = useState<DemoState>(() => adapter.load())

  const persist = useCallback(
    (next: DemoState) => {
      adapter.save(next)
      setState(next)
    },
    [adapter],
  )

  const value = useMemo<DataContextValue>(() => {
    const myPortrait = state.portraits.find((p) => p.ownerId === state.currentUserId)
    // PR-1：公共投影使用 publicSnapshot 隔离编辑草稿；无 snapshot 时回退到当前字段（向后兼容旧数据）
    const publicPortraits = state.portraits.filter((p) => p.isPublic).map(toPublicPortrait)

    // 演示排布：按公开列表顺序确定性散布，不引入聚类/匹配算法（未冻结）
    const nebulaProjections: NebulaProjection[] = publicPortraits.map((p, i) => {
      const angle = (i / Math.max(publicPortraits.length, 1)) * Math.PI * 2
      const radius = 22 + (i % 3) * 9
      return {
        portraitId: p.id,
        displayLabel: p.nickname,
        tags: p.interestTags.slice(0, 2),
        positionHint: {
          x: Math.min(92, Math.max(8, 50 + radius * Math.cos(angle))),
          y: Math.min(88, Math.max(12, 50 + radius * Math.sin(angle) * 0.72)),
        },
      }
    })

    // Q4：当前身份的报名记录 + 作为组织者的待处理报名
    const myEnrollments = state.enrollments.filter((e) => e.enrolleeId === state.currentUserId)
    const pendingEnrollmentsForOrganizer = state.enrollments.filter(
      (e) => e.organizerId === state.currentUserId && e.status === 'pending',
    )

    return {
      state,
      myPortrait,
      publicPortraits,
      nebulaProjections,
      getPortraitById: (id) => state.portraits.find((p) => p.id === id),
      getPublicView: (portrait) => portrait.publicSnapshot ?? toPublicView(portrait),
      getDraftView: toPublicView,
      canViewBasicPortrait: (viewerId, portraitId) => {
        const target = state.portraits.find((p) => p.id === portraitId)
        if (!target) return false
        if (target.isPublic) return true
        if (target.ownerId === viewerId) return true
        // PR-3：不仅检查 ACL 存在，还校验 source 对应关系有效且方向正确
        return state.interactionAccess.some((a) => {
          if (a.portraitId !== portraitId || a.viewerId !== viewerId) return false
          return isValidAccessSource(a, state)
        })
      },
      canGreet: (identityId) => {
        const p = state.portraits.find((x) => x.ownerId === identityId)
        return isBasicComplete(p) && p.isPublic
      },
      canEnroll: (identityId) => isBasicComplete(state.portraits.find((x) => x.ownerId === identityId)),
      acceptInvitation: (invitationId) => {
        const inv = state.invitations.find((i) => i.id === invitationId)
        if (!inv) return { success: false, reason: 'not_found' as const }
        // PR-2：只允许当前身份等于 toId
        if (inv.toId !== state.currentUserId) return { success: false, reason: 'not_recipient' as const }
        // PR-2：幂等——已接受返回已有 conversationId，不新建多个会话
        if (inv.status === 'accepted') return { success: true, conversationId: inv.conversationId }
        // Q3：接收方无基础 Portrait 时引导先补全（不强制公开）
        const receiverPortrait = state.portraits.find((p) => p.ownerId === state.currentUserId)
        if (!isBasicComplete(receiverPortrait)) return { success: false, reason: 'need_basic_profile' as const }

        const conversationId = `conv-${inv.id}`
        const nextInvitations: Invitation[] = state.invitations.map((i) =>
          i.id === invitationId ? { ...i, status: 'accepted', conversationId } : i,
        )
        // PR-3：接受后建立会话授权，让接收方可从会话记录查看发送者基础 Portrait
        const targetPortrait = state.portraits.find((p) => p.ownerId === inv.fromId)
        const newAccess: InteractionAccess | null = targetPortrait
          ? {
              id: `ia-conv-${inv.id}`,
              portraitId: targetPortrait.id,
              viewerId: state.currentUserId,
              source: { kind: 'conversation', refId: conversationId },
            }
          : null
        const next: DemoState = {
          ...state,
          invitations: nextInvitations,
          conversations: [
            ...state.conversations,
            {
              id: conversationId,
              invitationId: inv.id,
              participantIds: [inv.fromId, inv.toId],
              demoMessages: [],
            },
          ],
          interactionAccess: newAccess ? [...state.interactionAccess, newAccess] : state.interactionAccess,
        }
        persist(next)
        return { success: true, conversationId }
      },
      sendInvitation: (targetPortraitId) => {
        const target = state.portraits.find((p) => p.id === targetPortraitId)
        if (!target) return { success: false, reason: 'not_found' as const }
        // 禁止给自己打招呼
        if (target.ownerId === state.currentUserId) return { success: false, reason: 'self' as const }
        // Q2：发送方必须已公开（canGreet）
        const myP = state.portraits.find((p) => p.ownerId === state.currentUserId)
        if (!isBasicComplete(myP) || !myP.isPublic) return { success: false, reason: 'not_public' as const }
        // Q2：目标必须已公开
        if (!target.isPublic) return { success: false, reason: 'not_public' as const }

        const targetUserId = target.ownerId
        // 检查同方向已有邀请
        const existing = state.invitations.find(
          (i) => i.fromId === state.currentUserId && i.toId === targetUserId,
        )
        if (existing) {
          if (existing.status === 'accepted' && existing.conversationId) {
            return { success: true, invitationId: existing.id, conversationId: existing.conversationId, reason: 'already_accepted' as const }
          }
          return { success: true, invitationId: existing.id, reason: 'already_pending' as const }
        }

        // Q5b：发送时固定发送方基础资料快照
        const snapshot = toBasicView(myP)
        const newInv: Invitation = {
          id: `inv-${Date.now()}`,
          fromId: state.currentUserId,
          toId: targetUserId,
          status: 'pending',
          greetingText: GREETING_TEXT,
          basicSnapshot: snapshot,
          createdAt: new Date().toISOString(),
        }
        // PR-3：同时建立 InteractionAccess，让接收方可从邀请记录查看发送者基础 Portrait
        const newAccess: InteractionAccess = {
          id: `ia-inv-${newInv.id}`,
          portraitId: myP.id,
          viewerId: targetUserId,
          source: { kind: 'invitation', refId: newInv.id },
        }
        persist({
          ...state,
          invitations: [...state.invitations, newInv],
          interactionAccess: [...state.interactionAccess, newAccess],
        })
        return { success: true, invitationId: newInv.id }
      },
      enrollActivity: (activityId) => {
        const activity = state.activities.find((a) => a.id === activityId)
        if (!activity) return { success: false, reason: 'not_found' as const }
        // Q4：申请者基础完整即可，不强制公开
        const myP = state.portraits.find((p) => p.ownerId === state.currentUserId)
        if (!isBasicComplete(myP)) return { success: false, reason: 'no_basic_profile' as const }
        // 不能报名自己组织的活动
        if (activity.organizerId === state.currentUserId) return { success: false, reason: 'not_found' as const }
        // 检查已报名
        const existing = state.enrollments.find(
          (e) => e.activityId === activityId && e.enrolleeId === state.currentUserId,
        )
        if (existing) return { success: false, reason: 'already_enrolled' as const }

        // Q5b：申请时固定基础资料快照
        const snapshot = toBasicView(myP)
        const newEnr: Enrollment = {
          id: `enr-${Date.now()}`,
          activityId,
          enrolleeId: state.currentUserId,
          organizerId: activity.organizerId,
          status: 'pending',
          basicSnapshot: snapshot,
          createdAt: new Date().toISOString(),
        }
        // PR-3：建立 InteractionAccess，让组织者可从报名记录查看申请者基础 Portrait
        const newAccess: InteractionAccess = {
          id: `ia-enr-${newEnr.id}`,
          portraitId: myP.id,
          viewerId: activity.organizerId,
          source: { kind: 'enrollment', refId: newEnr.id },
        }
        persist({
          ...state,
          enrollments: [...state.enrollments, newEnr],
          interactionAccess: [...state.interactionAccess, newAccess],
        })
        return { success: true, enrollmentId: newEnr.id, status: 'pending' }
      },
      confirmEnrollment: (enrollmentId, decision) => {
        const enr = state.enrollments.find((e) => e.id === enrollmentId)
        if (!enr) return { success: false, reason: 'not_found' as const }
        // Q4：只有组织者可确认
        const activity = state.activities.find((a) => a.id === enr.activityId)
        if (!activity || activity.organizerId !== state.currentUserId) return { success: false, reason: 'not_organizer' as const }
        // 只能处理 pending 状态
        if (enr.status !== 'pending') return { success: false, reason: 'already_processed' as const }

        persist({
          ...state,
          enrollments: state.enrollments.map((e) =>
            e.id === enrollmentId ? { ...e, status: decision, processedAt: new Date().toISOString() } : e,
          ),
        })
        return { success: true }
      },
      cancelEnrollment: (enrollmentId) => {
        const enr = state.enrollments.find((e) => e.id === enrollmentId)
        if (!enr) return { success: false, reason: 'not_found' as const }
        // 只有申请者本人可取消
        if (enr.enrolleeId !== state.currentUserId) return { success: false, reason: 'not_owner' as const }
        if (enr.status === 'cancelled') return { success: false, reason: 'already_cancelled' as const }
        // 只能取消 pending 或 confirmed
        if (enr.status === 'rejected') return { success: false, reason: 'already_processed' as const }

        persist({
          ...state,
          enrollments: state.enrollments.map((e) =>
            e.id === enrollmentId ? { ...e, status: 'cancelled', processedAt: new Date().toISOString() } : e,
          ),
        })
        return { success: true }
      },
      switchIdentity: (identityId) => {
        // Q1：切换合成身份，仅用于演示，非真实登录
        const exists = state.identities.some((i) => i.id === identityId)
        if (!exists) return
        persist({ ...state, currentUserId: identityId })
      },
      getBasicPortraitView: (portraitId) => {
        const p = state.portraits.find((x) => x.id === portraitId)
        if (!p) return undefined
        return toBasicView(p)
      },
      myEnrollments,
      pendingEnrollmentsForOrganizer,
      savePortrait: (draft, options) => {
        const existing = state.portraits.find((p) => p.ownerId === state.currentUserId)
        const next: Portrait = {
          id: existing?.id ?? 'p-me',
          ownerId: state.currentUserId,
          nickname: draft.nickname.trim(),
          interestTags: draft.interestTags,
          socialIntents: draft.socialIntents,
          bio: draft.bio?.trim() || undefined,
          mbti: draft.mbti || undefined,
          zodiac: draft.zodiac || undefined,
          relationshipStatus: draft.relationshipStatus,
          isPublic: options?.isPublic ?? existing?.isPublic ?? false,
          updatedAt: new Date().toISOString(),
          // PR-1：保留已有的 publicSnapshot，编辑草稿不更新公共内容（候选 A/B 选择未定，此结构均兼容）
          publicSnapshot: existing?.publicSnapshot,
        }
        persist({
          ...state,
          portraits: existing ? state.portraits.map((p) => (p.id === existing.id ? next : p)) : [...state.portraits, next],
        })
      },
      publishPortrait: () => {
        const existing = state.portraits.find((p) => p.ownerId === state.currentUserId)
        if (!isBasicComplete(existing)) return
        // PR-1：确认公开时将当前草稿内容快照为 publicSnapshot（A 版本）
        const snapshot: PublicPortraitView = toPublicView(existing)
        persist({
          ...state,
          portraits: state.portraits.map((p) =>
            p.id === existing.id ? { ...p, isPublic: true, publicSnapshot: snapshot, updatedAt: new Date().toISOString() } : p,
          ),
        })
      },
      withdrawPortrait: () => {
        const existing = state.portraits.find((p) => p.ownerId === state.currentUserId)
        if (!existing) return
        // 仅改变公开标记；邀请、会话、报名与定向授权均不删除（DEC-003.3/4）
        persist({
          ...state,
          portraits: state.portraits.map((p) => (p.id === existing.id ? { ...p, isPublic: false, updatedAt: new Date().toISOString() } : p)),
        })
      },
      resetDemo: () => {
        persist(adapter.reset())
      },
    }
  }, [state, adapter, persist])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData 必须在 DataProvider 内使用')
  return ctx
}
