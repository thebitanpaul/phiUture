import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useMediaQuery, useIsMobile } from '@/hooks/useMediaQuery'
import type { Product } from '@/lib/types'
import { FeaturedProductCard } from './FeaturedProductCard'

interface FeaturedCarouselProps {
  products: Product[]
}

function Header({ hint = false }: { hint?: boolean }) {
  return (
    <div className="mx-auto mb-8 flex w-full max-w-6xl items-end justify-between px-6">
      <div>
        <span className="typo-label mb-2 block text-magenta">Featured</span>
        <h2 className="typo-section text-2xl text-text-primary md:text-3xl">
          Products in the spotlight
        </h2>
      </div>
      {hint && (
        <span className="hidden items-center gap-2 text-sm text-text-muted md:inline-flex">
          Scroll to explore
          <ArrowRight size={15} className="text-magenta" />
        </span>
      )}
    </div>
  )
}

/**
 * Desktop: the section pins while vertical scroll drives the row of
 * cards horizontally — a cinematic, scroll-linked slideshow.
 */
function PinnedCarousel({ products }: FeaturedCarouselProps) {
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
  }, [products.length])

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: `calc(100vh + ${distance}px)` }}
      aria-label="Featured products"
    >
      <div className="sticky top-0 flex h-screen flex-col justify-start overflow-hidden pt-24 md:pt-28">
        <Header hint />
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex gap-6 px-6 will-change-transform"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[86vw] max-w-[980px] shrink-0 lg:w-[68vw]"
            >
              <FeaturedProductCard product={product} />
            </div>
          ))}
        </motion.div>

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
    </section>
  )
}

/**
 * Touch / reduced-motion: a swipeable, snap-scrolling carousel — no
 * scroll hijacking, fully native.
 */
function SwipeCarousel({ products }: FeaturedCarouselProps) {
  return (
    <section className="pt-6 md:pt-8" aria-label="Featured products">
      <Header />
      <div
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4"
        style={{ scrollbarWidth: 'none' }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[85vw] max-w-[560px] shrink-0 snap-center"
          >
            <FeaturedProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}

export function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  const isMobile = useIsMobile()
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  if (products.length === 0) return null

  return isMobile || reduceMotion ? (
    <SwipeCarousel products={products} />
  ) : (
    <PinnedCarousel products={products} />
  )
}
