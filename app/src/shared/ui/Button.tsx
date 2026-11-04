import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md'

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white shadow-button hover:bg-primary/90 hover:shadow-card-hover',
  outline: 'border border-primary/30 bg-card text-primary hover:border-primary/55 hover:bg-primary-soft',
  ghost: 'text-ink-sub hover:bg-primary-soft/70 hover:text-primary',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-4 py-2 text-xs',
  md: 'min-h-11 px-5 py-2.5 text-sm',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
