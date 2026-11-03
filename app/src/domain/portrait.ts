import type { IdentityId } from './identity'

export type PortraitId = string

/** 关系状态：自愿展示，不做事实认证；与社交意图严格分离。 */
export type RelationshipStatus = 'in_relationship' | 'undisclosed'

/**
 * Portrait 个人心灵画像（DEC-002）：
 * 必填 = 昵称 + 至少 1 个兴趣标签 + 至少 1 项社交意图；其余选填。
 * 「基础资料完整」与「已公开」是两个独立条件。
 *
 * PR-1 公开内容隔离：编辑草稿字段直接存于 Portrait 顶层；
 * `publicSnapshot` 存储用户已明确确认公开的内容快照（A 版本）。
 * 编辑期间公共入口读取 publicSnapshot 而非草稿字段，
 * 确认公开后 publicSnapshot 原子替换为草稿内容。
 * 候选 A（草稿分离）与候选 B（暂撤）的选择未定，
 * 此结构对两种方案均兼容，不自行改变状态语义。
 */
export interface Portrait {
  id: PortraitId
  ownerId: IdentityId
  nickname: string
  interestTags: string[]
  socialIntents: string[]
  /** 选填自由文字，发布前需过基本内容过滤入口 */
  bio?: string
  /** 仅辅助表达，不作科学配对承诺 */
  mbti?: string
  zodiac?: string
  relationshipStatus?: RelationshipStatus
  /** 公开标记：预览不等于公开；可撤回 */
  isPublic: boolean
  updatedAt: string
  /** 已确认公开的内容快照（PR-1）；公共入口优先读取此字段而非草稿 */
  publicSnapshot?: PublicPortraitView
}

/** 由预览确认后的公开内容；公共列表、公共详情、星云共用同一公开范围。 */
export interface PublicPortraitView {
  portraitId: PortraitId
  nickname: string
  interestTags: string[]
  socialIntents: string[]
  bio?: string
  mbti?: string
  zodiac?: string
  relationshipStatus?: RelationshipStatus
}

/** 创建/编辑 Portrait 的输入（必填校验在表单层完成，见 DEC-002.2）。 */
export interface PortraitDraft {
  nickname: string
  interestTags: string[]
  socialIntents: string[]
  bio?: string
  mbti?: string
  zodiac?: string
  relationshipStatus?: RelationshipStatus
}

/** 定向授权（DEC-003）：撤回公开后，已有互动对方仍可从记录查看基础 Portrait。 */
export interface InteractionAccess {
  id: string
  portraitId: PortraitId
  viewerId: IdentityId
  source: { kind: 'invitation' | 'conversation' | 'enrollment'; refId: string }
}

/**
 * 基础定向资料视图（Q5a 已确认：只取三项必填）。
 * 组织者/邀请接收者查看对方时只返回这三项，不包含选填字段。
 */
export interface BasicPortraitView {
  portraitId: PortraitId
  nickname: string
  interestTags: string[]
  socialIntents: string[]
}
