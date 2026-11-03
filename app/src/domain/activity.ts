import type { IdentityId } from './identity'
import type { BasicPortraitView } from './portrait'

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

/**
 * 报名状态机（Q4 已确认：申请→确认→结果）：
 * pending → confirmed | rejected；本人可 cancelled（从 pending 或 confirmed）。
 */
export type EnrollmentStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled'

/**
 * 报名记录（Q4 已确认）：
 * - 申请者提交时固定基础资料快照（Q5b），后续编辑不影响已提交记录。
 * - 组织者显式确认/拒绝；本人可取消。
 * - confirmed 不自动入队、不改 capacityText、不默认群聊。
 */
export interface Enrollment {
  id: string
  activityId: string
  enrolleeId: IdentityId
  organizerId: IdentityId
  status: EnrollmentStatus
  /** Q5b：申请时固定的基础资料快照 */
  basicSnapshot: BasicPortraitView
  createdAt: string
  /** 状态更新时间 */
  processedAt?: string
}

/** 已有报名样例：用于展示/验证已有关系，不代表已审核或已入队。 */
export interface EnrollmentFixture {
  id: string
  activityId: string
  enrolleeId: IdentityId
  organizerId: IdentityId
  note: 'fixture'
}
