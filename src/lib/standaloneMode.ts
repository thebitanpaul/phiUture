// ============================================
// Installed-app (standalone) detection
// --------------------------------------------
// The fixed chrome needs extra top padding when the site runs as an installed
// app, because the document then starts underneath the status bar / notch (see
// the --pwa-top-inset block in styles/globals.css).
//
// CSS can detect that on its own via `display-mode: standalone`, except on iOS
// Safari below 16.4, which never matches it in a home-screen window but does
// expose the legacy `navigator.standalone` flag. Mirroring that flag onto <html>
// gives the stylesheet one selector that works on every version.
// ============================================

/** iOS-only legacy standalone flag — not part of the standard Navigator type. */
type LegacyStandaloneNavigator = Navigator & { standalone?: boolean }

/**
 * Adds `pwa-standalone` to <html> when the page is running as an installed app.
 * Safe to call anywhere — no-ops during the SSG pass, where there is no DOM.
 */
export function markStandaloneMode(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const isStandalone =
    (navigator as LegacyStandaloneNavigator).standalone === true ||
    window.matchMedia?.('(display-mode: standalone)').matches === true

  if (isStandalone) document.documentElement.classList.add('pwa-standalone')
}
