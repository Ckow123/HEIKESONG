import { Lock } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { useData } from '@/data/DataProvider'
import { Card } from '@/shared/ui/Card'
import { PageHeader } from '@/shared/ui/PageHeader'

/**
 * P09 会话视图：
 * - 仅当关联邀请已接受时可查看会话内容（DEC-003.5）；
 * - 消息为合成展示样例，不是实时传输，不伪装成联网聊天。
 */
export default function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { state } = useData()

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

  const otherId = conversation.participantIds.find((id) => id !== state.currentUserId)
  const other = state.identities.find((x) => x.id === otherId)

  if (invitation.status !== 'accepted') {
    return (
      <div>
        <PageHeader title="会话" fallback="/messages" />
        <Card className="text-center">
          <Lock className="mx-auto mb-2 text-ink-sub" size={24} />
          <p className="text-sm font-medium">邀请尚未被接受</p>
          <p className="mt-1 text-xs text-ink-sub">对方明确接受邀请后，才能开启自由聊天（DEC-003.5）。</p>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title={`与 ${other?.displayName ?? '同学'} 的会话`} subtitle="演示样例消息，非实时传输。" fallback="/messages" />
      <Card className="flex flex-col gap-3">
        {conversation.demoMessages.length === 0 ? (
          <p className="text-sm text-ink-sub">会话已开启。真实收发消息的方式（本地模拟或联网）待团队确认。</p>
        ) : (
          conversation.demoMessages.map((m, i) => {
            const mine = m.senderId === state.currentUserId
            return (
              <div key={i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <span
                  className={`max-w-[75%] rounded-card px-3 py-2 text-sm leading-relaxed ${
                    mine ? 'bg-primary text-white' : 'bg-bg text-ink'
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
