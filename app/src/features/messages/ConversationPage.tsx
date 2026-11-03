import { Lock } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { useData } from '@/data/DataProvider'
import { Card } from '@/shared/ui/Card'
import { GradientAvatar } from '@/shared/ui/GradientAvatar'
import { PageHeader } from '@/shared/ui/PageHeader'

/**
 * P09 会话视图：
 * - 仅当关联邀请已接受时可查看会话内容（DEC-003.5）；
 * - 非参与者直达 URL 被拒绝（PR-2）；
 * - 消息为合成展示样例，不是实时传输，不伪装成联网聊天。
 */
export default function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { state, canViewBasicPortrait } = useData()

  const conversation = state.conversations.find((c) => c.id === conversationId)
  const invitation = conversation ? state.invitations.find((i) => i.id === conversation.invitationId) : undefined

  if (!conversation || !invitation) {
    return (
      <div>
        <PageHeader title="会话" fallback="/messages" />
        <Card>
          <p className="text-sm text-ink-sub">没有找到这个会话。</p>
        </Card>
      </div>
    )
  }

  // PR-2：当前用户必须是会话参与者，非参与者直达 URL 被拒绝
  if (!conversation.participantIds.includes(state.currentUserId)) {
    return (
      <div>
        <PageHeader title="会话" fallback="/messages" />
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft">
            <Lock size={24} className="text-primary" />
          </span>
          <div>
            <p className="text-sm font-bold">无法查看此会话</p>
            <p className="mt-1 text-xs text-ink-sub">你不是这个会话的参与者。</p>
          </div>
        </Card>
      </div>
    )
  }

  const otherId = conversation.participantIds.find((id) => id !== state.currentUserId)
  const other = state.identities.find((x) => x.id === otherId)
  const otherPortrait = state.portraits.find((p) => p.ownerId === otherId)
  // PR-4：会话对方可经授权从记录查看基础 Portrait（DEC-003.4）
  const canViewOther = otherPortrait ? canViewBasicPortrait(state.currentUserId, otherPortrait.id) : false

  if (invitation.status !== 'accepted') {
    return (
      <div>
        <PageHeader title="会话" fallback="/messages" />
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft">
            <Lock size={24} className="text-primary" />
          </span>
          <div>
            <p className="text-sm font-bold">邀请尚未被接受</p>
            <p className="mt-1 text-xs text-ink-sub">对方明确接受邀请后，才能开启自由聊天（DEC-003.5）。</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title={`与 ${other?.displayName ?? '同学'} 的会话`} subtitle="演示样例消息，非实时传输。" fallback="/messages" />

      {/* 对方信息条：含基础 Portrait 入口（PR-4） */}
      <Card className="mb-4 flex items-center justify-between gap-3 !py-3">
        <div className="flex min-w-0 items-center gap-3">
          {otherPortrait ? (
            <GradientAvatar seed={otherPortrait.id} text={otherPortrait.nickname} size="sm" />
          ) : (
            <GradientAvatar seed={otherId ?? 'x'} text="同" size="sm" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{other?.displayName ?? '同学'}</p>
            <p className="text-[11px] text-ink-sub">已接受邀请 · 会话入口已开启</p>
          </div>
        </div>
        {otherPortrait && canViewOther ? (
          <Link to={`/people/${otherPortrait.id}`} className="shrink-0 text-xs font-medium text-primary hover:underline">
            查看 Portrait →
          </Link>
        ) : null}
      </Card>

      <Card className="flex flex-col gap-3">
        {conversation.demoMessages.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-sub">会话已开启。真实收发消息的方式（本地模拟或联网）待团队确认。</p>
        ) : (
          conversation.demoMessages.map((m, i) => {
            const mine = m.senderId === state.currentUserId
            return (
              <div key={i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <span
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    mine ? 'rounded-br-md bg-primary text-white' : 'rounded-bl-md bg-bg text-ink'
                  }`}
                >
                  {m.text}
                </span>
              </div>
            )
          })
        )}
      </Card>
    </div>
  )
}
