import { ReactNode } from 'react'

/**
 * The wrapper every page renders inside — it fades and un-blurs the incoming
 * page on a route change.
 *
 * Deliberately CSS, not framer-motion. This used to be a `motion.div` with an
 * `exit` variant, driven by `<AnimatePresence mode="wait">` in the Layout, and
 * that pairing is what caused the "whole page goes black and blank until you
 * reload" bug on navbar tab switches:
 *
 *   • In wait mode, AnimatePresence renders NOTHING of the incoming page until
 *     every motion component in the outgoing page reports its exit finished.
 *   • That report is a handshake. A motion component that unmounts mid-exit —
 *     which happens on this site whenever remote products.json / about.json
 *     lands and re-renders the outgoing page during its 300ms exit window — is
 *     dropped from the tally WITHOUT the tally being re-checked, so the "all
 *     done" signal never fires.
 *   • AnimatePresence then sits there with the old page removed and the new one
 *     never rendered: a blank page, on the void background, unrecoverable
 *     because the stuck state lives in AnimatePresence's internals.
 *
 * A CSS enter animation cannot fail that way. There is no handshake, nothing to
 * wait for, and no exit phase at all — the new page is in the DOM the moment the
 * route changes. The base style of the element is fully visible, so the animation
 * can be throttled, skipped, or unsupported (backgrounded tab, reduced motion,
 * old browser) and the worst case is a page that appears without a transition
 * rather than one that never appears at all.
 *
 * `animation-fill-mode` is left at `none` on purpose: once the animation ends no
 * `filter` remains on the wrapper, so it stops acting as a containing block for
 * `position: fixed` descendants.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>
}
