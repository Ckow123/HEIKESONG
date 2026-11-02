import { ArrowRight, CalendarCheck, Search, Sparkles, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useData } from '@/data/DataProvider'
import { Card } from '@/shared/ui/Card'
import { Tag } from '@/shared/ui/Tag'

/**
 * P01 发现页（信息架构已锁定）：
 * 顶部两个并列入口「找同频的人」「找活动搭子」；
 * 其下横跨整行的「星云探索」入口；再往下为推荐 Portrait 与校园活动。
 */
export default function DiscoveryPage() {
  const { publicPortraits, state } = useData()

  return (
    <div className="flex flex-col gap-5">
      {/* 品牌与搜索 */}
      <section className="pt-1">
        <h1 className="text-2xl font-bold leading-snug md:text-3xl">
          在校园里，
          <br />
          找到和你<span className="text-primary">真正同频</span>的人
        </h1>
        <p className="mt-2 text-sm text-ink-sub">发现同好、认识搭子、一起参与活动。</p>
        <div className="mt-3 flex items-center gap-2 rounded-full bg-card px-4 py-2.5 shadow-card">
          <Search size={16} className="shrink-0 text-ink-sub" />
          <input
            type="search"
            placeholder="搜索兴趣、活动和昵称"
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink-sub/70"
            aria-label="搜索兴趣、活动和昵称"
          />
        </div>
      </section>

      {/* 两个并列入口（固定，不可替换为其他结构） */}
      <section className="grid grid-cols-2 gap-3">
        <Link to="/discover/people" className="group">
          <Card className="flex h-full flex-col justify-between gap-3 transition-shadow hover:shadow-lg">
            <div>
              <Users size={26} className="text-primary" />
              <h2 className="mt-2 font-bold">找同频的人</h2>
              <p className="mt-1 text-xs leading-relaxed text-ink-sub">通过兴趣、价值观和生活方式，认识与你同频的同学。</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
              进入探索 <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Card>
        </Link>
        <Link to="/discover/activities" className="group">
          <Card className="flex h-full flex-col justify-between gap-3 transition-shadow hover:shadow-lg">
            <div>
              <CalendarCheck size={26} className="text-mint" />
              <h2 className="mt-2 font-bold">找活动搭子</h2>
              <p className="mt-1 text-xs leading-relaxed text-ink-sub">参加自习、运动、语言交流、比赛组队等校园活动。</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-mint">
              进入活动 <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Card>
        </Link>
      </section>

      {/* 星云探索：横跨整行的独立入口（深色仅限此模块） */}
      <Link to="/nebula" className="group block">
        <section className="relative overflow-hidden rounded-card bg-gradient-to-r from-[#241a4d] via-[#3b2a7a] to-[#5b3fa8] p-5 text-white shadow-card">
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
          <div className="pointer-events-none absolute -right-6 -top-10 h-36 w-36 rounded-full bg-primary/40 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 right-24 h-24 w-24 rounded-full bg-pink/30 blur-2xl" />
        </section>
      </Link>

      {/* 推荐 Portrait：仅展示已公开资料 */}
      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-bold">推荐 Portrait</h2>
          <Link to="/discover/people" className="text-xs font-medium text-primary">
            查看更多 →
          </Link>
        </div>
        <p className="mb-3 text-xs text-ink-sub">为你推荐公开且完整的同频同学（合成演示数据）。</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {publicPortraits.slice(0, 3).map((p) => (
            <Card key={p.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{p.nickname}</span>
                {p.mbti ? <Tag tone="primary">{p.mbti}</Tag> : null}
              </div>
              {p.bio ? <p className="line-clamp-2 text-xs leading-relaxed text-ink-sub">{p.bio}</p> : null}
              <div className="flex flex-wrap gap-1.5">
                {p.interestTags.slice(0, 4).map((tag) => (
                  <Tag key={tag} tone="mint">{tag}</Tag>
                ))}
              </div>
              <Link to={`/people/${p.id}`} className="mt-auto pt-1 text-xs font-medium text-primary">
                查看 Portrait →
              </Link>
            </Card>
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
            <Card key={a.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{a.title}</span>
                <Tag tone="primary">{a.interestCategory}</Tag>
              </div>
              <p className="text-xs text-ink-sub">{a.timeText}</p>
              <p className="text-xs text-ink-sub">{a.locationText}</p>
              <div className="mt-auto flex items-center justify-between pt-1">
                <span className="text-xs text-ink-sub">{a.capacityText}</span>
                <Link to={`/activities/${a.id}`} className="text-xs font-medium text-primary">
                  查看详情 →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
