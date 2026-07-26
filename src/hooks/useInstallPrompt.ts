// ============================================
// useInstallPrompt — PWA installability, as state
// --------------------------------------------
// Wraps the two very different ways a browser lets a site be installed:
//
//  • Chromium (Android, desktop) fires `beforeinstallprompt`. Capturing that
//    event lets us open the native install dialog from our own button, at a
//    moment that makes sense, instead of leaving it to the browser's chrome.
//
//  • iOS Safari has no such event — installing is Share → "Add to Home Screen"
//    and nothing else. There is no API to trigger or even detect it, so the
//    only useful thing to offer is the instruction, which is what the `ios`
//    mode represents.
//
// Either way the prompt is hidden once the app is already running installed,
// and a dismissal is remembered so the site never nags. Visitors who dismiss
// can still install from the browser's own menu.
// ============================================

import { useCallback, useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallMode = 'none' | 'prompt' | 'ios'

const DISMISSED_KEY = 'phiuture:install-dismissed'

/** Delay before offering, so the prompt never lands on top of a hero animation
    that is still settling. */
const REVEAL_DELAY_MS = 6000

function isDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

function rememberDismissal(): void {
  try {
    localStorage.setItem(DISMISSED_KEY, '1')
  } catch {
    /* storage blocked — the prompt reappears next visit, which is acceptable */
  }
}

/** True when the page is already running as an installed app. */
function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const iosStandalone = (navigator as { standalone?: boolean }).standalone === true
  return (
    iosStandalone ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches
  )
}

/** iOS/iPadOS, where install is a manual Share-sheet action. iPadOS 13+ reports
    a Mac user agent, so touch points are the tell-tale. */
function isIos(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return true
  return /Macintosh/.test(ua) && navigator.maxTouchPoints > 1
}

export interface InstallPromptState {
  /** Which affordance to show, if any. */
  mode: InstallMode
  /** Opens the native install dialog. Chromium only; no-op in `ios` mode. */
  install: () => Promise<void>
  /** Hide it and don't ask again. */
  dismiss: () => void
}

export function useInstallPrompt(): InstallPromptState {
  const [mode, setMode] = useState<InstallMode>('none')
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isStandalone() || isDismissed()) return

    let revealTimer: number | undefined

    const onBeforeInstallPrompt = (event: Event) => {
      // Suppress the browser's own mini-infobar so ours is the only affordance.
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
      revealTimer = window.setTimeout(() => setMode('prompt'), REVEAL_DELAY_MS)
    }

    const onInstalled = () => {
      setMode('none')
      setDeferred(null)
      rememberDismissal()
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)

    // iOS never fires the event, so schedule the hint directly.
    if (isIos()) {
      revealTimer = window.setTimeout(() => setMode('ios'), REVEAL_DELAY_MS)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      if (revealTimer) window.clearTimeout(revealTimer)
    }
  }, [])

  const install = useCallback(async () => {
    if (!deferred) return
    try {
      await deferred.prompt()
      const { outcome } = await deferred.userChoice
      // The event is single-use either way.
      setDeferred(null)
      setMode('none')
      if (outcome === 'accepted') rememberDismissal()
    } catch {
      setMode('none')
    }
  }, [deferred])

  const dismiss = useCallback(() => {
    setMode('none')
    rememberDismissal()
  }, [])

  return { mode, install, dismiss }
}
