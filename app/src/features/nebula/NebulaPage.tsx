import { Info } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useData } from '@/data/DataProvider'
import { PageHeader } from '@/shared/ui/PageHeader'

/**
 * P06 星云探索（独立子页）：
 * - 开放、自由探索的行星世界；每颗星球是一位自愿公开的同学；
 * - 深色宇宙视觉仅限本页容器，不影响全站浅色主题；
 * - 拖拽/缩放/点击发起连接等最低交互组合尚未冻结（T7 待定），
 *   本阶段为可进可回的定位页 + 公开样例行星，行星数据实时派生自公开 Portrait。
 */
export default function NebulaPage() {
  const { nebulaProjections } = useData()

  return (
    <div>
      <PageHeader
        title="星云探索"
        subtitle="在这片兴趣星云中，自由探索更多同频的伙伴。每一颗星球，都是一位愿意公开分享的同学。"
        fallback="/discover"
      />
      <div className="relative h-[420px] overflow-hidden rounded-card bg-gradient-to-br from-[#1B1437] via-[#2a1e5c] to-[#4a2f8f] shadow-card md:h-[480px]">
        {/* 星点背景 */}
        <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden>
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-0.5 w-0.5 rounded-full bg-white"
              style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, opacity: 0.3 + ((i * 7) % 10) / 18 }}
            />
          ))}
        </div>
        {nebulaProjections.map((n) => (
          <Link
            key={n.portraitId}
            to={`/people/${n.portraitId}`}
            className="group absolute -translate-x-1/2 -translate-y-1/2 text-center"
            style={{ left: `${n.positionHint?.x ?? 50}%`, top: `${n.positionHint?.y ?? 50}%` }}
          >
            <span className="mx-auto block h-9 w-9 rounded-full bg-gradient-to-br from-[#9d8cff] to-[#f47fb0] shadow-[0_0_18px_rgba(157,140,255,0.7)] transition-transform group-hover:scale-110 md:h-11 md:w-11" />
            <span className="mt-1 block rounded-full bg-black/35 px-2 py-0.5 text-[10px] text-white backdrop-blur">
              {n.displayLabel}
            </span>
            <span className="mt-0.5 block text-[9px] text-white/70">{n.tags.join(' · ')}</span>
          </Link>
        ))}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-card bg-black/35 px-3 py-2 text-[11px] leading-relaxed text-white/85 backdrop-blur">
          <Info size={14} className="shrink-0" />
          自由探索定位：搜索、拖拽缩放、点击星球查看 Portrait 与发起连接等交互将在 T7 按团队确认范围实现。
          当前仅展示已公开同学的合成样例；未公开或已撤回的同学不会出现在星云中。
        </div>
      </div>
    </div>
  )
}
