// ============================================
// Social links — one normalizer, three groups
// --------------------------------------------
// about.json splits every link into `business`, `people` and `artist`. This
// module turns whatever shape the file happens to be in into a complete set of
// those three groups, and derives the two flattened views the app needs (the
// footer row, and the `sameAs` list for structured data).
//
// The reason normalization is needed at all: about.json is bundled AND fetched
// at runtime from the content source, so the running code can briefly be paired
// with an older copy of the file. Rather than guarding for that in every
// component, it is handled once, here.
// ============================================

import type { AboutSocial, ResolvedSocial, SocialLink } from '@/lib/types'

/** Drops entries with no usable URL and de-duplicates by URL, first wins. */
function clean(links: SocialLink[] | undefined): SocialLink[] {
  if (!Array.isArray(links)) return []
  const seen = new Set<string>()
  return links.filter((link) => {
    if (!link?.url || !link.platform) return false
    if (seen.has(link.url)) return false
    seen.add(link.url)
    return true
  })
}

/** Icon keys that identify a link as a music/streaming channel. */
const ARTIST_ICONS = new Set([
  'spotify',
  'applemusic',
  'amazonmusic',
  'youtubemusic',
  'jiosaavn',
])

/**
 * Fills in every group, mapping the pre-split `connect` / `profiles` shape onto
 * the new groups when that's all the data has:
 *   • `connect`  was professional / direct contact  → people
 *   • `profiles` was audience channels             → artist if it's a streaming
 *                                                    platform, else people
 */
export function normalizeSocial(social: AboutSocial): ResolvedSocial {
  const business = clean(social.business)
  const people = clean(social.people)
  const artist = clean(social.artist)

  if (business.length || people.length || artist.length) {
    return {
      email: social.email,
      founderEmail: social.founderEmail,
      business,
      people,
      artist,
    }
  }

  // Legacy copy of about.json — derive the groups from the old two arrays.
  const legacyProfiles = clean(social.profiles)
  return {
    email: social.email,
    founderEmail: social.founderEmail,
    business: [],
    people: [
      ...clean(social.connect),
      ...legacyProfiles.filter((l) => !ARTIST_ICONS.has(l.icon)),
    ],
    artist: legacyProfiles.filter((l) => ARTIST_ICONS.has(l.icon)),
  }
}

/** Every link, across all three groups, in Business → People → Artist order. */
export function allSocialLinks(social: ResolvedSocial): SocialLink[] {
  return [...social.business, ...social.people, ...social.artist]
}

/**
 * The compact footer row: any link flagged `footer: true` in any group, keeping
 * the group ordering. Flagging lives in the JSON so the row can be re-curated
 * without touching code.
 */
export function footerSocialLinks(social: ResolvedSocial): SocialLink[] {
  return allSocialLinks(social).filter((link) => link.footer)
}

/**
 * Absolute http(s) profile URLs for the `sameAs` array in the Organization and
 * Person schemas — the signal that ties this domain to the profiles that already
 * rank for the name. mailto: and relative links are excluded (schema.org
 * `sameAs` expects a URL for the same entity), and duplicates are removed.
 */
export function socialSameAs(social: ResolvedSocial): string[] {
  return Array.from(
    new Set(
      allSocialLinks(social)
        .map((link) => link.url)
        .filter((url) => /^https?:\/\//i.test(url))
    )
  )
}
