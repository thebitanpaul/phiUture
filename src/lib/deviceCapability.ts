import { useEffect } from 'react'
import { useSyncExternalStore } from 'react'

// ── Runtime performance tiers ────────────────────────────────────────────────
// Devices vary enormously in how much of the cinematic scroll experience they
// can render without stuttering or (on memory-tight iPhones) crashing the tab.
// Rather than guess from the model — which we can't read on iOS anyway — we pick
// a conservative starting tier from the signals we *do* have, then let a live
// frame-rate watchdog downgrade any device that still struggles. The tier is a
// global signal every scene subscribes to, so one stuttering scene calms the
// whole page at once.
//
//   full     — desktop / high-memory: native-resolution, every frame.
//   reduced  — capable phones: sampled + downscaled frames, still fully animated.
//   minimal  — weak / memory-tight devices (e.g. iPhone 12 under load) or anyone
//              the watchdog catches janking: no scrubbing canvas at all, just a
//              static backdrop. Cannot crash and never stutters.
export type PerfTier = 'full' | 'reduced' | 'minimal'

const RANK: Record<PerfTier, number> = { minimal: 0, reduced: 1, full: 2 }
const STORAGE_KEY = 'phi-perf-tier'

function readPersisted(): PerfTier | null {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY)
    return v === 'minimal' || v === 'reduced' || v === 'full' ? v : null
  } catch {
    return null
  }
}

function persist(tier: PerfTier) {
  try {
    sessionStorage.setItem(STORAGE_KEY, tier)
  } catch {
    /* private mode / storage disabled — fine, we just re-detect next load */
  }
}

// Set when the tier is pinned via ?perf=… — used to disable the watchdog so a
// forced tier stays put while testing on a real device.
let tierForced = false

function parseTier(v: string | null): PerfTier | null {
  return v === 'full' || v === 'reduced' || v === 'minimal' ? v : null
}

function detectInitialTier(): PerfTier {
  if (typeof window === 'undefined') return 'full'

  // Manual override for testing on a real device, e.g. `?perf=minimal`.
  const forced = parseTier(new URLSearchParams(window.location.search).get('perf'))
  if (forced) {
    tierForced = true
    return forced
  }

  // A downgrade earlier this session wins — don't re-trigger the jank (or risk
  // the crash) that caused it in the first place.
  const persisted = readPersisted()
  if (persisted) return persisted

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'minimal'
  }

  const nav = navigator as Navigator & { deviceMemory?: number }
  const ua = navigator.userAgent
  const iOS =
    /iP(hone|od|ad)/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const mobile =
    window.matchMedia('(max-width: 768px)').matches ||
    iOS ||
    (navigator.maxTouchPoints > 0 && /Mobi|Android/i.test(ua))

  const mem = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : undefined

  // Explicit memory signal — present on Chromium (Android / desktop Chrome),
  // never on Safari/iOS. It's quantized to {0.25,0.5,1,2,4,8} (a 3 GB phone
  // reports 4), so we treat 2 GB as the floor: only genuinely tiny devices
  // (≤2 GB) start static. Every phone above that — including common 3 GB Indian
  // Androids — starts on the animated 'reduced' tier and the FPS watchdog
  // downgrades it only if it actually can't keep up.
  if (mem !== undefined) {
    if (mem <= 2) return 'minimal'
    if (mobile) return 'reduced'
    return mem <= 4 ? 'reduced' : 'full'
  }

  // No memory signal → Safari/iOS (or a very old browser). Phones (incl. every
  // iPhone/iPad) run the lightweight 'reduced' pipeline — downscaled, sampled,
  // lazily-loaded frames — so the great majority get the full animated scenes.
  // The FPS watchdog drops only the devices that genuinely can't cope (a very
  // old iPhone under a fast scroll) to a static backdrop. Desktop Safari on a
  // Mac is not iOS and gets the full show.
  return mobile ? 'reduced' : 'full'
}

let currentTier: PerfTier = detectInitialTier()
const listeners = new Set<() => void>()

export function getPerfTier(): PerfTier {
  return currentTier
}

/** Lower the global tier. Never raises it — degradation is one-way per session. */
export function downgradePerfTier(to: PerfTier) {
  if (RANK[to] < RANK[currentTier]) {
    currentTier = to
    persist(to)
    listeners.forEach((l) => l())
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Subscribe a component to the current tier; re-renders on downgrade. */
export function usePerfTier(): PerfTier {
  return useSyncExternalStore(subscribe, getPerfTier, getPerfTier)
}

/**
 * True when the device advertises plenty of RAM. Chromium caps `deviceMemory`
 * at 8, so this is the top bucket — flagship-class phones. It lets the animated
 * ('reduced') tier use a *denser frame set* for a smoother scrub, WITHOUT
 * raising resolution, so the memory footprint stays in the safe zone. iOS never
 * reports deviceMemory, so iPhones stay on the conservative default (correct —
 * they're the memory-fragile platform). The FPS watchdog is still the backstop.
 */
export function isHighMemoryDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  return typeof mem === 'number' && mem >= 8
}

/**
 * While `active`, measure the real frame rate of the running animation. If the
 * device can't sustain a smooth rate — the signature of hardware near its CPU or
 * memory limit — downgrade the whole page to 'minimal' before it can stutter
 * badly or crash. Self-terminates as soon as it has a verdict, so it costs
 * nothing once a device has proven itself.
 */
export function usePerfWatchdog(active: boolean) {
  useEffect(() => {
    if (!active || tierForced || getPerfTier() === 'minimal') return

    let raf = 0
    let last = 0
    let warmup = 12 // skip the first frames — scene decode/layout spikes them
    let samples = 0
    let slow = 0
    let acc = 0

    const tick = (now: number) => {
      if (last !== 0) {
        const dt = now - last
        if (warmup > 0) {
          warmup--
        } else if (dt > 0 && dt < 400) {
          // Ignore huge gaps (tab hidden, GC): they aren't sustained frame rate.
          acc += dt
          samples++
          if (dt > 34) slow++ // slower than ~29 fps
        }
      }
      last = now

      if (samples >= 90) {
        const avgFps = 1000 / (acc / samples)
        const slowRatio = slow / samples
        // Comfortable devices (incl. iPhone 15 on 'reduced') clear this easily;
        // an overwhelmed one (iPhone 12) trips it and drops to a static backdrop.
        if (avgFps < 40 || slowRatio > 0.35) {
          downgradePerfTier('minimal')
        }
        return // verdict reached — stop watching
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])
}
