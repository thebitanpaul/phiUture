import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Square, Music2, Video as VideoIcon } from 'lucide-react'
import type { GalleryItem } from './galleryTypes'
import { useSpotifyMeta } from './useSpotifyMeta'
import { SpotifyPlayer } from './SpotifyPlayer'

interface MediaCardProps {
  item: GalleryItem
  index: number
  /** Music only: this card's inline player is open. */
  isActive?: boolean
  /** Toggles inline play (music) or opens the popup (video). */
  onSelect: (item: GalleryItem) => void
}

/** Equalizer — animates only while actually playing, static bars when paused. */
function Equalizer({ active }: { active: boolean }) {
  return (
    <span className="flex items-end gap-[3px] h-3.5" aria-hidden="true">
      {[0, 1, 2, 3].map((i) =>
        active ? (
          <motion.span
            key={i}
            className="w-[3px] rounded-full bg-magenta"
            style={{ height: '35%' }}
            animate={{ height: ['35%', '100%', '50%', '85%', '35%'] }}
            transition={{ duration: 0.9 + i * 0.14, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : (
          <span key={i} className="w-[3px] rounded-full bg-text-muted/50" style={{ height: '35%' }} />
        )
      )}
    </span>
  )
}

/** Music tile expanded into its inline player; header reflects real state. */
function ActiveMusicCard({
  item,
  title,
  onStop,
}: {
  item: GalleryItem
  title: string
  onStop: () => void
}) {
  const [playing, setPlaying] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl overflow-hidden glass border border-magenta/30 shadow-lg shadow-magenta/10"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
        <span className="flex items-center gap-2">
          <Equalizer active={playing} />
          <span className="typo-label text-magenta/90">{playing ? 'Now playing' : 'Paused'}</span>
        </span>
        <button
          onClick={onStop}
          aria-label="Close player"
          className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors text-xs"
        >
          <Square size={13} fill="currentColor" />
          Close
        </button>
      </div>
      <SpotifyPlayer albumId={item.embedId} height={item.height ?? 352} onPlayingChange={setPlaying} />
    </motion.div>
  )
}

/**
 * Gallery tile. Music tiles expand into an inline Spotify player on click (no
 * popup); video tiles hand off to the popup player. Collapsed tiles cost only
 * an image, so pages stay light regardless of catalogue size.
 */
export function MediaCard({ item, index, isActive = false, onSelect }: MediaCardProps) {
  const isVideo = item.kind === 'youtube'
  const spotify = useSpotifyMeta(item.embedId, item.kind === 'spotify' && !item.thumbnail)
  const cover = item.thumbnail ?? spotify.cover
  const title = item.title || spotify.title || 'Untitled'
  const [imgOk, setImgOk] = useState(true)
  const showImage = Boolean(cover) && imgOk

  // ── Music: playing inline (replaces the cover with the Spotify player) ──────
  if (item.kind === 'spotify' && isActive) {
    return <ActiveMusicCard item={item} title={title} onStop={() => onSelect(item)} />
  }

  // ── Collapsed tile (music not playing, or any video) ────────────────────────
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(item)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
      className="group block w-full text-left focus:outline-none"
      aria-label={isVideo ? `Play ${title} in a popup` : `Play ${title}`}
    >
      <div
        className={`relative ${
          isVideo ? 'aspect-video' : 'aspect-square'
        } rounded-2xl overflow-hidden glass border border-white/[0.06]`}
      >
        {showImage ? (
          <img
            src={cover}
            alt={title}
            loading="lazy"
            onError={() => setImgOk(false)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple/25 via-magenta/10 to-transparent">
            {isVideo ? (
              <VideoIcon size={40} className="text-text-muted/25" />
            ) : (
              <Music2 size={40} className="text-text-muted/25" />
            )}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
          <span className="w-14 h-14 rounded-full bg-magenta/90 flex items-center justify-center shadow-lg shadow-magenta/30">
            <Play size={22} className="text-white ml-0.5" fill="currentColor" />
          </span>
        </div>
      </div>

      <div className="mt-3 px-0.5">
        <h3 className="typo-section text-sm text-text-primary truncate group-hover:text-white transition-colors">
          {title}
        </h3>
        {item.subtitle && (
          <p className="typo-body text-text-muted text-xs mt-0.5 truncate">{item.subtitle}</p>
        )}
      </div>
    </motion.button>
  )
}
