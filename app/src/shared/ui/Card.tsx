import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-card border border-white/80 bg-card p-4 shadow-card transition-shadow duration-200 md:p-5 ${className}`}>{children}</div>
}
