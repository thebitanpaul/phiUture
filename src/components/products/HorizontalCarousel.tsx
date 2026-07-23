import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery, useIsMobile } from '@/hooks/useMediaQuery'
import { SwipeHint } from '@/components/ui/SwipeHint'

interface HorizontalCarouselProps {
  label: string
  title: string
  items: ReactNode[]
  /** Width utility for each slide, e.g. 'w-[85vw] max-w-[720px] lg:w-[60vw]'. */
  itemClassName?: string
}

function Header({
  label,
  title,
  hint = false,
  swipeHint = false,
}: {
  label: string
  title: string
  hint?: boolean
  swipeHint?: boolean
}) {
  return (
    <div className="mx-auto mb-8 flex w-full max-w-6xl items-end justify-between px-6">
      <div>
        <span className="typo-label mb-2 block text-magenta">{label}</span>
        <h2 className="typo-section text-2xl text-text-primary md:text-3xl">
          {title}
        </h2>
      </div>
      {hint && (
        <span className="hidden items-center gap-2 text-sm text-text-muted md:inline-flex">
          Scroll to explore
          <ArrowRight size={15} className="text-magenta" />
        </span>
      )}
      {swipeHint && <SwipeHint className="shrink-0" />}
    </div>
  )
}

/**
 * Desktop: the section pins while vertical scroll drives the row of slides
 * horizontally. Leading padding + a trailing spacer guarantee the first and
 * last slides are fully reachable. When the slides already fit on screen it
 * degrades to a plain row (no scroll hijacking, no wasted vertical space).
 */
function Pinned({ label, title, items, itemClassName }: HorizontalCarouselProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [distance, setDistance] = useState(0)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance])

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current
      if (!track) return
      setDistance(Math.max(0, track.scrollWidth - track.clientWidth))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [items.length])

  const pinned = distance > 0

  const track = (
    <motion.div
      ref={trackRef}
      style={{ x }}
      className="flex gap-6 pl-6 will-change-transform"
    >
      {items.map((node, i) => (
        <div key={i} className={cn('shrink-0', itemClassName)}>
          {node}
        </div>
      ))}
      {/* Trailing spacer so the last slide scrolls fully into view */}
      <div aria-hidden="true" className="w-6 shrink-0" />
    </motion.div>
  )

  return (
    <section
      ref={sectionRef}
      className="relative border-t border-white/[0.06]"
      style={pinned ? { height: `calc(100vh + ${distance}px)` } : undefined}
      aria-label={title}
    >
      {pinned ? (
        <div className="sticky top-0 flex h-screen flex-col overflow-hidden pb-12 pt-24 md:pt-28">
          <Header label={label} title={title} hint />
          <div className="flex min-h-0 flex-1 flex-col justify-center">
            {track}
            {/* Progress rail */}
            <div className="mx-auto mt-8 w-full max-w-6xl px-6">
              <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full origin-left rounded-full bg-gradient-to-r from-magenta to-violet"
                  style={{ scaleX: scrollYProgress }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 md:py-14">
          <Header label={label} title={title} />
          {track}
        </div>
      )}
    </section>
  )
}

/** Touch / reduced-motion: native swipeable, snap-scrolling row. */
function Swipe({ label, title, items, itemClassName }: HorizontalCarouselProps) {
  return (
    <section className="border-t border-white/[0.06] py-12 md:py-14">
      <Header label={label} title={title} swipeHint={items.length > 1} />
      <div
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 pl-6"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map((node, i) => (
          <div key={i} className={cn('shrink-0 snap-center', itemClassName)}>
            {node}
          </div>
        ))}
        <div aria-hidden="true" className="w-6 shrink-0" />
      </div>
    </section>
  )
}

/**
 * Scroll-driven horizontal carousel for in-page content (features, gallery).
 * Mirrors the featured-products behaviour: pinned horizontal scroll on
 * desktop, native swipe on touch / reduced-motion.
 */
export function HorizontalCarousel(props: HorizontalCarouselProps) {
  const isMobile = useIsMobile()
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  if (props.items.length === 0) return null

  return isMobile || reduceMotion ? <Swipe {...props} /> : <Pinned {...props} />
}
