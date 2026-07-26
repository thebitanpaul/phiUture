// ============================================
// InstallPrompt — the "download this as an app" affordance
// --------------------------------------------
// A dismissible glass pill pinned to the bottom of the viewport. It only ever
// appears when the browser has actually told us the site is installable (or on
// iOS, where installing is a manual Share-sheet step) — see useInstallPrompt.
// Sits above the navbar's z-50 so the mobile menu can't bury it, and respects
// the iOS home-indicator inset.
// ============================================

import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Share } from 'lucide-react'
import { PhiLogo } from '@/components/ui/PhiLogo'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

export function InstallPrompt() {
  const { mode, install, dismiss } = useInstallPrompt()
  const isIos = mode === 'ios'

  return (
    <AnimatePresence>
      {mode !== 'none' && (
        <motion.div
          key="install-prompt"
          initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-label="Install phiUture"
          className="fixed inset-x-0 bottom-0 z-[70] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none"
        >
          {/* `glass-bar`, the same near-opaque surface as the navbar and the
              sticky filter bars — plain `glass-strong` is transparent enough
              that page text bleeds through and tangles with this text. */}
          <div className="glass-bar pointer-events-auto flex w-full max-w-md items-center gap-3.5 rounded-2xl p-3.5 shadow-2xl shadow-black/50">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-magenta/10 text-xl">
              <PhiLogo />
            </div>

            <div className="min-w-0 flex-1">
              <p className="typo-section text-sm text-text-primary">
                Install phiUture
              </p>
              <p className="typo-body mt-0.5 text-xs leading-snug text-text-muted">
                {isIos ? (
                  <>
                    Tap{' '}
                    <Share size={11} className="inline align-[-0.1em] text-text-secondary" aria-hidden="true" />{' '}
                    <span className="text-text-secondary">Share</span>, then{' '}
                    <span className="text-text-secondary">Add to Home Screen</span>.
                  </>
                ) : (
                  'Add it to your home screen for full-screen, offline-ready access.'
                )}
              </p>
            </div>

            {!isIos && (
              <button
                onClick={() => void install()}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-magenta to-violet px-4 py-2 text-xs font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-magenta/25 active:scale-[0.97]"
              >
                <Download size={13} aria-hidden="true" />
                Install
              </button>
            )}

            <button
              onClick={dismiss}
              aria-label="Dismiss install prompt"
              className="shrink-0 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/[0.06] hover:text-text-primary"
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
