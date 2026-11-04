import { useData } from '@/data/DataProvider'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Users } from 'lucide-react'
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
      <div className="mb-4 flex items-center justify-between gap-3 rounded-card border border-primary/10 bg-primary-soft/45 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm"><Users size={19} /></span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">从共同兴趣开始，慢慢认识</p>
            <p className="mt-0.5 truncate text-xs text-ink-sub">每份资料都来自本人确认公开的 Snapshot</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">{publicPortraits.length} 位公开</span>
      </div>
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {publicPortraits.map((p) => (
          <PersonCard key={p.id} portrait={p} />
        ))}
      </div>
    </div>
  )
}
