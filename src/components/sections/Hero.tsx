import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { ChevronDown, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PhiLogo } from '@/components/ui/PhiLogo'

const EASE = [0.16, 1, 0.3, 1] as const

// ── Scroll-driven frame sequence ─────────────────────────────────────────────
// The hero plays like a video that scrubs with the scroll wheel. As the user
// scrolls through the tall (pinned) hero section, we advance through 135 stills
// drawn to a full-bleed <canvas>, giving a smooth cinematic "scene" that reacts
// to every scroll — inspired by jeskojets.com.
const FRAME_COUNT = 135
const FRAME_BASE = `${import.meta.env.BASE_URL}scroll-frames/`
const frameSrc = (i: number) =>
  `${FRAME_BASE}ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`

// Preloads every frame, reporting progress so we can show a tasteful loader and
// only reveal the scene once enough frames exist to scrub without gaps.
function useFrameSequence() {
  const framesRef = useRef<HTMLImageElement[]>([])
  const [ready, setReady] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let cancelled = false
    let loaded = 0
    const images: HTMLImageElement[] = new Array(FRAME_COUNT)

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image()
      img.decoding = 'async'
      img.src = frameSrc(i)
      img.onload = img.onerror = () => {
        if (cancelled) return
        loaded++
        setProgress(loaded / FRAME_COUNT)
        // Reveal as soon as the opening frames are in — the rest stream in.
        if (loaded >= Math.min(12, FRAME_COUNT)) setReady(true)
      }
      images[i] = img
    }
    framesRef.current = images

    return () => {
      cancelled = true
    }
  }, [])

  return { framesRef, ready, progress }
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { framesRef, ready, progress } = useFrameSequence()

  // Smooth-scrub state: `target` follows scroll instantly, `current` eases
  // toward it each frame so fast flicks feel fluid rather than choppy.
  const targetFrame = useRef(0)
  const currentFrame = useRef(0)
  const rafId = useRef<number>()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // Map scroll (0→1) to a frame index.
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    targetFrame.current = Math.min(
      FRAME_COUNT - 1,
      Math.max(0, v * (FRAME_COUNT - 1))
    )
  })

  // Draws one frame to the canvas using "cover" fit + devicePixelRatio scaling.
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current
    const img = framesRef.current[Math.round(index)]
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cw = canvas.width
    const ch = canvas.height
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
    const dw = img.naturalWidth * scale
    const dh = img.naturalHeight * scale
    const dx = (cw - dw) / 2
    const dy = (ch - dh) / 2

    ctx.clearRect(0, 0, cw, ch)
    ctx.drawImage(img, dx, dy, dw, dh)
  }, [framesRef])

  // Size the canvas to its container (with DPR) and repaint on resize.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { clientWidth, clientHeight } = canvas
      canvas.width = Math.round(clientWidth * dpr)
      canvas.height = Math.round(clientHeight * dpr)
      drawFrame(currentFrame.current)
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [drawFrame, ready])

  // Continuous rAF loop: eases the displayed frame toward the scroll target.
  useEffect(() => {
    if (!ready) return

    const tick = () => {
      const cur = currentFrame.current
      const tgt = targetFrame.current
      const next = cur + (tgt - cur) * 0.18
      // Snap when close enough to stop needless repaints.
      currentFrame.current = Math.abs(tgt - next) < 0.05 ? tgt : next
      if (Math.round(currentFrame.current) !== Math.round(cur) || cur === 0) {
        drawFrame(currentFrame.current)
      }
      rafId.current = requestAnimationFrame(tick)
    }
    rafId.current = requestAnimationFrame(tick)
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [ready, drawFrame])

  // ── Scroll-synced overlay captions (fade in/out at scroll checkpoints) ──────
  // Scene 1 — opening headline, top-left. Fades out early as you scroll in.
  const heroOpacity = useTransform(scrollYProgress, [0, 0.14], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.14], [0, -60])
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0])

  // Scene 2 — "The Golden Ratio", middle-right.
  const scene1Opacity = useTransform(
    scrollYProgress,
    [0.22, 0.33, 0.46, 0.56],
    [0, 1, 1, 0]
  )
  // Scene 3 — "Centered on you", bottom-left.
  const scene2Opacity = useTransform(
    scrollYProgress,
    [0.6, 0.71, 0.85, 0.95],
    [0, 1, 1, 0]
  )

  // Pinned CTAs — stay anchored through the whole scrub, then disappear right
  // before the philosophy section begins.
  const ctaOpacity = useTransform(scrollYProgress, [0, 0.82, 0.96], [1, 1, 0])
  const ctaY = useTransform(scrollYProgress, [0.82, 0.96], [0, 24])

  return (
    <section ref={sectionRef} className="relative w-full h-[400vh]">
      {/* ── Pinned viewport ── */}
      <div className="sticky top-0 h-screen overflow-hidden bg-void">

        {/* Layer 0 — the scroll-scrubbed frame sequence */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 1, ease: EASE }}
          className="absolute inset-0"
          style={{ zIndex: 0 }}
        >
          <canvas ref={canvasRef} className="w-full h-full block" />
        </motion.div>

        {/* Loading indicator while the opening frames stream in */}
        {!ready && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ zIndex: 1 }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-40 h-px bg-border-light overflow-hidden rounded-full">
                <div
                  className="h-full bg-gradient-to-r from-magenta to-violet transition-[width] duration-300"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <span className="typo-label text-text-muted/60" style={{ fontSize: '10px' }}>
                Loading experience
              </span>
            </div>
          </div>
        )}

        {/* Layer 1 — Gradient overlays for depth & text readability */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          <div
            className="absolute inset-y-0 left-0 w-[70%]"
            style={{
              background:
                'linear-gradient(to right, rgba(2,2,3,0.92) 0%, rgba(2,2,3,0.5) 45%, transparent 100%)',
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-[28%]"
            style={{ background: 'linear-gradient(to top, #020203 12%, transparent)' }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-[18%]"
            style={{ background: 'linear-gradient(to bottom, rgba(2,2,3,0.6), transparent)' }}
          />
        </div>

        {/* Scene 1 — Opening hero text: TOP-LEFT */}
        <div
          className="absolute inset-0 flex items-start pointer-events-none"
          style={{ zIndex: 2 }}
        >
          <motion.div
            style={{ opacity: heroOpacity, y: heroY }}
            className="w-full max-w-6xl ml-0 mr-auto px-6 md:px-10 pt-46 md:pt-50"
          >
            <div className="max-w-xl text-left">
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
                className="typo-label text-magenta/70 mb-4 block"
              >
                Welcome to
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
                className="hero-heading text-text-primary"
              >
                phi<span className="gradient-text">U</span>ture
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
                className="typo-body text-text-secondary/90 text-base md:text-lg mt-5 max-w-md leading-relaxed"
              >
                Beautifully engineered technology, crafted for you, shaping the future.
              </motion.p>
            </div>
          </motion.div>
        </div>

        {/* Scene 2 — "The Golden Ratio": MIDDLE-RIGHT */}
        <motion.div
          style={{ opacity: scene1Opacity, zIndex: 2 }}
          className="absolute inset-0 flex items-center justify-end pointer-events-none px-6 md:px-10"
        >
          <div className="text-right max-w-md md:max-w-lg">
            <span className="typo-label text-magenta/80 mb-5 block">The Golden Ratio</span>
            <h2 className="typo-display text-4xl md:text-6xl text-text-primary">
              <PhiLogo alt="phi" className="text-4xl md:text-6xl" /> is for perfection.
            </h2>
            <p className="typo-body text-text-secondary text-lg mt-6 ml-auto max-w-sm">
              Every detail balanced, harmonious, and built to evolve.
            </p>
          </div>
        </motion.div>

        {/* Scene 3 — "Centered on you": BOTTOM-LEFT */}
        <motion.div
          style={{ opacity: scene2Opacity, zIndex: 2 }}
          className="absolute inset-0 flex items-end justify-start pointer-events-none px-6 md:px-10 pb-32 md:pb-36"
        >
          <div className="text-left max-w-md md:max-w-lg">
            <span className="typo-label text-violet/80 mb-5 block">Centered on you</span>
            <h2 className="typo-display text-4xl md:text-6xl text-text-primary">
              <span className="gradient-text">U</span> is for you.
            </h2>
            <p className="typo-body text-text-secondary text-lg mt-6 max-w-sm">
              Technology shaped around people — the reason we build.
            </p>
          </div>
        </motion.div>

        {/* Pinned CTAs — anchored bottom-center through the whole scrub */}
        <motion.div
          style={{ opacity: ctaOpacity, y: ctaY, zIndex: 3 }}
          className="absolute bottom-14 md:bottom-18 left-1/2 -translate-x-1/2 flex flex-col sm:flex-row items-center gap-3.5 pointer-events-auto"
        >
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-magenta to-violet text-white font-medium text-sm tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-magenta/25 hover:scale-[1.03] active:scale-[0.97]"
          >
            Explore Products
            <ArrowRight size={15} />
          </Link>
          <a
            href="#explore"
            className="px-7 py-3 rounded-full glass text-text-secondary font-medium text-sm tracking-wide transition-all duration-300 hover:text-text-primary"
          >
            Learn More
          </a>
        </motion.div>

        {/* Layer 2 — Scroll indicator */}
        <motion.div
          style={{ zIndex: 2, opacity: scrollHintOpacity }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="flex flex-col items-center gap-2"
          >
            <span
              className="typo-label text-text-muted/60"
              style={{ fontSize: '10px', letterSpacing: '0.15em' }}
            >
              Scroll
            </span>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown size={14} className="text-text-muted/50" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
