import { useMemo, useState } from 'react'
import { BookOpen, CalendarCheck, Dumbbell, Grid2X2, Languages, Trophy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useData } from '@/data/DataProvider'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ActivityCard } from './ActivityCard'

const CATEGORY_ORDER = ['全部活动', '运动', '学习', '语言', '比赛'] as const
const CATEGORY_ICONS: Record<(typeof CATEGORY_ORDER)[number], LucideIcon> = {
  全部活动: Grid2X2,
  运动: Dumbbell,
  学习: BookOpen,
  语言: Languages,
  比赛: Trophy,
}

/** P04 找活动搭子：合成活动列表；分类筛选为前端展示过滤（button 控件，非 Tag）。 */
export default function ActivitiesPage() {
  const { state } = useData()
  const [category, setCategory] = useState<string>('全部活动')

  const filtered = useMemo(() => {
    if (category === '全部活动') return state.activities
    return state.activities.filter((a) => a.interestCategory === category)
  }, [category, state.activities])

  return (
    <div>
      <PageHeader
        title="找活动搭子"
        subtitle="发现校园里的有趣活动，找到一起参与的搭子（合成演示数据）。"
      />
      <section className="relative mb-4 overflow-hidden rounded-card border border-mint/10 bg-mint-soft/55 p-4 md:p-5">
        <CalendarCheck className="pointer-events-none absolute -bottom-8 -right-5 h-32 w-32 rotate-12 text-[#27997C]/[.08]" aria-hidden />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#27997C] shadow-sm"><CalendarCheck size={22} /></span>
          <div>
            <h2 className="text-sm font-bold">把共同兴趣，变成一起行动</h2>
            <p className="mt-1 text-xs leading-5 text-ink-sub">从一场自习、一次球局或英语交流开始认识新伙伴。</p>
          </div>
        </div>
      </section>
      {/* 分类筛选：button 控件（不使用 Tag），支持键盘导航 / focus / aria-pressed */}
      <div className="mb-4 flex flex-wrap gap-2 rounded-card border border-white/80 bg-card/70 p-2 shadow-sm" role="group" aria-label="活动分类筛选">
        {CATEGORY_ORDER.map((c) => {
          const pressed = category === c
          const Icon = CATEGORY_ICONS[c]
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={pressed}
              className={
                'inline-flex min-h-11 flex-none items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition-all ' +
                (pressed
                  ? 'bg-primary text-white shadow-button'
                  : 'bg-bg text-ink-sub hover:bg-primary-soft hover:text-primary')
              }
            >
              <Icon size={14} /> {c}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={`暂无「${category}」类活动`}
          description="当前合成演示数据中该分类暂无活动。点击「全部活动」可查看全部四条基准活动。"
        >
          <button
            type="button"
            onClick={() => setCategory('全部活动')}
            className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            查看全部活动
          </button>
        </EmptyState>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium text-ink-sub">
              共 <span className="font-bold text-ink">{filtered.length}</span> 条活动{category !== '全部活动' ? ` · 已筛选「${category}」` : ''}
            </p>
            <span className="text-[11px] text-ink-sub">合成演示数据</span>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filtered.map((a) => (
              <ActivityCard key={a.id} activity={a} horizontal />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
