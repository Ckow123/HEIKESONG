import { useState } from 'react'
import { ArrowRight, Info, MousePointerClick, MoveDiagonal, X } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useData } from '@/data/DataProvider'
import { PageHeader } from '@/shared/ui/PageHeader'

/**
 * P06 星云探索（独立子页）：
 * - 开放、自由探索的行星世界；每颗星球是一位自愿公开的同学；
 * - 深色宇宙视觉仅限本页容器，不影响全站浅色主题；
 * - 点击星球显示该同学的公开资料预览浮层，点击空白处关闭；
 * - 拖拽/缩放等最低交互组合尚未冻结（T7 待定），本阶段不实现；
 *   行星数据实时派生自公开 Portrait。
 */

/** 马卡龙色系行星调色板：让每颗星球可辨识，避免全部同色 */
const PLANET_PALETTE = [
  { from: '#9d8cff', to: '#6C5CE7', glow: 'rgba(157,140,255,0.65)' },
  { from: '#f47fb0', to: '#e85a98', glow: 'rgba(244,127,176,0.6)' },
  { from: '#7eeccf', to: '#3ECFAD', glow: 'rgba(126,236,207,0.6)' },
  { from: '#ffd479', to: '#f5a623', glow: 'rgba(255,212,121,0.55)' },
  { from: '#8fd3ff', to: '#4A90E2', glow: 'rgba(143,211,255,0.6)' },
  { from: '#c9a0ff', to: '#a06be0', glow: 'rgba(201,160,255,0.6)' },
]

/** 星球大小按 index 确定性分四档，形成远近层次 */
const PLANET_SIZES = [34, 52, 40, 60]

export default function NebulaPage() {
  const { nebulaProjections, publicPortraits } = useData()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = selectedId ? publicPortraits.find((p) => p.id === selectedId) : undefined
  const selectedPalette = selected
    ? PLANET_PALETTE[
        nebulaProjections.findIndex((n) => n.portraitId === selected.id) % PLANET_PALETTE.length
      ] ?? PLANET_PALETTE[0]
    : PLANET_PALETTE[0]

  return (
    <div>
      <PageHeader
        title="星云探索"
        subtitle="在这片兴趣星云中，自由探索更多同频的伙伴。每一颗星球，都是一位愿意公开分享的同学。"
        fallback="/discover"
      />
      <div className="relative h-[480px] overflow-hidden rounded-card bg-gradient-to-br from-[#1B1437] via-[#2a1e5c] to-[#4a2f8f] shadow-card md:h-[540px]">
        {/* 星点背景 */}
        <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden>
          {Array.from({ length: 56 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 100}%`,
                width: i % 5 === 0 ? 2 : 1.5,
                height: i % 5 === 0 ? 2 : 1.5,
                opacity: 0.25 + ((i * 7) % 10) / 18,
              }}
            />
          ))}
        </div>

        {/* 装饰性轨道线 + 中央主视觉星球光晕 */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute left-1/2 top-1/2 h-48 w-72 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-white/10 md:h-56 md:w-96" />
          <div className="absolute left-1/2 top-1/2 h-32 w-56 -translate-x-1/2 -translate-y-1/2 rounded-[50%] -rotate-12 border border-white/[0.07] md:h-40 md:w-80" />
          <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(196,160,255,0.35),rgba(244,127,176,0.12)_60%,transparent_75%)] blur-xl" />
          <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#9d8cff]/60 to-[#f47fb0]/50 blur-[2px]" />
        </div>

        {/* 行星层：点空白处关闭预览；底部预留空间避免与说明条遮挡 */}
        <div
          className="absolute inset-x-0 top-0 bottom-16"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedId(null)
          }}
        >
          {nebulaProjections.map((n, i) => {
            const palette = PLANET_PALETTE[i % PLANET_PALETTE.length]
            const size = PLANET_SIZES[i % PLANET_SIZES.length]
            const hasRing = i % 3 === 1
            const isSelected = selectedId === n.portraitId
            // 移动端只给较大的星球常显昵称，小星球选中后再显示，避免拥挤
            const alwaysShowLabel = size >= 40
            return (
              <button
                key={n.portraitId}
                type="button"
                onClick={() => setSelectedId(isSelected ? null : n.portraitId)}
                aria-pressed={isSelected}
                aria-label={`查看 ${n.displayLabel} 的简介`}
                className="group absolute -translate-x-1/2 -translate-y-1/2 text-center focus:outline-none"
                style={{ left: `${n.positionHint?.x ?? 50}%`, top: `${n.positionHint?.y ?? 50}%` }}
              >
                <span className="relative mx-auto block" style={{ width: size, height: size }}>
                  {/* 行星本体 */}
                  <span
                    className={`block h-full w-full rounded-full transition-transform group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-white/70 ${
                      isSelected ? 'scale-110 ring-2 ring-white/80' : ''
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
                      boxShadow: `0 0 ${isSelected ? 26 : 18}px ${palette.glow}`,
                    }}
                  />
                  {/* 行星环（装饰） */}
                  {hasRing ? (
                    <span
                      className="pointer-events-none absolute left-1/2 top-1/2 h-[35%] w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-white/40"
                      aria-hidden
                    />
                  ) : null}
                </span>
                <span
                  className={`mt-1.5 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur transition-colors group-hover:bg-black/55 md:inline-block md:text-[11px] ${
                    alwaysShowLabel || isSelected ? 'inline-block' : 'hidden'
                  } ${isSelected ? 'bg-black/60' : ''}`}
                >
                  {n.displayLabel}
                </span>
                <span
                  className={`mt-0.5 text-[9px] leading-tight text-white/65 md:text-[10px] ${
                    alwaysShowLabel ? 'hidden md:block' : 'hidden'
                  }`}
                >
                  {n.tags.join(' · ')}
                </span>
              </button>
            )
          })}
        </div>

        {/* 选中星球的公开资料预览：移动端底部浮层，桌面端右侧浮层 */}
        {selected ? (
          <div className="absolute inset-x-3 bottom-16 z-20 rounded-card border border-white/15 bg-[#241a4d]/85 p-4 text-white shadow-2xl backdrop-blur md:inset-x-auto md:right-4 md:top-4 md:bottom-auto md:w-80">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label="关闭预览"
              className="absolute right-3 top-3 inline-flex items-center justify-center rounded-full p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-3">
              <span
                className="h-11 w-11 shrink-0 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${selectedPalette.from}, ${selectedPalette.to})`,
                  boxShadow: `0 0 16px ${selectedPalette.glow}`,
                }}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="truncate font-bold">{selected.nickname}</p>
                <p className="text-[11px] text-white/65">
                  {[selected.mbti, selected.zodiac].filter(Boolean).join(' · ') || '公开 Portrait'}
                </p>
              </div>
            </div>
            {selected.bio ? (
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/80">{selected.bio}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selected.interestTags.slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/90">
                  {tag}
                </span>
              ))}
            </div>
            {selected.socialIntents.length > 0 ? (
              <p className="mt-2 text-[11px] text-white/65">
                想找：{selected.socialIntents.join('、')}
              </p>
            ) : null}
            <Link
              to={`/people/${selected.id}`}
              className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#3b2a7a] transition-opacity hover:opacity-90"
            >
              查看 Portrait <ArrowRight size={13} />
            </Link>
          </div>
        ) : null}

        {/* 底部说明条：独立区域，不与行星重叠 */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-start gap-2 rounded-card bg-black/40 px-3 py-2 text-[11px] leading-relaxed text-white/85 backdrop-blur">
          <Info size={14} className="mt-0.5 shrink-0" />
          <div>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className="inline-flex items-center gap-1">
                <MousePointerClick size={12} /> 点击星球查看简介，再点空白处关闭
              </span>
              <span className="inline-flex items-center gap-1 text-white/60">
                <MoveDiagonal size={12} /> 拖拽 / 滚轮缩放待 T7 实现
              </span>
            </p>
            <p className="mt-0.5 text-white/65">
              当前仅展示已公开同学的合成样例；未公开或已撤回的同学不会出现在星云中。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
