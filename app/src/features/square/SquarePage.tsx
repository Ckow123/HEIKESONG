import { CircleHelp, Info, Map, MessageSquare, Search } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { SQUARE_CATEGORIES } from '@/domain'
import type { SquareCategoryKey } from '@/domain'
import { Card } from '@/shared/ui/Card'
import { PageHeader } from '@/shared/ui/PageHeader'

/** 四类入口专属配色：紫 / 薄荷绿 / 粉 / 蓝渐变卡片，一眼可辨（沿用主题色板，不引入新色） */
const CATEGORY_STYLE: Record<
  SquareCategoryKey,
  { Icon: LucideIcon; card: string; ink: string }
> = {
  laoren: { Icon: Search, card: 'from-[#F0ECFD] to-[#DCD3F9]', ink: 'text-primary' },
  ceping_map: { Icon: Map, card: 'from-[#E5F9F3] to-[#C6EEDC]', ink: 'text-mint' },
  tucao: { Icon: MessageSquare, card: 'from-[#FDEAF3] to-[#F7C9DF]', ink: 'text-pink' },
  qiuzhu: { Icon: CircleHelp, card: 'from-[#E8F0FF] to-[#C7DAFF]', ink: 'text-[#4A7BD8]' },
}

/**
 * P07 广场：保留捞人、测评地图、吐槽、求助帖四类构想。
 * 本阶段只做入口与待实现说明；比赛版实现深度未定，不假称已上线。
 */
export default function SquarePage() {
  return (
    <div>
      <PageHeader title="校园广场" subtitle="校园里的多元交流社区：分享、发现与互相帮助。" />
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {SQUARE_CATEGORIES.map((c) => {
          const { Icon, card, ink } = CATEGORY_STYLE[c.key]
          return (
            <section
              key={c.key}
              className={`relative flex min-h-[168px] flex-col gap-2.5 overflow-hidden rounded-card border border-white/90 bg-gradient-to-br p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover md:p-5 ${card}`}
            >
              <Icon className="pointer-events-none absolute -bottom-6 -right-5 h-24 w-24 opacity-[.09] md:h-32 md:w-32" aria-hidden />
              <span className="pointer-events-none absolute -right-5 -top-7 h-20 w-20 rounded-full border-[12px] border-white/30" aria-hidden />
              <div className="relative flex items-center justify-between">
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 shadow-sm ${ink}`}>
                  <Icon size={22} />
                </span>
                <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold text-ink-sub shadow-sm">
                  待实现
                </span>
              </div>
              <h2 className="relative text-[15px] font-bold tracking-tight md:text-base">{c.label}</h2>
              <p className="relative text-xs leading-5 text-ink-sub">{c.description}</p>
              <span className={`relative mt-auto inline-flex min-h-7 items-center text-[11px] font-semibold ${ink}`}>规划中 · 蓝图阶段</span>
            </section>
          )
        })}
      </div>

      {/* 广场蓝图说明区 */}
      <Card className="mt-4 flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Info size={18} />
        </span>
        <div>
          <h2 className="text-sm font-bold">四类模块均在产品蓝图中，比赛版实现深度待团队确认</h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-sub">
            捞人将采用模糊描述 + 当事人自愿认领 + 举报删除的安全设计；测评地图需先解决底图与合规问题；吐槽与求助帖将配备基本内容过滤。确认前不开放真实内容发布。
          </p>
        </div>
      </Card>
    </div>
  )
}
