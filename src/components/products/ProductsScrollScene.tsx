import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { ScrollFrames } from '@/components/ui/ScrollFrames'

// ── Products cinematic scene ─────────────────────────────────────────────────
// A scroll-scrubbed 9:16 frame sequence that bridges the featured carousel and
// the filter bar. Same language as the Beyond scene — frames pinned on the left,
// identity text on the right — only the frame set differs. When the scene's
// bounded scroll finishes, the sticky screen releases and the filter bar below
// scrolls into view.
const FRAME_COUNT = 91
const FRAME_BASE = `${import.meta.env.BASE_URL}ProductsScrollAnimation/`
const frameSrc = (i: number) =>
  `${FRAME_BASE}ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`

export function ProductsScrollScene() {
  // The scene owns a fixed scroll budget; frame scrub maps to its progress.
  const sceneRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start start', 'end end'],
  })

  return (
    <section ref={sceneRef} className="relative h-[185vh] lg:h-[220vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-void">
        {/* Frame panel — left ~46% on desktop, full-bleed backdrop on mobile */}
        <div className="absolute inset-0 lg:right-auto lg:w-[46%]" aria-hidden="true">
          <ScrollFrames
            scrollYProgress={scrollYProgress}
            frameCount={FRAME_COUNT}
            frameSrc={frameSrc}
          />
        </div>
        <SceneOverlay progress={scrollYProgress} />
      </div>
    </section>
  )
}

/** Pinned identity over the scene — right-aligned copy that eases in as the
    frames begin to move and fades back out as the filter bar approaches. */
function SceneOverlay({ progress }: { progress: MotionValue<number> }) {
  const y = useTransform(progress, [0, 1], [0, -50])
  const textOpacity = useTransform(progress, [0, 0.06, 0.22, 0.62, 0.85], [0, 0, 1, 1, 0])
  const cueOpacity = useTransform(progress, [0, 0.05, 0.16, 0.6, 0.8], [0, 0, 0.9, 0.9, 0])

  return (
    <div className="absolute inset-0 z-10 flex items-center pointer-events-none">
      <motion.div
        style={{ y, opacity: textOpacity }}
        className="w-full max-w-6xl mx-auto px-6 lg:px-10 flex justify-center lg:justify-end"
      >
        <div className="max-w-md text-center lg:text-right">
          <span className="typo-label text-magenta/80 mb-4 block">phiUture · Products</span>
          <h2 className="typo-display text-3xl md:text-5xl text-text-primary leading-[1.1]">
            Engineered with care,
            <br />
            <span className="gradient-text">shipped to matter.</span>
          </h2>
          <p className="typo-body text-text-secondary/90 text-base mt-5 leading-relaxed lg:ml-auto max-w-sm">
            Every product starts as a real problem and ends as something people
            reach for daily — intelligence, design and craft in one.
          </p>
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
