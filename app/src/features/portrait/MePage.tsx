import { PenLine, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useData } from '@/data/DataProvider'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Tag } from '@/shared/ui/Tag'

/**
 * P10 我的：Portrait 完成/公开状态、编辑入口、关系状态与动态位置预留。
 * 演示身份初始未创建 Portrait（DEC-002：先浏览，首次互动前再创建）。
 */
export default function MePage() {
  const { myPortrait, resetDemo } = useData()

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
            <div className="mt-3 flex flex-wrap gap-1.5">
              {myPortrait.interestTags.map((t) => (
                <Tag key={t} tone="mint">{t}</Tag>
              ))}
              {myPortrait.socialIntents.map((s) => (
                <Tag key={s} tone="pink">{s}</Tag>
              ))}
            </div>
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
        </div>
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
        <Button variant="ghost" className="mt-2 px-0 text-xs" onClick={() => resetDemo()}>
          <RotateCcw size={13} /> 重置为初始合成样例
        </Button>
      </Card>
    </div>
  )
}
