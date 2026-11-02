import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'outline' | 'ghost'

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  outline: 'border border-primary text-primary hover:bg-primary-soft',
  ghost: 'text-ink-sub hover:text-ink',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

export function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClass[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
