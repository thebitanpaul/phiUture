// ============================================
// Build-time sitemap generator
// --------------------------------------------
// Runs AFTER `vite-react-ssg build` and writes dist/sitemap.xml from the
// static routes + every product in src/data/products.json. Because it reads
// the same JSON the app ships, adding a product and pushing means the next
// Vercel build regenerates the sitemap automatically — no manual editing.
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

const STATIC_ROUTES = ['/', '/about', '/products', '/beyond', '/contact']

function priorityFor(path) {
  if (path === '/') return '1.0'
  if (path.startsWith('/products/')) return '0.7'
  return '0.8'
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
  const routes = [...STATIC_ROUTES, ...productRoutes]

  const lastmod = new Date().toISOString().slice(0, 10)

  const body = routes
    .map((path) => {
      const loc = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`
      return [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        '    <changefreq>weekly</changefreq>',
        `    <priority>${priorityFor(path)}</priority>`,
        '  </url>',
      ].join('\n')
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

  writeFileSync(resolve(DIST, 'sitemap.xml'), xml)
  console.log(
    `[sitemap] wrote ${routes.length} URLs (${STATIC_ROUTES.length} static + ${productRoutes.length} products) → dist/sitemap.xml`
  )
}

main()
