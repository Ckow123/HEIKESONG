import type { ReactNode } from 'react'

type TagTone = 'primary' | 'mint' | 'pink' | 'neutral'

const toneClass: Record<TagTone, string> = {
  primary: 'bg-primary-soft text-primary',
  mint: 'bg-mint-soft text-mint',
  pink: 'bg-pink-soft text-pink',
  neutral: 'bg-bg text-ink-sub',
}

export function Tag({ children, tone = 'neutral' }: { children: ReactNode; tone?: TagTone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClass[tone]}`}>
      {children}
    </span>
  )
}
