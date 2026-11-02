import { CircleHelp, MapPin, MessageSquare, Search } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { SQUARE_CATEGORIES } from '@/domain'
import type { SquareCategoryKey } from '@/domain'
import { Card } from '@/shared/ui/Card'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Tag } from '@/shared/ui/Tag'

const CATEGORY_ICONS: Record<SquareCategoryKey, LucideIcon> = {
  laoren: Search,
  ceping_map: MapPin,
  tucao: MessageSquare,
  qiuzhu: CircleHelp,
}

/**
 * P07 广场：保留捞人、测评地图、吐槽、求助帖四类构想。
 * 本阶段只做入口与待实现说明；比赛版实现深度未定，不假称已上线。
 */
export default function SquarePage() {
  return (
    <div>
      <PageHeader title="校园广场" subtitle="校园里的多元交流社区：分享、发现与互相帮助。" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {SQUARE_CATEGORIES.map((c) => {
          const Icon = CATEGORY_ICONS[c.key]
          return (
            <Card key={c.key} className="flex h-full flex-col gap-2">
              <Icon size={24} className="text-primary" />
              <div className="flex items-center gap-2">
                <h2 className="font-bold">{c.label}</h2>
                <Tag tone="neutral">待实现</Tag>
              </div>
              <p className="text-xs leading-relaxed text-ink-sub">{c.description}</p>
            </Card>
          )
        })}
      </div>
      <div className="mt-4">
        <EmptyState
          title="四类模块均在产品蓝图中，比赛版实现深度待团队确认"
          description="捞人将采用模糊描述 + 当事人自愿认领 + 举报删除的安全设计；测评地图需先解决底图与合规问题；吐槽与求助帖将配备基本内容过滤。确认前不开放真实内容发布。"
        />
      </div>
    </div>
  )
}
