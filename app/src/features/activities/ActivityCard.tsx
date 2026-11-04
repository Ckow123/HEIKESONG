import { ArrowUpRight, BookOpen, CalendarCheck, Dumbbell, Languages, MapPin, Trophy, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { Activity } from '@/domain'

interface ActivityTheme {
  Icon: LucideIcon
  cover: string
  chip: string
  ink: string
}

/** 活动类别 → 合成插画风封面（渐变 + 类别图标），未知类别按 id 哈希兜底 */
const CATEGORY_THEMES: Record<string, ActivityTheme> = {
  运动: { Icon: Dumbbell, cover: 'from-[#DFF7EE] to-[#B6EBDA]', chip: 'bg-mint text-white', ink: 'text-mint' },
  学习: { Icon: BookOpen, cover: 'from-[#ECE7FC] to-[#CDC2F5]', chip: 'bg-primary text-white', ink: 'text-primary' },
  语言: { Icon: Languages, cover: 'from-[#E3EEFF] to-[#C0D5FF]', chip: 'bg-[#4A7BD8] text-white', ink: 'text-[#4A7BD8]' },
  比赛: { Icon: Trophy, cover: 'from-[#FDE7F1] to-[#F7C3DB]', chip: 'bg-pink text-white', ink: 'text-pink' },
}
const FALLBACK_THEMES = Object.values(CATEGORY_THEMES)

function themeFor(a: Activity): ActivityTheme {
  const hit = CATEGORY_THEMES[a.interestCategory]
  if (hit) return hit
  let h = 0
  for (let i = 0; i < a.id.length; i++) h = (h * 31 + a.id.charCodeAt(i)) >>> 0
  return FALLBACK_THEMES[h % FALLBACK_THEMES.length]
}

/** 校园活动卡片：渐变封面 + 类别 badge + 标题/描述 + 时间/地点/人数元数据 + CTA。 */
export function ActivityCard({ activity: a, horizontal = false }: { activity: Activity; horizontal?: boolean }) {
  const t = themeFor(a)
  return (
    <article className={`group h-full overflow-hidden rounded-card border border-white/90 bg-card shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover ${horizontal ? 'sm:grid sm:grid-cols-[164px_minmax(0,1fr)]' : 'flex flex-col'}`}>
      <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${t.cover} ${horizontal ? 'h-28 sm:h-full sm:min-h-[252px]' : 'h-24 md:h-28'}`}>
        <span className="absolute -left-7 -top-9 h-28 w-28 rounded-full border-[14px] border-white/25" aria-hidden />
        <span className="absolute -bottom-8 -right-5 h-24 w-24 rounded-full bg-white/25" aria-hidden />
        <span className="absolute bottom-4 left-5 h-2 w-2 rounded-full bg-white/70" aria-hidden />
        <span className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/40 bg-white/35 shadow-sm">
          <t.Icon size={34} className={`${t.ink} opacity-90`} aria-hidden />
        </span>
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${t.chip}`}>
          {a.interestCategory}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <h3 className="text-[15px] font-bold leading-6 tracking-tight text-ink">{a.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-ink-sub">{a.description}</p>
        <div className="mt-3 flex flex-col gap-1.5 text-xs text-ink-sub">
          <span className="inline-flex items-start gap-1.5">
            <CalendarCheck size={14} className="mt-0.5 shrink-0 text-[#27997C]" /> <span className="leading-5">{a.timeText}</span>
          </span>
          <span className="inline-flex items-start gap-1.5">
            <MapPin size={14} className="mt-0.5 shrink-0 text-[#D46A98]" /> <span className="leading-5">{a.locationText}</span>
          </span>
          {a.capacityText ? (
            <span className="inline-flex items-center gap-1.5">
              <Users size={14} className="shrink-0 text-primary" /> {a.capacityText}
            </span>
          ) : null}
        </div>
        <div className="mt-auto flex justify-end border-t border-ink-sub/10 pt-1.5">
          <Link to={`/activities/${a.id}`} className="-mr-2 inline-flex min-h-10 items-center gap-1 rounded-full px-2 text-xs font-semibold text-primary transition-colors hover:bg-primary-soft">
            查看详情 <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}
