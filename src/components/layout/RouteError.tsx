// ============================================
// Route error boundary
// --------------------------------------------
// The safety net for anything that throws while a route renders or loads. Two
// jobs, in order:
//
//  1. SELF-HEAL the stale-deploy class of error. When a new version ships, a
//     tab still holding the previous build asks for chunks and manifests that
//     no longer exist. The host answers those misses with an HTML page, so the
//     failure surfaces as "Failed to fetch dynamically imported module" or as
//     a JSON parse error on "<!DOCTYPE" — errors where the code is fine and
//     only the cached copy is wrong. Those get one automatic cache purge and
//     reload, guarded by a sessionStorage flag so a genuine bug can never turn
//     into a reload loop.
//
//  2. Show a branded page for everything else, instead of React Router's bare
//     "Unexpected Application Error!" default.
// ============================================

import { useEffect, useState } from 'react'
import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom'
import { RefreshCw, Home, AlertTriangle } from 'lucide-react'
import { purgeAppCachesAndReload } from '@/lib/registerServiceWorker'
import { Wordmark } from '@/components/ui/Wordmark'

/** One recovery attempt per tab session. */
const RECOVERY_FLAG = 'phiuture:recovered-stale-deploy'

/**
 * Signatures of a load failure caused by stale cached code rather than by a
 * defect in the app. All of them mean "this browser is asking for a file that
 * this deploy no longer has".
 */
const STALE_DEPLOY_SIGNATURES = [
  'failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'importing a module script failed',
  '<!doctype',
  'is not valid json',
  'unexpected token <',
  "unexpected token '<'",
  'chunkloaderror',
  'loading chunk',
  'loading css chunk',
]

function errorText(error: unknown): string {
  if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText}`
  if (error instanceof Error) return `${error.name}: ${error.message}`
  if (typeof error === 'string') return error
  return 'Unknown error'
}

function isStaleDeployError(error: unknown): boolean {
  const text = errorText(error).toLowerCase()
  return STALE_DEPLOY_SIGNATURES.some((sig) => text.includes(sig))
}

function alreadyTriedRecovery(): boolean {
  try {
    return sessionStorage.getItem(RECOVERY_FLAG) === '1'
  } catch {
    // Private mode / storage blocked → treat as "already tried" so we show the
    // error page rather than risk an unguarded reload loop.
    return true
  }
}

function markRecoveryAttempted(): void {
  try {
    sessionStorage.setItem(RECOVERY_FLAG, '1')
  } catch {
    /* storage unavailable — the flag check above already handled this */
  }
}

export default function RouteError() {
  const error = useRouteError()
  const [recovering, setRecovering] = useState(
    () => isStaleDeployError(error) && !alreadyTriedRecovery()
  )

  useEffect(() => {
    if (!recovering) {
      // Nothing to auto-heal — record it so the failure is debuggable.
      console.error('[route] unrecoverable error', error)
      return
    }
    markRecoveryAttempted()
    void purgeAppCachesAndReload()
  }, [recovering, error])

  const retry = () => {
    setRecovering(true)
  }

  if (recovering) {
    // Momentary — the reload is already in flight. A spinner rather than an
    // error message, because from the visitor's side nothing went wrong.
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6">
        <div className="w-8 h-8 rounded-full border-2 border-magenta/30 border-t-magenta animate-spin" />
        <p className="typo-body text-text-muted text-sm">Updating to the latest version…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-magenta/10">
          <AlertTriangle size={24} className="text-magenta" aria-hidden="true" />
        </div>

        <h1 className="typo-display text-3xl md:text-4xl text-text-primary">
          Something broke
        </h1>
        <p className="typo-body text-text-secondary mt-4">
          An unexpected error stopped this page from loading. Reloading usually
          clears it — if it doesn't, the rest of the site is still fine.
        </p>

        <p className="font-mono mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left text-xs text-text-muted break-words">
          {errorText(error)}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={retry}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-magenta to-violet px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-magenta/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            <RefreshCw size={15} aria-hidden="true" />
            Reload the page
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <Home size={15} aria-hidden="true" />
            Back to home
          </Link>
        </div>

        <p className="mt-10 text-xs text-text-muted tracking-wide">
          <Wordmark className="text-text-secondary" />
        </p>
      </div>
    </div>
  )
}
