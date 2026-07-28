import { cn } from '@/lib/utils'
import { Trademark } from './Trademark'

interface WordmarkProps {
  /** Classes for the wordmark span. Pass `trademark-display` on display-scale
      headings (3rem and up) to shrink the TM mark — the class sets inherited
      custom properties, so it reaches the mark from here. */
  className?: string
  /** Set false to render the lockup without the TM mark, for the places where
      repeating it would be noise rather than notice. */
  mark?: boolean
}

/**
 * The phiUture wordmark — the exact hero lockup: the display font with the
 * central “U” carrying the brand magenta→violet gradient, closed by the TM mark.
 * Rendered wherever the brand name appears so the identity stays consistent
 * (including data-driven strings, via <BrandText />). Sizes to the current
 * font-size, so set it with the surrounding `text-*` classes.
 */
export function Wordmark({ className, mark = true }: WordmarkProps) {
  return (
    <span className={cn('hero-wordmark', className)}>
      phi<span className="gradient-text">U</span>ture
      {mark && <Trademark />}
    </span>
  )
}
