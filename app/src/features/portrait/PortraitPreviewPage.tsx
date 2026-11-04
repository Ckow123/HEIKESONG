import { useLocation, useNavigate } from 'react-router-dom'

import { useData } from '@/data/DataProvider'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { GradientAvatar, gradientFor } from '@/shared/ui/GradientAvatar'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Tag } from '@/shared/ui/Tag'

/**
 * P12 Portrait 预览（T3/T4）：展示他人实际可见的公开视图（DEC-002.3）。
 * 预览不自动公开；「确认公开」明确触发公开，「仅保存不公开」保留未公开状态。
 */
export default function PortraitPreviewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { myPortrait, getDraftView, publishPortrait, savePortrait } = useData()

  // PR-1：预览看到的是草稿内容（B 版本），而非已确认公开的 publicSnapshot（A 版本）
  const previewView = myPortrait ? getDraftView(myPortrait) : undefined

  return (
    <div>
      <PageHeader
        title="预览 Portrait"
        subtitle="这是其他同学将看到的内容。预览不等于公开，确认后才会进入公开列表与星云。"
        fallback="/me/portrait/edit"
      />
      {previewView && myPortrait ? (
        <Card className="relative mb-4 overflow-hidden !p-0">
          <div className={`relative h-24 bg-gradient-to-br ${gradientFor(myPortrait.id)}`}>
            <span className="absolute -left-5 -top-8 h-24 w-24 rounded-full border-[12px] border-white/25" />
            <span className="absolute -right-4 bottom-0 h-14 w-14 rounded-full bg-white/20" />
          </div>
          <div className="px-4 pb-4 md:px-5 md:pb-5">
            <div className="-mt-10 flex items-end justify-between gap-3">
              <GradientAvatar seed={myPortrait.id} text={previewView.nickname} size="lg" className="!h-20 !w-20 !text-2xl !shadow-card ring-4 ring-card" />
              {previewView.mbti ? <Tag tone="primary" className="mb-2">{previewView.mbti}</Tag> : null}
            </div>
            <h2 className="mt-3 text-xl font-bold tracking-tight">{previewView.nickname}</h2>
            {previewView.bio ? <p className="mt-1.5 text-sm leading-6 text-ink-sub">{previewView.bio}</p> : null}
            <div className="mt-2 flex flex-col gap-1 text-xs text-ink-sub">
              {previewView.zodiac ? <span>星座：{previewView.zodiac}（仅辅助表达）</span> : null}
              <span>关系状态：{previewView.relationshipStatus === 'in_relationship' ? '有对象（自愿展示，非认证）' : '不公开'}</span>
            </div>
            <h3 className="mb-2 mt-4 text-sm font-bold">兴趣爱好</h3>
            <div className="flex flex-wrap gap-2">
              {previewView.interestTags.map((t) => (
                <Tag key={t} tone="mint">{t}</Tag>
              ))}
            </div>
            <h3 className="mb-2 mt-4 text-sm font-bold">社交意图</h3>
            <div className="flex flex-wrap gap-2">
              {previewView.socialIntents.map((s) => (
                <Tag key={s} tone="pink">{s}</Tag>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        <Card className="mb-4">
          <p className="text-sm text-ink-sub">暂无可预览的内容。请先回到编辑页完成必填信息。</p>
        </Card>
      )}
      {myPortrait ? (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate('/me/portrait/edit', { state: location.state })}>
            返回编辑
          </Button>
          <Button
            onClick={() => {
              publishPortrait()
              navigate('/me')
            }}
          >
            确认公开
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              savePortrait(
                {
                  nickname: myPortrait.nickname,
                  interestTags: myPortrait.interestTags,
                  socialIntents: myPortrait.socialIntents,
                  bio: myPortrait.bio,
                  mbti: myPortrait.mbti,
                  zodiac: myPortrait.zodiac,
                  relationshipStatus: myPortrait.relationshipStatus,
                },
                { isPublic: false },
              )
              navigate('/me')
            }}
          >
            仅保存，暂不公开
          </Button>
        </div>
      ) : null}
    </div>
  )
}
