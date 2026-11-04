import { BookOpen, CalendarDays, CheckCircle2, ClipboardList, Dumbbell, Languages, MapPin, ShieldCheck, Sparkles, Trophy, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useData } from '@/data/DataProvider'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { GradientAvatar, gradientFor } from '@/shared/ui/GradientAvatar'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Tag } from '@/shared/ui/Tag'

const CATEGORY_ICONS: Record<string, LucideIcon> = { 运动: Dumbbell, 学习: BookOpen, 语言: Languages, 比赛: Trophy }

/**
 * P05 活动详情：展示活动信息、组织者与资料门槛。
 * Q4 已确认：申请→待组织者确认→组织者明确确认→申请者看到"已确认"。
 * 本人可取消；不自动入队/不改 capacityText/不默认群聊。
 */
export default function ActivityDetailPage() {
  const { activityId } = useParams<{ activityId: string }>()
  const { state, canEnroll, myPortrait, enrollActivity, confirmEnrollment, cancelEnrollment, myEnrollments, pendingEnrollmentsForOrganizer } = useData()
  const [enrollResult, setEnrollResult] = useState<string | null>(null)

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
  // B1/P0-03（Gate B 决策 2）：发起人署名只取有效公开 Snapshot 的昵称；
  // 无快照 / 已撤回 / 未授权时统一兜底为「活动发起人」，绝不读取草稿字段
  const organizerPublicName = organizer?.isPublic && organizer.publicSnapshot ? organizer.publicSnapshot.nickname : null
  const allEnrollments = state.enrollments.filter((e) => e.activityId === activity.id)
  const enrollGatePassed = canEnroll(state.currentUserId)
  const isOrganizer = activity.organizerId === state.currentUserId
  const myEnrollment = myEnrollments.find((e) => e.activityId === activity.id)
  const organizerPending = pendingEnrollmentsForOrganizer.filter((e) => e.activityId === activity.id)
  const CategoryIcon = CATEGORY_ICONS[activity.interestCategory] ?? Sparkles

  const statusLabel = (s: string) => {
    switch (s) {
      case 'pending': return '待组织者确认'
      case 'confirmed': return '已确认'
      case 'rejected': return '未通过'
      case 'cancelled': return '已取消'
      default: return s
    }
  }

  const handleEnroll = () => {
    const result = enrollActivity(activity.id)
    if (result.success) {
      setEnrollResult('已提交申请，等待组织者确认')
    } else if (result.reason === 'no_basic_profile') {
      setEnrollResult('需要先补全基础 Portrait')
    } else if (result.reason === 'already_enrolled') {
      setEnrollResult('你已经报名了这个活动')
    }
  }

  const handleCancel = () => {
    if (!myEnrollment) return
    cancelEnrollment(myEnrollment.id)
    setEnrollResult('已取消报名')
  }

  const handleConfirm = (enrollmentId: string, decision: 'confirmed' | 'rejected') => {
    confirmEnrollment(enrollmentId, decision)
  }

  return (
    <div>
      <PageHeader title={activity.title} subtitle="活动详情（合成演示数据）" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)] lg:items-start">
        {/* 活动主卡：分类渐变封面 + 信息 */}
        <Card className="overflow-hidden !p-0">
          <div className={`relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br md:h-48 ${gradientFor(activity.id)}`}>
            <span className="absolute -left-10 -top-12 h-40 w-40 rounded-full border-[22px] border-white/15" />
            <span className="absolute -bottom-12 -right-8 h-40 w-40 rounded-full bg-white/15" />
            <span className="absolute left-[18%] top-8 h-2 w-2 rounded-full bg-white/50" />
            <span className="flex h-24 w-24 items-center justify-center rounded-[30px] border border-white/30 bg-white/20 shadow-sm backdrop-blur-sm">
              <CategoryIcon size={50} className="text-white" aria-hidden />
            </span>
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink shadow-sm">
              {activity.interestCategory}
            </span>
            {activity.capacityText ? (
              <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-ink/40 px-3 py-1.5 text-xs font-medium text-white">
                <Users size={13} /> {activity.capacityText}
              </span>
            ) : null}
          </div>
          <div className="p-5 md:p-6">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"><ClipboardList size={17} /></span>
              <div>
                <h2 className="text-sm font-bold">活动介绍</h2>
                <p className="mt-1.5 text-sm leading-6 text-ink-sub">{activity.description}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-ink-sub sm:grid-cols-2">
              <div className="flex items-center gap-2.5 rounded-2xl bg-primary-soft/45 px-3 py-3">
                <CalendarDays size={17} className="shrink-0 text-primary" /> <span className="text-xs leading-5">{activity.timeText}</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl bg-pink-soft/45 px-3 py-3">
                <MapPin size={17} className="shrink-0 text-[#C65486]" /> <span className="text-xs leading-5">{activity.locationText}</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl bg-mint-soft/55 px-3 py-3 sm:col-span-2">
                <Users size={17} className="shrink-0 text-[#218B70]" />
                <span className="text-xs">发起人</span>
                {organizerPublicName ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink">
                    <GradientAvatar seed={organizer!.id} text={organizerPublicName} size="sm" className="!h-7 !w-7 !text-[10px]" />
                    {organizerPublicName}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-sub">
                    <GradientAvatar seed={activity.id} text="活动发起人" size="sm" className="!h-7 !w-7 !text-[10px]" />
                    活动发起人
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* 报名申请区域 */}
        {!isOrganizer ? (
          <Card className="relative overflow-hidden border-primary/10 bg-gradient-to-br from-card to-primary-soft/35">
            <CheckCircle2 className="pointer-events-none absolute -bottom-7 -right-5 h-28 w-28 text-primary/[.055]" aria-hidden />
            <h3 className="relative mb-3 flex items-center gap-2 text-base font-bold">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary"><ClipboardList size={17} /></span>
              报名申请 <span className="rounded-full bg-primary-soft px-2 py-1 text-[10px] font-medium text-primary">申请制</span>
            </h3>
            {myEnrollment ? (
              <div>
                <p className="flex items-center gap-2 text-sm font-medium">
                  你的报名状态：
                  <Tag tone={myEnrollment.status === 'confirmed' ? 'mint' : myEnrollment.status === 'rejected' ? 'pink' : 'neutral'}>
                    {statusLabel(myEnrollment.status)}
                  </Tag>
                </p>
                {myEnrollment.status === 'pending' || myEnrollment.status === 'confirmed' ? (
                  <Button variant="outline" size="sm" className="mt-2.5" onClick={handleCancel}>取消报名</Button>
                ) : null}
              </div>
            ) : enrollGatePassed ? (
              <div>
                <p className="text-xs leading-relaxed text-ink-sub">你的基础 Portrait 已完整，可以申请报名。组织者确认后你将看到处理结果。</p>
                <Button className="mt-2.5" size="sm" onClick={handleEnroll}>申请报名</Button>
              </div>
            ) : (
              <div>
                <p className="text-xs leading-relaxed text-ink-sub">
                  {myPortrait ? '你的基础 Portrait 尚未完整。' : '你还没有创建 Portrait。'}报名前需要先完成基础 Portrait（昵称 + 至少 1 个兴趣标签 + 至少 1 项社交意图）。
                </p>
                <Link to="/me/portrait/edit" className="mt-2.5 inline-block">
                  <Button variant="outline" size="sm">去创建 / 补全基础 Portrait</Button>
                </Link>
              </div>
            )}
            {enrollResult ? <p className="mt-2 text-xs font-medium text-primary">{enrollResult}</p> : null}
          </Card>
        ) : (
          /* 组织者面板 */
          <Card className="border-primary/15 bg-gradient-to-br from-card to-primary-soft/35">
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary"><ShieldCheck size={17} /></span>
              组织者面板
            </h3>
            <p className="text-xs leading-relaxed text-ink-sub">你是这个活动的组织者。可以查看申请者的基础 Portrait 并处理报名。</p>
            {organizerPending.length > 0 ? (
              <div className="mt-3 flex flex-col gap-3">
                {organizerPending.map((enr) => {
                  const applicantPortrait = state.portraits.find((p) => p.ownerId === enr.enrolleeId)
                  return (
                    <div key={enr.id} className="rounded-card border border-ink-sub/15 bg-bg/50 p-3.5">
                      <div className="flex items-center gap-2.5">
                        <GradientAvatar seed={enr.basicSnapshot.portraitId} text={enr.basicSnapshot.nickname} size="sm" />
                        <p className="text-sm font-bold">{enr.basicSnapshot.nickname}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {enr.basicSnapshot.interestTags.map((t) => <Tag key={t} tone="mint">{t}</Tag>)}
                        {enr.basicSnapshot.socialIntents.map((s) => <Tag key={s} tone="pink">{s}</Tag>)}
                      </div>
                      {applicantPortrait ? (
                        <Link to={`/people/${applicantPortrait.id}`} className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
                          查看基础 Portrait →
                        </Link>
                      ) : null}
                      <div className="mt-2.5 flex gap-2">
                        <Button size="sm" onClick={() => handleConfirm(enr.id, 'confirmed')}>确认</Button>
                        <Button variant="outline" size="sm" onClick={() => handleConfirm(enr.id, 'rejected')}>拒绝</Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="mt-2 text-xs text-ink-sub">暂无待处理报名。</p>
            )}
          </Card>
        )}

        {/* 报名记录名单：B1/P0-02 仅组织者可见全部申请记录；
            申请者在上方「报名申请」卡查看自己的状态；无关访客不展示任何可识别名单 */}
        {isOrganizer && allEnrollments.length > 0 ? (
          <Card className="lg:col-span-2">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold"><ShieldCheck size={16} className="text-primary" />报名记录（仅组织者可见）</h3>
            <p className="text-xs leading-relaxed text-ink-sub">
              共 {allEnrollments.length} 条报名记录。撤回公开不会自动取消已有报名（DEC-003.3）。
            </p>
            <div className="mt-2.5 flex flex-col gap-2">
              {allEnrollments.map((enr) => (
                <div key={enr.id} className="flex items-center justify-between rounded-xl bg-bg/60 px-3 py-2 text-xs">
                  <span className="flex items-center gap-2 font-medium">
                    <GradientAvatar seed={enr.basicSnapshot.portraitId} text={enr.basicSnapshot.nickname} size="sm" className="!h-6 !w-6 !text-[10px]" />
                    {enr.basicSnapshot.nickname}
                  </span>
                  <Tag tone={enr.status === 'confirmed' ? 'mint' : enr.status === 'rejected' ? 'pink' : enr.status === 'cancelled' ? 'neutral' : 'primary'}>
                    {statusLabel(enr.status)}
                  </Tag>
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
