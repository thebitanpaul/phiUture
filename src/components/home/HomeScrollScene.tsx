import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { ChevronDown, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ScrollFrames } from '@/components/ui/ScrollFrames'

// ── Home cinematic scene ─────────────────────────────────────────────────────
// A scroll-scrubbed 9:16 frame sequence that anchors the middle of the home
// page — the same language as the Products and Beyond scenes, only the frame
// set and the copy differ. Frames pinned to the left on desktop, brand identity
// on the right. When the scene's bounded scroll finishes, the sticky screen
// releases and the sections below scroll into view.
const FRAME_COUNT = 117

export function HomeScrollScene() {
  // The scene owns a fixed scroll budget; frame scrub maps to its progress.
  const sceneRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start start', 'end end'],
  })

  return (
    <section ref={sceneRef} className="relative h-[200vh] lg:h-[240vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-void">
        {/* Frame panel — left ~48% on desktop, full-bleed backdrop on mobile */}
        <div className="absolute inset-0 lg:right-auto lg:w-[48%]" aria-hidden="true">
          <ScrollFrames
            scrollYProgress={scrollYProgress}
            frameCount={FRAME_COUNT}
            folder="HomeScrollAnimation"
          />
        </div>
        <SceneOverlay progress={scrollYProgress} />
      </div>
    </section>
  )
}

/** Pinned brand identity over the scene — right-aligned copy that eases in as
    the frames begin to move and fades back out as the next section approaches.
    Speaks for the whole studio: engineering on one side, artistry on the other. */
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
        <div className="max-w-md text-center lg:text-right pointer-events-auto">
          <span className="typo-label text-magenta/80 mb-4 block">phiUture · The Studio</span>
          <h2 className="typo-display text-3xl md:text-5xl text-text-primary leading-[1.1]">
            Where precision
            <br />
            <span className="gradient-text">meets imagination.</span>
          </h2>
          <p className="typo-body text-text-secondary/90 text-base mt-5 leading-relaxed lg:ml-auto max-w-sm">
            One studio, two worlds — software engineered to the last detail, and
            creative work made by hand. Both shaped by the same pursuit of the
            golden ratio.
          </p>

          {/* Twin doorways into the two sides of the work */}
          <div className="flex flex-wrap gap-3 mt-7 justify-center lg:justify-end">
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-magenta to-violet text-white text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-magenta/25 hover:scale-[1.03] active:scale-[0.97]"
            >
              Products
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/beyond"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass text-sm font-medium text-text-secondary hover:text-text-primary transition-all duration-300"
            >
              Beyond
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
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
