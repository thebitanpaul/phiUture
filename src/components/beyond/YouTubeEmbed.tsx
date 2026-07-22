interface YouTubeEmbedProps {
  /** YouTube video ID — the segment after youtu.be/ or /watch?v=. */
  videoId: string
  title?: string
  autoplay?: boolean
}

/** A single 16:9 YouTube player, styled to match the site's dark surfaces. */
export function YouTubeEmbed({ videoId, title, autoplay = false }: YouTubeEmbedProps) {
  // `playsinline` lets iOS play inside the modal instead of forcing fullscreen.
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  })
  if (autoplay) params.set('autoplay', '1')

  return (
    <div className="aspect-video w-full">
      <iframe
        title={title ?? `Video ${videoId}`}
        // Standard youtube.com/embed + an explicit referrer policy. The
        // privacy-enhanced `youtube-nocookie.com` domain throws
        // "video player configuration error 153" on iOS (works on desktop &
        // Android) because the referrer it receives is stripped; this pairing
        // sends the origin YouTube expects and plays on every device.
        src={`https://www.youtube.com/embed/${videoId}?${params.toString()}`}
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        className="w-full h-full block"
        style={{ border: 0, borderRadius: 12 }}
      />
    </div>
  )
}
