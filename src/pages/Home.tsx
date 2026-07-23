import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Play,
  Music2,
  Clapperboard,
  Sparkles,
} from 'lucide-react'

import { Hero } from '@/components/sections/Hero'
import { PhiLogo } from '@/components/ui/PhiLogo'
import { Wordmark } from '@/components/ui/Wordmark'
import { Section } from '@/components/layout/Section'
import { PageTransition } from '@/components/layout/PageTransition'
import { GlassCard } from '@/components/ui/GlassCard'
import { AnimatedGroup, AnimatedItem } from '@/components/ui/AnimatedGroup'
import { HomeScrollScene } from '@/components/home'
import { FeaturedCarousel } from '@/components/products'
import { SpotifyEmbed, PlayerModal, toGalleryItems } from '@/components/beyond'
import { SEO } from '@/components/seo/SEO'

import { useProducts, useFeaturedProducts } from '@/context/ProductsContext'
import { useRemoteData } from '@/hooks/useRemoteData'
import { CATEGORIES, getCategoryCounts } from '@/lib/products'
import type { BeyondData } from '@/lib/types'
import beyondFallback from '@data/beyond.json'

const EASE = [0.16, 1, 0.3, 1] as const

// Short, human descriptions for each discipline — shown on the category cards.
const CATEGORY_BLURB: Record<string, string> = {
  applications: 'Web & mobile apps engineered for performance and delight.',
  ai: 'Agents and models that reason, generate, and decide.',
  automation: 'Workflows that quietly do the work while you sleep.',
  data: 'Pipelines and dashboards that turn raw data into decisions.',
  research: 'Experiments probing what technology can do next.',
  games: 'Playable ideas — mechanics, polish, and a little fun.',
}

// ──────────────────────────────────────────────────────────────────────────────
// Count-up — eases a number from 0 to its target the first time it scrolls in.
// ──────────────────────────────────────────────────────────────────────────────
function StatCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      return
    }
    let raf = 0
    const start = performance.now()
    const duration = 1100
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
      setDisplay(Math.round(eased * value))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value])

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  )
}

export default function Home() {
  const allProducts = useProducts()
  const featured = useFeaturedProducts()

  const { data: beyond } = useRemoteData<BeyondData>(
    'beyond.json',
    beyondFallback as BeyondData
  )
  const mediums = beyond.mediums ?? []
  const musicMedium = mediums.find((m) => m.id === 'music')
  const video = mediums.find((m) => m.id === 'video')
  const featuredAlbum = musicMedium?.music?.[0]

  // Videos as gallery items so the same popup player used on the Beyond page
  // can play a clip in place here — clicking a thumbnail opens the player at
  // that clip instead of navigating away.
  const videoItems = useMemo(() => toGalleryItems(video), [video])
  const filmClips = videoItems.slice(0, 4)
  const [videoIndex, setVideoIndex] = useState<number | null>(null)

  const counts = getCategoryCounts(allProducts)
  const disciplines = CATEGORIES.filter(
    (c) => c.id !== 'all' && (counts[c.id] ?? 0) > 0
  )

  const stats = [
    { value: allProducts.length, suffix: '', label: 'Products shipped' },
    { value: disciplines.length, suffix: '', label: 'Disciplines' },
    { value: musicMedium?.music?.length ?? 0, suffix: '', label: 'Music releases' },
    { value: video?.videos?.length ?? 0, suffix: '', label: 'Films & videos' },
  ]

  return (
    <PageTransition>
      <SEO path="/" />
      <Hero />

      {/* ============================================================
          SECTION 2 — The Principle: the golden ratio, engineered in.
          A fresh editorial take (not a repeat of the hero scenes).
          ============================================================ */}
      <Section id="philosophy" className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">
          {/* The ratio, as a piece of type */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative flex flex-col items-center lg:items-start"
          >
            <div
              className="absolute -inset-10 pointer-events-none"
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(ellipse 60% 60% at 40% 40%, rgba(217,70,239,0.10), transparent 70%)',
              }}
            />
            <PhiLogo alt="phi" className="relative leading-none text-[8rem] md:text-[11rem]" />
            <div className="relative mt-2 flex items-baseline gap-3">
              <span className="typo-display text-2xl md:text-3xl text-text-primary">
                1.618
              </span>
              <span className="typo-label text-text-muted">The golden ratio</span>
            </div>
          </motion.div>

          {/* The principle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-magenta/40" />
              <span className="typo-label text-magenta">The Principle</span>
            </div>
            <h2 className="typo-section text-3xl md:text-4xl lg:text-5xl text-text-primary">
              Balance, engineered into{' '}
              <span className="gradient-text">everything</span>.
            </h2>
            <p className="typo-body text-text-secondary text-lg mt-6 max-w-xl">
              <PhiLogo alt="phi" /> is for perfection, U is for you — <Wordmark /> is where the two meet.
              Every product and every piece of creative work is measured against
              the same standard: harmonious, considered, and built to evolve.
            </p>
            <Link
              to="/about"
              className="group inline-flex items-center gap-2 mt-8 px-7 py-3 rounded-full glass text-sm font-medium text-text-secondary hover:text-text-primary transition-all duration-300"
            >
              Our Story
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* ============================================================
          SECTION 3 — At-a-glance: the whole studio in four numbers.
          `id="explore"` is the hero "Learn More" anchor target.
          ============================================================ */}
      <section id="explore" className="relative -mt-8 md:-mt-10 pb-4">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: EASE }}
            className="glass-strong rounded-3xl px-6 py-8 md:px-10 md:py-9 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 divide-y divide-white/[0.05] md:divide-y-0 md:divide-x"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center px-2 pt-6 first:pt-0 md:pt-0">
                <div className="typo-display text-4xl md:text-5xl gradient-text">
                  <StatCounter value={s.value} suffix={s.suffix} />
                </div>
                <div className="typo-label text-text-muted mt-2">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4 — Featured products (scroll-driven spotlight).
          ============================================================ */}
      {featured.length > 0 && (
        <div className="mt-16 md:mt-24">
          <FeaturedCarousel products={featured} />
        </div>
      )}

      {/* ============================================================
          SECTION 5 — Cinematic scroll scene (HomeScrollAnimation).
          The scroll-scrubbed 9:16 frame sequence, bridging the
          product spotlight and the deeper dive below.
          ============================================================ */}
      <HomeScrollScene />

      {/* ============================================================
          SECTION 6 — What we build: the disciplines, with live counts.
          ============================================================ */}
      <Section
        label="What we build"
        title="Technology that moves you forward"
        subtitle="From intelligent automation to beautiful applications — every discipline is crafted with precision and purpose."
      >
        <AnimatedGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {disciplines.map((cat) => {
            const Icon = cat.icon
            const count = counts[cat.id] ?? 0
            return (
              <AnimatedItem key={cat.id}>
                <Link to={`/products?category=${cat.id}`}>
                  <GlassCard className="p-7 h-full group">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-magenta/10">
                        <Icon size={22} className="text-magenta" />
                      </div>
                      <span className="typo-label text-text-muted">
                        {count} {count === 1 ? 'product' : 'products'}
                      </span>
                    </div>
                    <h3 className="typo-section text-xl text-text-primary mb-2.5">
                      {cat.label}
                    </h3>
                    <p className="typo-body text-text-secondary text-sm leading-relaxed mb-5">
                      {CATEGORY_BLURB[cat.id] ??
                        'Crafted with precision and purpose.'}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted group-hover:text-magenta transition-colors duration-300">
                      Explore
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </span>
                  </GlassCard>
                </Link>
              </AnimatedItem>
            )
          })}
        </AnimatedGroup>
      </Section>

      {/* ============================================================
          SECTION 7 — Beyond: the creative side (music + film).
          ============================================================ */}
      <section className="relative overflow-hidden py-24 md:py-32">
        {/* Ambient violet wash so the creative side reads distinct from products */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 80% 20%, rgba(168,85,247,0.08), transparent 70%)',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: EASE }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14"
          >
            <div>
              <span className="typo-label text-magenta mb-4 block">Beyond</span>
              <h2 className="typo-section text-3xl md:text-4xl lg:text-5xl text-text-primary max-w-2xl">
                Crafted with AI, <span className="gradient-text">not by it</span>.
              </h2>
              <p className="typo-body text-text-secondary mt-5 max-w-xl text-lg">
                The creative side of phiUture — original music and film, made by
                hand with AI as a collaborator in the room.
              </p>
            </div>
            <Link
              to="/beyond"
              className="group shrink-0 inline-flex items-center gap-2 px-7 py-3 rounded-full glass text-sm font-medium text-text-secondary hover:text-text-primary transition-all duration-300"
            >
              Enter Beyond
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Music — a real, playable release */}
            {featuredAlbum && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <GlassCard hoverTilt={false} className="h-full p-6 md:p-7 flex flex-col">
                  <div className="flex items-center gap-2.5 mb-5">
                    <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-magenta/10">
                      <Music2 size={17} className="text-magenta" />
                    </span>
                    <div>
                      <h3 className="typo-section text-base text-text-primary leading-tight">
                        Fresh Release
                      </h3>
                      <p className="typo-label text-text-muted">Now streaming</p>
                    </div>
                  </div>
                  <SpotifyEmbed
                    albumId={featuredAlbum.spotifyId}
                    height={352}
                    title={featuredAlbum.title}
                  />
                </GlassCard>
              </motion.div>
            )}

            {/* Film — thumbnail grid linking into Beyond */}
            {filmClips.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
              >
                <GlassCard hoverTilt={false} className="h-full p-6 md:p-7 flex flex-col">
                  <div className="flex items-center gap-2.5 mb-5">
                    <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-violet/10">
                      <Clapperboard size={17} className="text-violet" />
                    </span>
                    <div>
                      <h3 className="typo-section text-base text-text-primary leading-tight">
                        Latest Videos
                      </h3>
                      <p className="typo-label text-text-muted">
                        {video?.videos?.length ?? 0} releases
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 flex-1">
                    {filmClips.map((clip, i) => (
                      <button
                        key={clip.key}
                        type="button"
                        onClick={() => setVideoIndex(i)}
                        aria-label={`Play ${clip.title}`}
                        className="group relative block w-full aspect-video rounded-xl overflow-hidden glass border border-white/[0.06]"
                      >
                        <img
                          src={clip.thumbnail}
                          alt={clip.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="w-11 h-11 rounded-full bg-magenta/90 flex items-center justify-center shadow-lg shadow-magenta/30">
                            <Play size={17} className="text-white ml-0.5" fill="currentColor" />
                          </span>
                        </div>
                        <span className="absolute bottom-2 left-2.5 right-2.5 typo-body text-xs text-white/90 truncate text-left">
                          {clip.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </div>

          {/* Medium palette — the full creative range, one voice */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-8 justify-center">
            {mediums.map((m, i) => (
              <span key={m.id} className="inline-flex items-center gap-3">
                {i > 0 && <span className="text-text-muted/30">·</span>}
                <span className="typo-label text-text-secondary">
                  {m.label}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Popup player — plays a home-page video clip in place (no navigation) */}
      <PlayerModal
        items={videoItems}
        index={videoIndex}
        onIndex={setVideoIndex}
        onClose={() => setVideoIndex(null)}
      />

      {/* ============================================================
          SECTION 8 — About teaser
          ============================================================ */}
      <Section className="overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: EASE }}
          className="max-w-3xl mx-auto text-center"
        >
          <span className="typo-label text-magenta mb-6 inline-flex items-center gap-2">
            <Sparkles size={14} /> About
          </span>
          <h2 className="typo-section text-3xl md:text-4xl lg:text-5xl text-text-primary mb-6">
            The story behind <Wordmark />
          </h2>
          <p className="typo-body text-text-secondary text-lg mb-10">
            A comprehensive view of the philosophy, the engineer, and the work
            that shapes phiUture — all in one place.
          </p>
          <Link
            to="/about"
            className="group inline-flex items-center gap-2 px-7 py-3 rounded-full glass text-sm font-medium text-text-secondary hover:text-text-primary transition-all duration-300"
          >
            Explore About
            <ArrowRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </Section>

      {/* ============================================================
          SECTION 9 — Call to action: contact
          ============================================================ */}
      <Section className="overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(217,70,239,0.06), transparent 70%)',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative text-center max-w-3xl mx-auto"
        >
          <h2 className="typo-display text-4xl md:text-5xl lg:text-6xl text-text-primary mb-6">
            Let's build something{' '}
            <span className="gradient-text">extraordinary</span>
          </h2>
          <p className="typo-body text-text-secondary text-lg mb-10">
            Have a project in mind? Let's talk.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-9 py-4 rounded-full bg-gradient-to-r from-magenta to-violet text-white font-medium text-sm tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-magenta/25 hover:scale-[1.03] active:scale-[0.97]"
            >
              Get in Touch
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/products"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-primary transition-colors duration-300"
            >
              View all products
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </motion.div>
      </Section>
    </PageTransition>
  )
}
