// ============================================
// Remote data — fetched at runtime via a same-origin proxy
// --------------------------------------------
// The site ships with the JSON files in src/data/ compiled in as an instant
// fallback. In production it ALSO fetches the newest committed version at
// runtime and swaps it in — so editing a file at the source, committing, and
// the LIVE site reflects it within a minute (no rebuild, no redeploy).
//
// The fetch goes to a SAME-ORIGIN API route (/api/content/<file>), which proxies
// the real source server-side (see api/content/[file].js). This keeps the
// upstream URL out of the browser Network tab and lets the source later become
// private (server-only token) without exposing anything to the client.
//
// SETUP (once, on the host — e.g. Vercel project → Environment Variables):
//   GITHUB_DATA_BASE   = https://raw.githubusercontent.com/<user>/<repo>/<branch>/src/data
//   GITHUB_DATA_TOKEN  = (optional) bearer token if the source is private
// Note: these are SERVER-only — deliberately NOT "VITE_"-prefixed, so their
// values are never bundled into or visible from the browser.
// ============================================

/** Same-origin route that proxies the content source server-side. */
const CONTENT_API = '/api/content'

/**
 * Remote loading only runs in production builds. In `vite dev` there is no
 * serverless function to answer /api/content, so we stay on the bundled data
 * (and keep the dev console clean).
 */
export const REMOTE_DATA_ENABLED = import.meta.env.PROD

/**
 * Fetches a content JSON file through the proxy. Returns `null` when the server
 * has no source configured (HTTP 204) so the caller keeps its bundled copy
 * silently; throws on a genuine failure so the caller can fall back and warn.
 */
export async function fetchRemoteJson<T>(file: string): Promise<T | null> {
  const res = await fetch(`${CONTENT_API}/${file}`, { cache: 'no-store' })
  if (res.status === 204) return null
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`)
  return (await res.json()) as T
}
