import { CheckCircle2, Clock, MessageCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { useData } from '@/data/DataProvider'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Tag } from '@/shared/ui/Tag'

/**
 * P08 信息中心：待处理邀请 + 已有会话。
 * 规则（DEC-003.5）：接收方明确接受后才开启自由聊天；
 * 「拒绝」操作尚未确认，不提供入口（参考图中的拒绝按钮不实现）。
 */
export default function MessagesPage() {
  const { state, acceptInvitation } = useData()
  const navigate = useNavigate()

  const pending = state.invitations.filter((i) => i.toId === state.currentUserId && i.status === 'pending')

  const nameOf = (id: string) => state.identities.find((x) => x.id === id)?.displayName ?? '合成用户'

  return (
    <div>
      <PageHeader title="信息中心" subtitle="管理来自同学的邀请与会话，在尊重与同意的基础上建立交流。" />

      <section className="mb-5">
        <h2 className="mb-2 flex items-center gap-2 font-bold">
          <Clock size={16} className="text-pink" /> 待处理邀请
          <Tag tone="pink">{pending.length}</Tag>
        </h2>
        {pending.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-sub">暂无待处理邀请。</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((inv) => (
              <Card key={inv.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{nameOf(inv.fromId)}</p>
                  {inv.message ? <p className="mt-1 text-xs leading-relaxed text-ink-sub">{inv.message}</p> : null}
                  <p className="mt-1 text-[11px] text-ink-sub/70">接受后才能开始自由聊天（DEC-003.5）</p>
                </div>
                <Button
                  onClick={() => {
                    acceptInvitation(inv.id)
                    const convId = `conv-${inv.id}`
                    navigate(`/messages/${convId}`)
                  }}
                >
                  接受
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 flex items-center gap-2 font-bold">
          <CheckCircle2 size={16} className="text-mint" /> 已有会话
        </h2>
        {state.conversations.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-sub">接受邀请后，会话会出现在这里。</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {state.conversations.map((c) => {
              const otherId = state.conversations
                .find((x) => x.id === c.id)
                ?.participantIds.find((id) => id !== state.currentUserId)
              const last = c.demoMessages[c.demoMessages.length - 1]
              return (
                <Link key={c.id} to={`/messages/${c.id}`}>
                  <Card className="flex items-center gap-3 transition-shadow hover:shadow-lg">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft font-bold text-primary">
                      <MessageCircle size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{nameOf(otherId ?? '')}</p>
                      <p className="truncate text-xs text-ink-sub">
                        {last ? last.text : '会话已开启，打个招呼吧（演示样例，非实时传输）'}
                      </p>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
