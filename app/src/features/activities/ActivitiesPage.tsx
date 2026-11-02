import { Link } from 'react-router-dom'

import { useData } from '@/data/DataProvider'
import { Card } from '@/shared/ui/Card'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Tag } from '@/shared/ui/Tag'

const CATEGORY_ORDER = ['全部活动', '运动', '学习', '语言', '比赛']

/** P04 找活动搭子：合成活动列表；分类筛选仅前端展示过滤。 */
export default function ActivitiesPage() {
  const { state } = useData()

  return (
    <div>
      <PageHeader
        title="找活动搭子"
        subtitle="发现校园里的有趣活动，找到一起参与的搭子（合成演示数据）。"
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORY_ORDER.map((c, i) => (
          <Tag key={c} tone={i === 0 ? 'primary' : 'neutral'}>{c}</Tag>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {state.activities.map((a) => (
          <Card key={a.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">{a.title}</span>
              <Tag tone="primary">{a.interestCategory}</Tag>
            </div>
            <p className="line-clamp-2 text-xs leading-relaxed text-ink-sub">{a.description}</p>
            <p className="text-xs text-ink-sub">{a.timeText}</p>
            <p className="text-xs text-ink-sub">{a.locationText}</p>
            <div className="mt-auto flex items-center justify-between pt-1">
              <span className="text-xs text-ink-sub">{a.capacityText}</span>
              <Link to={`/activities/${a.id}`} className="text-xs font-medium text-primary">
                查看详情 →
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
