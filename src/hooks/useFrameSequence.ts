import { useEffect, useRef, useState } from 'react'

// A single decoded still, normalised so the canvas can paint an <img> or a
// downscaled ImageBitmap through the same path.
export type Frame = { source: CanvasImageSource; w: number; h: number }

// On phones we sample the sequence down to at most this many stills. The eased
// rAF scrub interpolates between them, so the motion still reads smooth while
// the image memory (the thing that makes mobile browsers reload the tab) drops
// by 2–3×.
const MOBILE_MAX_FRAMES = 48

/**
 * Preloads a scroll-scrubbed frame sequence for a <canvas> scene.
 *
 * Naively preloading a hundred-odd 1080×1920 stills — all requests fired at
 * once, every frame decoded at full size — reliably stalls and then reloads a
 * mobile tab. Three things keep it safe here:
 *
 *  1. Frame sampling — small screens load only every Nth still (a stride),
 *     capping the sequence at ~MOBILE_MAX_FRAMES.
 *  2. Resolution capping — on mobile each still is decoded (via createImageBitmap)
 *     down to roughly the device's own pixel budget instead of its native 1080×1920,
 *     cutting the per-frame memory well over half. Falls back to the raw <img>
 *     wherever createImageBitmap is unavailable.
 *  3. Bounded, in-order loading — only a few requests are ever in flight, and the
 *     opening frames come first, so scrubbing can begin almost immediately instead
 *     of waiting behind a burst of a hundred parallel downloads.
 *
 * `countRef.current` is the *effective* frame count (after sampling); callers map
 * scroll progress onto it. `framesRef.current` holds the frames in playback order.
 */
export function useFrameSequence(
  frameCount: number,
  frameSrc: (i: number) => string,
  readyThreshold = 8
) {
  const framesRef = useRef<Frame[]>([])
  const countRef = useRef(frameCount)
  const [ready, setReady] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let cancelled = false

    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2)

    const stride = isMobile
      ? Math.max(1, Math.ceil(frameCount / MOBILE_MAX_FRAMES))
      : 1
    const effective = Math.ceil(frameCount / stride)
    const srcIndex = (i: number) => Math.min(frameCount - 1, i * stride)

    // Longest edge we ever need on screen (portrait or landscape). 0 → keep the
    // native resolution (desktop, where memory is not the constraint).
    const maxDecodeEdge = isMobile
      ? Math.ceil(Math.max(window.innerWidth, window.innerHeight) * dpr)
      : 0
    const canBitmap = typeof createImageBitmap === 'function'

    countRef.current = effective
    setReady(false)
    setProgress(0)

    const frames: Frame[] = new Array(effective)
    framesRef.current = frames
    const bitmaps: ImageBitmap[] = []

    let loaded = 0
    let next = 0
    const concurrency = Math.min(isMobile ? 4 : 8, effective)

    const advance = () => {
      loaded++
      setProgress(loaded / effective)
      if (loaded >= Math.min(readyThreshold, effective)) setReady(true)
      startNext()
    }

    const store = (i: number, frame: Frame) => {
      if (cancelled) return
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
        const nw = img.naturalWidth
        const nh = img.naturalHeight
        const longest = Math.max(nw, nh)

        // Downscale the decoded bitmap to the device budget where it helps.
        if (canBitmap && maxDecodeEdge > 0 && longest > maxDecodeEdge) {
          const factor = maxDecodeEdge / longest
          const rw = Math.max(1, Math.round(nw * factor))
          const rh = Math.max(1, Math.round(nh * factor))
          createImageBitmap(img, {
            resizeWidth: rw,
            resizeHeight: rh,
            resizeQuality: 'medium',
          })
            .then((bmp) => {
              if (cancelled) {
                bmp.close()
                return
              }
              bitmaps.push(bmp)
              store(i, { source: bmp, w: rw, h: rh })
            })
            .catch(() => store(i, { source: img, w: nw, h: nh }))
        } else {
          store(i, { source: img, w: nw, h: nh })
        }
      }
      // A broken frame shouldn't stall the pipeline — skip it and keep going.
      img.onerror = () => {
        if (cancelled) return
        advance()
      }
    }

    for (let c = 0; c < concurrency; c++) startNext()

    return () => {
      cancelled = true
      for (const b of bitmaps) b.close()
    }
  }, [frameCount, frameSrc, readyThreshold])

  return { framesRef, ready, progress, countRef }
}
