import { cn } from '@/lib/utils'
import { STATUS_META } from '@/lib/products'
import type { ProductStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: ProductStatus
  className?: string
  /** Show the leading status dot. */
  dot?: boolean
}

export function StatusBadge({ status, className, dot = true }: StatusBadgeProps) {
  const meta = STATUS_META[status]
  if (!meta) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium backdrop-blur-md',
        meta.className,
        className
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />}
      {meta.label}
    </span>
  )
}
