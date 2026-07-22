import { Play } from 'lucide-react'
import { resolveImageUrl, getMediaEmbed } from '@/lib/products'

interface GalleryMediaProps {
  src: string
  caption?: string
  alt: string
  onOpen: () => void
}

// The brand wordmark, via Cloudinary (optimized). Used as the branded thumbnail
// for video tiles so the gallery stays on-theme.
const WORDMARK_SRC =
  'https://res.cloudinary.com/b0tb1mho/image/upload/f_auto,q_auto/v1784753097/lgvkw3dn9w5veqhbej2b.png'

/**
 * A single gallery tile — an image or a YouTube video, detected from
 * `src`. Clicking opens the fullscreen lightbox (playback happens there).
 * Every tile uses a uniform 16:9 frame so the caption band is identical
 * regardless of the media's own aspect ratio.
 *
 * Videos use the phiUture wordmark as a clean branded thumbnail that fills the
 * whole 16:9 frame (the wordmark shares that aspect ratio).
 */
export function GalleryMedia({ src, caption, alt, onOpen }: GalleryMediaProps) {
  const isVideo = getMediaEmbed(src) !== null

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
            {/* Wordmark fills the whole 16:9 thumbnail (shared aspect ratio) */}
            <img
              src={WORDMARK_SRC}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
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
