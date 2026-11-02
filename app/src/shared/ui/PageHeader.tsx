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
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(fallback))}
          className="mb-2 inline-flex items-center gap-1 text-sm text-ink-sub transition-colors hover:text-ink"
        >
          <ArrowLeft size={16} /> 返回
        </button>
        <h1 className="text-xl font-bold md:text-2xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-ink-sub">{subtitle}</p> : null}
      </div>
      {extra}
    </div>
  )
}
