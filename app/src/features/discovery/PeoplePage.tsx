import { Link } from 'react-router-dom'

import { useData } from '@/data/DataProvider'
import { Card } from '@/shared/ui/Card'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Tag } from '@/shared/ui/Tag'

/** P02 找同频的人：浏览公开 Portrait（无需先创建自己的资料，DEC-002.1）。 */
export default function PeoplePage() {
  const { publicPortraits } = useData()

  return (
    <div>
      <PageHeader
        title="找同频的人"
        subtitle="通过兴趣、社交意图和表达方式认识同学；仅展示已公开的 Portrait（合成演示数据）。"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {publicPortraits.map((p) => (
          <Card key={p.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{p.nickname}</span>
              {p.mbti ? <Tag tone="primary">{p.mbti}</Tag> : null}
            </div>
            {p.bio ? <p className="line-clamp-2 text-xs leading-relaxed text-ink-sub">{p.bio}</p> : null}
            <div className="flex flex-wrap gap-1.5">
              {p.interestTags.map((tag) => (
                <Tag key={tag} tone="mint">{tag}</Tag>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {p.socialIntents.map((intent) => (
                <Tag key={intent} tone="pink">{intent}</Tag>
              ))}
            </div>
            <Link to={`/people/${p.id}`} className="mt-auto pt-1 text-xs font-medium text-primary">
              查看 Portrait →
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}
