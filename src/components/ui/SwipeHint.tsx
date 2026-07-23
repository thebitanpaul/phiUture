import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SwipeHintProps {
  /** Extra classes (e.g. to control when it shows). */
  className?: string
  /** Copy before the arrow. Defaults to "Scroll". */
  label?: string
}

/**
 * A small "Scroll →" cue for horizontally-swipeable strips on touch screens,
 * where the desktop "Scroll to explore" hint is hidden. The arrow nudges to the
 * right on a loop so it reads as a swipe affordance, not a static label.
 */
export function SwipeHint({ className, label = 'Scroll' }: SwipeHintProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium text-text-muted',
        className
      )}
      aria-hidden="true"
    >
      {label}
      <motion.span
        animate={{ x: [0, 5, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className="inline-flex"
      >
        <ArrowRight size={14} className="text-magenta" />
      </motion.span>
    </span>
  )
}
