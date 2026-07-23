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

/** Default social share image (1200×630). Used as the Open Graph / Twitter
    image wherever a page doesn't supply its own. */
export const DEFAULT_OG_IMAGE =
  'https://res.cloudinary.com/b0tb1mho/image/upload/v1784753097/lgvkw3dn9w5veqhbej2b.png'

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

/**
 * Social profiles for the Organization `sameAs` array — derived live from
 * about.json (connect + profiles), so adding a channel there also feeds SEO.
 * mailto: and non-http links are excluded; duplicates are removed.
 */
export const SOCIAL_SAMEAS: string[] = Array.from(
  new Set(
    [...(about.social?.connect ?? []), ...(about.social?.profiles ?? [])]
      .map((s) => s.url)
      .filter((u) => /^https?:\/\//i.test(u))
  )
)

/** Organization schema — enables Google's brand/knowledge panel. */
export function organizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: ORG_LOGO,
    description: DEFAULT_DESCRIPTION,
    founder: { '@type': 'Person', name: SITE_CONFIG.founder },
    sameAs: SOCIAL_SAMEAS,
  }
}

/** WebSite schema. No SearchAction: site search is client-only and not
    addressable via a URL, so advertising one would be invalid. */
export function webSiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: DEFAULT_DESCRIPTION,
  }
}
