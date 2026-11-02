import type { Conversation, Invitation, Portrait } from '@/domain'
import {
  CURRENT_USER,
  DEMO_ACTIVITIES,
  DEMO_CONVERSATIONS,
  DEMO_ENROLLMENTS,
  DEMO_IDENTITIES,
  DEMO_INTERACTION_ACCESS,
  DEMO_INVITATIONS,
  DEMO_PORTRAITS,
} from './fixtures'

/** 应用状态快照：全部为合成演示数据。 */
export interface DemoState {
  currentUserId: string
  identities: typeof DEMO_IDENTITIES
  portraits: Portrait[]
  activities: typeof DEMO_ACTIVITIES
  invitations: Invitation[]
  conversations: Conversation[]
  enrollments: typeof DEMO_ENROLLMENTS
  interactionAccess: typeof DEMO_INTERACTION_ACCESS
}

export function createInitialState(): DemoState {
  return {
    currentUserId: CURRENT_USER.id,
    identities: DEMO_IDENTITIES,
    portraits: DEMO_PORTRAITS,
    activities: DEMO_ACTIVITIES,
    invitations: DEMO_INVITATIONS,
    conversations: DEMO_CONVERSATIONS,
    enrollments: DEMO_ENROLLMENTS,
    interactionAccess: DEMO_INTERACTION_ACCESS,
  }
}
