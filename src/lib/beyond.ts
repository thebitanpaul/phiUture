// ============================================
// Beyond — shared selectors
// --------------------------------------------
// Pure functions over the beyond.json shape, mirroring lib/products.ts. They
// take the current dataset (bundled or remotely loaded) so the same code works
// for both sources.
//
// The home page's Beyond section is data-driven: the `featured` block in
// beyond.json names which release and which videos it shows. Since that file is
// fetched at runtime, editing those slugs restyles the home page on the fly —
// no rebuild, no redeploy.
// ============================================

import type {
  BeyondData,
  BeyondMedium,
  BeyondMusicItem,
  BeyondVideo,
} from './types'

/** One medium by id ("music", "video", "images"…). */
export const getMedium = (
  data: BeyondData,
  id: string
): BeyondMedium | undefined => (data.mediums ?? []).find((m) => m.id === id)

/**
 * The release for the home page's "Fresh Release" card — whichever Music item
 * `featured["fresh release"]` names. Falls back to the first release when the
 * field is absent or names a slug that no longer exists, so a typo degrades to
 * the old behaviour instead of an empty card.
 */
export function getFreshRelease(data: BeyondData): BeyondMusicItem | undefined {
  const music = getMedium(data, 'music')?.music ?? []
  const slug = data.featured?.['fresh release']
  const pick = slug ? music.find((m) => m.slug === slug) : undefined
  return pick ?? music[0]
}

/**
 * The clips for the home page's "Latest Videos" grid — the Video items named by
 * `featured["latest videos"]`, in exactly that order. Unknown slugs are skipped;
 * if none resolve, the first `limit` videos are used.
 */
export function getLatestVideos(data: BeyondData, limit = 4): BeyondVideo[] {
  const videos = getMedium(data, 'video')?.videos ?? []
  const slugs = data.featured?.['latest videos'] ?? []

  const picked = slugs
    .map((slug) => videos.find((v) => v.slug === slug))
    .filter((v): v is BeyondVideo => Boolean(v))

  return (picked.length > 0 ? picked : videos).slice(0, limit)
}
