import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, ChevronLeft, ChevronRight, Ratio, Rocket, User } from 'lucide-react'
import { PhiMark } from '@/components/ui/PhiMark'

// ============================================
// PhilosophyBook — the meaning of phiUture told
// as a small book the visitor flips through.
// Cover → φ → U → future, one chapter per page.
// ============================================

type BookPage =
  | {
      kind: 'cover'
      kicker: string
      title: string
      subtitle: string
    }
  | {
      kind: 'chapter'
      numeral: string
      chapter: string
      symbol: string
      icon: typeof Ratio
      title: string
      lede: string
      body: string
      pull: string
      color: string
    }

const PAGES: BookPage[] = [
  {
    kind: 'cover',
    kicker: 'A short book on the name',
    title: 'The phiUture Story',
    subtitle:
      'Three ideas hide inside one word — beauty in engineering, the customer at the centre, and eyes fixed on the horizon. Turn the page.',
  },
  {
    kind: 'chapter',
    numeral: 'I',
    chapter: 'Chapter One',
    symbol: 'φ',
    icon: Ratio,
    title: 'The Golden Ratio',
    lede: 'Beauty is not decoration. It is structure.',
    body: 'Phi — roughly 1.618 — is the proportion nature keeps returning to: the spiral of a galaxy, the curl of a fern, the geometry of a human face. For millennia it has meant balance and harmony. We treat it as an engineering brief. Every product should feel as considered as it is capable — precise underneath, effortless on the surface.',
    pull: 'Balance is engineered, never accidental.',
    color: '#d946ef',
  },
  {
    kind: 'chapter',
    numeral: 'II',
    chapter: 'Chapter Two',
    symbol: 'U',
    icon: User,
    title: 'You, at the Centre',
    lede: 'The letter U is you — the person on the other side of the screen.',
    body: 'Every interface, workflow, and model begins with a single question: does this respect the human using it? Technology should bend toward people — adapting to how they already think and work — never the other way around. Decisions are measured by whether they give you back time, clarity, and control.',
    pull: 'Software should adapt to people, not the reverse.',
    color: '#a855f7',
  },
  {
    kind: 'chapter',
    numeral: 'III',
    chapter: 'Chapter Three',
    symbol: 'future',
    icon: Rocket,
    title: 'Building Tomorrow',
    lede: 'The future is not a place we arrive at. It is something we assemble.',
    body: 'Decision by decision, phiUture builds the tools that make what comes next feel ordinary — AI that genuinely assists, automation that removes the busywork, and design that earns trust before it asks for it. We aim to ship today what most people only expect to see tomorrow.',
    pull: 'Ship tomorrow, today.',
    color: '#7c3aed',
  },
]

const flip = {
  enter: (dir: number) => ({
    rotateY: dir > 0 ? 18 : -18,
    x: dir > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    rotateY: 0,
    x: 0,
    opacity: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (dir: number) => ({
    rotateY: dir > 0 ? -18 : 18,
    x: dir > 0 ? -80 : 80,
    opacity: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 1, 1] },
  }),
}

export function PhilosophyBook() {
  const [[page, dir], setPage] = useState<[number, number]>([0, 0])
  const total = PAGES.length

  const paginate = useCallback(
    (next: number) => {
      setPage(([current]) => {
        const target = Math.min(Math.max(current + next, 0), total - 1)
        if (target === current) return [current, 0]
        return [target, next]
      })
    },
    [total]
  )

  const goTo = (index: number) =>
    setPage(([current]) => [index, index > current ? 1 : -1])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') paginate(1)
      if (e.key === 'ArrowLeft') paginate(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [paginate])

  const current = PAGES[page]
  const accent = current.kind === 'chapter' ? current.color : '#d946ef'

  return (
    <div className="max-w-5xl mx-auto">
      {/* Book */}
      <div className="relative" style={{ perspective: '2200px' }}>
        {/* Stacked page-edge illusion behind the book */}
        <div className="absolute inset-x-6 -bottom-2 h-6 rounded-b-3xl bg-white/[0.02] blur-sm" />
        <div className="absolute inset-x-3 -bottom-1 h-6 rounded-b-3xl bg-white/[0.03]" />

        <div
          className="relative glass-strong rounded-3xl overflow-hidden"
          style={{
            boxShadow:
              '0 40px 120px -30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Top spine bar with a running accent */}
          <div className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <BookOpen size={16} style={{ color: accent }} />
              <span className="typo-label text-text-muted">
                The Philosophy of phiUture
              </span>
            </div>
            <span className="font-mono text-xs text-text-muted tabular-nums">
              {String(page + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          </div>

          {/* Center spine — only on the two-panel (chapter) spread */}
          {current.kind === 'chapter' && (
            <div className="hidden md:block absolute top-[57px] bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent z-20 pointer-events-none" />
          )}

          {/* Stage grows with the page's natural height (min-h is only a floor)
              so the tall single-column mobile chapter spread is never clipped by
              the card's overflow-hidden. mode="wait" keeps one page mounted at a
              time, so the animating page can flow instead of being absolute. */}
          <div className="relative min-h-[420px] md:min-h-[440px]">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={page}
                custom={dir}
                variants={flip}
                initial="enter"
                animate="center"
                exit="exit"
                style={{ transformOrigin: dir > 0 ? 'left center' : 'right center' }}
                className="w-full"
              >
                {current.kind === 'cover' ? (
                  <CoverSpread page={current} />
                ) : (
                  <ChapterSpread page={current} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-8">
        <BookButton
          direction="prev"
          disabled={page === 0}
          onClick={() => paginate(-1)}
        />

        <div className="flex items-center gap-2.5">
          {PAGES.map((p, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to page ${i + 1}`}
              className="group relative py-2"
            >
              <span
                className="block h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === page ? 28 : 8,
                  background:
                    i === page
                      ? p.kind === 'chapter'
                        ? p.color
                        : '#d946ef'
                      : 'rgba(255,255,255,0.15)',
                }}
              />
            </button>
          ))}
        </div>

        <BookButton
          direction="next"
          disabled={page === total - 1}
          onClick={() => paginate(1)}
        />
      </div>
    </div>
  )
}

function BookButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'prev' | 'next'
  disabled: boolean
  onClick: () => void
}) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2.5 rounded-full glass text-sm typo-body text-text-secondary transition-all duration-300 hover:text-text-primary hover:border-white/20 disabled:opacity-25 disabled:pointer-events-none"
    >
      {direction === 'prev' && <Icon size={16} />}
      <span className="hidden sm:inline">
        {direction === 'prev' ? 'Previous' : 'Next'}
      </span>
      {direction === 'next' && <Icon size={16} />}
    </button>
  )
}

function CoverSpread({ page }: { page: Extract<BookPage, { kind: 'cover' }> }) {
  return (
    <div className="relative flex min-h-[420px] flex-col items-center justify-center px-8 py-14 text-center md:min-h-[440px]">
      <div
        className="absolute inset-0 opacity-[0.5] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(217,70,239,0.10), transparent 60%)',
        }}
      />
      <div className="relative z-10 max-w-xl">
        <div className="text-7xl md:text-8xl mb-8 leading-none">
          <PhiMark />
        </div>
        <span className="typo-label text-magenta mb-4 block">{page.kicker}</span>
        <h3 className="typo-display text-3xl md:text-5xl text-text-primary mb-6">
          {page.title}
        </h3>
        <p className="typo-body text-text-secondary text-base md:text-lg leading-relaxed">
          {page.subtitle}
        </p>
        <div className="mt-8 flex items-center justify-center gap-2 text-text-muted">
          <span className="h-px w-8 bg-border-light" />
          <span className="typo-label text-[0.65rem]">Turn the page</span>
          <span className="h-px w-8 bg-border-light" />
        </div>
      </div>
    </div>
  )
}

function ChapterSpread({
  page,
}: {
  page: Extract<BookPage, { kind: 'chapter' }>
}) {
  const Icon = page.icon
  return (
    <div className="grid min-h-[420px] md:min-h-[440px] md:grid-cols-2">
      {/* Left leaf — the symbol */}
      <div className="relative flex flex-col items-center justify-center px-8 py-12 md:py-14 border-b md:border-b-0 border-white/[0.06]">
        <div
          className="absolute inset-0 opacity-[0.6] pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 45%, ${page.color}18, transparent 62%)`,
          }}
        />
        <div className="relative z-10 flex flex-col items-center">
          <span
            className="typo-label text-[0.65rem] mb-6 px-3 py-1 rounded-full"
            style={{
              color: page.color,
              background: `${page.color}12`,
              border: `1px solid ${page.color}25`,
            }}
          >
            {page.chapter}
          </span>
          <div
            className="typo-display leading-none mb-6"
            style={{
              fontSize: page.symbol.length > 1 ? '3.5rem' : '7rem',
              color: page.color,
              textShadow: `0 8px 50px ${page.color}55`,
            }}
          >
            {page.symbol === 'φ' ? (
              <PhiMark
                gradient={false}
                title="phi"
                style={{ filter: `drop-shadow(0 8px 50px ${page.color}55)` }}
              />
            ) : (
              page.symbol
            )}
          </div>
          <Icon size={22} style={{ color: page.color }} strokeWidth={1.5} />
        </div>
        {/* Roman-numeral watermark */}
        <span className="absolute bottom-5 left-6 typo-display text-4xl text-white/[0.04]">
          {page.numeral}
        </span>
      </div>

      {/* Right leaf — the story */}
      <div className="relative flex flex-col justify-center px-8 md:px-10 py-12 md:py-14">
        <h3 className="typo-section text-2xl md:text-3xl text-text-primary mb-4">
          {page.title}
        </h3>
        <p
          className="typo-body text-base md:text-lg mb-5 leading-snug"
          style={{ color: page.color }}
        >
          {page.lede}
        </p>
        <p className="typo-body text-text-secondary text-sm md:text-[0.95rem] leading-relaxed mb-6">
          {page.body}
        </p>
        <blockquote
          className="pl-4 typo-section text-text-primary text-base md:text-lg italic"
          style={{ borderLeft: `2px solid ${page.color}` }}
        >
          “{page.pull}”
        </blockquote>
      </div>
    </div>
  )
}
