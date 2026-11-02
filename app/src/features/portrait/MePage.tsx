import { EyeOff, PenLine, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useData } from '@/data/DataProvider'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Tag } from '@/shared/ui/Tag'

/**
 * P10 我的：Portrait 完成/公开状态、编辑入口、公开/撤回、关系状态与动态位置预留。
 * 撤回公开（DEC-003）：退出公开列表与星云、暂停主动打招呼；已有邀请/会话/报名保留。
 */
export default function MePage() {
  const { myPortrait, withdrawPortrait, resetDemo } = useData()

  return (
    <div>
      <PageHeader title="我的" subtitle="自我表达、资料与社交边界。" />

      <Card className="mb-4">
        {myPortrait ? (
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{myPortrait.nickname}</h2>
              <Tag tone={myPortrait.isPublic ? 'mint' : 'neutral'}>{myPortrait.isPublic ? '已公开' : '未公开'}</Tag>
            </div>
            {myPortrait.bio ? <p className="mt-2 text-sm leading-relaxed text-ink-sub">{myPortrait.bio}</p> : null}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {myPortrait.interestTags.map((t) => (
                <Tag key={t} tone="mint">{t}</Tag>
              ))}
              {myPortrait.socialIntents.map((s) => (
                <Tag key={s} tone="pink">{s}</Tag>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-ink-sub">
              {myPortrait.isPublic
                ? '当前状态：出现在公开找人列表与星云中，可以主动打招呼。'
                : '当前状态：不出现在公开列表与星云，不能主动打招呼；仍可以凭基础 Portrait 向组织者展示并报名（DEC-002.4）。'}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-semibold">你还没有创建 Portrait</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-sub">
              你可以先自由浏览同学和活动；首次互动（打招呼 / 报名）前，再花一分钟完成基础 Portrait：
              昵称 + 至少 1 个兴趣标签 + 至少 1 项社交意图（DEC-002）。
            </p>
            <Link to="/me/portrait/edit" className="mt-3 inline-block">
              <Button>
                <PenLine size={14} /> 创建我的 Portrait
              </Button>
            </Link>
          </div>
        )}
      </Card>

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
