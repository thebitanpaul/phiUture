interface YouTubeEmbedProps {
  /** YouTube video ID — the segment after youtu.be/ or /watch?v=. */
  videoId: string
  title?: string
  autoplay?: boolean
}

/** A single 16:9 YouTube player, styled to match the site's dark surfaces. */
export function YouTubeEmbed({ videoId, title, autoplay = false }: YouTubeEmbedProps) {
  const params = new URLSearchParams({ rel: '0', modestbranding: '1' })
  if (autoplay) params.set('autoplay', '1')

  return (
    <div className="aspect-video w-full">
      <iframe
        title={title ?? `Video ${videoId}`}
        src={`https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        className="w-full h-full block"
        style={{ border: 0, borderRadius: 12 }}
      />
    </div>
  )
}
