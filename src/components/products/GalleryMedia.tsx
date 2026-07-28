import { Play } from 'lucide-react'
import { resolveImageUrl, getMediaEmbed, getYouTubeId } from '@/lib/products'
import { BRAND_WORDMARK } from '@/lib/seo'

interface GalleryMediaProps {
  src: string
  caption?: string
  alt: string
  onOpen: () => void
}

// The brand wordmark, from the single definition in lib/seo. Only used for videos
// that have no thumbnail of their own to show (Instagram / Facebook embeds).
// `f_auto,q_auto` lets Cloudinary serve an optimized, tiny variant of it.
const WORDMARK_SRC = BRAND_WORDMARK.replace(
  '/image/upload/',
  '/image/upload/f_auto,q_auto/'
)

/** YouTube's own thumbnail for a video id. `hqdefault` rather than `maxres`
    because maxres does not exist for every upload and 404s to a broken tile,
    whereas hqdefault is always generated — and it is already 480×360. */
const youTubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

/**
 * A single gallery tile — an image or a YouTube video, detected from
 * `src`. Clicking opens the fullscreen lightbox (playback happens there).
 * Every tile uses a uniform 16:9 frame so the caption band is identical
 * regardless of the media's own aspect ratio.
 *
 * YouTube tiles show the video's real thumbnail, so a visitor can tell the
 * videos apart before opening one. Other embeds fall back to the wordmark.
 */
export function GalleryMedia({ src, caption, alt, onOpen }: GalleryMediaProps) {
  const isVideo = getMediaEmbed(src) !== null
  const youTubeId = getYouTubeId(src)

  return (
    <figure className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-elevated">
      <button
        type="button"
        onClick={onOpen}
        className="group/tile relative block aspect-video w-full overflow-hidden"
        aria-label={isVideo ? `Play video: ${alt}` : `Open image: ${alt}`}
      >
        {isVideo ? (
          <>
            {youTubeId ? (
              /* The video's own thumbnail. `object-cover` is what makes both
                 sizes work: maxres is already 16:9, and hqdefault is 4:3 with
                 baked-in letterbox bars that the cover crop trims away. */
              <img
                src={`https://i.ytimg.com/vi/${youTubeId}/maxresdefault.jpg`}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  // maxres isn't generated for every upload; hqdefault always is.
                  const img = e.currentTarget
                  const fallback = youTubeThumb(youTubeId)
                  if (img.src !== fallback) img.src = fallback
                }}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover/tile:scale-[1.03]"
              />
            ) : (
              /* No thumbnail available for this embed — wordmark fills the
                 whole 16:9 frame (it shares that aspect ratio). */
              <img
                src={WORDMARK_SRC}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            {/* Scrim — keeps the play button legible over a bright thumbnail. */}
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-black/25 transition-colors duration-300 group-hover/tile:bg-black/10"
            />
            {/* Play button */}
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-magenta/90 shadow-lg shadow-magenta/30 transition-transform duration-300 group-hover/tile:scale-110">
              <Play size={26} className="ml-1 text-white" fill="currentColor" />
            </span>
          </>
        ) : (
          <img
            src={resolveImageUrl(src)}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover/tile:scale-[1.03]"
          />
        )}
      </button>

      {/* Uniform caption band — identical for every tile */}
      {caption && (
        <figcaption className="flex min-h-[3rem] items-center border-t border-white/[0.04] px-4 py-3">
          <span className="typo-body min-w-0 truncate text-xs text-text-muted">
            {caption}
          </span>
        </figcaption>
      )}
    </figure>
  )
}
