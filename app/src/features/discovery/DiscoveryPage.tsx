import { useMemo, useState } from 'react'
import { ArrowRight, CalendarCheck, Search, Sparkles, Users, X } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useData } from '@/data/DataProvider'
import type { Activity, Portrait } from '@/domain'
import { Card } from '@/shared/ui/Card'
import { ActivityCard } from '../activities/ActivityCard'
import { PersonCard } from './PersonCard'

/** 本地合成校园场景：仅以装饰性 SVG 营造氛围，不携带任何用户资料。 */
function CampusScene({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 260" fill="none" className={className} aria-hidden="true">
      <circle cx="420" cy="52" r="34" fill="#FFF4C7" opacity=".85" />
      <path d="M40 210C150 160 336 162 500 206V260H40V210Z" fill="#DDEDCE" />
      <path d="M190 260C232 214 300 190 376 182C326 216 302 238 292 260H190Z" fill="#F7F0DC" />
      <path d="M250 78H432V184H250V78Z" fill="#FFF9F0" />
      <path d="M236 82L340 34L446 82H236Z" fill="#C9B9F2" />
      <path d="M322 46H360V18H322V46Z" fill="#F7F2FF" />
      <path d="M316 20L341 4L366 20H316Z" fill="#8E7BE0" />
      <circle cx="341" cy="32" r="7" fill="#FFF" stroke="#8E7BE0" strokeWidth="3" />
      <path d="M328 184V126C328 118 336 112 341 112C346 112 354 118 354 126V184" fill="#9D8BE4" />
      {[270, 302, 382, 414].map((x) => (
        <g key={x}>
          <rect x={x} y="102" width="18" height="24" rx="4" fill="#C7E5E0" />
          <rect x={x} y="140" width="18" height="24" rx="4" fill="#D9CCF4" />
        </g>
      ))}
      <g>
        <path d="M102 188V118" stroke="#8D7158" strokeWidth="10" strokeLinecap="round" />
        <circle cx="102" cy="102" r="43" fill="#B9E2C5" />
        <circle cx="72" cy="116" r="28" fill="#CBE9C6" />
        <circle cx="132" cy="118" r="31" fill="#A9DABB" />
        <circle cx="124" cy="76" r="26" fill="#D8EDBC" />
      </g>
      <g>
        <path d="M468 192V132" stroke="#8D7158" strokeWidth="9" strokeLinecap="round" />
        <circle cx="468" cy="116" r="39" fill="#B9E2C5" />
        <circle cx="442" cy="132" r="25" fill="#D8EDBC" />
        <circle cx="492" cy="132" r="26" fill="#A9DABB" />
      </g>
      <g transform="translate(168 166)">
        <circle cx="0" cy="0" r="13" fill="#F4C9B7" />
        <path d="M-13-2C-12-18 12-20 14-2C7-8-2-10-13-2Z" fill="#3E3558" />
        <path d="M-18 56C-18 26-12 16 0 16C12 16 20 28 20 56H-18Z" fill="#6C5CE7" />
        <path d="M18 28L38 48" stroke="#F4C9B7" strokeWidth="8" strokeLinecap="round" />
      </g>
      <g transform="translate(408 170)">
        <circle cx="0" cy="0" r="13" fill="#F4C9B7" />
        <path d="M-14-1C-14-18 12-20 14 0C4-8-5-8-14-1Z" fill="#493B52" />
        <path d="M-20 54C-18 26-12 16 0 16C14 16 20 28 22 54H-20Z" fill="#3ECFAD" />
        <path d="M-18 28L-36 46" stroke="#F4C9B7" strokeWidth="8" strokeLinecap="round" />
      </g>
      <path d="M54 58C74 42 92 44 106 56C122 44 144 48 152 62H54V58Z" fill="white" opacity=".72" />
    </svg>
  )
}

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
      <section className="relative isolate overflow-hidden rounded-[24px] border border-white/90 bg-[#F4F1FC] shadow-card md:min-h-[286px]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#F4F1FC] via-[#F7F5FCEF] to-[#EAF6EF]/40" aria-hidden />
        <CampusScene className="pointer-events-none absolute -right-14 bottom-0 h-full w-[430px] opacity-[.32] sm:right-0 sm:opacity-50 md:h-[290px] md:w-[520px] md:opacity-100" />
        <div className="relative z-10 flex min-h-[260px] max-w-2xl flex-col justify-center p-5 sm:p-7 md:min-h-[286px] md:w-[58%] md:p-8 lg:p-10">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/10 bg-white/85 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-primary shadow-sm">
            <Sparkles size={13} /> 校园兴趣社交
          </span>
          <h1 className="mt-4 max-w-xl text-[27px] font-bold leading-[1.35] tracking-tight text-ink sm:text-3xl md:text-[34px]">
            在校园，找到和你
            <span className="relative whitespace-nowrap text-primary">
              真正同频
              <span className="absolute -bottom-1 left-0 h-1.5 w-full rounded-full bg-primary/15" aria-hidden />
            </span>
            的人
          </h1>
          <p className="mt-3 text-sm leading-6 text-ink-sub md:text-[15px]">发现同好、认识搭子、一起参与活动。</p>
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="mt-5 flex min-h-12 items-center gap-2 rounded-full border border-white bg-white/95 p-1.5 pl-4 shadow-card transition-shadow focus-within:ring-2 focus-within:ring-primary/25 md:max-w-[520px]"
          >
            <Search size={18} className="shrink-0 text-ink-sub" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索兴趣、活动和昵称"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-sub/75"
              aria-label="搜索兴趣、活动和昵称"
            />
            {hasQuery ? (
              <button
                type="button"
                onClick={clear}
                aria-label="清空搜索"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-sub transition-colors hover:bg-bg hover:text-ink"
              >
                <X size={16} />
              </button>
            ) : null}
            <button
              type="submit"
              className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full bg-primary px-5 text-xs font-semibold text-white shadow-button transition-colors hover:bg-primary/90"
            >
              搜索
            </button>
          </form>
        </div>
      </section>

      {/* 两个并列入口（固定，不可替换为其他结构）：淡紫 / 薄荷渐变底卡 */}
      <section className="grid grid-cols-2 gap-3 md:gap-4" aria-label="探索入口">
        <Link
          to="/discover/people"
          className="group relative flex min-h-[176px] flex-col justify-between overflow-hidden rounded-card border border-white/90 bg-gradient-to-br from-primary-soft via-[#F0ECFD] to-[#E2DAFA] p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover md:min-h-[158px] md:p-5"
        >
          <Users className="pointer-events-none absolute -bottom-5 -right-4 h-28 w-28 rotate-[-8deg] text-primary/[.07] md:h-36 md:w-36" aria-hidden />
          <div className="relative">
            <div className="flex items-start justify-between gap-2">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-primary shadow-sm">
                <Users size={22} />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-transform group-hover:translate-x-0.5">
                <ArrowRight size={16} />
              </span>
            </div>
            <h2 className="mt-3 text-[15px] font-bold tracking-tight md:text-lg">找同频的人</h2>
            <p className="mt-1.5 text-xs leading-5 text-ink-sub md:max-w-sm md:text-[13px]">
              从兴趣、价值观和生活方式出发，认识与你同频的同学。
            </p>
          </div>
          <span className="relative mt-3 inline-flex min-h-8 items-center text-xs font-semibold text-primary">进入探索</span>
        </Link>
        <Link
          to="/discover/activities"
          className="group relative flex min-h-[176px] flex-col justify-between overflow-hidden rounded-card border border-white/90 bg-gradient-to-br from-mint-soft via-[#E8F8F1] to-[#D3F1E5] p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover md:min-h-[158px] md:p-5"
        >
          <CalendarCheck className="pointer-events-none absolute -bottom-5 -right-4 h-28 w-28 rotate-[8deg] text-[#218B70]/[.08] md:h-36 md:w-36" aria-hidden />
          <div className="relative">
            <div className="flex items-start justify-between gap-2">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-[#27997C] shadow-sm">
                <CalendarCheck size={22} />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2FAE8B] text-white shadow-sm transition-transform group-hover:translate-x-0.5">
                <ArrowRight size={16} />
              </span>
            </div>
            <h2 className="mt-3 text-[15px] font-bold tracking-tight md:text-lg">找活动搭子</h2>
            <p className="mt-1.5 text-xs leading-5 text-ink-sub md:max-w-sm md:text-[13px]">
              参加自习、运动、语言交流和比赛组队，找到一起行动的搭子。
            </p>
          </div>
          <span className="relative mt-3 inline-flex min-h-8 items-center text-xs font-semibold text-[#218B70]">进入活动</span>
        </Link>
      </section>

      {/* 星云探索：横跨整行的独立入口（深色仅限此模块） */}
      <Link to="/nebula" className="group block rounded-card">
        <section className="relative isolate min-h-[132px] overflow-hidden rounded-card bg-[#1B1437] px-5 py-5 text-white shadow-card md:min-h-[126px] md:px-7">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1B1437] via-[#332366] to-[#55409B]" aria-hidden />
          <div className="pointer-events-none absolute -bottom-20 left-[38%] h-44 w-72 rounded-[50%] border border-white/15 -rotate-12" aria-hidden />
          <div className="pointer-events-none absolute -bottom-16 left-[42%] h-36 w-64 rounded-[50%] border border-[#B8A9F7]/20 -rotate-12" aria-hidden />
          <div className="pointer-events-none absolute right-[18%] top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#D7C9FF] via-[#9B88ED] to-[#6C5CE7] shadow-[0_0_36px_rgba(182,164,255,.45)] md:right-[22%]" aria-hidden />
          <div className="pointer-events-none absolute right-[12%] top-1/2 h-9 w-40 -translate-y-1/2 -rotate-12 rounded-[50%] border-[3px] border-[#E5DCFF]/70 md:right-[15%]" aria-hidden />
          <div className="pointer-events-none absolute right-[7%] top-4 h-5 w-5 rounded-full bg-[#8FE2D0] shadow-[0_0_18px_rgba(143,226,208,.6)]" aria-hidden />
          <div className="pointer-events-none absolute bottom-5 right-[38%] h-3 w-3 rounded-full bg-[#F6A8CA]" aria-hidden />
          <div className="pointer-events-none absolute left-6 top-4 h-1 w-1 rounded-full bg-white/80 shadow-[40px_70px_0_rgba(255,255,255,.5),170px_15px_0_rgba(255,255,255,.65),240px_82px_0_rgba(255,255,255,.4)]" aria-hidden />
          <div className="relative z-10 flex h-full items-center justify-between gap-3">
            <div className="max-w-[68%] md:max-w-[56%]">
              <span className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#C9BCFA]">NEBULA EXPLORER</span>
              <h2 className="mt-1.5 flex items-center gap-2 text-xl font-bold tracking-tight">
                <Sparkles size={19} className="text-[#D9CEFF]" /> 星云探索
              </h2>
              <p className="mt-1.5 text-xs leading-5 text-white/70 md:text-[13px]">
                在兴趣星云中自由探索，遇见更多同频的校园伙伴。
              </p>
            </div>
            <span className="absolute bottom-4 right-4 inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-white px-4 text-xs font-semibold text-[#49369A] shadow-sm transition-transform group-hover:translate-x-0.5 md:static md:px-5">
              进入星云 <ArrowRight size={15} />
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
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,1fr)] xl:items-start">
          {/* 推荐 Portrait：仅展示已公开资料 */}
          <section className="min-w-0">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-soft text-primary"><Sparkles size={16} /></span>
                  推荐 Portrait
                </h2>
                <p className="mt-1.5 pl-10 text-xs text-ink-sub">公开且完整的同频同学，从兴趣开始认识彼此。</p>
              </div>
              <Link to="/discover/people" className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-full px-2 text-xs font-semibold text-primary hover:bg-primary-soft">
                查看更多 <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
              {publicPortraits.slice(0, 6).map((p) => (
                <PersonCard key={p.id} portrait={p} />
              ))}
            </div>
          </section>

          {/* 校园活动 */}
          <section className="min-w-0">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-mint-soft text-[#218B70]"><CalendarCheck size={16} /></span>
                  校园活动
                </h2>
                <p className="mt-1.5 pl-10 text-xs text-ink-sub">一起参与校园活动，把共同兴趣变成真实相遇。</p>
              </div>
              <Link to="/discover/activities" className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-full px-2 text-xs font-semibold text-primary hover:bg-primary-soft">
                查看更多 <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-1">
              {state.activities.map((a) => (
                <ActivityCard key={a.id} activity={a} />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
