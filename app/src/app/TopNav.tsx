import { Sparkles } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { NAV_ITEMS } from './navItems'

/** 桌面端顶部导航条（≥md 显示）：左 Logo、中间四模块（顺序固定）、右侧占位。 */
export function TopNav() {
  return (
    <header className="sticky top-0 z-40 hidden border-b border-ink-sub/10 bg-card/90 backdrop-blur md:block">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <NavLink to="/discover" className="flex items-center gap-2 font-bold text-ink">
          <Sparkles size={20} className="text-primary" />
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
        <div className="w-24" aria-hidden />
      </div>
    </header>
  )
}
