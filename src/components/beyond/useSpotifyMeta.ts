import { useEffect, useState } from 'react'

export interface SpotifyMeta {
  title?: string
  cover?: string
  loaded: boolean
}

// Spotify's oEmbed endpoint is CORS-enabled (Access-Control-Allow-Origin: *),
// so we can fetch album art + title straight from the browser. Results are
// cached module-wide so switching tabs or paging never refetches.
const cache = new Map<string, SpotifyMeta>()
const inflight = new Map<string, Promise<SpotifyMeta>>()

function load(spotifyId: string): Promise<SpotifyMeta> {
  const cached = cache.get(spotifyId)
  if (cached) return Promise.resolve(cached)
  const existing = inflight.get(spotifyId)
  if (existing) return existing

  const url = `https://open.spotify.com/oembed?url=${encodeURIComponent(
    `https://open.spotify.com/album/${spotifyId}`
  )}`

  const p = fetch(url)
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((j: { title?: string; thumbnail_url?: string }) => {
      const meta: SpotifyMeta = { title: j.title, cover: j.thumbnail_url, loaded: true }
      cache.set(spotifyId, meta)
      return meta
    })
    .catch(() => {
      // Fail soft — the card falls back to a branded gradient tile.
      const meta: SpotifyMeta = { loaded: true }
      cache.set(spotifyId, meta)
      return meta
    })
    .finally(() => inflight.delete(spotifyId))

  inflight.set(spotifyId, p)
  return p
}

/** Fetches Spotify album metadata (cover + title) lazily; `enabled` gates it
    so off-screen / unmounted cards never hit the network. */
export function useSpotifyMeta(spotifyId: string, enabled = true): SpotifyMeta {
  const [meta, setMeta] = useState<SpotifyMeta>(
    () => cache.get(spotifyId) ?? { loaded: false }
  )

  useEffect(() => {
    if (!enabled || meta.loaded) return
    let active = true
    load(spotifyId).then((m) => {
      if (active) setMeta(m)
    })
    return () => {
      active = false
    }
  }, [spotifyId, enabled, meta.loaded])

  return meta
}
