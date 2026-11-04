import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { Portrait } from '@/domain'
import { GradientAvatar } from '@/shared/ui/GradientAvatar'
import { Tag } from '@/shared/ui/Tag'

/** 合成插画风封面色板：按 id 哈希确定性取色，避免真人照片（合成演示数据） */
const COVERS = [
  { cover: 'from-[#F0ECFD] via-[#E4DCFB] to-[#CFC4F6]', ink: 'text-primary' },
  { cover: 'from-[#E5F9F3] via-[#D6F3E8] to-[#BCE9D8]', ink: 'text-mint' },
  { cover: 'from-[#FDEAF3] via-[#FADDEC] to-[#F5C6DE]', ink: 'text-pink' },
  { cover: 'from-[#E8F0FF] via-[#DBE8FF] to-[#C3D6FF]', ink: 'text-[#4A7BD8]' },
  { cover: 'from-[#FFF4E3] via-[#FFEBCC] to-[#FFDFAE]', ink: 'text-[#D98A2B]' },
] as const

function coverFor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return COVERS[h % COVERS.length]
}

function relationshipLabel(p: Portrait): string | null {
  if (p.relationshipStatus === 'in_relationship') return '有对象'
  if (p.relationshipStatus === 'undisclosed') return '关系状态未公开'
  return null
}

/**
 * 公开 Portrait 卡片：渐变封面 + 首字头像 + bio + 兴趣/意图标签 + 辅助信息。
 * 发现页推荐、搜索结果与找同频的人列表共用，仅展示已公开字段。
 */
export function PersonCard({ portrait: p }: { portrait: Portrait }) {
  const theme = coverFor(p.id)
  const rel = relationshipLabel(p)
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-card border border-white/90 bg-card shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className={`relative h-[86px] overflow-hidden bg-gradient-to-br md:h-24 ${theme.cover}`}>
        <span className="absolute -right-5 -top-8 h-24 w-24 rounded-full border-[12px] border-white/25" aria-hidden />
        <span className="absolute bottom-3 right-10 h-7 w-7 rounded-full bg-white/25" aria-hidden />
        <span className="absolute left-[58%] top-4 h-1.5 w-1.5 rounded-full bg-white/70" aria-hidden />
        {p.mbti ? (
          <span className="absolute right-3 top-3 rounded-full border border-white/60 bg-white/80 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-ink shadow-sm">
            {p.mbti}
          </span>
        ) : null}
        <GradientAvatar
          seed={p.id}
          text={p.nickname}
          size="md"
          className="absolute -bottom-5 left-3 !h-12 !w-12 !border-2 !border-white !text-lg !shadow-card md:left-4 md:!h-14 md:!w-14"
        />
      </div>

      <div className="flex flex-1 flex-col px-3 pb-2 pt-7 md:px-4 md:pt-8">
        <div className="flex items-center justify-between gap-2">
          <span className={`truncate text-[15px] font-bold tracking-tight ${theme.ink}`}>{p.nickname}</span>
          {p.zodiac ? <span className="shrink-0 text-[11px] text-ink-sub">{p.zodiac}</span> : null}
        </div>
        {p.bio ? (
          <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-ink-sub">{p.bio}</p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.interestTags.slice(0, 3).map((tag) => (
            <Tag key={tag} tone="mint" className="!px-2 !text-[11px]">
              {tag}
            </Tag>
          ))}
        </div>
        {p.socialIntents.length > 0 ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-ink-sub">想找</span>
            {p.socialIntents.slice(0, 1).map((intent) => (
              <Tag key={intent} tone="pink" className="!px-2 !text-[11px]">
                {intent}
              </Tag>
            ))}
          </div>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-ink-sub/10 pt-1.5">
          <span className="truncate text-[10px] text-ink-sub">
            {rel ? (
              <span className={p.relationshipStatus === 'in_relationship' ? 'text-[#C65486]' : ''}>{rel}</span>
            ) : (
              '公开 Portrait'
            )}
          </span>
          <Link to={`/people/${p.id}`} className="-mr-2 inline-flex min-h-10 shrink-0 items-center gap-0.5 rounded-full px-2 text-[11px] font-semibold text-primary transition-colors hover:bg-primary-soft">
            查看 Portrait <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}
