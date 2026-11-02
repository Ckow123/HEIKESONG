import { useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Tag } from '@/shared/ui/Tag'

interface DraftState {
  draft?: { nickname: string; interests: string[]; intents: string[]; bio: string }
}

/**
 * P12 Portrait 预览：展示他人实际可见的内容（DEC-002.3）。
 * 预览不自动公开；「确认公开 / 仅保存不公开」在 T3/T4 接入数据层。
 */
export default function PortraitPreviewPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const draft = (location.state as DraftState | null)?.draft

  return (
    <div>
      <PageHeader
        title="预览 Portrait"
        subtitle="这是其他同学将看到的内容。预览不等于公开，确认后才会进入公开列表与星云。"
        fallback="/me/portrait/edit"
      />
      {draft ? (
        <Card className="mb-4">
          <h2 className="text-lg font-bold">{draft.nickname}</h2>
          {draft.bio ? <p className="mt-2 text-sm leading-relaxed text-ink-sub">{draft.bio}</p> : null}
          <h3 className="mb-2 mt-4 text-sm font-bold">兴趣爱好</h3>
          <div className="flex flex-wrap gap-1.5">
            {draft.interests.map((t) => (
              <Tag key={t} tone="mint">{t}</Tag>
            ))}
          </div>
          <h3 className="mb-2 mt-4 text-sm font-bold">社交意图</h3>
          <div className="flex flex-wrap gap-1.5">
            {draft.intents.map((s) => (
              <Tag key={s} tone="pink">{s}</Tag>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="mb-4">
          <p className="text-sm text-ink-sub">暂无可预览的内容。请先回到编辑页完成必填信息。</p>
        </Card>
      )}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => navigate('/me/portrait/edit')}>
          返回编辑
        </Button>
        <Button disabled title="T3/T4 接入：确认公开写入数据层">
          确认公开（T3/T4）
        </Button>
        <Button variant="outline" disabled title="T3/T4 接入：保存为未公开">
          仅保存，暂不公开（T3/T4）
        </Button>
      </div>
    </div>
  )
}
