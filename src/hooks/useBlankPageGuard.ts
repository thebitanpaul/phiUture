import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { useLocation } from 'react-router-dom'

// ============================================
// Blank-page guard — last line of defence for "the page went black"
// --------------------------------------------
// The known cause of a blank page on this site was framer-motion's
// <AnimatePresence mode="wait"> withholding the incoming page forever when the
// outgoing one never reported its exit finished; that mechanism is gone (see
// Layout / PageTransition). This guard covers the ones we cannot see from here —
// a paused animation frame loop after a tab switch, a compositing layer WebKit
// threw away, a render that stalled for a reason that only reproduces on one
// device. All of them look identical to the visitor: chrome still there, page
// area empty, nothing but a manual reload brings it back.
//
// So instead of chasing the cause, this watches the outcome. If the page area is
// empty a moment after a navigation (or after the tab is brought back), it heals
// it — the same reload the visitor would otherwise do by hand, but a cheap
// remount is tried first.
// ============================================

/** When to look, after a navigation or after the tab comes back.
    Two passes, not one: the first catches a page that never rendered, the second
    catches one that broke a moment later (late remote data, a scene loading) and
    is also what escalates if the first pass's remount didn't help. */
const CHECK_DELAYS_MS = [1600, 4200]

/** Below this height the page area holds nothing that could be page content.
    The Suspense loader is `min-h-screen`, so a route still fetching its chunk is
    comfortably above the line and never mistaken for a blank page. */
const MIN_HEIGHT = 120

/** Only ever one automatic reload per document, so a page that genuinely
    measures empty can't put the tab in a reload loop. */
let reloadedOnce = false

/**
 * Watches the page container and repairs it if it ends up empty.
 *
 * @param ref   the <main> element every route renders into
 * @param heal  forces a fresh mount of the route subtree (first attempt)
 */
export function useBlankPageGuard(
  ref: RefObject<HTMLElement>,
  heal: () => void
): void {
  const { pathname } = useLocation()
  const attempts = useRef(0)

  const check = useCallback(() => {
    const el = ref.current
    if (!el || document.visibilityState !== 'visible') return

    const { height } = el.getBoundingClientRect()
    const first = el.firstElementChild
    // Rendered but transparent counts as blank: an enter animation stuck at
    // opacity 0 is exactly as invisible as an empty container.
    const opacity = first ? Number(getComputedStyle(first).opacity) : 1
    if (height >= MIN_HEIGHT && (Number.isNaN(opacity) || opacity > 0.05)) return

    attempts.current += 1
    if (attempts.current === 1) {
      heal()
    } else if (!reloadedOnce) {
      reloadedOnce = true
      window.location.reload()
    }
  }, [ref, heal])

  useEffect(() => {
    // A route change is a fresh chance for the page to render correctly.
    attempts.current = 0

    let timers: number[] = []
    const schedule = () => {
      timers.forEach(window.clearTimeout)
      timers = CHECK_DELAYS_MS.map((delay) => window.setTimeout(check, delay))
    }
    const recheck = () => {
      if (document.visibilityState === 'visible') schedule()
    }

    schedule()
    document.addEventListener('visibilitychange', recheck)
    window.addEventListener('pageshow', recheck)
    return () => {
      timers.forEach(window.clearTimeout)
      document.removeEventListener('visibilitychange', recheck)
      window.removeEventListener('pageshow', recheck)
    }
  }, [pathname, check])
}
