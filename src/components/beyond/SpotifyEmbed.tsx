interface SpotifyEmbedProps {
  /** Spotify album ID — the segment after /album/ in the share URL. */
  albumId: string
  /** 152 for a compact single, 352 to reveal the full tracklist. */
  height?: number
  title?: string
}

/**
 * A single Spotify album player. `theme=0` renders Spotify's dark player,
 * which sits naturally on the void-black canvas of the site.
 */
export function SpotifyEmbed({ albumId, height = 152, title }: SpotifyEmbedProps) {
  return (
    <iframe
      data-testid="embed-iframe"
      title={title ?? `Spotify album ${albumId}`}
      src={`https://open.spotify.com/embed/album/${albumId}?utm_source=generator&theme=0`}
      width="100%"
      height={height}
      style={{ borderRadius: 12, border: 0, display: 'block' }}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      allowFullScreen
      loading="lazy"
    />
  )
}
