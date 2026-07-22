import { useEffect, useRef } from 'react'
import { getSpotifyIframeApi, type SpotifyController } from './spotifyIframeApi'

interface SpotifyPlayerProps {
  albumId: string
  height?: number
  /** Fires with the real play/pause state from Spotify's playback events. */
  onPlayingChange?: (playing: boolean) => void
}

/**
 * Inline Spotify player built on the IFrame API. On mount it attempts to start
 * playback (best-effort — some browsers still require the first tap inside the
 * widget) and reports genuine playing/paused state so the card never shows a
 * false "Now playing".
 */
export function SpotifyPlayer({ albumId, height = 352, onPlayingChange }: SpotifyPlayerProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<SpotifyController | null>(null)

  // Keep the latest callback without re-creating the controller each render.
  const cbRef = useRef(onPlayingChange)
  cbRef.current = onPlayingChange

  useEffect(() => {
    let destroyed = false

    getSpotifyIframeApi().then((api) => {
      if (destroyed || !hostRef.current) return
      api.createController(
        hostRef.current,
        { uri: `spotify:album:${albumId}`, width: '100%', height },
        (controller) => {
          if (destroyed) {
            controller.destroy()
            return
          }
          controllerRef.current = controller
          controller.addListener('playback_update', (e) => {
            if (typeof e?.data?.isPaused === 'boolean') {
              cbRef.current?.(!e.data.isPaused)
            }
          })
          // Best-effort auto-start once the widget is ready.
          try {
            controller.play()
          } catch {
            /* browser blocked autoplay — user taps play in the widget */
          }
        }
      )
    })

    return () => {
      destroyed = true
      try {
        controllerRef.current?.destroy()
      } catch {
        /* ignore */
      }
      controllerRef.current = null
    }
  }, [albumId, height])

  return <div ref={hostRef} className="w-full" style={{ minHeight: height }} />
}
