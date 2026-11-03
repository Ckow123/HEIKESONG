import { useData } from '@/data/DataProvider'
import { PageHeader } from '@/shared/ui/PageHeader'
import { PersonCard } from './PersonCard'

/** P02 找同频的人：浏览公开 Portrait（无需先创建自己的资料，DEC-002.1）。 */
export default function PeoplePage() {
  const { publicPortraits } = useData()

  return (
    <div>
      <PageHeader
        title="找同频的人"
        subtitle="通过兴趣、社交意图和表达方式认识同学；仅展示已公开的 Portrait（合成演示数据）。"
      />
      <p className="mb-3 text-xs text-ink-sub">共 {publicPortraits.length} 位已公开同学</p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {publicPortraits.map((p) => (
          <PersonCard key={p.id} portrait={p} />
        ))}
      </div>
    </div>
  )
}
