// ============================================
// SEO — reusable per-page metadata component
// --------------------------------------------
// Renders into the document <head> via vite-react-ssg's <Head> (a wrapper
// around react-helmet-async). Using <Head> — rather than react-helmet-async
// directly — is what lets these tags be STATICALLY extracted into the
// prerendered HTML at build time, so crawlers see them without running JS.
//
// One <SEO> per page. Duplicate tags are merged by react-helmet-async
// (last mounted wins), and since only pages emit a canonical link there is
// never more than one canonical per page.
// ============================================

import { Head } from 'vite-react-ssg'
import {
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
} from '@/lib/seo'

export interface SEOProps {
  /** Page-specific title segment, e.g. "Products" → "Products — phiUture".
      Omit on the home page to use the full-brand default title. */
  title?: string
  /** Unique meta description. Falls back to the site default. */
  description?: string
  /** Route path for the canonical + og:url, e.g. "/about". Required so every
      page declares exactly one correct canonical URL. */
  path: string
  /** Social share image. Absolute URLs pass through; site-relative paths are
      resolved against the origin. Falls back to the default OG image. */
  image?: string
  /** Open Graph type — "website" for listing pages, "article" for details. */
  type?: 'website' | 'article'
  /** Exclude from search indexes (e.g. the 404 page). */
  noindex?: boolean
  /** Optional page-level JSON-LD (site-wide Org/WebSite live in the Layout). */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

export function SEO({
  title,
  description,
  path,
  image,
  type = 'website',
  noindex = false,
  jsonLd,
}: SEOProps) {
  const pageTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE
  const desc = description ?? DEFAULT_DESCRIPTION
  const canonical = absoluteUrl(path)
  const ogImage = image ? absoluteUrl(image) : DEFAULT_OG_IMAGE
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : null}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />

      {/* Optional page-level structured data */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Head>
  )
}

/**
 * Site-wide JSON-LD block, rendered once in the Layout so every page carries
 * the Organization + WebSite schema. Kept separate from <SEO> so it never
 * competes with page-level canonical/OG tags.
 */
export function StructuredData({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[]
}) {
  const arr = Array.isArray(data) ? data : [data]
  return (
    <Head>
      {arr.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Head>
  )
}
