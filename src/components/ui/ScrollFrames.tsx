import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { motion, useMotionValueEvent, type MotionValue } from 'framer-motion'
import { useFrameSequence } from '@/hooks/useFrameSequence'
import { usePerfTier, usePerfWatchdog } from '@/lib/deviceCapability'
import {
  cloudFrameSrc,
  localFrameSrc,
  type FrameFolder,
} from '@/lib/animationFrames'

const EASE = [0.16, 1, 0.3, 1] as const
const VOID = '#020203'

// ── Scroll-driven frame sequence (9:16) ──────────────────────────────────────
// A portrait "video" that scrubs with the scroll wheel. As the visitor moves
// through a bounded scroll region, we advance through N stills painted to a
// <canvas>, giving a cinematic backdrop that reacts to every scroll. Shared by
// the Beyond scene and the Products scene — only the frame source differs.
// The heavy lifting (mobile-safe preloading, frame sampling, resolution capping)
// lives in the shared useFrameSequence hook.

interface ScrollFramesProps {
  /** Scroll progress (0→1) of the enclosing section, drives the frame index. */
  scrollYProgress: MotionValue<number>
  /** How many stills make up the sequence. */
  frameCount: number
  /** Frame folder — resolves to Cloudinary (primary) + /public (fallback) URLs. */
  folder: FrameFolder
  /** Optional caption stamped over the scene. */
  label?: string
}

export function ScrollFrames({
  scrollYProgress,
  frameCount,
  folder,
  label = '',
}: ScrollFramesProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Weak / memory-tight devices (and anyone the watchdog catches janking) get a
  // static backdrop instead of the scrubbing canvas — it can't crash or stutter.
  const tier = usePerfTier()
  const minimal = tier === 'minimal'
  // Cloudinary primary + /public fallback, memoized so the loader effect is
  // stable across renders (only rebuilds when the folder or tier changes).
  const frameSrc = useMemo(() => cloudFrameSrc(folder, tier), [folder, tier])
  const fallbackSrc = useMemo(() => localFrameSrc(folder), [folder])
  // Defer loading until the scene is near the viewport, so a page with more than
  // one scene (e.g. Home) never reserves memory for all of them up front.
  const [shouldLoad, setShouldLoad] = useState(false)
  const { framesRef, ready, progress, countRef } = useFrameSequence(
    frameCount,
    frameSrc,
    { start: shouldLoad && !minimal, tier, fallbackSrc }
  )
  // Only fade the canvas in once a real frame has been painted — prevents the
  // brief flash of an unpainted/half-sized canvas during the page transition.
  const [painted, setPainted] = useState(false)
  // Pause the rAF scrub whenever the scene is off-screen, so scrolling the rest
  // of the (long) page never fights a redraw loop it can't even see.
  const [onScreen, setOnScreen] = useState(true)

  // Measure real FPS while this scene animates; downgrade to 'minimal' if the
  // device can't keep up. Runs only on the canvas path, on screen, once loaded.
  usePerfWatchdog(!minimal && onScreen && ready)

  // Smooth-scrub state: `target` follows scroll instantly, `current` eases
  // toward it each frame so fast flicks feel fluid rather than choppy.
  const targetFrame = useRef(0)
  const currentFrame = useRef(0)
  const rafId = useRef<number>()

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const max = countRef.current - 1
    targetFrame.current = Math.min(max, Math.max(0, v * max))
  })

  // Draws one frame to the canvas using "cover" fit + devicePixelRatio scaling.
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current
    const frame = framesRef.current[Math.round(index)]
    if (!canvas || !frame) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cw = canvas.width
    const ch = canvas.height
    const scale = Math.max(cw / frame.w, ch / frame.h)
    const dw = frame.w * scale
    const dh = frame.h * scale
    const dx = (cw - dw) / 2
    const dy = (ch - dh) / 2

    // Paint the backdrop void first (never a transparent/white flash), then
    // overscan the image by a pixel each side so no sub-pixel seam shows at
    // the edges while scrubbing.
    ctx.fillStyle = VOID
    ctx.fillRect(0, 0, cw, ch)
    ctx.drawImage(
      frame.source,
      Math.floor(dx) - 1,
      Math.floor(dy) - 1,
      Math.ceil(dw) + 2,
      Math.ceil(dh) + 2
    )
    setPainted(true)
  }, [framesRef])

  // Size the canvas to its container (with DPR) and repaint on resize.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, tier === 'full' ? 2 : 1.5)
      const { clientWidth, clientHeight } = canvas
      if (clientWidth === 0 || clientHeight === 0) return
      canvas.width = Math.round(clientWidth * dpr)
      canvas.height = Math.round(clientHeight * dpr)
      drawFrame(currentFrame.current)
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [drawFrame, ready, tier])

  // Two observers on the same element, different jobs:
  //  • loader — pre-arms decoding ~1.5 viewports out, then latches on.
  //  • gate   — true visibility, so the rAF scrub only runs when on screen.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    const loader = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          loader.disconnect()
        }
      },
      { threshold: 0, rootMargin: '150% 0px' }
    )
    const gate = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0 }
    )
    loader.observe(el)
    gate.observe(el)
    return () => {
      loader.disconnect()
      gate.disconnect()
    }
  }, [])

  // Continuous rAF loop: eases the displayed frame toward the scroll target.
  useEffect(() => {
    if (!ready || !onScreen || minimal) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const tick = () => {
      const cur = currentFrame.current
      const tgt = targetFrame.current
      // Reduced motion → snap straight to target (no eased interpolation).
      const next = reduce ? tgt : cur + (tgt - cur) * 0.18
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
  }, [ready, onScreen, minimal, drawFrame])

  return (
    <div ref={rootRef} className="relative w-full h-full overflow-hidden bg-void">
      {minimal ? (
        /* Minimal tier — a single static still, no canvas, no rAF, no risk.
           Cloudinary first; swap to the local copy if it fails to load. */
        <img
          src={frameSrc(Math.floor(frameCount / 2))}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const img = e.currentTarget
            if (!img.dataset.fallback) {
              img.dataset.fallback = '1'
              img.src = fallbackSrc(Math.floor(frameCount / 2))
            }
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <>
          {/* The scrubbed frame sequence. The canvas is overscanned 2px beyond
              every edge (root clips it) so its own anti-aliased layer edge falls
              outside the visible area — kills the faint 1px seam that otherwise
              flashes at the top edge during transitions / tab switches. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: ready && painted ? 1 : 0 }}
            transition={{ duration: 1, ease: EASE }}
            className="absolute -inset-[2px]"
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full block"
              // Pin the canvas to its own stable compositing layer — reduces the
              // black-flash iOS Safari can show when a repainting layer inside a
              // sticky container falls behind during fast momentum scroll.
              style={{
                backgroundColor: VOID,
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
              }}
            />
          </motion.div>

          {/* Loader while the opening frames stream in */}
          {!(ready && painted) && (
            <div className="absolute inset-0 flex items-center justify-center">
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
        </>
      )}

      {/* ── Gradient blend layers ──────────────────────────────────────────── */}
      {/* Top & bottom vignette — melts the panel into the page above and below. */}
      <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-void to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-void to-transparent pointer-events-none" />

      {/* Desktop — fade the right edge into the void so the frame bleeds into
          the content column instead of ending on a hard seam. */}
      <div className="hidden lg:block absolute inset-y-0 right-0 w-1/2 bg-gradient-to-r from-transparent to-void pointer-events-none" />
      {/* A touch of left darkening for depth on desktop. */}
      <div className="hidden lg:block absolute inset-y-0 left-0 w-1/4 bg-gradient-to-l from-transparent to-void/70 pointer-events-none" />

      {/* Mobile — the frame IS the page background, so lay a blackish scrim
          over it to keep the content cards and text readable. */}
      <div className="lg:hidden absolute inset-0 bg-gradient-to-b from-void/85 via-void/55 to-void/90 pointer-events-none" />
      <div className="lg:hidden absolute inset-0 bg-void/40 pointer-events-none" />

      {/* Optional corner caption stamped over the scene. */}
      {label && (
        <div className="hidden lg:flex absolute bottom-10 left-8 items-center gap-3 pointer-events-none">
          <span className="w-8 h-px bg-magenta/60" />
          <span className="typo-label text-text-secondary/80 tracking-[0.2em]">
            {label}
          </span>
        </div>
      )}
    </div>
  )
}
