import { Compass, LayoutGrid, MessageCircle, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * 一级导航唯一数据源（不可更改）：
 * 名称、语义与顺序固定为 发现 / 广场 / 信息 / 我的。
 */
export interface NavItem {
  key: string
  label: string
  path: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'discover', label: '发现', path: '/discover', icon: Compass },
  { key: 'square', label: '广场', path: '/square', icon: LayoutGrid },
  { key: 'messages', label: '信息', path: '/messages', icon: MessageCircle },
  { key: 'me', label: '我的', path: '/me', icon: User },
]
