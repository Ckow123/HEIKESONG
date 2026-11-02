import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import type { Invitation, NebulaProjection, Portrait, PublicPortraitView } from '@/domain'

import { storageAdapter } from './adapters/storageAdapter'
import type { DataAdapter } from './adapters/memoryAdapter'
import type { DemoState } from './state'

interface DataContextValue {
  state: DemoState
  /** 当前演示身份的 Portrait（可能不存在 = 未创建） */
  myPortrait: Portrait | undefined
  /** 公开 Portrait 列表（仅 isPublic，公共列表/详情/星云共用） */
  publicPortraits: Portrait[]
  /** 星云投影：从公开资料实时派生，未公开/撤回用户自动消失 */
  nebulaProjections: NebulaProjection[]
  getPortraitById: (id: string) => Portrait | undefined
  getPublicView: (portrait: Portrait) => PublicPortraitView
  /** 撤回后，指定互动对方仍可查看基础 Portrait（DEC-003.4） */
  canViewBasicPortrait: (viewerId: string, portraitId: string) => boolean
  /** 主动打招呼门槛（DEC-002.5）：需已公开 */
  canGreet: (identityId: string) => boolean
  /** 报名资料门槛（DEC-002.4）：基础完整即可，未公开也可 */
  canEnroll: (identityId: string) => boolean
  /** 接受邀请（DEC-003.5）：接受后才开启会话入口；不设拒绝操作 */
  acceptInvitation: (invitationId: string) => void
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
    const publicPortraits = state.portraits.filter((p) => p.isPublic)

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

    return {
      state,
      myPortrait,
      publicPortraits,
      nebulaProjections,
      getPortraitById: (id) => state.portraits.find((p) => p.id === id),
      getPublicView: toPublicView,
      canViewBasicPortrait: (viewerId, portraitId) => {
        const target = state.portraits.find((p) => p.id === portraitId)
        if (!target) return false
        if (target.isPublic) return true
        if (target.ownerId === viewerId) return true
        return state.interactionAccess.some((a) => a.portraitId === portraitId && a.viewerId === viewerId)
      },
      canGreet: (identityId) => {
        const p = state.portraits.find((x) => x.ownerId === identityId)
        return isBasicComplete(p) && p.isPublic
      },
      canEnroll: (identityId) => isBasicComplete(state.portraits.find((x) => x.ownerId === identityId)),
      acceptInvitation: (invitationId) => {
        const nextInvitations: Invitation[] = state.invitations.map((inv) =>
          inv.id === invitationId && inv.status === 'pending'
            ? { ...inv, status: 'accepted', conversationId: `conv-${inv.id}` }
            : inv,
        )
        const changed = nextInvitations.some((inv, i) => inv !== state.invitations[i])
        if (!changed) return
        const accepted = nextInvitations.find((inv) => inv.id === invitationId)
        const next: DemoState = {
          ...state,
          invitations: nextInvitations,
          conversations: accepted?.conversationId
            ? [
                ...state.conversations,
                {
                  id: accepted.conversationId,
                  invitationId: accepted.id,
                  participantIds: [accepted.fromId, accepted.toId],
                  demoMessages: [],
                },
              ]
            : state.conversations,
        }
        persist(next)
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
