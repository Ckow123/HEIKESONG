/**
 * 合成插画风头像/封面：按 seed 字符串确定性选取柔和渐变，
 * 不使用真人照片（全部合成演示数据）。
 */
const GRADIENTS = [
  'from-[#B8A9F7] to-[#8E7FE8]',
  'from-[#7FDEC3] to-[#3ECFAD]',
  'from-[#F9B8D4] to-[#F47FB0]',
  'from-[#9FC8F8] to-[#6FA8F2]',
  'from-[#F8D39A] to-[#F2B26F]',
  'from-[#C3B1F2] to-[#A08BE0]',
] as const

export function gradientFor(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return GRADIENTS[h % GRADIENTS.length]
}

/** 圆形首字头像：seed 决定渐变底色（建议用 portrait/activity id），text 显示字符。 */
export function GradientAvatar({ seed, text, size = 'md', className = '' }: {
  seed: string
  text: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const sizeClass = {
    sm: 'h-10 w-10 text-sm',
    md: 'h-12 w-12 text-base',
    lg: 'h-16 w-16 text-xl',
    xl: 'h-24 w-24 text-3xl',
  }[size]
  return (
    <div
      aria-hidden
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br font-bold text-white shadow-sm ${gradientFor(seed)} ${sizeClass} ${className}`}
    >
      <span className="pointer-events-none absolute -left-2 -top-3 h-1/2 w-2/3 rounded-full bg-white/25 blur-md" />
      <span className="relative">{text.slice(0, 1)}</span>
    </div>
  )
}
