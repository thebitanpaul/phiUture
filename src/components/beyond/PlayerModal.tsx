import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { GalleryItem } from './galleryTypes'
import { YouTubeEmbed } from './YouTubeEmbed'

interface PlayerModalProps {
  /** The full (filtered) list of video items to page through. */
  items: GalleryItem[]
  /** Index of the open item, or null when closed. */
  index: number | null
  onIndex: (i: number) => void
  onClose: () => void
}

const EASE = [0.16, 1, 0.3, 1] as const

/** Popup video player with previous/next navigation across the video list. */
export function PlayerModal({ items, index, onIndex, onClose }: PlayerModalProps) {
  const idx = index ?? -1
  const open = idx >= 0 && idx < items.length
  const current = open ? items[idx] : null
  const hasPrev = open && idx > 0
  const hasNext = open && idx < items.length - 1

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft' && idx > 0) onIndex(idx - 1)
      else if (e.key === 'ArrowRight' && idx < items.length - 1) onIndex(idx + 1)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, idx, items.length, onClose, onIndex])

  // Rendered through a portal to <body>: the page is wrapped in a transformed/
  // filtered PageTransition, which would otherwise make `position: fixed`
  // anchor to that ancestor instead of the viewport (modal ends up off-screen).
  // Portal targets document.body — absent during static prerender (SSG).
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && current && (
        <motion.div
          key="video-player"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
        >
          <div className="absolute inset-0 bg-void/90 backdrop-blur-md" onClick={onClose} />

          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="relative z-10 w-full max-w-3xl"
          >
            <button
              onClick={onClose}
              aria-label="Close player"
              className="absolute -top-11 right-0 text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={24} />
            </button>

            {/* Side arrows (desktop) */}
            <NavArrow
              side="left"
              disabled={!hasPrev}
              onClick={() => hasPrev && onIndex(idx - 1)}
            />
            <NavArrow
              side="right"
              disabled={!hasNext}
              onClick={() => hasNext && onIndex(idx + 1)}
            />

            <div className="glass-strong rounded-2xl overflow-hidden p-2 sm:p-3">
              {/* key forces a remount per video so the next one autoplays */}
              <YouTubeEmbed key={current.embedId} videoId={current.embedId} title={current.title} autoplay />
            </div>

            {/* Title + inline prev/next controls (works on every screen size) */}
            <div className="mt-4 flex items-center justify-between gap-3 px-1">
              <NavButton
                dir="prev"
                disabled={!hasPrev}
                onClick={() => hasPrev && onIndex(idx - 1)}
              />
              <div className="min-w-0 text-center">
                <h3 className="typo-section text-base text-text-primary truncate">{current.title}</h3>
                {current.subtitle && (
                  <p className="typo-body text-text-secondary text-xs mt-0.5 truncate">
                    {current.subtitle}
                  </p>
                )}
                <span className="typo-label text-text-muted/70 mt-1 inline-block" style={{ fontSize: '10px' }}>
                  {idx + 1} / {items.length}
                </span>
              </div>
              <NavButton
                dir="next"
                disabled={!hasNext}
                onClick={() => hasNext && onIndex(idx + 1)}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

function NavArrow({
  side,
  disabled,
  onClick,
}: {
  side: 'left' | 'right'
  disabled: boolean
  onClick: () => void
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={side === 'left' ? 'Previous video' : 'Next video'}
      className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 ${
        side === 'left' ? '-left-14' : '-right-14'
      } w-11 h-11 rounded-full items-center justify-center glass-strong text-text-secondary transition-colors hover:text-text-primary disabled:opacity-25 disabled:pointer-events-none`}
    >
      <Icon size={22} />
    </button>
  )
}

function NavButton({
  dir,
  disabled,
  onClick,
}: {
  dir: 'prev' | 'next'
  disabled: boolean
  onClick: () => void
}) {
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1 shrink-0 px-3 py-2 rounded-xl text-sm text-text-secondary border border-white/10 transition-colors hover:border-magenta/30 hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none"
    >
      {dir === 'prev' && <Icon size={16} />}
      <span className="hidden sm:inline">{dir === 'prev' ? 'Prev' : 'Next'}</span>
      {dir === 'next' && <Icon size={16} />}
    </button>
  )
}
