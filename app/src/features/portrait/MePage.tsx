import { EyeOff, PenLine, RotateCcw, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useData } from '@/data/DataProvider'
import { readMigrationConflicts } from '@/data/migrations/b1Legacy'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { GradientAvatar, gradientFor } from '@/shared/ui/GradientAvatar'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Tag } from '@/shared/ui/Tag'

/**
 * P10 我的：Portrait 完成/公开状态、编辑入口、公开/撤回、身份切换、关系状态与动态位置预留。
 * Q1 已确认：合成身份切换（演示模式，非真实登录）。
 * 撤回公开（DEC-003）：退出公开列表与星云、暂停主动打招呼；已有邀请/会话/报名保留。
 */
export default function MePage() {
  const { state, myPortrait, withdrawPortrait, resetDemo, switchIdentity } = useData()
  const currentIdentity = state.identities.find((i) => i.id === state.currentUserId)
  const otherIdentities = state.identities.filter((i) => i.id !== state.currentUserId)
  // B1/P0-04：历史重复 Portrait ID 冲突记录（歧义数据未自动迁移，保留恢复提示）
  const migrationConflicts = readMigrationConflicts()
  // B1/P0-01：旧公开资料缺少可信快照 → 提示本人重新预览并确认公开
  const needsReconfirm = Boolean(myPortrait?.isPublic && !myPortrait.publicSnapshot)

  return (
    <div>
      <PageHeader title="我的" subtitle="自我表达、资料与社交边界。" />

      {migrationConflicts.length > 0 ? (
        <Card className="mb-4 border border-pink/40 bg-pink-soft/60">
          <p className="text-sm font-bold">检测到历史数据冲突（未自动合并或删除）</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-sub">
            发现 {migrationConflicts.length} 组归属存在歧义的历史 Portrait 记录，已原样保留；
            原始数据备份在本浏览器中（tongpin-campus-v1-backup-b1），可人工核对恢复，或重置为初始合成样例。
          </p>
          <ul className="mt-1.5 list-inside list-disc text-[11px] text-ink-sub">
            {migrationConflicts.map((c) => (
              <li key={c.portraitId}>记录 {c.portraitId}：{c.reason}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      {needsReconfirm ? (
        <Card className="mb-4 border border-primary/30 bg-primary-soft/40">
          <p className="text-sm font-bold">你的公开资料需要重新确认公开</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-sub">
            这份资料来自旧版本数据，缺少已确认的公开快照，已暂停在公共列表、星云与搜索中展示。
            草稿与已有邀请、会话、报名关系均保留；请重新预览并明确确认公开后恢复。
          </p>
          <Link to="/me/portrait/preview" className="mt-2 inline-block">
            <Button size="sm">去预览并确认公开</Button>
          </Link>
        </Card>
      ) : null}

      {myPortrait ? (
        <Card className="relative mb-4 overflow-hidden !p-0">
          <div className={`relative h-28 bg-gradient-to-br ${gradientFor(myPortrait.id)}`}>
            <span className="absolute -left-6 -top-10 h-28 w-28 rounded-full border-[14px] border-white/20" />
            <span className="absolute bottom-0 right-10 h-16 w-16 rounded-full bg-white/15" />
            <span className="absolute left-[26%] top-6 h-1.5 w-1.5 rounded-full bg-white/70" />
          </div>
          <div className="px-4 pb-4 md:px-5 md:pb-5">
            <div className="-mt-12 flex items-end justify-between gap-3">
              <GradientAvatar seed={myPortrait.id} text={myPortrait.nickname} size="xl" className="!h-24 !w-24 !text-3xl !shadow-card ring-4 ring-card" />
              <Tag tone={myPortrait.isPublic ? 'mint' : 'neutral'} className="mb-2">{myPortrait.isPublic ? '已公开' : '未公开'}</Tag>
            </div>
            <h2 className="mt-3 text-xl font-bold tracking-tight">{myPortrait.nickname}</h2>
            {myPortrait.bio ? <p className="mt-1.5 text-sm leading-6 text-ink-sub">{myPortrait.bio}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {myPortrait.interestTags.map((t) => (
                <Tag key={t} tone="mint">{t}</Tag>
              ))}
              {myPortrait.socialIntents.map((s) => (
                <Tag key={s} tone="pink">{s}</Tag>
              ))}
            </div>
            <p className="mt-3 rounded-2xl bg-bg/70 px-3 py-2.5 text-[11px] leading-5 text-ink-sub">
              {myPortrait.isPublic
                ? '当前状态：出现在公开找人列表与星云中，可以主动打招呼。'
                : '当前状态：不出现在公开列表与星云，不能主动打招呼；仍可以凭基础 Portrait 向组织者展示并报名（DEC-002.4）。'}
            </p>
          </div>
        </Card>
      ) : (
        <Card className="mb-4 flex flex-col items-center gap-2 py-8 text-center">
          <GradientAvatar seed={state.currentUserId} text="我" size="xl" />
          <p className="text-sm font-bold">你还没有创建 Portrait</p>
          <p className="max-w-sm text-xs leading-relaxed text-ink-sub">
            你可以先自由浏览同学和活动；首次互动（打招呼 / 报名）前，再花一分钟完成基础 Portrait：
            昵称 + 至少 1 个兴趣标签 + 至少 1 项社交意图（DEC-002）。
          </p>
          <Link to="/me/portrait/edit" className="mt-2">
            <Button>
              <PenLine size={14} /> 创建我的 Portrait
            </Button>
          </Link>
        </Card>
      )}

      {myPortrait ? (
        <div className="mb-4 flex flex-wrap gap-2">
          <Link to="/me/portrait/edit">
            <Button variant="outline">
              <PenLine size={14} /> 编辑 Portrait
            </Button>
          </Link>
          <Link to="/me/portrait/preview">
            <Button variant="outline">预览他人可见效果</Button>
          </Link>
          {myPortrait.isPublic ? (
            <Button variant="outline" onClick={() => withdrawPortrait()}>
              <EyeOff size={14} /> 撤回公开
            </Button>
          ) : null}
        </div>
      ) : null}

      {myPortrait?.isPublic ? (
        <Card className="mb-4 border border-dashed border-ink-sub/30 bg-card/60">
          <p className="text-xs leading-relaxed text-ink-sub">
            撤回公开后：你将退出公开找人列表与星云，并暂停主动打招呼；
            已发出的邀请、已有会话和活动报名继续有效，已有互动的对方仍可从记录查看你的基础 Portrait（DEC-003.2/3/4）。
          </p>
        </Card>
      ) : null}

      {/* Q1：身份切换器（演示模式） */}
      <Card className="mb-4 border border-primary/20 bg-primary-soft/20">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-primary" />
          <h3 className="text-sm font-bold">演示身份切换</h3>
          <Tag tone="neutral">演示模式</Tag>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-ink-sub">
          当前身份：<span className="font-medium text-ink">{currentIdentity?.displayName ?? '未知'}</span>
          。可切换到其他合成身份体验对方视角（如查看收到的招呼、处理报名）。仅用于演示，非真实登录，换设备不共享。
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {otherIdentities.map((id) => (
            <button
              key={id.id}
              onClick={() => switchIdentity(id.id)}
              className="rounded-full bg-card px-3 py-1 text-xs font-medium text-ink-sub transition-colors hover:bg-primary-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {id.displayName}
            </button>
          ))}
        </div>
      </Card>

      <Card className="mb-4 border border-dashed border-ink-sub/30 bg-card/60">
        <h3 className="text-sm font-bold">关系状态与个人动态</h3>
        <p className="mt-1 text-xs leading-relaxed text-ink-sub">
          关系状态自愿展示、与社交意图分离，不做事实认证；个人动态发布深度待团队确认，此处仅预留位置。
        </p>
      </Card>

      <Card className="border border-dashed border-ink-sub/30 bg-card/60">
        <h3 className="text-sm font-bold">演示数据</h3>
        <p className="mt-1 text-xs leading-relaxed text-ink-sub">
          当前为合成演示数据，保存在本浏览器的 localStorage 中，刷新后保留；不会发送到任何服务器，也不是跨设备联机。
        </p>
        <Button variant="ghost" className="mt-2 px-0 text-xs" onClick={() => resetDemoSafe()}>
          <RotateCcw size={13} /> 重置为初始合成样例
        </Button>
      </Card>
    </div>
  )

  function resetDemoSafe() {
    if (window.confirm('将清除本浏览器中的演示修改并恢复初始合成样例，确定重置？')) {
      resetDemo()
    }
  }
}
