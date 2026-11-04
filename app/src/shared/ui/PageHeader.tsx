import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

/** 子页标题栏：返回键 + 标题/副标题。 */
export function PageHeader({ title, subtitle, fallback = '/discover', extra }: {
  title: string
  subtitle?: string
  /** 无历史来源时的兜底返回路径 */
  fallback?: string
  extra?: ReactNode
}) {
  const navigate = useNavigate()
  return (
    <div className="mb-5 flex items-start justify-between gap-3 md:mb-6">
      <div className="min-w-0">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(fallback))}
          className="mb-2 inline-flex min-h-10 items-center gap-1.5 rounded-full pr-3 text-sm text-ink-sub transition-colors hover:text-primary"
        >
          <ArrowLeft size={17} /> 返回
        </button>
        <div className="flex items-center gap-2.5">
          <span className="h-6 w-1 shrink-0 rounded-full bg-primary md:h-7" aria-hidden />
          <h1 className="text-2xl font-bold tracking-tight md:text-[28px]">{title}</h1>
        </div>
        {subtitle ? <p className="mt-2 max-w-2xl pl-3.5 text-sm leading-6 text-ink-sub">{subtitle}</p> : null}
      </div>
      {extra}
    </div>
  )
}
