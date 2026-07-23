import { type MotionValue } from 'framer-motion'
import { ScrollFrames } from '@/components/ui/ScrollFrames'

// ── Beyond cinematic frame sequence ──────────────────────────────────────────
// The Beyond scene's portrait "video" — 121 stills scrubbed by scroll. The
// canvas engine, easing, frame sourcing (Cloudinary + local fallback) and blend
// layers all live in the shared <ScrollFrames>; this just names the frame set.
const FRAME_COUNT = 121

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
      folder="BeyondScrollAnimation"
      label={label}
    />
  )
}
