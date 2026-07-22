import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronRight, Clock, SearchX } from 'lucide-react'
import type { BeyondMedium } from '@/lib/types'
import { Pagination } from '@/components/ui'
import { useAbout } from '@/context/AboutContext'
import { socialIcon } from '@/components/icons/socialIcons'
import { toGalleryItems, type GalleryItem } from './galleryTypes'
import { MediaCard } from './MediaCard'
import { PlayerModal } from './PlayerModal'
import { mediumIcon } from './mediumIcons'

const PAGE_SIZE = 9
const EASE = [0.16, 1, 0.3, 1] as const

type SortKey = 'featured' | 'az' | 'za'
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'az', label: 'Title A–Z' },
  { key: 'za', label: 'Title Z–A' },
]

interface GalleryProps {
  mediums: BeyondMedium[]
  activeId: string
  onSelect: (id: string) => void
}

/**
 * The scalable browse zone — one control bar (medium tabs + search + sort) over
 * a responsive, paginated card grid. Handles 5 items or 500 the same way:
 * only the current page mounts, and heavy players live in a modal.
 */
export function Gallery({ mediums, activeId, onSelect }: GalleryProps) {
  const { social } = useAbout()
  const artistProfiles = social.artist ?? []
  const active = mediums.find((m) => m.id === activeId) ?? mediums[0]
  const allItems = useMemo(() => toGalleryItems(active), [active])
  const isLive = active?.status === 'live' && allItems.length > 0

  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('featured')
  const [page, setPage] = useState(0)
  const [playingId, setPlayingId] = useState<string | null>(null) // music, inline
  const [videoIndex, setVideoIndex] = useState<number | null>(null) // video, popup

  // Reset paging + playback whenever the result set changes underfoot.
  useEffect(() => {
    setPage(0)
    setPlayingId(null)
    setVideoIndex(null)
  }, [query, sort, activeId])

  // Stop the inline music player when the visible page changes.
  useEffect(() => setPlayingId(null), [page])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = q ? allItems.filter((i) => i.searchText.includes(q)) : allItems
    if (sort !== 'featured') {
      list = [...list].sort((a, b) =>
        sort === 'az' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      )
    }
    return list
  }, [allItems, query, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  // Music toggles an inline player; video opens the popup at its list index.
  const handleSelect = (it: GalleryItem) => {
    if (it.kind === 'youtube') {
      const idx = filtered.findIndex((f) => f.key === it.key)
      setVideoIndex(idx >= 0 ? idx : null)
    } else {
      setPlayingId((prev) => (prev === it.key ? null : it.key))
    }
  }

  return (
    <section id="beyond-gallery" className="relative z-10 bg-void">
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-28">
        {/* ── Control bar: tabs + search + sort ────────────────────────────── */}
        <div className="sticky top-20 z-30 mb-10">
          <div className="glass-bar rounded-2xl p-2 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
            {/* Medium tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {mediums.map((m) => {
                const Icon = mediumIcon(m.icon)
                const on = m.id === activeId
                return (
                  <button
                    key={m.id}
                    onClick={() => onSelect(m.id)}
                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
                      on ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {on && (
                      <motion.span
                        layoutId="beyond-tab"
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(217,70,239,0.16), rgba(168,85,247,0.08))',
                          border: '1px solid rgba(217,70,239,0.2)',
                        }}
                        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                      />
                    )}
                    <Icon size={15} className="relative z-10" />
                    <span className="relative z-10">{m.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Right group: artist profile links + (when browsable) search & sort */}
            {(artistProfiles.length > 0 || isLive) && (
              <div className="flex flex-wrap items-center justify-center gap-2 lg:flex-nowrap lg:justify-end lg:pr-1">
                {/* Artist / streaming profiles — always in view on the sticky bar,
                    so a visitor who likes a track can jump straight to it. */}
                {artistProfiles.length > 0 && (
                  <div className="flex items-center gap-1">
                    {artistProfiles.map((link) => {
                      const Icon = socialIcon(link.icon)
                      if (!Icon) return null
                      return (
                        <a
                          key={link.id ?? link.platform}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={link.platform}
                          title={link.platform}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors duration-300 hover:bg-white/[0.06] hover:text-magenta"
                        >
                          <Icon size={16} />
                        </a>
                      )
                    })}
                  </div>
                )}

                {isLive && (
                  <>
                <div className="relative flex-1 lg:flex-none lg:w-56">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Search ${active.label.toLowerCase()}…`}
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:border-magenta/40 transition-colors"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    aria-label="Sort"
                    className="appearance-none py-2 pl-3 pr-8 rounded-xl bg-white/[0.04] border border-white/[0.07] text-sm text-text-secondary focus:outline-none focus:border-magenta/40 cursor-pointer transition-colors"
                  >
                    {SORTS.map((s) => (
                      <option key={s.key} value={s.key} className="bg-elevated text-text-primary">
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <ChevronRight
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-text-muted pointer-events-none"
                  />
                </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        {isLive ? (
          <>
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="typo-section text-xl md:text-2xl">
                <span className="gradient-text">{active.label}</span>
              </h2>
              <span className="typo-body text-text-muted text-xs">
                {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {pageItems.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeId}-${safePage}-${sort}-${query}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-start"
                >
                  {pageItems.map((it, i) => (
                    <MediaCard
                      key={it.key}
                      item={it}
                      index={i}
                      isActive={it.kind === 'spotify' && playingId === it.key}
                      onSelect={handleSelect}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="py-20 text-center">
                <SearchX size={40} className="text-text-muted/30 mx-auto mb-4" />
                <p className="typo-section text-text-secondary">No matches for “{query}”</p>
                <button
                  onClick={() => setQuery('')}
                  className="mt-4 text-sm text-magenta hover:text-fuschia transition-colors"
                >
                  Clear search
                </button>
              </div>
            )}

            <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
          </>
        ) : (
          <ComingSoon medium={active} />
        )}
      </div>

      <PlayerModal
        items={filtered}
        index={videoIndex}
        onIndex={setVideoIndex}
        onClose={() => setVideoIndex(null)}
      />
    </section>
  )
}

function ComingSoon({ medium }: { medium: BeyondMedium }) {
  const Icon = mediumIcon(medium.icon)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="glass rounded-2xl p-10 md:p-14 text-center max-w-xl mx-auto"
    >
      <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-magenta/15 to-violet/10 border border-white/[0.06]">
        <Icon size={28} className="text-magenta/80" />
      </div>
      <h3 className="typo-section text-xl text-text-primary mb-3">
        {medium.label} is in the works
      </h3>
      <p className="typo-body text-text-secondary text-sm max-w-sm mx-auto leading-relaxed">
        {medium.blurb}
      </p>
      <div className="inline-flex items-center gap-2 mt-7 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-text-muted text-xs">
        <Clock size={13} className="text-violet/70" />
        Coming soon
      </div>
    </motion.div>
  )
}
