import { Play } from 'lucide-react'
import { resolveImageUrl, getMediaEmbed } from '@/lib/products'

interface GalleryMediaProps {
  src: string
  caption?: string
  alt: string
  onOpen: () => void
}

// Served from /public so it can be swapped without a rebuild.
const LOGO_SRC = `${import.meta.env.BASE_URL}logo.png`

/**
 * A single gallery tile — an image or a YouTube video, detected from
 * `src`. Clicking opens the fullscreen lightbox (playback happens there).
 * Every tile uses a uniform 16:9 frame so the caption band is identical
 * regardless of the media's own aspect ratio.
 *
 * Videos use a branded placeholder (logo on the theme gradient with a
 * magenta tint) as their thumbnail, so the gallery stays on-theme.
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
            {/* Theme gradient */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(120% 120% at 30% 20%, rgba(217,70,239,0.18), transparent 55%), radial-gradient(120% 120% at 80% 90%, rgba(168,85,247,0.16), transparent 55%)',
              }}
            />
            {/* Fine grid texture */}
            <div
              className="absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />
            {/* Logo — fills the entire thumbnail area */}
            <img
              src={LOGO_SRC}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Magenta tint */}
            <div
              className="absolute inset-0 mix-blend-overlay"
              style={{
                background:
                  'linear-gradient(135deg, rgba(217,70,239,0.40), rgba(168,85,247,0.28))',
              }}
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
