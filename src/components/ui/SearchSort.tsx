import { useEffect, useRef, useState } from 'react'
import { Search, X, ArrowDownUp, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SortOption<K extends string = string> {
  key: K
  label: string
}

interface SearchSortProps<K extends string> {
  query: string
  onQueryChange: (value: string) => void
  placeholder?: string
  sort: K
  onSortChange: (key: K) => void
  sortOptions: readonly SortOption<K>[]
  /** Width/layout classes for the outer field (e.g. "w-full lg:w-64"). */
  className?: string
}

/**
 * A single search field with the sort control living *inside* it — one glass
 * pill holding the query input, a clear button, and a sort dropdown opened from
 * a small icon-button on the trailing edge. Shared by the Beyond gallery and
 * the Products filter bar so both read identically and stay responsive: the
 * field flexes to full width on mobile and the menu never pushes the bar wider.
 */
export function SearchSort<K extends string>({
  query,
  onQueryChange,
  placeholder = 'Search…',
  sort,
  onSortChange,
  sortOptions,
  className,
}: SearchSortProps<K>) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Dismiss the sort menu on outside click or Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div
      ref={wrapRef}
      className={cn(
        'relative flex items-center rounded-xl border border-white/[0.07] bg-white/[0.04] transition-colors focus-within:border-magenta/40',
        className
      )}
    >
      <Search
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
      />
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full min-w-0 bg-transparent py-2 pl-9 pr-1 text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none"
      />

      {query && (
        <button
          type="button"
          onClick={() => onQueryChange('')}
          aria-label="Clear search"
          className="shrink-0 px-1 text-text-muted transition-colors hover:text-text-primary"
        >
          <X size={15} />
        </button>
      )}

      <span className="mx-0.5 h-5 w-px shrink-0 bg-white/10" aria-hidden="true" />

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Sort"
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Sort"
        className={cn(
          'mr-1 flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 transition-colors hover:text-magenta',
          open ? 'text-magenta' : 'text-text-muted'
        )}
      >
        <ArrowDownUp size={15} />
        <ChevronDown
          size={12}
          className={cn('transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Sort by"
          className="glass-bar absolute right-0 top-full z-50 mt-2 min-w-[11rem] overflow-hidden rounded-xl p-1 shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
        >
          {sortOptions.map((opt) => {
            const active = opt.key === sort
            return (
              <button
                key={opt.key}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onSortChange(opt.key)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  active
                    ? 'bg-white/[0.06] text-text-primary'
                    : 'text-text-secondary hover:bg-white/[0.04] hover:text-text-primary'
                )}
              >
                {opt.label}
                {active && <Check size={14} className="text-magenta" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
