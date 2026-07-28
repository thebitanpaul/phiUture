// ============================================
// Build-time sitemap generator
// --------------------------------------------
// Runs AFTER `vite-react-ssg build` and writes dist/sitemap.xml from three
// sources, all derived from data the app already ships:
//
//   1. the static routes,
//   2. every product page in src/data/products.json, and
//   3. every PRODUCT SUBDOMAIN (vera.phiuture.com, archaitect.phiuture.com, …)
//      discovered in those products' links.
//
// (3) is the automatic part: any link on a `*.phiuture.com` host found anywhere
// in a product's `links` block is treated as that product's own site and gets
// its own sitemap entry. So giving a new product `"website":
// "https://newthing.phiuture.com"` is all it takes — the next build picks the
// subdomain up with no edit here and no hard-coded list to maintain. Links to
// third-party hosts (GitHub, YouTube, Play Store, streamlit.app…) are ignored,
// and phiuture.com / www.phiuture.com are skipped because the page routes
// already cover them.
//
// CROSS-HOST CAVEAT: a sitemap may only list URLs on hosts it is authorised
// for. Listing https://vera.phiuture.com/ inside https://phiuture.com/
// sitemap.xml is "cross-submission", which search engines accept only when the
// subdomain's OWN robots.txt points back at this sitemap. Each subdomain is a
// separate deployment, so that line has to be added there:
//
//   Sitemap: https://phiuture.com/sitemap.xml
//
// Without it the subdomain entries are ignored (harmless, just not indexed
// from here).
//
// Kept as a plain Node script (not a Vite plugin) so it runs deterministically
// after the SSG output exists, independent of plugin ordering.
// ============================================

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const DIST = resolve(ROOT, 'dist')

// Canonical origin (no trailing slash). Mirrors SITE_URL in src/lib/seo.ts.
const SITE_URL = 'https://phiuture.com'

/** Bare apex host, used to recognise `*.phiuture.com` product subdomains. */
const SITE_HOST = new URL(SITE_URL).hostname

const STATIC_ROUTES = ['/', '/about', '/products', '/beyond', '/contact']

function priorityFor(path) {
  if (path === '/') return '1.0'
  if (path.startsWith('/products/')) return '0.7'
  return '0.8'
}

/**
 * Every distinct `*.phiuture.com` origin referenced by any product link, as
 * absolute URLs, sorted for a stable diff between builds.
 *
 * Scans the whole `links` block rather than just `website`, so a product whose
 * subdomain is its demo or dashboard is found too. Non-string and unparseable
 * values are skipped rather than crashing the build — products.json is edited
 * by hand (and live, through the content proxy), so this has to tolerate a
 * half-filled entry.
 */
function productSubdomains(products) {
  const origins = new Set()

  for (const product of products) {
    const links = product?.links
    if (!links || typeof links !== 'object') continue

    for (const value of Object.values(links)) {
      if (typeof value !== 'string' || !value) continue

      let hostname
      try {
        ;({ hostname } = new URL(value))
      } catch {
        continue // not an absolute URL — nothing to derive a host from
      }

      hostname = hostname.toLowerCase()
      // The apex and www already have page routes in this same sitemap.
      if (hostname === SITE_HOST || hostname === `www.${SITE_HOST}`) continue
      if (!hostname.endsWith(`.${SITE_HOST}`)) continue

      origins.add(`https://${hostname}/`)
    }
  }

  return [...origins].sort()
}

function main() {
  if (!existsSync(DIST)) {
    console.error('[sitemap] dist/ not found — run this after the build.')
    process.exit(1)
  }

  const products =
    JSON.parse(readFileSync(resolve(ROOT, 'src/data/products.json'), 'utf-8'))
      .products ?? []
  const productRoutes = products.map((p) => `/products/${p.slug}`)
  const subdomains = productSubdomains(products)

  const lastmod = new Date().toISOString().slice(0, 10)

  const entry = (loc, changefreq, priority) =>
    [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n')

  const pageEntries = [...STATIC_ROUTES, ...productRoutes].map((path) =>
    entry(
      path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`,
      'weekly',
      priorityFor(path)
    )
  )

  // Product sites change on their own release cadence, not this site's, so they
  // get `monthly` and sit just below the product pages that describe them.
  const subdomainEntries = subdomains.map((loc) => entry(loc, 'monthly', '0.6'))

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...pageEntries, ...subdomainEntries].join('\n')}
</urlset>
`

  writeFileSync(resolve(DIST, 'sitemap.xml'), xml)

  const total = pageEntries.length + subdomainEntries.length
  console.log(
    `[sitemap] wrote ${total} URLs (${STATIC_ROUTES.length} static + ${productRoutes.length} products + ${subdomains.length} product subdomains) → dist/sitemap.xml`
  )
  if (subdomains.length) console.log(`[sitemap] subdomains: ${subdomains.join(', ')}`)
}

main()
