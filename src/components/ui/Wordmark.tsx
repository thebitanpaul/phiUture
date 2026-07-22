import { cn } from '@/lib/utils'

interface WordmarkProps {
  className?: string
}

/**
 * The phiUture wordmark — the exact hero lockup: the display font with the
 * central “U” carrying the brand magenta→violet gradient. Rendered wherever the
 * brand name appears so the identity stays consistent. Sizes to the current
 * font-size, so set it with the surrounding `text-*` classes.
 */
export function Wordmark({ className }: WordmarkProps) {
  return (
    <span className={cn('hero-wordmark', className)}>
      phi<span className="gradient-text">U</span>ture
    </span>
  )
}
