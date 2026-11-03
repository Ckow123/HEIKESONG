import { Link } from 'react-router-dom'

import type { Portrait } from '@/domain'
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
    <article className="flex h-full flex-col overflow-hidden rounded-card bg-card shadow-card transition-shadow hover:shadow-lg">
      {/* 合成插画封面：柔和渐变 + 几何装饰 + 首字头像 */}
      <div className={`relative h-20 bg-gradient-to-br md:h-24 ${theme.cover}`}>
        <span className="absolute -right-4 -top-6 h-16 w-16 rounded-full bg-white/40" aria-hidden />
        <span className="absolute bottom-2 right-8 h-6 w-6 rounded-full bg-white/30" aria-hidden />
        {p.mbti ? (
          <span className="absolute right-3 top-3 rounded-full bg-white/75 px-2 py-0.5 text-[10px] font-semibold text-ink">
            {p.mbti}
          </span>
        ) : null}
        <span
          className={`absolute -bottom-5 left-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-base font-bold shadow-card md:left-4 md:h-12 md:w-12 ${theme.ink}`}
          aria-hidden
        >
          {p.nickname.slice(0, 1)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-3 pb-3 pt-7 md:px-4 md:pb-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate font-semibold">{p.nickname}</span>
          {p.zodiac ? <span className="shrink-0 text-[11px] text-ink-sub">{p.zodiac}</span> : null}
        </div>
        {p.bio ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-ink-sub">{p.bio}</p>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
          {p.interestTags.slice(0, 3).map((tag) => (
            <Tag key={tag} tone="mint">
              {tag}
            </Tag>
          ))}
        </div>
        {p.socialIntents.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-ink-sub/80">想找</span>
            {p.socialIntents.slice(0, 2).map((intent) => (
              <Tag key={intent} tone="pink">
                {intent}
              </Tag>
            ))}
          </div>
        ) : null}
        <div className="mt-auto flex items-center justify-between border-t border-bg pt-2">
          <span className="text-[11px] text-ink-sub">
            {rel ? (
              <span className={p.relationshipStatus === 'in_relationship' ? 'text-pink' : ''}>{rel}</span>
            ) : (
              '公开 Portrait'
            )}
          </span>
          <Link to={`/people/${p.id}`} className="text-xs font-medium text-primary hover:underline">
            查看 Portrait →
          </Link>
        </div>
      </div>
    </article>
  )
}
