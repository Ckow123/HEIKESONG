import type { IdentityId } from './identity'

/**
 * 邀请（DEC-003）：打招呼 → 待处理邀请 → 接收方明确接受 → 开启自由聊天。
 * 「拒绝」规则尚未确认，不建模、不提供入口。
 */
export interface Invitation {
  id: string
  fromId: IdentityId
  toId: IdentityId
  status: 'pending' | 'accepted'
  /** 招呼内容是否必填未定，先可选 */
  message?: string
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
