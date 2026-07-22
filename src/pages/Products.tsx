import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'
import { AnimatedGroup, AnimatedItem } from '@/components/ui/AnimatedGroup'
import {
  ProductFilterBar,
  ProductCard,
  FeaturedCarousel,
  ProductsScrollScene,
} from '@/components/products'
import { Pagination } from '@/components/ui'
import {
  CATEGORIES,
  getProductsByCategory,
  type FilterId,
} from '@/lib/products'
import { useProducts, useFeaturedProducts } from '@/context/ProductsContext'

const EASE = [0.16, 1, 0.3, 1] as const

// 3 rows × 3 columns on desktop — one page caps at 3 rows, then Next page.
const PAGE_SIZE = 9

const VALID_FILTERS = new Set<FilterId>(CATEGORIES.map((c) => c.id))

function normalizeFilter(value: string | null): FilterId {
  return value && VALID_FILTERS.has(value as FilterId)
    ? (value as FilterId)
    : 'all'
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [active, setActive] = useState<FilterId>(() =>
    normalizeFilter(searchParams.get('category'))
  )

  // Keep state in sync if the URL changes (e.g. nav dropdown links).
  useEffect(() => {
    setActive(normalizeFilter(searchParams.get('category')))
  }, [searchParams])

  // Marker sitting at the filter bar's flow position, plus a flag so we only
  // re-anchor the scroll on a *user* tab switch (not the initial / URL-driven
  // mount, which would fight the route's own scroll-to-top).
  const filterAnchorRef = useRef<HTMLDivElement>(null)
  const shouldReanchorRef = useRef(false)

  const handleChange = (id: FilterId) => {
    shouldReanchorRef.current = true
    setActive(id)
    const next = new URLSearchParams(searchParams)
    if (id === 'all') next.delete('category')
    else next.set('category', id)
    setSearchParams(next, { replace: true })
  }

  const [query, setQuery] = useState('')
  const trimmedQuery = query.trim().toLowerCase()

  const allProducts = useProducts()
  const featured = useFeaturedProducts()
  const filtered = useMemo(() => {
    const list = getProductsByCategory(allProducts, active)
    if (!trimmedQuery) return list
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(trimmedQuery) ||
        p.tagline.toLowerCase().includes(trimmedQuery)
    )
  }, [allProducts, active, trimmedQuery])

  // Paginate the grid at 3 rows/page. Reset to the first page whenever the
  // result set changes underfoot (category switch or new search).
  const [page, setPage] = useState(0)
  useEffect(() => {
    setPage(0)
  }, [active, trimmedQuery])

  // On a user tab switch, glide the filter bar just under the navbar so the new
  // results start in view. The featured carousel + scroll scene stay mounted, so
  // the layout above the bar never changes — a single smooth scroll is enough,
  // with no multi-frame settling or the "jumps to the top then scrolls down" jank.
  useEffect(() => {
    if (!shouldReanchorRef.current) return
    shouldReanchorRef.current = false

    const NAV_OFFSET = 88 // clears the fixed navbar (filter bar sticks at top-20)
    const rafId = requestAnimationFrame(() => {
      const anchor = filterAnchorRef.current
      if (!anchor) return
      const top = anchor.getBoundingClientRect().top + window.scrollY - NAV_OFFSET
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    })
    return () => cancelAnimationFrame(rafId)
  }, [active])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageItems = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE
  )

  // The featured carousel and the cinematic scroll scene stay mounted at all
  // times — they never hide when switching filters, so the page never lurches
  // and the scroll animation always remains part of the products page.
  const showFeatured = featured.length > 0

  return (
    <PageTransition>
      {/* ============================================================
          HERO
          ============================================================ */}
      <section className="relative overflow-hidden pb-2 pt-36 md:pt-40">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 rounded-full opacity-[0.05]"
            style={{
              background: 'radial-gradient(circle, #d946ef, transparent 70%)',
              filter: 'blur(90px)',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="typo-label mb-4 block text-magenta"
          >
            Products
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="typo-display max-w-3xl text-4xl text-text-primary md:text-6xl"
          >
            Technology, <span className="gradient-text">thoughtfully built.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
            className="typo-body mt-5 max-w-2xl text-lg text-text-secondary"
          >
            From AI-powered applications to intelligent automation systems, every
            product is designed to solve real-world problems — beautifully.
          </motion.p>
        </div>
      </section>

      {/* ============================================================
          FEATURED — scroll-driven horizontal slideshow.
          Sits directly below the hero, above the filters.
          ============================================================ */}
      {showFeatured && (
        <div className="mt-10 md:mt-14">
          <FeaturedCarousel products={featured} />
        </div>
      )}

      {/* ============================================================
          CINEMATIC SCENE — scroll-scrubbed 9:16 frame sequence.
          Bridges the featured carousel and the filter bar; the
          filter bar reveals once the scene's scroll completes.
          ============================================================ */}
      <ProductsScrollScene />

      {/* ============================================================
          STICKY FILTER BAR
          ============================================================ */}
      {/* Flow-position marker for the filter bar (the bar itself is sticky, so
          its own rect can't be measured reliably). */}
      <div ref={filterAnchorRef} aria-hidden className="h-0" />
      <ProductFilterBar
        active={active}
        onChange={handleChange}
        query={query}
        onQueryChange={setQuery}
      />

      {/* ============================================================
          SELECTED CATEGORY'S PRODUCTS
          ============================================================ */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-8">
          <span className="typo-label mb-2 block text-magenta">
            {trimmedQuery ? 'Search' : active === 'all' ? 'All Products' : 'Filtered'}
          </span>
          <h2 className="typo-section text-2xl text-text-primary md:text-3xl">
            {trimmedQuery
              ? `Results for “${query.trim()}”`
              : active === 'all'
                ? 'Everything we build'
                : CATEGORIES.find((c) => c.id === active)?.label}
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="typo-body text-sm text-text-muted">
              {trimmedQuery
                ? `No products match “${query.trim()}”.`
                : 'No products in this category yet — more are on the way.'}
            </p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${active}-${trimmedQuery}-${safePage}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatedGroup
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  stagger={0.06}
                >
                  {pageItems.map((product) => (
                    <AnimatedItem key={product.id}>
                      <ProductCard product={product} />
                    </AnimatedItem>
                  ))}
                </AnimatedGroup>
              </motion.div>
            </AnimatePresence>

            <Pagination
              page={safePage}
              pageCount={pageCount}
              onChange={setPage}
            />
          </>
        )}
      </section>
    </PageTransition>
  )
}
