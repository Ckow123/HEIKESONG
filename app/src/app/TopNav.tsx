import { NavLink } from 'react-router-dom'

import { useData } from '@/data/DataProvider'
import { GradientAvatar } from '@/shared/ui/GradientAvatar'

import { NAV_ITEMS } from './navItems'

/** 桌面端顶部导航条（≥md 显示）：左 Logo、中间四模块（顺序固定）、右侧当前合成身份标注。 */
export function TopNav() {
  const { state } = useData()
  const currentIdentity = state.identities.find((i) => i.id === state.currentUserId)

  return (
    <header className="sticky top-0 z-40 hidden border-b border-ink-sub/10 bg-card/95 shadow-[0_2px_16px_rgba(45,42,62,0.035)] backdrop-blur-md md:block">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <NavLink to="/discover" className="flex items-center gap-2 font-bold text-ink">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#9D8CF5] text-white">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="9" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
              <circle cx="16.5" cy="9" r="2" fill="currentColor" />
            </svg>
          </span>
          同频 Campus
        </NavLink>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm transition-colors ${
                  isActive ? 'bg-primary-soft font-semibold text-primary' : 'text-ink-sub hover:text-ink'
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        {/* Q1：清楚显示当前合成身份（演示模式，非真实登录） */}
        <NavLink to="/me" className="flex items-center gap-2 rounded-full bg-bg px-2.5 py-1 transition-colors hover:bg-primary-soft">
          <GradientAvatar seed={state.currentUserId} text={currentIdentity?.displayName ?? '我'} size="sm" className="!h-6 !w-6 !text-[10px]" />
          <span className="max-w-24 truncate text-xs font-medium text-ink">{currentIdentity?.displayName ?? '未知身份'}</span>
          <span className="rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-medium text-primary">演示</span>
        </NavLink>
      </div>
    </header>
  )
}
