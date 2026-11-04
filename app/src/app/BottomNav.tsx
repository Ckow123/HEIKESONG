import { NavLink } from 'react-router-dom'

import { NAV_ITEMS } from './navItems'

/** 移动端底部四栏（<md 显示），顺序固定：发现 / 广场 / 信息 / 我的。 */
export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-sub/10 bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-nav backdrop-blur-md md:hidden" aria-label="主导航">
      <div className="mx-auto grid max-w-md grid-cols-4 px-2 pt-1.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            className={({ isActive }) =>
              `mx-0.5 flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] transition-colors ${
                isActive ? 'bg-primary-soft font-semibold text-primary' : 'text-ink-sub hover:bg-bg hover:text-ink'
              }`
            }
          >
            <item.icon size={21} strokeWidth={2} />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
