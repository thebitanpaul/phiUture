import { cn } from '@/lib/utils'

interface TrademarkProps {
  className?: string
}

/**
 * The TM mark, set as a superscript at the top-right of the name it follows.
 *
 * Everything about it is sized in `em`, so the one component works unchanged from
 * the 6rem hero wordmark down to a 0.875rem card title — see `.trademark` in
 * styles/globals.css for the metrics.
 *
 * Hidden from assistive tech: a screen reader announcing "V E R A T M" is worse
 * than one reading the name, and the mark carries no information a listener
 * needs. Sighted users see it; the accessible name stays clean.
 */
export function Trademark({ className }: TrademarkProps) {
  return (
    <sup aria-hidden="true" className={cn('trademark', className)}>
      TM
    </sup>
  )
}
