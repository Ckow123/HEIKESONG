import type { IdentityId } from './identity'
import type { BasicPortraitView } from './portrait'

/**
 * 邀请（DEC-003 + Q2 已确认）：
 * 打招呼 → 待处理邀请 → 接收方明确接受 → 开启自由聊天。
 * Q2：固定礼貌招呼文本，不支持自由文字。
 * Q5b：发送时固定发送方基础资料快照。
 * 「拒绝」规则尚未确认，不建模、不提供入口。
 */
export interface Invitation {
  id: string
  fromId: IdentityId
  toId: IdentityId
  status: 'pending' | 'accepted'
  /** Q2：固定礼貌招呼文本 */
  greetingText: string
  /** Q5b：发送时固定的发送方基础资料快照 */
  basicSnapshot?: BasicPortraitView
  /** 接受后关联的会话 */
  conversationId?: string
  createdAt: string
}

/** 会话：必须对应一条已接受的邀请；内容为展示用样例，非实时传输。 */
export interface Conversation {
  id: string
  invitationId: string
  participantIds: [IdentityId, IdentityId]
  demoMessages: { senderId: IdentityId; text: string; sentAt: string }[]
}
