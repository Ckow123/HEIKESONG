import { NavLink } from 'react-router-dom'

import { NAV_ITEMS } from './navItems'

/** 移动端底部四栏（<md 显示），顺序固定：发现 / 广场 / 信息 / 我的。 */
export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-sub/10 bg-card pb-[env(safe-area-inset-bottom)] shadow-nav md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 text-xs ${
                isActive ? 'font-semibold text-primary' : 'text-ink-sub'
              }`
            }
          >
            <item.icon size={22} />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
