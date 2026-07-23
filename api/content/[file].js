// ============================================================================
// Content proxy — Vercel serverless function
// ----------------------------------------------------------------------------
// The site's editable content (products / beyond / about JSON) is fetched at
// runtime so edits to the source propagate to the live site without a redeploy.
// The browser calls this SAME-ORIGIN route (/api/content/<file>.json); this
// function fetches the real source server-side and returns it. Two benefits:
//
//   1. The upstream URL never appears in the browser Network tab — visitors see
//      only your own domain.
//   2. Future-ready for a PRIVATE source: point GITHUB_DATA_BASE at a private
//      repo/endpoint and add GITHUB_DATA_TOKEN — the token stays on the server
//      and is never shipped to the client.
//
// Server-only env vars (NOT VITE_-prefixed, so never bundled into the client):
//   GITHUB_DATA_BASE   e.g. https://raw.githubusercontent.com/<user>/<repo>/<branch>/src/data
//   GITHUB_DATA_TOKEN  (optional) bearer token for a private source
// ============================================================================

// Only these files may be proxied — never let the path parameter fetch anything
// else from the upstream base.
const ALLOWED = new Set(['products.json', 'beyond.json', 'about.json'])

export default async function handler(req, res) {
  const file = req.query.file
  if (typeof file !== 'string' || !ALLOWED.has(file)) {
    return res.status(404).json({ error: 'Unknown content file' })
  }

  const base = process.env.GITHUB_DATA_BASE
  if (!base) {
    // Source not configured → 204 tells the client to keep its bundled copy,
    // quietly (a 204 is a success, so it logs nothing in the console).
    return res.status(204).end()
  }

  try {
    const headers = { Accept: 'application/json' }
    if (process.env.GITHUB_DATA_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_DATA_TOKEN}`
    }

    const upstream = await fetch(`${base.replace(/\/+$/, '')}/${file}`, {
      headers,
      cache: 'no-store',
    })
    if (!upstream.ok) {
      return res.status(502).json({ error: `Upstream ${upstream.status}` })
    }

    const data = await upstream.json()
    // Fresh within ~a minute at the edge; serve stale briefly while revalidating,
    // so we don't hit the upstream on every single request.
    res.setHeader(
      'Cache-Control',
      'public, max-age=0, s-maxage=60, stale-while-revalidate=300'
    )
    return res.status(200).json(data)
  } catch {
    return res.status(502).json({ error: 'Content fetch failed' })
  }
}
