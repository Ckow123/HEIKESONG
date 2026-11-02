/**
 * 基本内容过滤入口（交接文档 11.1.5 要求）。
 * 仅为有限词表的前端初筛，不等于完整内容审核；
 * 未开放的发布/聊天入口不接收真实用户内容。
 */
const BANNED_WORDS = ['色情', '约炮', '裸聊', '暴力', '去死', '傻逼', '诈骗']

export function containsBannedContent(text: string): boolean {
  const normalized = text.toLowerCase()
  return BANNED_WORDS.some((w) => normalized.includes(w))
}
