import type { ReactNode } from 'react'

type TagTone = 'primary' | 'mint' | 'pink' | 'neutral'

const toneClass: Record<TagTone, string> = {
  primary: 'bg-primary-soft text-primary',
  mint: 'bg-mint-soft text-[#218B70]',
  pink: 'bg-pink-soft text-[#C65486]',
  neutral: 'bg-bg text-ink-sub',
}

export function Tag({ children, tone = 'neutral', className = '' }: { children: ReactNode; tone?: TagTone; className?: string }) {
  return (
    <span className={`inline-flex min-h-6 max-w-full items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium leading-4 ${toneClass[tone]} ${className}`}>
      {children}
    </span>
  )
}
