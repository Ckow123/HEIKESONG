import { useLocation, useNavigate } from 'react-router-dom'

import { useData } from '@/data/DataProvider'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Tag } from '@/shared/ui/Tag'

/**
 * P12 Portrait 预览（T3/T4）：展示他人实际可见的公开视图（DEC-002.3）。
 * 预览不自动公开；「确认公开」明确触发公开，「仅保存不公开」保留未公开状态。
 */
export default function PortraitPreviewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { myPortrait, getPublicView, publishPortrait, savePortrait } = useData()

  const publicView = myPortrait ? getPublicView(myPortrait) : undefined

  return (
    <div>
      <PageHeader
        title="预览 Portrait"
        subtitle="这是其他同学将看到的内容。预览不等于公开，确认后才会进入公开列表与星云。"
        fallback="/me/portrait/edit"
      />
      {publicView ? (
        <Card className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{publicView.nickname}</h2>
            {publicView.mbti ? <Tag tone="primary">{publicView.mbti}</Tag> : null}
          </div>
          {publicView.bio ? <p className="mt-2 text-sm leading-relaxed text-ink-sub">{publicView.bio}</p> : null}
          <div className="mt-2 flex flex-col gap-1 text-xs text-ink-sub">
            {publicView.zodiac ? <span>星座：{publicView.zodiac}</span> : null}
            <span>关系状态：{publicView.relationshipStatus === 'in_relationship' ? '有对象（自愿展示）' : '不公开'}</span>
          </div>
          <h3 className="mb-2 mt-4 text-sm font-bold">兴趣爱好</h3>
          <div className="flex flex-wrap gap-1.5">
            {publicView.interestTags.map((t) => (
              <Tag key={t} tone="mint">{t}</Tag>
            ))}
          </div>
          <h3 className="mb-2 mt-4 text-sm font-bold">社交意图</h3>
          <div className="flex flex-wrap gap-1.5">
            {publicView.socialIntents.map((s) => (
              <Tag key={s} tone="pink">{s}</Tag>
            ))}
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
