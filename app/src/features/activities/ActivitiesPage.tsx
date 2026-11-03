import { useMemo, useState } from 'react'

import { useData } from '@/data/DataProvider'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ActivityCard } from './ActivityCard'

const CATEGORY_ORDER = ['全部活动', '运动', '学习', '语言', '比赛'] as const

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
      {/* 分类筛选：button 控件（不使用 Tag），支持键盘导航 / focus / aria-pressed */}
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="活动分类筛选">
        {CATEGORY_ORDER.map((c) => {
          const pressed = category === c
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={pressed}
              className={
                'inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ' +
                (pressed
                  ? 'bg-primary text-white shadow-card'
                  : 'bg-card text-ink-sub shadow-sm hover:bg-primary-soft hover:text-primary')
              }
            >
              {c}
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
          <p className="mb-3 text-xs text-ink-sub">
            共 {filtered.length} 条活动{category !== '全部活动' ? ` · 已筛选「${category}」` : ''}
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filtered.map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
