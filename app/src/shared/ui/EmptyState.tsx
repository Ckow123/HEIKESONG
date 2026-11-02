import { Hammer } from 'lucide-react'
import type { ReactNode } from 'react'

/** 「待实现」占位：明确标注范围未定，不假称已上线。 */
export function EmptyState({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-ink-sub/30 bg-card/60 p-6 text-center">
      <Hammer className="mx-auto mb-2 text-ink-sub" size={22} />
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-sub">{description}</p>
      {children}
    </div>
  )
}
