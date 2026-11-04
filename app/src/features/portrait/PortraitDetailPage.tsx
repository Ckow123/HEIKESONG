import { BadgeCheck, Heart, Info, MessageCircleHeart, Send, ShieldCheck, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useData } from '@/data/DataProvider'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { GradientAvatar, gradientFor } from '@/shared/ui/GradientAvatar'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Tag } from '@/shared/ui/Tag'

/**
 * P03 Portrait 详情：
 * - 公共入口只读完整公开内容（DEC-003.1，经 publicSnapshot 公共投影）；
 * - 未公开资料仅已有互动对方可经授权查看基础 Portrait（DEC-003.4 + Q5a：仅昵称/兴趣/社交意图三项）；
 * - Q2 已确认：canGreet 时可发送固定礼貌招呼；同方向 pending/accepted 有对应状态。
 */
export default function PortraitDetailPage() {
  const { portraitId } = useParams<{ portraitId: string }>()
  const { state, getPortraitById, getPublicView, canViewBasicPortrait, canGreet, sendInvitation } = useData()
  const [greetResult, setGreetResult] = useState<string | null>(null)

  const portrait = portraitId ? getPortraitById(portraitId) : undefined

  if (!portrait) {
    return (
      <div>
        <PageHeader title="Portrait 详情" />
        <Card>
          <p className="text-sm text-ink-sub">没有找到这个 Portrait。</p>
        </Card>
      </div>
    )
  }

  const viewerId = state.currentUserId
  const isSelf = portrait.ownerId === viewerId
  // B1/P0-01：公开且具可信快照才算公共可见；公开但无快照 = 暂停展示，等待本人重新确认
  const hasTrustedSnapshot = Boolean(portrait.publicSnapshot)
  const isPublicView = portrait.isPublic && hasTrustedSnapshot
  // Q2：检查同方向已有邀请
  const existingInvitation = state.invitations.find(
    (i) => i.fromId === viewerId && i.toId === portrait.ownerId,
  )
  const allowed = isPublicView || canViewBasicPortrait(viewerId, portrait.id)

  // B1/P0-01：旧公开资料缺少可信快照 → 对他人暂停展示，提示等待本人重新确认公开
  if (portrait.isPublic && !hasTrustedSnapshot && !isSelf) {
    return (
      <div>
        <PageHeader title="Portrait 详情" />
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft">
            <ShieldCheck size={26} className="text-primary" />
          </span>
          <div>
            <p className="text-sm font-bold">这份 Portrait 等待本人重新确认公开</p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-sub">
              对方此前公开过资料，但需要本人重新预览并明确确认公开后才会恢复展示；草稿内容不会在确认前公开。
            </p>
          </div>
        </Card>
      </div>
    )
  }

  if (!allowed) {
    return (
      <div>
        <PageHeader title="Portrait 详情" />
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft">
            <ShieldCheck size={26} className="text-primary" />
          </span>
          <div>
            <p className="text-sm font-bold">这是一份未公开的 Portrait</p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-sub">
              对方选择暂不公开资料。已建立邀请、会话或活动报名关系的同学，仍可从互动记录中查看基础信息。
            </p>
          </div>
        </Card>
      </div>
    )
  }

  // PR-1：已公开 Portrait 使用 publicSnapshot 公共投影展示，隔离编辑草稿；
  // Q5a：授权查看的未公开 Portrait 只展示基础三项（昵称/兴趣/社交意图），不含选填字段
  const publicView = isPublicView ? getPublicView(portrait) : undefined
  const nickname = publicView?.nickname ?? portrait.nickname
  const interestTags = publicView?.interestTags ?? portrait.interestTags
  const socialIntents = publicView?.socialIntents ?? portrait.socialIntents
  const mbti = publicView?.mbti
  const zodiac = publicView?.zodiac
  const relationshipStatus = publicView?.relationshipStatus
  const bio = publicView?.bio
  // B1/P0-01：本人查看自己被暂停公开的资料时给出重新确认提示
  const selfNeedsReconfirm = isSelf && portrait.isPublic && !hasTrustedSnapshot

  return (
    <div>
      <PageHeader
        title={`${nickname} 的 Portrait`}
        subtitle={isPublicView ? '已公开 · 内容以对方确认公开的范围为准' : '未公开 · 你因已有互动关系可查看基础信息（仅昵称 / 兴趣 / 社交意图）'}
      />

      {selfNeedsReconfirm ? (
        <Card className="mb-4 border border-primary/30 bg-primary-soft/40">
          <p className="text-sm font-medium">你的公开资料需要重新确认公开</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-sub">
            这份资料来自旧版本数据，缺少已确认的公开快照，已暂停在公共列表、星云与搜索中展示。
            请重新预览并明确确认公开后恢复；草稿与已有邀请、会话、报名关系均保留。
          </p>
          <Link to="/me/portrait/preview" className="mt-2 inline-block">
            <Button size="sm">去预览并确认公开</Button>
          </Link>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_300px]">
        {/* 左侧资料栏 */}
        <Card className="relative overflow-hidden lg:self-start">
          <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-br opacity-90 ${gradientFor(portrait.id)}`}>
            <span className="absolute -left-4 -top-6 h-16 w-16 rounded-full bg-white/25 blur-xl" />
            <span className="absolute -right-3 bottom-0 h-12 w-12 rounded-full bg-white/20 blur-lg" />
          </div>
          <div className="relative flex flex-col items-center pt-8 text-center">
            <GradientAvatar seed={portrait.id} text={nickname} size="xl" className="ring-4 ring-card" />
            <h2 className="mt-3 flex items-center gap-1.5 text-lg font-bold">{nickname}</h2>
            <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${isPublicView ? 'bg-mint-soft text-mint' : 'bg-bg text-ink-sub'}`}>
              <BadgeCheck size={12} />
              {isPublicView ? '已公开' : '未公开 · 定向可见'}
            </span>
          </div>
          {isPublicView ? (
            <dl className="relative mt-4 flex flex-col gap-2.5 border-t border-ink-sub/10 pt-4 text-sm">
              {mbti ? (
                <div className="flex items-center justify-between">
                  <dt className="text-ink-sub">MBTI</dt>
                  <dd className="font-medium">{mbti}<span className="ml-1 text-[11px] font-normal text-ink-sub">仅辅助</span></dd>
                </div>
              ) : null}
              {zodiac ? (
                <div className="flex items-center justify-between">
                  <dt className="text-ink-sub">星座</dt>
                  <dd className="font-medium">{zodiac}<span className="ml-1 text-[11px] font-normal text-ink-sub">仅辅助</span></dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <dt className="inline-flex items-center gap-1 text-ink-sub"><Heart size={13} className="text-pink" />关系状态</dt>
                <dd className="font-medium">
                  {relationshipStatus === 'in_relationship' ? (
                    <span>有对象<span className="ml-1 text-[11px] font-normal text-ink-sub">自愿展示，非认证</span></span>
                  ) : '不公开'}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="relative mt-4 border-t border-ink-sub/10 pt-4 text-center text-[11px] leading-relaxed text-ink-sub">
              定向基础视图只包含昵称、兴趣与社交意图（Q5a）；MBTI、星座、介绍等选填内容不展示。
            </p>
          )}
        </Card>

        {/* 中间表达区 */}
        <div className="flex min-w-0 flex-col gap-4">
          {bio ? (
            <Card className="relative overflow-hidden">
              <span aria-hidden className="absolute right-4 top-3 select-none text-5xl font-black text-primary/10">”</span>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold">
                <Sparkles size={15} className="text-primary" /> 一句话介绍
              </h3>
              <p className="text-sm leading-relaxed text-ink">{bio}</p>
            </Card>
          ) : null}

          <Card>
            <h3 className="mb-2.5 flex items-center gap-1.5 text-sm font-bold">
              <MessageCircleHeart size={15} className="text-mint" /> 兴趣爱好
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {interestTags.map((t) => (
                <Tag key={t} tone="mint">{t}</Tag>
              ))}
            </div>
            <h3 className="mb-2.5 mt-5 flex items-center gap-1.5 text-sm font-bold">
              <Heart size={15} className="text-pink" /> 社交意图
              <span className="text-[11px] font-normal text-ink-sub">我希望在这里…</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {socialIntents.map((s) => (
                <Tag key={s} tone="pink">{s}</Tag>
              ))}
            </div>
          </Card>

          {/* 行动区：移动端/平板显示在此处，xl 移至右栏 */}
          {!isSelf ? (
            <div className="xl:hidden">
              <GreetingCard
                nickname={nickname}
                existingInvitation={existingInvitation}
                canGreetNow={canGreet(viewerId)}
                greetResult={greetResult}
                onGreet={() => {
                  const result = sendInvitation(portrait.id)
                  if (result.success) {
                    if (result.conversationId) setGreetResult('已有会话，可直接进入')
                    else if (result.reason === 'already_pending') setGreetResult('已发送过招呼，等待对方回应')
                    else setGreetResult('招呼已发送，等待对方回应')
                  } else if (result.reason === 'not_public') {
                    setGreetResult('对方或你未公开 Portrait')
                  }
                }}
              />
            </div>
          ) : null}
        </div>

        {/* 右侧行动栏（xl 桌面） */}
        {!isSelf ? (
          <div className="hidden flex-col gap-4 self-start xl:flex">
            <GreetingCard
              nickname={nickname}
              existingInvitation={existingInvitation}
              canGreetNow={canGreet(viewerId)}
              greetResult={greetResult}
              onGreet={() => {
                const result = sendInvitation(portrait.id)
                if (result.success) {
                  if (result.conversationId) setGreetResult('已有会话，可直接进入')
                  else if (result.reason === 'already_pending') setGreetResult('已发送过招呼，等待对方回应')
                  else setGreetResult('招呼已发送，等待对方回应')
                } else if (result.reason === 'not_public') {
                  setGreetResult('对方或你未公开 Portrait')
                }
              }}
            />
            <Card className="bg-primary-soft/40 shadow-none">
              <p className="flex items-start gap-1.5 text-xs leading-relaxed text-ink-sub">
                <Info size={14} className="mt-0.5 shrink-0 text-primary" />
                主动打招呼需先完成并公开你的基础 Portrait；对方明确接受后才能开启会话入口（DEC-002.5 / DEC-003.5）。
              </p>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/** 打招呼行动卡：按邀请状态渲染（待回应 / 已接受进会话 / 可发送 / 未达门槛）。 */
function GreetingCard({ nickname, existingInvitation, canGreetNow, greetResult, onGreet }: {
  nickname: string
  existingInvitation: { status: string; conversationId?: string } | undefined
  canGreetNow: boolean
  greetResult: string | null
  onGreet: () => void
}) {
  return (
    <Card className="border border-primary/15 bg-gradient-to-br from-primary-soft/70 to-card">
      {existingInvitation ? (
        existingInvitation.status === 'accepted' && existingInvitation.conversationId ? (
          <div>
            <p className="text-sm font-bold text-mint">已建立会话</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-sub">你们已经接受招呼，可以进入会话入口。</p>
            <Link to={`/messages/${existingInvitation.conversationId}`} className="mt-3 inline-block">
              <Button size="sm">进入会话</Button>
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-sm font-bold">已发送招呼，等待对方回应</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-sub">对方明确接受后才能开启会话入口（DEC-003.5）。</p>
          </div>
        )
      ) : canGreetNow ? (
        <div>
          <p className="text-sm font-bold">想认识 {nickname}？</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-sub">
            发送一条固定礼貌招呼，对方接受后开启会话入口。聊天收发尚未实现，会话入口即终点。
          </p>
          <Button className="mt-3 w-full" size="sm" onClick={onGreet}>
            <Send size={13} /> 打招呼
          </Button>
          {greetResult ? <p className="mt-2 text-xs font-medium text-primary">{greetResult}</p> : null}
        </div>
      ) : (
        <div>
          <p className="text-sm font-bold">想认识 {nickname}？</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-sub">
            你尚未公开 Portrait，暂不能主动打招呼（DEC-002.5）；未公开时仍可凭基础 Portrait 报名活动。
          </p>
          <Link to="/me/portrait/edit" className="mt-3 inline-block">
            <Button variant="outline" size="sm">去完善并公开 Portrait</Button>
          </Link>
        </div>
      )}
    </Card>
  )
}
