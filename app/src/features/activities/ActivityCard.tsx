import { BookOpen, CalendarCheck, Dumbbell, Languages, MapPin, Trophy, Users } from 'lucide-react'
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
export function ActivityCard({ activity: a }: { activity: Activity }) {
  const t = themeFor(a)
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card bg-card shadow-card transition-shadow hover:shadow-lg">
      <div className={`relative flex h-24 items-center justify-center bg-gradient-to-br md:h-28 ${t.cover}`}>
        <span className="absolute -left-5 -top-7 h-20 w-20 rounded-full bg-white/40" aria-hidden />
        <span className="absolute bottom-2 right-4 h-8 w-8 rounded-full bg-white/30" aria-hidden />
        <t.Icon size={40} className={`${t.ink} opacity-80`} aria-hidden />
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${t.chip}`}>
          {a.interestCategory}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold leading-snug">{a.title}</h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-ink-sub">{a.description}</p>
        <div className="flex flex-col gap-1 text-xs text-ink-sub">
          <span className="inline-flex items-center gap-1.5">
            <CalendarCheck size={13} className="text-mint" /> {a.timeText}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={13} className="text-pink" /> {a.locationText}
          </span>
          {a.capacityText ? (
            <span className="inline-flex items-center gap-1.5">
              <Users size={13} className="text-primary" /> {a.capacityText}
            </span>
          ) : null}
        </div>
        <div className="mt-auto flex justify-end border-t border-bg pt-2">
          <Link to={`/activities/${a.id}`} className="text-xs font-medium text-primary hover:underline">
            查看详情 →
          </Link>
        </div>
      </div>
    </article>
  )
}
