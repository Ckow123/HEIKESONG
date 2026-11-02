import { CalendarDays, MapPin, Users } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { useData } from '@/data/DataProvider'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Tag } from '@/shared/ui/Tag'

/**
 * P05 活动详情：展示活动信息、组织者与资料门槛说明。
 * 报名提交、审核、名额占用规则未定（DEC 未冻结），本阶段不提供报名动作。
 */
export default function ActivityDetailPage() {
  const { activityId } = useParams<{ activityId: string }>()
  const { state, canEnroll, myPortrait } = useData()

  const activity = state.activities.find((a) => a.id === activityId)
  if (!activity) {
    return (
      <div>
        <PageHeader title="活动详情" />
        <Card>
          <p className="text-sm text-ink-sub">没有找到这个活动。</p>
        </Card>
      </div>
    )
  }

  const organizer = state.portraits.find((p) => p.ownerId === activity.organizerId)
  const enrollments = state.enrollments.filter((e) => e.activityId === activity.id)
  const enrollGatePassed = canEnroll(state.currentUserId)

  return (
    <div>
      <PageHeader title={activity.title} subtitle="活动详情（合成演示数据）" />
      <div className="flex flex-col gap-4">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Tag tone="primary">{activity.interestCategory}</Tag>
            {activity.capacityText ? <Tag tone="neutral">{activity.capacityText}</Tag> : null}
          </div>
          <p className="text-sm leading-relaxed">{activity.description}</p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-ink-sub">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={15} /> {activity.timeText}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin size={15} /> {activity.locationText}
            </span>
            <span className="inline-flex items-center gap-2">
              <Users size={15} /> 发起人：{organizer?.nickname ?? '合成用户'}
            </span>
          </div>
        </Card>

        <Card>
          <h3 className="mb-2 text-sm font-bold">报名资料门槛（DEC-002）</h3>
          {myPortrait ? (
            enrollGatePassed ? (
              <p className="text-xs leading-relaxed text-ink-sub">
                你的基础 Portrait 已完整，满足资料门槛；即使未公开，报名时也会向组织者展示基础信息。
              </p>
            ) : (
              <p className="text-xs leading-relaxed text-ink-sub">
                你的基础 Portrait 尚未完整（需昵称 + 至少 1 个兴趣标签 + 至少 1 项社交意图）。
              </p>
            )
          ) : (
            <p className="text-xs leading-relaxed text-ink-sub">
              你还没有创建 Portrait。报名前需要先在「我的」中完成基础 Portrait（昵称 + 至少 1 个兴趣标签 + 至少 1 项社交意图）。
            </p>
          )}
          {!enrollGatePassed ? (
            <Link to="/me/portrait/edit" className="mt-2 inline-block">
              <Button variant="outline">去创建 / 补全基础 Portrait</Button>
            </Link>
          ) : null}
          <p className="mt-2 text-xs leading-relaxed text-ink-sub">
            报名提交、组织者确认、名额占用与取消规则尚未确定，本阶段不提供报名按钮，不会伪造「报名成功」。
          </p>
        </Card>

        {enrollments.length > 0 ? (
          <Card>
            <h3 className="mb-2 text-sm font-bold">已有报名记录（样例）</h3>
            <p className="text-xs leading-relaxed text-ink-sub">
              共 {enrollments.length} 条合成报名记录。撤回公开不会自动取消已有报名（DEC-003.3）；
              组织者可从互动记录查看报名者的基础 Portrait（DEC-003.4）。
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
