import { type MotionValue } from 'framer-motion'
import { ScrollFrames } from '@/components/ui/ScrollFrames'

// ── Beyond cinematic frame sequence ──────────────────────────────────────────
// The Beyond scene's portrait "video" — 121 stills scrubbed by scroll. The
// canvas engine, easing and blend layers live in the shared <ScrollFrames>;
// this just points it at the Beyond frame set.
const FRAME_COUNT = 121
const FRAME_BASE = `${import.meta.env.BASE_URL}BeyondScrollAnimation/`
const frameSrc = (i: number) =>
  `${FRAME_BASE}ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`

interface BeyondFramesProps {
  /** Scroll progress (0→1) of the experience section, drives the frame index. */
  scrollYProgress: MotionValue<number>
  /** Label of the medium currently in view, stamped over the scene. */
  label: string
}

export function BeyondFrames({ scrollYProgress, label }: BeyondFramesProps) {
  return (
    <ScrollFrames
      scrollYProgress={scrollYProgress}
      frameCount={FRAME_COUNT}
      frameSrc={frameSrc}
      label={label}
    />
  )
}
