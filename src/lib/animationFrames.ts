import type { PerfTier } from './deviceCapability'

// ── Animation frame sources ──────────────────────────────────────────────────
// The scroll-scene stills are served primarily from Cloudinary — a global CDN
// that also transcodes to modern formats (AVIF/WebP) and resizes on the fly, so
// each device downloads a fraction of the bytes of the original 1080×1920 JPEG.
// The copies bundled in /public are kept as an automatic fallback: if a
// Cloudinary frame ever fails to load, the loader retries the same frame from
// our own origin (see useFrameSequence), so the animation degrades gracefully
// instead of breaking.

const CLOUD_BASE = 'https://res.cloudinary.com/b0tb1mho/image/upload'
const CLOUD_DIR = 'phiUture/Animations'

// Folder names — identical on Cloudinary and in /public, so one string drives
// both the primary and the fallback URL.
export type FrameFolder =
  | 'HeroScrollAnimation'
  | 'HomeScrollAnimation'
  | 'ProductsScrollAnimation'
  | 'BeyondScrollAnimation'

function fileName(index: number): string {
  return `ezgif-frame-${String(index + 1).padStart(3, '0')}.jpg`
}

// Cloudinary delivery transform per tier. `f_auto` (AVIF/WebP where supported)
// and `q_auto` (perceptual quality) apply everywhere; the lean tiers add a hard
// `c_limit` size cap so phones fetch tiny frames straight from the CDN rather
// than downloading the full-size still and shrinking it on the device.
function transformFor(tier: PerfTier): string {
  switch (tier) {
    case 'reduced':
      return 'f_auto,q_auto,c_limit,w_720,h_720'
    case 'minimal':
      return 'f_auto,q_auto,c_limit,w_1080,h_1080'
    case 'full':
    default:
      return 'f_auto,q_auto'
  }
}

/** Primary source builder — Cloudinary, format-optimized and sized to the tier. */
export function cloudFrameSrc(folder: FrameFolder, tier: PerfTier) {
  const transform = transformFor(tier)
  return (index: number) =>
    `${CLOUD_BASE}/${transform}/${CLOUD_DIR}/${folder}/${fileName(index)}`
}

/** Fallback source builder — the frames bundled in /public, served by our origin. */
export function localFrameSrc(folder: FrameFolder) {
  const base = import.meta.env.BASE_URL
  return (index: number) => `${base}${folder}/${fileName(index)}`
}
