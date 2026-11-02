import type { IdentityId } from './identity'

/** 活动：字段仅为展示建议，不代表发布必填、容量或审核规则已定。 */
export interface Activity {
  id: string
  title: string
  description: string
  interestCategory: string
  timeText: string
  locationText: string
  organizerId: IdentityId
  /** 展示用名额信息，不承诺占用/审核逻辑 */
  capacityText?: string
}

/** 已有报名样例：用于展示/验证已有关系，不代表已审核或已入队。 */
export interface EnrollmentFixture {
  id: string
  activityId: string
  enrolleeId: IdentityId
  organizerId: IdentityId
  note: 'fixture'
}
