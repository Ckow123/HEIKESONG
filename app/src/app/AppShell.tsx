import { Sparkles } from 'lucide-react'
import { Outlet } from 'react-router-dom'

import { BottomNav } from './BottomNav'
import { TopNav } from './TopNav'

/**
 * 响应式布局壳：
 * - ≥md：顶部导航条；<md：移动端品牌头 + 底部四栏。
 * - 四模块名称/语义/顺序全端固定（见 navItems.ts）。
 */
export function AppShell() {
  return (
    <div className="min-h-full">
      <TopNav />
      {/* 移动端品牌头 */}
      <div className="flex items-center gap-2 px-4 pt-4 font-bold md:hidden">
        <Sparkles size={20} className="text-primary" />
        同频 Campus
      </div>
      <main className="mx-auto w-full max-w-md px-4 pb-24 pt-3 md:max-w-3xl md:pb-10 md:pt-6 lg:max-w-5xl">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
