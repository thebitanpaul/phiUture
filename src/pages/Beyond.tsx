import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { BeyondFrames, Gallery } from '@/components/beyond'
import { useRemoteData } from '@/hooks/useRemoteData'
import type { BeyondData, BeyondMedium } from '@/lib/types'
import beyondFallback from '@data/beyond.json'
import type { MotionValue } from 'framer-motion'
import { SEO } from '@/components/seo/SEO'

const EASE = [0.16, 1, 0.3, 1] as const

export default function BeyondPage() {
  const { data } = useRemoteData<BeyondData>('beyond.json', beyondFallback as BeyondData)
  const mediums = data.mediums ?? []

  const [activeId, setActiveId] = useState(
    () => (mediums.find((m) => m.status === 'live') ?? mediums[0])?.id ?? ''
  )

  // The cinematic scene has a fixed height; frame scrub maps to its scroll.
  const sceneRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start start', 'end end'],
  })

  return (
    <PageTransition>
      <SEO
        title="Beyond"
        description="The creative side of phiUture — original music and film, crafted by hand with AI as a collaborator in the room."
        path="/beyond"
      />
      {/* ── Intro hero ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-40 pb-16 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-10 left-1/3 w-[420px] h-[420px] rounded-full opacity-[0.05]"
            style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)', filter: 'blur(90px)' }}
          />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="typo-label text-magenta mb-4 block"
          >
            The Creative Side
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
            className="typo-display text-5xl md:text-7xl text-text-primary"
          >
            Beyond
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
            className="typo-body text-text-secondary text-lg mt-6 max-w-2xl"
          >
            Creative work made at phiUture — music and film today, images on the way —
            crafted first and foremost by hand, with AI as a collaborator along the way.
            Scroll to step inside; the scene moves with you.
          </motion.p>
        </div>
      </section>

      {/* ── Cinematic scene: the frame sequence scrubs across a bounded scroll ── */}
      <section ref={sceneRef} className="relative h-[185vh] lg:h-[220vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-void">
          {/* Frame panel — left ~46% on desktop, full-bleed backdrop on mobile */}
          <div className="absolute inset-0 lg:right-auto lg:w-[46%]" aria-hidden="true">
            <BeyondFrames scrollYProgress={scrollYProgress} label="" />
          </div>
          <SceneOverlay mediums={mediums} progress={scrollYProgress} />
        </div>
      </section>

      {/* ── Scalable gallery: tabs + search + sort + paginated grid ─────────── */}
      <Gallery mediums={mediums} activeId={activeId} onSelect={setActiveId} />
    </PageTransition>
  )
}

/** Pinned identity over the scene. Speaks for the whole showcase — not a single
    medium — and lists every creative track (live bright, upcoming dimmed) so it
    reads as a multi-medium home. No hardcoded counts; it scales with the data. */
function SceneOverlay({
  mediums,
  progress,
}: {
  mediums: BeyondMedium[]
  progress: MotionValue<number>
}) {
  const y = useTransform(progress, [0, 1], [0, -50])
  // Hidden at the very start, then eases in as the frames begin to change with
  // scroll, and fades back out as the gallery approaches.
  const textOpacity = useTransform(progress, [0, 0.06, 0.22, 0.62, 0.85], [0, 0, 1, 1, 0])
  const cueOpacity = useTransform(progress, [0, 0.05, 0.16, 0.6, 0.8], [0, 0, 0.9, 0.9, 0])

  return (
    <div className="absolute inset-0 z-10 flex items-center pointer-events-none">
      <motion.div
        style={{ y, opacity: textOpacity }}
        className="w-full max-w-6xl mx-auto px-6 lg:px-10 flex justify-center lg:justify-end"
      >
        <div className="max-w-md text-center lg:text-right">
          <span className="typo-label text-magenta/80 mb-4 block">phiUture · Beyond</span>
          <h2 className="typo-display text-3xl md:text-5xl text-text-primary leading-[1.1]">
            Crafted with AI,
            <br />
            <span className="gradient-text">not by it.</span>
          </h2>
          <p className="typo-body text-text-secondary/90 text-base mt-5 leading-relaxed lg:ml-auto max-w-sm">
            Original work across every medium — made by hand, with AI as a
            collaborator in the room.
          </p>

          {/* Medium palette — every track, one voice */}
          <div className="flex flex-wrap gap-x-2 gap-y-1.5 mt-6 justify-center lg:justify-end">
            {mediums.map((m, i) => (
              <span key={m.id} className="inline-flex items-center gap-2">
                {i > 0 && <span className="text-text-muted/30">·</span>}
                <span className="typo-label text-text-secondary">{m.label}</span>
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        style={{ opacity: cueOpacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
      >
        <span className="typo-label text-text-muted/60" style={{ fontSize: '10px' }}>
          Scroll to explore
        </span>
        <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
          <ChevronDown size={14} className="text-text-muted/50" />
        </motion.div>
      </motion.div>
    </div>
  )
}
