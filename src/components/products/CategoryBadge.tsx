import { cn } from '@/lib/utils'
import { CATEGORY_LABELS, getCategoryIcon } from '@/lib/products'
import type { ProductCategory } from '@/lib/types'

interface CategoryBadgeProps {
  category: ProductCategory
  /** Optional human sub-label, e.g. "Mobile App" — falls back to the category. */
  subcategory?: string
  className?: string
}

export function CategoryBadge({
  category,
  subcategory,
  className,
}: CategoryBadgeProps) {
  const Icon = getCategoryIcon(category)
  const label = subcategory || CATEGORY_LABELS[category]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/30 px-2.5 py-1 text-xs font-medium text-text-secondary backdrop-blur-md',
        className
      )}
    >
      <Icon size={12} className="text-magenta" />
      {label}
    </span>
  )
}
