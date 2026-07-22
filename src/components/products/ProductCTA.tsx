import { cn } from '@/lib/utils'
import type { ResolvedCTA } from '@/lib/products'

interface ProductCTAProps {
  cta: ResolvedCTA
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md'
  className?: string
  onClick?: (e: React.MouseEvent) => void
}

/**
 * A single external call-to-action. Only ever rendered for links that
 * exist, so it never appears in a disabled state.
 */
export function ProductCTA({
  cta,
  variant = 'secondary',
  size = 'sm',
  className,
  onClick,
}: ProductCTAProps) {
  const Icon = cta.icon

  return (
    <a
      href={cta.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={cn(
        'group/cta inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-300',
        size === 'sm' ? 'px-3.5 py-1.5 text-xs' : 'px-5 py-2.5 text-sm',
        variant === 'primary'
          ? 'bg-gradient-to-r from-magenta to-violet text-white hover:shadow-lg hover:shadow-magenta/25 hover:scale-[1.02] active:scale-[0.98]'
          : 'glass text-text-secondary hover:text-text-primary',
        className
      )}
    >
      <Icon size={size === 'sm' ? 13 : 15} />
      {cta.label}
    </a>
  )
}
