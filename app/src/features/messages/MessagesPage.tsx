import { CheckCircle2, Clock, Send } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useData } from '@/data/DataProvider'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { GradientAvatar } from '@/shared/ui/GradientAvatar'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Tag } from '@/shared/ui/Tag'

/**
 * P08 信息中心：待处理邀请 + 我发出的邀请 + 已有会话。
 * 规则（DEC-003.5）：接收方明确接受后才开启自由聊天；
 * 「拒绝」操作尚未确认，不提供入口（参考图中的拒绝按钮不实现）。
 */
export default function MessagesPage() {
  const { state, acceptInvitation } = useData()
  const navigate = useNavigate()
  const [needProfileInvId, setNeedProfileInvId] = useState<string | null>(null)

  const me = state.currentUserId
  const pending = state.invitations.filter((i) => i.toId === me && i.status === 'pending')
  const sent = state.invitations.filter((i) => i.fromId === me)
  // PR-2：仅展示当前身份参与的会话，排除无关/越权会话
  const myConversations = state.conversations.filter((c) => c.participantIds.includes(me))

  const nameOf = (id: string) => state.identities.find((x) => x.id === id)?.displayName ?? '合成用户'

  return (
    <div>
      <PageHeader title="信息中心" subtitle="管理来自同学的邀请与会话，在尊重与同意的基础上建立交流。" />

      {/* 待处理邀请 */}
      <section className="mb-6">
        <h2 className="mb-2.5 flex items-center gap-2 font-bold">
          <Clock size={16} className="text-pink" /> 待处理邀请
          <Tag tone="pink">{pending.length}</Tag>
        </h2>
        {pending.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-sub">暂无待处理邀请。</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((inv) => {
              const senderPortrait = state.portraits.find((p) => p.ownerId === inv.fromId)
              const snapshot = inv.basicSnapshot
              const displayName = snapshot?.nickname ?? nameOf(inv.fromId)
              const avatarSeed = snapshot?.portraitId ?? senderPortrait?.id ?? inv.fromId
              return (
              <Card key={inv.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <GradientAvatar seed={avatarSeed} text={displayName} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">{displayName}</p>
                      {senderPortrait ? (
                        <Link to={`/people/${senderPortrait.id}`} className="text-xs font-medium text-primary hover:underline">
                          查看基础 Portrait →
                        </Link>
                      ) : null}
                    </div>
                    {inv.greetingText ? <p className="mt-1 text-xs leading-relaxed text-ink-sub">{inv.greetingText}</p> : null}
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {(snapshot?.interestTags ?? []).slice(0, 3).map((t) => (
                        <Tag key={t} tone="mint">{t}</Tag>
                      ))}
                      {(snapshot?.socialIntents ?? []).slice(0, 2).map((s) => (
                        <Tag key={s} tone="pink">{s}</Tag>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[11px] text-ink-sub/70">接受后才能开始自由聊天（DEC-003.5）</p>
                  </div>
                </div>
                <Button
                  className="shrink-0 self-end sm:self-center"
                  onClick={() => {
                    // PR-2 + Q3：使用 acceptInvitation 返回值导航；Q3 资料补全门槛
                    const result = acceptInvitation(inv.id)
                    if (result.success && result.conversationId) {
                      navigate(`/messages/${result.conversationId}`)
                    } else if (result.reason === 'need_basic_profile') {
                      setNeedProfileInvId(inv.id)
                    }
                  }}
                >
                  接受
                </Button>
              </Card>
              )
            })}
          </div>
        )}
        {needProfileInvId ? (
          <Card className="mt-3 border border-primary/30 bg-primary-soft/30">
            <p className="text-sm font-medium">需要先补全基础 Portrait</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-sub">接受邀请前，请先创建基础 Portrait（昵称 + 至少 1 个兴趣标签 + 至少 1 项社交意图）。不强制公开。</p>
            <Link to="/me/portrait/edit" className="mt-2 inline-block">
              <Button variant="outline" size="sm">去补全 Portrait</Button>
            </Link>
            <Button variant="ghost" size="sm" className="ml-2" onClick={() => setNeedProfileInvId(null)}>稍后</Button>
          </Card>
        ) : null}
      </section>

      {/* 我发出的邀请 */}
      <section className="mb-6">
        <h2 className="mb-2.5 flex items-center gap-2 font-bold">
          <Send size={15} className="text-primary" /> 我发出的邀请
          <Tag tone="neutral">{sent.length}</Tag>
        </h2>
        {sent.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-sub">你还没有发出过招呼。在同学的 Portrait 页可以发送固定礼貌招呼。</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {sent.map((inv) => {
              const accepted = inv.status === 'accepted' && inv.conversationId
              const targetPortrait = state.portraits.find((p) => p.ownerId === inv.toId)
              return (
                <Card key={inv.id} className="flex items-center justify-between gap-3 !py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {targetPortrait ? (
                      <GradientAvatar seed={targetPortrait.id} text={targetPortrait.nickname} size="sm" />
                    ) : null}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">发给 {nameOf(inv.toId)}</p>
                      {inv.greetingText ? <p className="truncate text-xs text-ink-sub">{inv.greetingText}</p> : null}
                    </div>
                  </div>
                  {accepted ? (
                    <Link to={`/messages/${inv.conversationId}`} className="shrink-0">
                      <Tag tone="mint">已接受 · 进入会话 →</Tag>
                    </Link>
                  ) : (
                    <Tag tone="neutral">等待对方回应</Tag>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* 已有会话 */}
      <section>
        <h2 className="mb-2.5 flex items-center gap-2 font-bold">
          <CheckCircle2 size={16} className="text-mint" /> 已有会话
        </h2>
        {myConversations.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-sub">接受邀请后，会话会出现在这里。</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {myConversations.map((c) => {
              const otherId = c.participantIds.find((id) => id !== me)
              const otherPortrait = state.portraits.find((p) => p.ownerId === otherId)
              const last = c.demoMessages[c.demoMessages.length - 1]
              return (
                <Link key={c.id} to={`/messages/${c.id}`}>
                  <Card className="flex items-center gap-3 !py-3 transition-shadow hover:shadow-lg">
                    {otherPortrait ? (
                      <GradientAvatar seed={otherPortrait.id} text={otherPortrait.nickname} size="md" />
                    ) : (
                      <GradientAvatar seed={otherId ?? 'x'} text="同" size="md" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold">{nameOf(otherId ?? '')}</p>
                      <p className="truncate text-xs text-ink-sub">
                        {last ? last.text : '会话已开启，打个招呼吧（演示样例，非实时传输）'}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-ink-sub/60">进入 →</span>
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
