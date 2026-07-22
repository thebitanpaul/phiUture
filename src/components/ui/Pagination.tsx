import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  /** Current 0-based page index. */
  page: number
  /** Total number of pages. */
  pageCount: number
  /** Called with the next 0-based page index to navigate to. */
  onChange: (page: number) => void
}

/**
 * Prev / status / "Next page" pagination in the site's glass language. Shared by
 * the Products grid and the Beyond gallery — both cap a page at 3 rows (9 cards)
 * and step forward with the Next page button.
 */
export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null

  const atStart = page <= 0
  const atEnd = page >= pageCount - 1

  return (
    <div className="mt-12 flex items-center justify-center gap-3 md:gap-4">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={atStart}
        aria-label="Previous page"
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-magenta/30 hover:text-text-primary disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <span className="typo-label px-1 text-xs text-text-muted whitespace-nowrap">
        Page {page + 1} of {pageCount}
      </span>

      <button
        type="button"
        onClick={() => onChange(Math.min(pageCount - 1, page + 1))}
        disabled={atEnd}
        aria-label="Next page"
        className="inline-flex items-center gap-1.5 rounded-xl border border-magenta/30 bg-gradient-to-br from-magenta/25 to-violet/15 px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-magenta/50 disabled:pointer-events-none disabled:opacity-30"
      >
        <span>Next page</span>
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
