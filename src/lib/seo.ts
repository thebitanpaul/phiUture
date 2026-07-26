// ============================================
// SEO — single source of truth for all metadata
// --------------------------------------------
// Every page derives its <title>, description, canonical URL, Open Graph and
// Twitter tags, and JSON-LD from the helpers here, so nothing is duplicated or
// hard-coded per page. Consumed by the reusable <SEO> component and the
// site-wide <StructuredData> block in the Layout.
// ============================================

import aboutData from '@data/about.json'
import type { AboutData } from '@/lib/types'
import { normalizeSocial, socialSameAs } from '@/lib/social'
import { SITE_CONFIG } from '@/lib/constants'

/** Display name of the site / organization. */
export const SITE_NAME = SITE_CONFIG.name

/** Canonical origin, no trailing slash. This is the ONLY canonical host —
    the www subdomain 301s here at the Vercel/DNS layer. */
export const SITE_URL = SITE_CONFIG.url.replace(/\/+$/, '')

/** Fallback <title> for the home page and any route that sets no title. */
export const DEFAULT_TITLE = `${SITE_NAME} — Beautifully engineered technology`

/** Fallback meta description. */
export const DEFAULT_DESCRIPTION = SITE_CONFIG.description

/** Default social share image. Used as the Open Graph / Twitter image wherever
    a page doesn't supply its own. */
export const DEFAULT_OG_IMAGE =
  'https://res.cloudinary.com/b0tb1mho/image/upload/v1785090107/phiUture/BrandAssets/phiWordmark.png'

/** Official transparent logo — used for the Organization JSON-LD. */
export const ORG_LOGO =
  'https://res.cloudinary.com/b0tb1mho/image/upload/v1784753097/aj9rycbehzhpwepoc3g0.png'

/**
 * Resolves any link into an absolute URL rooted at SITE_URL.
 *  • Already-absolute (http/https) links are returned untouched.
 *  • "/" → the canonical origin with a trailing slash.
 *  • "/about" → "https://phiuture.com/about".
 */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  if (!path || path === '/') return `${SITE_URL}/`
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

// --------------------------------------------
// Structured data (JSON-LD)
// --------------------------------------------

const about = aboutData as unknown as AboutData

const SOCIAL = normalizeSocial(about.social)

/** Drops the site's own origin — `sameAs` is for OTHER URLs that identify the
    entity, and the canonical one is already the node's `url`. */
const notSelf = (url: string) => url.replace(/\/+$/, '') !== SITE_URL

/**
 * `sameAs` for each entity, derived live from about.json so adding a channel
 * there is all it takes to feed structured data too. mailto: and non-http links
 * are excluded (schema.org wants URLs), and duplicates are removed.
 *
 * The split matters: `sameAs` is how Google reconciles a node with profiles it
 * already knows, so pointing the studio at the studio's channels and the person
 * at the person's — rather than one merged list on both — is what lets it treat
 * them as two linked entities instead of one blurred one. Between them the two
 * lists still cover every link in the file.
 */
export const ORG_SAMEAS: string[] = socialSameAs(SOCIAL)
  .filter((url) => SOCIAL.business.some((l) => l.url === url))
  .filter(notSelf)

/** The person, including the artist identity — same human, same entity. */
export const PERSON_SAMEAS: string[] = socialSameAs(SOCIAL).filter((url) =>
  [...SOCIAL.people, ...SOCIAL.artist].some((l) => l.url === url)
)

// Stable @id anchors so the Organization, WebSite and Person nodes reference
// one another as a single connected graph — a strong signal to Google that the
// person and the brand behind this site are the same entity.
export const ORG_ID = `${SITE_URL}/#organization`
export const WEBSITE_ID = `${SITE_URL}/#website`
export const PERSON_ID = `${SITE_URL}/#person`

/** The founder, as an AboutData person (name, roles, bio, avatar). */
const FOUNDER = about.people?.[0]

/** Organization schema — enables Google's brand/knowledge panel. */
export function organizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: ORG_LOGO,
    description: DEFAULT_DESCRIPTION,
    founder: { '@id': PERSON_ID },
    email: SOCIAL.email,
    sameAs: ORG_SAMEAS,
  }
}

/** WebSite schema. No SearchAction: site search is client-only and not
    addressable via a URL, so advertising one would be invalid. */
export function webSiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: DEFAULT_DESCRIPTION,
    publisher: { '@id': ORG_ID },
  }
}

/**
 * Person schema for the founder — the key to associating this site with a name
 * search ("Bitan Paul" / "thebitanpaul"). `sameAs` points at the same profiles
 * that already rank for the name, so Google can tie this domain to that same
 * entity; `alternateName` covers the handle form of the name.
 */
export function personSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: SITE_CONFIG.founder,
    alternateName: 'thebitanpaul',
    url: `${SITE_URL}/`,
    ...(FOUNDER?.avatar ? { image: absoluteUrl(FOUNDER.avatar) } : {}),
    ...(FOUNDER?.roles?.length ? { jobTitle: FOUNDER.roles.join(', ') } : {}),
    ...(FOUNDER?.bio ? { description: FOUNDER.bio } : {}),
    worksFor: { '@id': ORG_ID },
    sameAs: PERSON_SAMEAS,
  }
}
