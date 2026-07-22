import type { BeyondMedium } from '@/lib/types'

/** A medium-agnostic, gallery-ready item — the shape cards and the player
    modal consume, regardless of whether it came from Spotify or YouTube. */
export interface GalleryItem {
  key: string
  kind: 'spotify' | 'youtube'
  /** Spotify album ID or YouTube video ID. */
  embedId: string
  title: string
  subtitle?: string
  /** Pre-derivable thumbnail (YouTube); Spotify art is fetched at render time. */
  thumbnail?: string
  /** Spotify embed height. */
  height?: number
  /** Lower-cased haystack used by the search box. */
  searchText: string
}

/** Normalises a medium's raw content into gallery items. Video wins if present;
    otherwise music. Adding a new content kind means extending this one spot. */
export function toGalleryItems(medium: BeyondMedium | undefined): GalleryItem[] {
  if (!medium) return []

  const videos = medium.videos ?? []
  if (videos.length > 0) {
    return videos.map((v) => ({
      key: v.id,
      kind: 'youtube' as const,
      embedId: v.youtubeId,
      title: v.title,
      subtitle: v.artist,
      thumbnail: `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`,
      searchText: [v.title, v.artist, ...(v.tags ?? [])].join(' ').toLowerCase(),
    }))
  }

  const musicItems = medium.music ?? []
  return musicItems.map((m, i) => ({
    key: m.id,
    kind: 'spotify' as const,
    embedId: m.spotifyId,
    title: m.title ?? `Release ${i + 1}`,
    subtitle: m.artist,
    thumbnail: m.cover,
    height: m.height,
    searchText: [m.title, m.artist, ...(m.tags ?? [])].join(' ').toLowerCase(),
  }))
}
