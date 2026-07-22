import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORIES, getCategoryCounts, type FilterId } from '@/lib/products'
import { useProducts } from '@/context/ProductsContext'

interface ProductFilterBarProps {
  active: FilterId
  onChange: (id: FilterId) => void
  query: string
  onQueryChange: (value: string) => void
}

// Shares the Beyond gallery control-bar language: a floating glass-strong pill
// with gradient active-tab pills and a matching search field.
export function ProductFilterBar({
  active,
  onChange,
  query,
  onQueryChange,
}: ProductFilterBarProps) {
  const products = useProducts()
  // Counts drive which tabs appear (empty categories are hidden); not shown.
  const counts = useMemo(() => getCategoryCounts(products), [products])

  return (
    <div className="sticky top-20 z-30 mt-8 md:mt-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="glass-bar rounded-2xl p-2 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
          {/* Category tabs */}
          <div
            className="flex items-center gap-1 overflow-x-auto no-scrollbar"
            role="tablist"
            aria-label="Filter products by category"
          >
            {CATEGORIES.map((cat) => {
              const isActive = active === cat.id
              const count = counts[cat.id] ?? 0
              if (cat.id !== 'all' && count === 0) return null

              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onChange(cat.id)}
                  className={cn(
                    'relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-300',
                    isActive
                      ? 'text-text-primary'
                      : 'text-text-muted hover:text-text-secondary'
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="product-filter-active"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(217,70,239,0.16), rgba(168,85,247,0.08))',
                        border: '1px solid rgba(217,70,239,0.2)',
                      }}
                      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                    />
                  )}
                  <cat.icon size={15} className="relative z-10" />
                  <span className="relative z-10">{cat.label}</span>
                </button>
              )
            })}
          </div>

          {/* Search */}
          <div className="lg:pr-1">
            <div className="relative lg:w-56">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search products…"
                aria-label="Search products by name"
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:border-magenta/40 transition-colors"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => onQueryChange('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
