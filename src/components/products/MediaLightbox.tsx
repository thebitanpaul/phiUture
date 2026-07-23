import { useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { resolveImageUrl, getMediaEmbed } from '@/lib/products'

export interface LightboxItem {
  src: string
  caption?: string
}

interface MediaLightboxProps {
  items: LightboxItem[]
  index: number
  onClose: () => void
  onIndex: (index: number) => void
}

/**
 * Fullscreen media viewer for product images and YouTube videos.
 * Supports prev/next navigation (buttons + arrow keys), Escape to close,
 * and backdrop click to dismiss. Rendered in a portal on document.body.
 */
export function MediaLightbox({
  items,
  index,
  onClose,
  onIndex,
}: MediaLightboxProps) {
  const count = items.length
  const hasMultiple = count > 1

  const go = useCallback(
    (delta: number) => onIndex((index + delta + count) % count),
    [index, count, onIndex]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose, go])

  const item = items[index]
  if (!item) return null

  const embed = getMediaEmbed(item.src)

  // Portal targets document.body — absent during static prerender (SSG).
  if (typeof document === 'undefined') return null

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-void/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full glass text-text-secondary transition-colors hover:text-text-primary"
      >
        <X size={20} />
      </button>

      {/* Prev / Next */}
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous"
            className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full glass text-text-secondary transition-colors hover:text-text-primary sm:left-5"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next"
            className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full glass text-text-secondary transition-colors hover:text-text-primary sm:right-5"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Content */}
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        {embed ? (
          embed.portrait ? (
            <div className="mx-auto flex justify-center">
              <div className="relative aspect-[9/16] h-[82vh] max-w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-black">
                <iframe
                  src={embed.embedUrl}
                  title={item.caption || 'Video'}
                  allow="autoplay; encrypted-media; clipboard-write; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  scrolling="no"
                  className="h-full w-full"
                />
              </div>
            </div>
          ) : (
            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-black">
              <iframe
                src={embed.embedUrl}
                title={item.caption || 'Video'}
                allow="autoplay; encrypted-media; clipboard-write; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                scrolling="no"
                className="h-full w-full"
              />
            </div>
          )
        ) : (
          <img
            src={resolveImageUrl(item.src)}
            alt={item.caption || 'Preview'}
            className="mx-auto max-h-[82vh] w-auto max-w-full rounded-2xl border border-white/[0.08] object-contain"
          />
        )}

        {/* Caption + counter */}
        {(item.caption || hasMultiple) && (
          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="typo-body text-sm text-text-secondary">
              {item.caption}
            </span>
            {hasMultiple && (
              <span className="typo-body shrink-0 text-xs tabular-nums text-text-muted">
                {index + 1} / {count}
              </span>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body
  )
}
