import { Heart, MessageCircleHeart, ShieldCheck } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { useData } from '@/data/DataProvider'
import { Card } from '@/shared/ui/Card'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Tag } from '@/shared/ui/Tag'

/**
 * P03 Portrait 详情：
 * - 公共入口只读完整公开内容（DEC-003.1）；
 * - 未公开资料仅已有互动对方可经授权查看基础 Portrait（DEC-003.4）；
 * - 打招呼门槛（须已公开，DEC-002.5）在 T5 接入，本阶段不发送真实邀请。
 */
export default function PortraitDetailPage() {
  const { portraitId } = useParams<{ portraitId: string }>()
  const { state, getPortraitById, canViewBasicPortrait } = useData()

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
  const allowed = portrait.isPublic || canViewBasicPortrait(viewerId, portrait.id)

  if (!allowed) {
    return (
      <div>
        <PageHeader title="Portrait 详情" />
        <Card className="text-center">
          <ShieldCheck className="mx-auto mb-2 text-ink-sub" size={24} />
          <p className="text-sm font-medium">这是一份未公开的 Portrait</p>
          <p className="mt-1 text-xs text-ink-sub">
            对方选择暂不公开资料。已建立邀请、会话或活动报名关系的同学，仍可从互动记录中查看基础信息。
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={`${portrait.nickname} 的 Portrait`}
        subtitle={portrait.isPublic ? '已公开 · 内容以对方确认公开的范围为准' : '未公开 · 你因已有互动关系可查看基础信息'}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-xl font-bold text-primary">
            {portrait.nickname.slice(0, 1)}
          </div>
          <h2 className="mt-3 text-lg font-bold">{portrait.nickname}</h2>
          <div className="mt-3 flex flex-col gap-2 text-sm text-ink-sub">
            {portrait.mbti ? <span>MBTI：{portrait.mbti}（仅辅助表达）</span> : null}
            {portrait.zodiac ? <span>星座：{portrait.zodiac}（仅辅助表达）</span> : null}
            <span className="inline-flex items-center gap-1">
              <Heart size={14} className="text-pink" />
              关系状态：{portrait.relationshipStatus === 'in_relationship' ? '有对象（自愿展示，非认证信息）' : '不公开'}
            </span>
          </div>
        </Card>
        <div className="flex flex-col gap-4 md:col-span-2">
          {portrait.bio ? (
            <Card>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold">
                <MessageCircleHeart size={16} className="text-primary" /> 关于我
              </h3>
              <p className="text-sm leading-relaxed">{portrait.bio}</p>
            </Card>
          ) : null}
          <Card>
            <h3 className="mb-2 text-sm font-bold">兴趣爱好</h3>
            <div className="flex flex-wrap gap-1.5">
              {portrait.interestTags.map((t) => (
                <Tag key={t} tone="mint">{t}</Tag>
              ))}
            </div>
            <h3 className="mb-2 mt-4 text-sm font-bold">社交意图</h3>
            <div className="flex flex-wrap gap-1.5">
              {portrait.socialIntents.map((s) => (
                <Tag key={s} tone="pink">{s}</Tag>
              ))}
            </div>
          </Card>
          <Card className="border border-dashed border-ink-sub/30 bg-card/60">
            <p className="text-xs leading-relaxed text-ink-sub">
              打招呼与邀请功能将在 T5 接入：主动打招呼需要先公开自己的 Portrait（DEC-002.5），
              对方明确接受邀请后才能开启自由聊天（DEC-003.5）。本阶段不发送真实邀请。
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
