import { useMemo, useState } from 'react'
import { ArrowRight, CalendarCheck, Search, Sparkles, Users, X } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useData } from '@/data/DataProvider'
import type { Activity, Portrait } from '@/domain'
import { Card } from '@/shared/ui/Card'
import { ActivityCard } from '../activities/ActivityCard'
import { PersonCard } from './PersonCard'

/**
 * P01 发现页（信息架构已锁定）：
 * 顶部两个并列入口「找同频的人」「找活动搭子」；
 * 其下横跨整行的「星云探索」入口；再往下为推荐 Portrait 与校园活动。
 *
 * 搜索为真交互：输入即时匹配已确认公开的昵称/兴趣（publicPortraits）
 * 与活动标题/描述/类别（state.activities）；英文不区分大小写，去首尾空格。
 */
export default function DiscoveryPage() {
  const { publicPortraits, state } = useData()
  const [query, setQuery] = useState('')

  const trimmed = query.trim()
  const q = trimmed.toLowerCase()

  const { matchedPeople, matchedActivities } = useMemo(() => {
    if (!q) return { matchedPeople: [] as Portrait[], matchedActivities: [] as Activity[] }
    return {
      matchedPeople: publicPortraits.filter(
        (p) =>
          p.nickname.toLowerCase().includes(q) ||
          p.interestTags.some((t) => t.toLowerCase().includes(q)),
      ),
      matchedActivities: state.activities.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.interestCategory.toLowerCase().includes(q),
      ),
    }
  }, [q, publicPortraits, state.activities])

  const hasQuery = q.length > 0
  const hasResults = matchedPeople.length > 0 || matchedActivities.length > 0
  const clear = () => setQuery('')

  return (
    <div className="flex flex-col gap-5">
      {/* Hero：品牌 + 搜索（柔和渐变氛围层，装饰不遮挡交互） */}
      <section className="relative overflow-hidden rounded-card bg-gradient-to-br from-[#EFECFD] via-white to-[#E5F9F3] p-5 shadow-card md:p-7">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-2xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-14 -left-8 h-36 w-36 rounded-full bg-mint/15 blur-2xl" aria-hidden />
        <div className="pointer-events-none absolute right-24 top-6 h-16 w-16 rounded-full bg-pink/15 blur-xl" aria-hidden />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-primary shadow-sm">
            <Sparkles size={12} /> 校园兴趣社交
          </span>
          <h1 className="mt-3 text-2xl font-bold leading-snug md:text-3xl">
            在校园里，
            <br />
            找到和你<span className="text-primary">真正同频</span>的人
          </h1>
          <p className="mt-2 text-sm text-ink-sub">发现同好、认识搭子、一起参与活动。</p>
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="mt-3 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-card focus-within:ring-2 focus-within:ring-primary/30"
          >
            <Search size={16} className="shrink-0 text-ink-sub" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索兴趣、活动和昵称"
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink-sub/70"
              aria-label="搜索兴趣、活动和昵称"
            />
            {hasQuery ? (
              <button
                type="button"
                onClick={clear}
                aria-label="清空搜索"
                className="inline-flex shrink-0 items-center justify-center rounded-full p-1 text-ink-sub transition-colors hover:bg-bg hover:text-ink"
              >
                <X size={16} />
              </button>
            ) : null}
            <button
              type="submit"
              className="inline-flex shrink-0 items-center rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              搜索
            </button>
          </form>
        </div>
      </section>

      {/* 两个并列入口（固定，不可替换为其他结构）：淡紫 / 薄荷渐变底卡 */}
      <section className="grid grid-cols-2 gap-3">
        <Link
          to="/discover/people"
          className="group relative flex flex-col justify-between gap-3 overflow-hidden rounded-card bg-gradient-to-br from-[#F0ECFD] to-[#DCD3F9] p-4 shadow-card transition-shadow hover:shadow-lg md:p-5"
        >
          <span className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/50" aria-hidden />
          <span className="pointer-events-none absolute bottom-3 right-6 h-8 w-8 rounded-full bg-white/30" aria-hidden />
          <div className="relative">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/85 text-primary shadow-sm">
              <Users size={20} />
            </span>
            <h2 className="mt-3 font-bold">找同频的人</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-sub">
              通过兴趣、价值观和生活方式，认识与你同频的同学。
            </p>
          </div>
          <span className="relative inline-flex items-center gap-1 text-xs font-semibold text-primary">
            进入探索 <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
        <Link
          to="/discover/activities"
          className="group relative flex flex-col justify-between gap-3 overflow-hidden rounded-card bg-gradient-to-br from-[#E5F9F3] to-[#C6EEDC] p-4 shadow-card transition-shadow hover:shadow-lg md:p-5"
        >
          <span className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/50" aria-hidden />
          <span className="pointer-events-none absolute bottom-3 right-6 h-8 w-8 rounded-full bg-white/30" aria-hidden />
          <div className="relative">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/85 text-mint shadow-sm">
              <CalendarCheck size={20} />
            </span>
            <h2 className="mt-3 font-bold">找活动搭子</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-sub">
              参加自习、运动、语言交流、比赛组队等校园活动。
            </p>
          </div>
          <span className="relative inline-flex items-center gap-1 text-xs font-semibold text-mint">
            进入活动 <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </section>

      {/* 星云探索：横跨整行的独立入口（深色仅限此模块） */}
      <Link to="/nebula" className="group block">
        <section className="relative overflow-hidden rounded-card bg-gradient-to-r from-[#241a4d] via-[#3b2a7a] to-[#5b3fa8] p-5 text-white shadow-card">
          {/* 星球光晕装饰 */}
          <div className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-[#9d8cff] to-[#6C5CE7] opacity-80 blur-[1px]" aria-hidden />
          <div className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full bg-primary/50 blur-2xl" aria-hidden />
          <div className="pointer-events-none absolute right-16 top-2 h-2 w-16 -rotate-12 rounded-[50%] border border-white/40" aria-hidden />
          <div className="pointer-events-none absolute -bottom-12 right-24 h-24 w-24 rounded-full bg-pink/30 blur-2xl" aria-hidden />
          <div className="pointer-events-none absolute left-10 top-3 h-1 w-1 rounded-full bg-white/70" aria-hidden />
          <div className="pointer-events-none absolute left-24 bottom-4 h-1.5 w-1.5 rounded-full bg-white/50" aria-hidden />
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Sparkles size={20} /> 星云探索
              </h2>
              <p className="mt-1 text-xs text-white/80 md:text-sm">
                在兴趣星云中遇见更多同频的伙伴，按照你的兴趣，自由探索更大的校园同好圈。
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur transition-transform group-hover:translate-x-0.5">
              进入星云 <ArrowRight size={14} />
            </span>
          </div>
        </section>
      </Link>

      {/* 有查询：展示两组搜索结果；空查询：恢复推荐 + 活动布局 */}
      {hasQuery ? (
        <section aria-label="搜索结果">
          {!hasResults ? (
            <Card className="flex flex-col items-center gap-3 py-8 text-center">
              <Search size={26} className="text-ink-sub/60" />
              <div>
                <p className="text-sm font-semibold text-ink">没有找到与「{trimmed}」相关的内容</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-sub">
                  试试换个关键词，或清空后浏览推荐的同频同学与校园活动。
                </p>
              </div>
              <button
                type="button"
                onClick={clear}
                className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                <X size={14} /> 清空搜索
              </button>
            </Card>
          ) : (
            <div className="flex flex-col gap-5">
              {/* 同频的人 */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Users size={16} className="text-primary" />
                  <h2 className="font-bold">同频的人</h2>
                  <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
                    {matchedPeople.length}
                  </span>
                </div>
                {matchedPeople.length === 0 ? (
                  <p className="rounded-card bg-card/60 px-4 py-3 text-xs text-ink-sub">
                    没有匹配的已公开同学。
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                    {matchedPeople.map((p) => (
                      <PersonCard key={p.id} portrait={p} />
                    ))}
                  </div>
                )}
              </div>

              {/* 相关活动 */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <CalendarCheck size={16} className="text-mint" />
                  <h2 className="font-bold">相关活动</h2>
                  <span className="rounded-full bg-mint-soft px-2 py-0.5 text-xs font-medium text-mint">
                    {matchedActivities.length}
                  </span>
                </div>
                {matchedActivities.length === 0 ? (
                  <p className="rounded-card bg-card/60 px-4 py-3 text-xs text-ink-sub">
                    没有匹配的校园活动。
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {matchedActivities.map((a) => (
                      <ActivityCard key={a.id} activity={a} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* 推荐 Portrait：仅展示已公开资料 */}
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="font-bold">推荐 Portrait</h2>
              <Link to="/discover/people" className="text-xs font-medium text-primary">
                查看更多 →
              </Link>
            </div>
            <p className="mb-3 text-xs text-ink-sub">为你推荐公开且完整的同频同学（合成演示数据）。</p>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {publicPortraits.slice(0, 6).map((p) => (
                <PersonCard key={p.id} portrait={p} />
              ))}
            </div>
          </section>

          {/* 校园活动 */}
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="font-bold">校园活动</h2>
              <Link to="/discover/activities" className="text-xs font-medium text-primary">
                查看更多 →
              </Link>
            </div>
            <p className="mb-3 text-xs text-ink-sub">一起参与真实的校园活动，结识更多同频朋友。</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {state.activities.map((a) => (
                <ActivityCard key={a.id} activity={a} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
