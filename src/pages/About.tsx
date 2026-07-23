import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Section } from '@/components/layout/Section'
import { PageTransition } from '@/components/layout/PageTransition'
import { GlassCard } from '@/components/ui/GlassCard'
import { AnimatedGroup, AnimatedItem } from '@/components/ui/AnimatedGroup'
import { PhilosophyBook } from '@/components/about/PhilosophyBook'
import { PhiLogo } from '@/components/ui/PhiLogo'
import { Wordmark } from '@/components/ui/Wordmark'
import { BrandText } from '@/components/ui/BrandText'
import { useProducts } from '@/context/ProductsContext'
import { useAbout } from '@/context/AboutContext'
import { useRemoteData } from '@/hooks/useRemoteData'
import { SEO } from '@/components/seo/SEO'
import type { AboutKpi, AboutPerson, BeyondData } from '@/lib/types'
import beyondFallback from '@data/beyond.json'
import {
  Briefcase,
  GraduationCap,
  Lightbulb,
  Cpu,
  Target,
  Sparkles,
  AppWindow,
  Workflow,
  Database,
  FlaskConical,
  ArrowRight,
  Smartphone,
  Award,
  MapPin,
  Route,
  X,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'

const EASE = [0.16, 1, 0.3, 1] as const

// Icon keys used in about.json → lucide components. Adding a new icon is a
// one-line change here; the JSON only ever stores the string key.
const ICONS: Record<string, LucideIcon> = {
  graduation: GraduationCap,
  cpu: Cpu,
  smartphone: Smartphone,
  award: Award,
  briefcase: Briefcase,
  lightbulb: Lightbulb,
  target: Target,
  appwindow: AppWindow,
  workflow: Workflow,
  database: Database,
  flask: FlaskConical,
  sparkles: Sparkles,
}

// --------------------------------------------
// KPI value derivation — every tile computes live so the board never goes
// stale as products, music, videos, time, or the GitHub count change.
// --------------------------------------------

/** Whole years elapsed since an ISO-ish "YYYY-MM" start (auto-increments). */
function yearsSince(since?: string): number {
  if (!since) return 0
  const [y, m = 1] = since.split('-').map(Number)
  if (!y) return 0
  const start = new Date(y, m - 1, 1)
  const now = new Date()
  let years = now.getFullYear() - start.getFullYear()
  if (now.getMonth() < start.getMonth()) years -= 1
  return Math.max(0, years)
}

/** Reads a GitHub user's public repo count once, live. null until/if it loads. */
function useGithubRepoCount(username?: string): number | null {
  const [count, setCount] = useState<number | null>(null)
  useEffect(() => {
    if (!username) return
    let active = true
    fetch(`https://api.github.com/users/${username}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => {
        if (active && typeof d.public_repos === 'number') setCount(d.public_repos)
      })
      .catch(() => {
        /* offline / rate-limited → the caller uses the JSON fallback */
      })
    return () => {
      active = false
    }
  }, [username])
  return count
}

interface KpiContext {
  products: number
  aiProducts: number
  records: number
  videos: number
  githubLive: number | null
}

/** Resolves a KPI tile to its displayed string, given the live context. */
function kpiValue(kpi: AboutKpi, ctx: KpiContext): string {
  const suffix = kpi.suffix ?? ''
  switch (kpi.kind) {
    case 'years':
      return `${yearsSince(kpi.since)}${suffix}`
    case 'github': {
      // Live count rounded down to the nearest 10 with a "+", matching the
      // house style; falls back to the manual JSON value when offline.
      const live = ctx.githubLive
      const base = live != null ? Math.floor(live / 10) * 10 : kpi.githubReposFallback ?? 0
      return `${base}${suffix}`
    }
    case 'products':
      return `${ctx.products}${suffix}`
    case 'ai-products':
      return `${ctx.aiProducts}${suffix}`
    case 'records':
      return `${ctx.records}${suffix}`
    case 'videos':
      return `${ctx.videos}${suffix}`
    default:
      return `${suffix}`
  }
}

export default function About() {
  const about = useAbout()
  const { data: beyond } = useRemoteData<BeyondData>(
    'beyond.json',
    beyondFallback as BeyondData
  )
  const products = useProducts()

  // Which person's journey (if any) is open in the modal.
  const [journeyPerson, setJourneyPerson] = useState<AboutPerson | null>(null)
  // Avatar opened in the image lightbox (null = closed).
  const [avatar, setAvatar] = useState<{ src: string; name: string } | null>(null)

  const { people, kpis, capabilities } = about
  const multiPerson = people.length > 1

  // Live context for the KPI board.
  const mediums = beyond.mediums ?? []
  const musicMedium = mediums.find((m) => m.id === 'music')
  const video = mediums.find((m) => m.id === 'video')
  const githubUsername = kpis.find((k) => k.kind === 'github')?.githubUsername
  const githubLive = useGithubRepoCount(githubUsername)

  const kpiCtx: KpiContext = {
    products: products.length,
    aiProducts: products.filter((p) => p.category === 'ai').length,
    records: musicMedium?.music?.length ?? 0,
    videos: video?.videos?.length ?? 0,
    githubLive,
  }

  return (
    <PageTransition>
      <SEO
        title="About"
        description="The story and philosophy behind phiUture — beauty in engineering, the customer at the center, and eyes always on the horizon."
        path="/about"
      />
      {/* Page hero */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle, #d946ef, transparent 70%)' }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="typo-label text-magenta mb-4 block"
          >
            About
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="typo-display text-4xl md:text-6xl lg:text-7xl text-text-primary"
          >
            The meaning behind
            <br />
            <Wordmark />
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="typo-body text-text-secondary text-lg mt-6 max-w-2xl mx-auto"
          >
            A studio built on one philosophy — beauty in engineering, the
            customer at the center, and eyes always on the horizon.
          </motion.p>
        </div>
      </section>

      {/* The storybook — φ · U · future */}
      <Section
        label="The Philosophy"
        title="Read the story behind the name"
        subtitle={
          <>
            phiUture packs three ideas into one word. Flip through the book to
            see how <PhiLogo alt="phi" />, U, and future fit together.
          </>
        }
      >
        <PhilosophyBook />
      </Section>

      {/* Promise — the back cover */}
      <Section>
        <motion.blockquote
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="text-5xl md:text-7xl mb-6 leading-tight">
            <PhiLogo alt="phi" />
          </div>
          <p className="typo-section text-2xl md:text-3xl text-text-primary leading-snug">
            Beautifully engineered technology, crafted for you, shaping the future.
          </p>
          <p className="typo-body text-text-muted mt-6 text-sm">
            — The phiUture promise
          </p>
        </motion.blockquote>
      </Section>

      {/* The Team — people cards (a switchable stack when there's more than one),
          each with its journey tucked behind a CTA. Kept separate from the KPI
          band and the capability cards below. */}
      <Section
        label="The Team"
        title={
          <BrandText>
            {multiPerson ? 'The people behind phiUture' : 'The person behind phiUture'}
          </BrandText>
        }
        subtitle={
          multiPerson
            ? 'The people building phiUture — use the arrows to meet each one.'
            : undefined
        }
      >
        <PeopleStack
          people={people}
          onOpenJourney={setJourneyPerson}
          onOpenAvatar={(p) =>
            p.avatar && setAvatar({ src: p.avatar, name: p.name })
          }
        />
      </Section>

      {/* Capabilities — the studio's disciplines, proven by shipped work */}
      <Section
        label="Capabilities"
        title="What we bring to the table"
        subtitle="Every capability below is proven by shipped work in the phiUture portfolio — not a résumé line, but a product you can open."
      >
        {/* KPI band — headline numbers, all derived live from the data */}
        <AnimatedGroup
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px rounded-2xl overflow-hidden glass mb-14"
          stagger={0.06}
        >
          {kpis.map((kpi) => (
            <AnimatedItem key={kpi.id} className="bg-white/[0.015]">
              <div className="h-full px-5 py-6 text-center flex flex-col items-center justify-center">
                <div className="typo-display text-3xl md:text-4xl gradient-text leading-none mb-2">
                  {kpiValue(kpi, kpiCtx)}
                </div>
                <div className="typo-section text-[0.8rem] text-text-primary leading-tight">
                  {kpi.label}
                </div>
                {kpi.sub && (
                  <div className="typo-body text-[0.68rem] text-text-muted mt-1 leading-tight">
                    {kpi.sub}
                  </div>
                )}
              </div>
            </AnimatedItem>
          ))}
        </AnimatedGroup>

        <AnimatedGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" stagger={0.08}>
          {capabilities.map((c) => {
            const Icon = ICONS[c.icon] ?? Sparkles
            // Every card is actionable: the Beyond card keeps its own link, the
            // rest lead to the products page (which opens at the top).
            const to = c.href ?? '/products'
            return (
              <AnimatedItem key={c.id}>
                <Link to={to} className="group block h-full">
                  <GlassCard className="p-6 h-full flex flex-col" hoverTilt={false}>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                      style={{ background: `${c.color}14`, border: `1px solid ${c.color}28` }}
                    >
                      <Icon size={22} style={{ color: c.color }} strokeWidth={1.6} />
                    </div>
                    <h4 className="typo-section text-lg text-text-primary mb-2 flex items-center gap-2">
                      {c.title}
                      <ArrowRight
                        size={15}
                        className="text-text-muted transition-transform duration-300 group-hover:translate-x-0.5"
                      />
                    </h4>
                    <p className="typo-body text-text-secondary text-sm leading-relaxed mb-5 flex-1">
                      {c.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {c.products.map((p) => (
                        <span
                          key={p}
                          className="font-mono text-[0.68rem] px-2 py-1 rounded-md text-text-muted bg-white/[0.03] border border-white/[0.06]"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                </Link>
              </AnimatedItem>
            )
          })}
        </AnimatedGroup>
      </Section>

      {/* Closing vision */}
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <Sparkles size={28} className="text-magenta mx-auto mb-5" />
          <h2 className="typo-section text-2xl md:text-3xl text-text-primary mb-5">
            The vision
          </h2>
          <p className="typo-body text-text-secondary text-lg leading-relaxed">
            Build products people love using, powered by AI that actually helps,
            wrapped in design that respects your time and attention. Every product
            under phiUture carries this standard — no exceptions.
          </p>
        </motion.div>
      </Section>

      <JourneyModal
        person={journeyPerson}
        onClose={() => setJourneyPerson(null)}
      />

      <AvatarLightbox avatar={avatar} onClose={() => setAvatar(null)} />
    </PageTransition>
  )
}

// --------------------------------------------
// People — a single card, or a switchable stack when there's more than one.
// --------------------------------------------
function PeopleStack({
  people,
  onOpenJourney,
  onOpenAvatar,
}: {
  people: AboutPerson[]
  onOpenJourney: (p: AboutPerson) => void
  onOpenAvatar: (p: AboutPerson) => void
}) {
  const [[active, dir], setActive] = useState<[number, number]>([0, 0])
  const multi = people.length > 1
  const idx = Math.min(active, people.length - 1)
  const current = people[idx]
  const hasPrev = idx > 0
  const hasNext = idx < people.length - 1

  const go = (delta: number) =>
    setActive(([cur]) => [
      Math.min(Math.max(cur + delta, 0), people.length - 1),
      delta,
    ])

  const slide = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } },
    exit: (d: number) => ({
      opacity: 0,
      x: d > 0 ? -60 : 60,
      transition: { duration: 0.3, ease: EASE },
    }),
  }

  return (
    <div className={`mx-auto max-w-4xl ${multi ? 'px-2 md:px-0' : ''}`}>
      <div className="relative">
        {/* Stacked-page depth behind the card, hinting there are more people */}
        {multi && (
          <>
            <div className="absolute inset-x-8 -bottom-2 h-8 rounded-b-3xl bg-white/[0.02] blur-sm" />
            <div className="absolute inset-x-4 -bottom-1 h-8 rounded-b-3xl bg-white/[0.03]" />
          </>
        )}

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={current.id}
            custom={dir}
            variants={multi ? slide : undefined}
            initial={multi ? 'enter' : false}
            animate={multi ? 'center' : undefined}
            exit={multi ? 'exit' : undefined}
          >
            <PersonCard
              person={current}
              onOpenJourney={onOpenJourney}
              onOpenAvatar={onOpenAvatar}
            />
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next arrows. Only "next" shows at first; "prev" appears once
            the visitor has moved forward (i.e. when there's somewhere back to). */}
        {multi && (
          <AnimatePresence>
            {hasPrev && (
              <NavArrow key="prev" side="left" onClick={() => go(-1)} />
            )}
            {hasNext && (
              <NavArrow key="next" side="right" onClick={() => go(1)} />
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Progress dots */}
      {multi && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {people.map((p, i) => (
            <span
              key={p.id}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === idx ? 22 : 6,
                background: i === idx ? '#d946ef' : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function NavArrow({
  side,
  onClick,
}: {
  side: 'left' | 'right'
  onClick: () => void
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Previous person' : 'Next person'}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.25, ease: EASE }}
      className={`glass-strong absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-text-secondary transition-colors duration-300 hover:text-text-primary ${
        side === 'left' ? 'left-2 md:-left-16' : 'right-2 md:-right-16'
      }`}
    >
      <Icon size={22} />
    </motion.button>
  )
}

function PersonCard({
  person,
  onOpenJourney,
  onOpenAvatar,
}: {
  person: AboutPerson
  onOpenJourney: (p: AboutPerson) => void
  onOpenAvatar: (p: AboutPerson) => void
}) {
  return (
    <GlassCard className="p-8 md:p-10" hoverTilt={false}>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Avatar image (click to enlarge), or the monogram fallback */}
        <div className="shrink-0">
          {person.avatar ? (
            <button
              type="button"
              onClick={() => onOpenAvatar(person)}
              aria-label={`View photo of ${person.name}`}
              className="block cursor-zoom-in rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-magenta/50"
            >
              <img
                src={person.avatar}
                alt={person.name}
                loading="lazy"
                className="h-44 w-44 rounded-2xl object-cover transition-transform duration-300 hover:scale-[1.03]"
                style={{ border: '1px solid rgba(217,70,239,0.25)' }}
              />
            </button>
          ) : (
            <div
              className="w-44 h-44 rounded-2xl flex items-center justify-center typo-display text-6xl text-text-primary relative overflow-hidden"
              style={{
                background:
                  'linear-gradient(135deg, rgba(217,70,239,0.18), rgba(124,58,237,0.14))',
                border: '1px solid rgba(217,70,239,0.25)',
              }}
            >
              <span className="relative z-10 gradient-text">{person.monogram}</span>
            </div>
          )}
        </div>

        <div className="text-center md:text-left">
          <h3 className="typo-section text-2xl text-text-primary mb-1.5">
            {person.name}
          </h3>
          <div className="flex items-center justify-center md:justify-start gap-1.5 text-text-muted mb-3">
            <MapPin size={13} />
            <span className="typo-label text-[0.65rem]">{person.location}</span>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-5">
            {person.roles.map((role) => (
              <span
                key={role}
                className="typo-label text-[0.65rem] px-3 py-1 rounded-full text-text-secondary border border-border-light bg-white/[0.02]"
              >
                {role}
              </span>
            ))}
          </div>
          <p className="typo-body text-text-secondary text-base md:text-lg leading-relaxed">
            {person.bio}
          </p>

          {/* CTA — reveals this person's journey timeline in a modal */}
          {person.journey.length > 0 && (
            <button
              type="button"
              onClick={() => onOpenJourney(person)}
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-magenta to-violet px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-magenta/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Route size={15} />
              {person.journeyCta ?? 'Explore the journey'}
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  )
}

// --------------------------------------------
// Journey modal — a person's timeline, revealed on demand from their card.
// A centered rail with icon nodes in the middle and cards alternating left /
// right (single column on mobile), each easing in as it scrolls into view.
// Rendered in a portal so the page's transform/filter wrapper can't misplace it.
// --------------------------------------------
const timelineItem = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

function JourneyModal({
  person,
  onClose,
}: {
  person: AboutPerson | null
  onClose: () => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const open = person !== null

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  // Portals target document.body, which doesn't exist during static
  // prerender (SSG). Render nothing server-side; the modal is client-only.
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && person && (
        <motion.div
          key="journey-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`The journey of ${person.name}`}
        >
          <div
            className="absolute inset-0 bg-void/90 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.34, ease: EASE }}
            className="glass-strong relative z-10 flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl"
            style={{ boxShadow: '0 40px 120px -30px rgba(0,0,0,0.85)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4 md:px-8">
              <div className="flex items-center gap-2.5">
                <Route size={16} className="text-magenta" />
                <span className="typo-label text-text-secondary">
                  {person.name} · The path so far
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            {/* Timeline — centered rail, alternating cards, scroll-driven reveal */}
            <div ref={scrollRef} className="overflow-y-auto px-6 py-10 md:px-10 md:py-12">
              <div className="relative">
                {/* Center (mobile: left) rail */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border-light to-transparent md:left-1/2 md:-translate-x-px" />

                <div className="space-y-10 md:space-y-14">
                  {person.journey.map((item, i) => {
                    const Icon = ICONS[item.icon] ?? Target
                    const isLeft = i % 2 === 0
                    return (
                      <motion.div
                        key={item.id}
                        variants={timelineItem}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, root: scrollRef, amount: 0.4 }}
                        className={`relative flex items-start gap-6 md:gap-0 ${
                          isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                        }`}
                      >
                        {/* Card — sits to one side on desktop, right of rail on mobile */}
                        <div
                          className={`flex-1 ml-16 md:ml-0 ${
                            isLeft ? 'md:pr-14 md:text-right' : 'md:pl-14 md:text-left'
                          }`}
                        >
                          <div className="rounded-2xl glass p-5">
                            <span
                              className="typo-label text-xs mb-2 block"
                              style={{ color: item.color }}
                            >
                              {item.year}
                            </span>
                            <h3 className="typo-section text-lg text-text-primary mb-1.5">
                              <BrandText>{item.title}</BrandText>
                            </h3>
                            <p className="typo-body text-text-secondary text-sm leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Icon node — centered on the rail at every breakpoint */}
                        <div className="absolute left-6 top-1 z-10 -translate-x-1/2 md:left-1/2 md:top-3">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl"
                            style={{
                              background: `${item.color}15`,
                              border: `1px solid ${item.color}30`,
                            }}
                          >
                            <Icon size={20} style={{ color: item.color }} />
                          </div>
                        </div>

                        {/* Spacer keeps the alternating column balanced on desktop */}
                        <div className="hidden md:block md:flex-1" />
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

// --------------------------------------------
// Avatar lightbox — enlarges a person's photo on click, with a close button.
// --------------------------------------------
function AvatarLightbox({
  avatar,
  onClose,
}: {
  avatar: { src: string; name: string } | null
  onClose: () => void
}) {
  const open = avatar !== null

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  // Portals target document.body, which doesn't exist during static
  // prerender (SSG). Render nothing server-side; the modal is client-only.
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && avatar && (
        <motion.div
          key="avatar-lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo of ${avatar.name}`}
        >
          <div
            className="absolute inset-0 bg-void/90 backdrop-blur-md"
            onClick={onClose}
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full glass text-text-secondary transition-colors hover:text-text-primary"
          >
            <X size={20} />
          </button>

          <motion.img
            key={avatar.src}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.28, ease: EASE }}
            src={avatar.src}
            alt={avatar.name}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 max-h-[85vh] max-w-[90vw] rounded-2xl object-contain"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
