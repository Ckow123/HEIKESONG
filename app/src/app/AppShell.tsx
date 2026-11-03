import { Link, Outlet } from 'react-router-dom'

import { useData } from '@/data/DataProvider'

import { BottomNav } from './BottomNav'
import { TopNav } from './TopNav'

/**
 * 响应式布局壳：
 * - ≥md：顶部导航条；<md：移动端品牌头 + 底部四栏。
 * - 四模块名称/语义/顺序全端固定（见 navItems.ts）。
 */
export function AppShell() {
  const { state } = useData()
  const currentIdentity = state.identities.find((i) => i.id === state.currentUserId)

  return (
    <div className="min-h-full">
      <TopNav />
      {/* 移动端品牌头：Logo + 当前合成身份标注（Q1 演示模式） */}
      <div className="flex items-center justify-between px-4 pt-4 md:hidden">
        <div className="flex items-center gap-2 font-bold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#9D8CF5] text-white">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="9" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
              <circle cx="16.5" cy="9" r="2" fill="currentColor" />
            </svg>
          </span>
          同频 Campus
        </div>
        <Link to="/me" className="flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 shadow-card">
          <span className="max-w-20 truncate text-xs font-medium text-ink">{currentIdentity?.displayName ?? '未知身份'}</span>
          <span className="rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-medium text-primary">演示</span>
        </Link>
      </div>
      <main className="mx-auto w-full max-w-md px-4 pb-24 pt-3 md:max-w-3xl md:pb-10 md:pt-6 lg:max-w-5xl">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
