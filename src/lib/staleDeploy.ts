// ============================================
// Stale-deploy detection + one-shot recovery
// --------------------------------------------
// THE FAILURE THIS OWNS
//
// Vercel serves the newest deployment under the production domain, and the
// previous deployment's content-hashed /assets/ files stop existing there. A tab
// that was already open across a deploy — or a browser replaying the previous
// index.html — then asks for chunk names this deploy has never heard of, gets a
// 404, and the dynamic import rejects:
//
//   Failed to fetch dynamically imported module: /assets/Home-C4IgdMhU.js
//
// Same root cause, different wording depending on the browser and on what
// exactly was missed: ChunkLoadError, "error loading dynamically imported
// module", or a JSON parse error on "<!DOCTYPE" when a miss is answered with an
// HTML page instead of a 404.
//
// None of those are defects in the app. The code is fine; only the copy this tab
// is holding is out of date, and the cure is always the same — drop the caches,
// get fresh HTML, and the current chunk names arrive with it.
//
// WHY IT LIVES IN ITS OWN MODULE
//
// Two places can observe the failure and they must agree on what counts as one:
//   • the lazy page loader in App.tsx — sees it FIRST, at the import itself, and
//     can heal before React ever renders an error. This matters because
//     React.lazy memoises a rejected loader permanently: once a page chunk
//     fails, that route stays broken for the life of the document even if the
//     network recovers.
//   • the route error boundary (components/layout/RouteError) — the backstop for
//     everything else that can carry the same signature, including route loaders.
//
// The sessionStorage flag caps recovery at one reload per tab, so a genuine bug
// can never turn into a reload loop.
// ============================================

import { purgeAppCachesAndReload } from '@/lib/registerServiceWorker'

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
  'unable to preload css',
  '<!doctype',
  'is not valid json',
  'unexpected token <',
  "unexpected token '<'",
  'chunkloaderror',
  'loading chunk',
  'loading css chunk',
]

/** Best-effort human text for any thrown value. */
export function describeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`
  if (typeof error === 'string') return error
  return 'Unknown error'
}

/** Whether an error message looks like a stale-deploy load failure. */
export function isStaleDeployMessage(text: string): boolean {
  const lower = text.toLowerCase()
  return STALE_DEPLOY_SIGNATURES.some((sig) => lower.includes(sig))
}

/**
 * Whether a recovery reload is still allowed in this tab.
 *
 * Storage being blocked (private mode, embedded webview) reads as "already
 * tried": showing the error page is strictly better than risking an unguarded
 * reload loop we have no way to remember breaking out of.
 */
export function canAttemptRecovery(): boolean {
  try {
    return sessionStorage.getItem(RECOVERY_FLAG) !== '1'
  } catch {
    return false
  }
}

/**
 * Marks this tab as recovered, then purges every cache and hard-reloads.
 * Call only after `canAttemptRecovery()` returns true.
 */
export function beginRecovery(): void {
  try {
    sessionStorage.setItem(RECOVERY_FLAG, '1')
  } catch {
    /* storage unavailable — canAttemptRecovery() already refuses in that case */
  }
  void purgeAppCachesAndReload()
}
