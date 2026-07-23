import { useEffect, useRef, useState } from 'react'
import type { PerfTier } from '@/lib/deviceCapability'

// A single decoded still, normalised so the canvas can paint an <img>, a
// downscaled ImageBitmap, or a downscaled <canvas> through the same path.
export type Frame = { source: CanvasImageSource; w: number; h: number }

// ── Lean ('reduced') budgets ─────────────────────────────────────────────────
// The scenes are 1080×1920 stills (~8 MB each once decoded). On a phone a full
// sequence is hundreds of MB and the home page mounts two — enough to blow past
// a memory-tight iPhone's tab budget and get the process killed ("Can't open
// this page"). On the reduced tier we clamp frame COUNT and frame SIZE hard;
// the scene sits full-bleed behind a heavy scrim, so the lost sharpness is
// invisible while the memory saving is ~8×.
const REDUCED_MAX_FRAMES = 40
const REDUCED_MAX_EDGE = 640

interface FrameSequenceOptions {
  /** How many frames must be in before the scene reveals (default 8). */
  readyThreshold?: number
  /** Gate: only start downloading/decoding when true (default true). */
  start?: boolean
  /** Performance tier — drives sampling and resolution. */
  tier?: PerfTier
}

const hasImageBitmap = typeof ImageBitmap !== 'undefined'

/**
 * Downscale a decoded image to `maxEdge` on its long side.
 *
 * We draw into a 2D <canvas> rather than lean on `createImageBitmap`'s resize
 * options — those are silently ignored by older iOS Safari, which then keeps the
 * full 1080×1920 decode resident. Canvas drawImage honours the target size on
 * every browser. The result is returned as an ImageBitmap where available (cheap,
 * GPU-resident), else the small canvas itself; either way the full-size source
 * <img> is unreferenced afterwards and freed.
 */
function makeFrame(img: HTMLImageElement, maxEdge: number): Frame | Promise<Frame> {
  const nw = img.naturalWidth
  const nh = img.naturalHeight
  const longest = Math.max(nw, nh)
  if (maxEdge <= 0 || longest <= maxEdge) {
    return { source: img, w: nw, h: nh }
  }

  const factor = maxEdge / longest
  const w = Math.max(1, Math.round(nw * factor))
  const h = Math.max(1, Math.round(nh * factor))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const cx = canvas.getContext('2d')
  if (!cx) return { source: img, w: nw, h: nh }
  cx.drawImage(img, 0, 0, w, h)

  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(canvas)
      .then((bmp) => ({ source: bmp as CanvasImageSource, w, h }))
      .catch(() => ({ source: canvas, w, h }))
  }
  return { source: canvas, w, h }
}

/**
 * Preloads a scroll-scrubbed frame sequence for a <canvas> scene, tuned to the
 * device performance tier. `full` keeps native resolution and every frame;
 * anything else runs the lean budget above. The `minimal` tier never loads —
 * its scene renders a single static backdrop instead (see ScrollFrames/Hero).
 *
 * `countRef.current` is the *effective* frame count (after sampling); callers map
 * scroll progress onto it. `framesRef.current` holds the frames in playback order.
 */
export function useFrameSequence(
  frameCount: number,
  frameSrc: (i: number) => string,
  { readyThreshold = 8, start = true, tier = 'full' }: FrameSequenceOptions = {}
) {
  const framesRef = useRef<Frame[]>([])
  const countRef = useRef(frameCount)
  const [ready, setReady] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!start || tier === 'minimal') return
    let cancelled = false

    const lean = tier !== 'full'
    const stride = lean
      ? Math.max(1, Math.ceil(frameCount / REDUCED_MAX_FRAMES))
      : 1
    const effective = Math.ceil(frameCount / stride)
    const srcIndex = (i: number) => Math.min(frameCount - 1, i * stride)
    const maxEdge = lean ? REDUCED_MAX_EDGE : 0
    // Keep few decodes in flight — on iOS a burst of parallel full-size decodes
    // spikes memory hard even when the retained result is small.
    const concurrency = Math.min(lean ? 3 : 8, effective)

    countRef.current = effective
    setReady(false)
    setProgress(0)

    const frames: Frame[] = new Array(effective)
    framesRef.current = frames
    const bitmaps: ImageBitmap[] = []

    let loaded = 0
    let next = 0

    const advance = () => {
      loaded++
      setProgress(loaded / effective)
      if (loaded >= Math.min(readyThreshold, effective)) setReady(true)
      startNext()
    }

    const store = (i: number, frame: Frame) => {
      if (cancelled) {
        if (hasImageBitmap && frame.source instanceof ImageBitmap) frame.source.close()
        return
      }
      if (hasImageBitmap && frame.source instanceof ImageBitmap) bitmaps.push(frame.source)
      frames[i] = frame
      advance()
    }

    const startNext = () => {
      if (cancelled) return
      const i = next++
      if (i >= effective) return

      const img = new Image()
      img.decoding = 'async'
      img.src = frameSrc(srcIndex(i))

      img.onload = () => {
        if (cancelled) return
        const result = makeFrame(img, maxEdge)
        if (result instanceof Promise) result.then((f) => store(i, f))
        else store(i, result)
      }
      // A broken frame shouldn't stall the pipeline — skip it and keep going.
      img.onerror = () => {
        if (!cancelled) advance()
      }
    }

    for (let c = 0; c < concurrency; c++) startNext()

    return () => {
      cancelled = true
      // Release GPU/decoded memory on unmount (or tier change) so it doesn't
      // linger across route changes or after a downgrade.
      for (const b of bitmaps) b.close()
      framesRef.current = []
    }
  }, [frameCount, frameSrc, readyThreshold, start, tier])

  return { framesRef, ready, progress, countRef }
}
