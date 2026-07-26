// ============================================
// Service worker registration + recovery
// --------------------------------------------
// Registers /sw.js, which makes the site installable as an app and keeps a
// minimal offline shell. Registration is deliberately deferred until after
// `load` so it never competes with the LCP frame for bandwidth.
//
// The worker is written to be update-safe (see public/sw.js): HTML is always
// network-first, so a new deploy can never be masked by a cached document.
// `purgeAppCachesAndReload` is the escape hatch for the cases that survive
// anyway — it wipes every cache, drops the worker, and reloads clean.
// ============================================

/** Only in production builds: `vite dev` has no built sw.js to serve. */
const SW_ENABLED = import.meta.env.PROD

const SW_URL = '/sw.js'

/** Registers the service worker. Safe to call anywhere — no-ops during the
    SSG pass, in dev, and in browsers without service worker support. */
export function registerServiceWorker(): void {
  if (!SW_ENABLED) return
  if (typeof window === 'undefined') return
  if (!('serviceWorker' in navigator)) return

  const register = () => {
    navigator.serviceWorker.register(SW_URL).catch((err) => {
      // A failed registration costs nothing but the offline shell — never let
      // it surface to the visitor.
      console.warn('[pwa] service worker registration failed', err)
    })
  }

  if (document.readyState === 'complete') register()
  else window.addEventListener('load', register, { once: true })
}

/**
 * Nuclear recovery: deletes every Cache Storage entry, unregisters all service
 * workers, then hard-reloads. Used by the route error boundary when a load
 * failure looks like stale cached code from a previous deploy — the one class
 * of error a reload alone might not clear.
 */
export async function purgeAppCachesAndReload(): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
    }
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((r) => r.unregister()))
    }
  } catch {
    // Reload regardless — a partial purge is still better than the error page.
  }

  window.location.reload()
}
