// ============================================
// Remote data — GitHub-hosted JSON, fetched at runtime
// --------------------------------------------
// The site ships with the JSON files in src/data/ compiled in as an
// instant fallback. When a GitHub base URL is configured below, each
// page ALSO fetches the newest committed version of its JSON directly
// from GitHub at runtime (cache-busted, no-store) and swaps it in.
//
// => Edit any file in src/data/*.json on GitHub, commit, and the LIVE
//    site reflects it within a minute — no rebuild, no redeploy.
//
// SETUP (once): set the base to your repo's raw path — the folder that
// contains the JSON files. Two ways (env wins over the constant):
//
//   1. .env  (recommended):
//        VITE_GITHUB_DATA_BASE="https://raw.githubusercontent.com/USER/REPO/BRANCH/src/data"
//
//   2. Or hard-code CONFIG_BASE just below.
//
// Leave it empty to run purely on the bundled JSON (no runtime fetch).
// ============================================

// Optional hard-coded base (used only if the env var is not set).
// e.g. 'https://raw.githubusercontent.com/bitanpaul/phiuture/main/src/data'
const CONFIG_BASE = ''

const ENV_BASE = (import.meta.env.VITE_GITHUB_DATA_BASE as string | undefined) ?? ''

/** Base URL of the folder holding the JSON files (no trailing slash). */
export const REMOTE_DATA_BASE = (ENV_BASE || CONFIG_BASE).trim().replace(/\/+$/, '')

/** Whether runtime remote loading is turned on. */
export const REMOTE_DATA_ENABLED = REMOTE_DATA_BASE.length > 0

/** Raw URL for a given JSON file name (e.g. "products.json"). */
export function rawUrl(file: string): string {
  return `${REMOTE_DATA_BASE}/${file}`
}

/**
 * Fetches a JSON file from the configured GitHub base, aggressively
 * bypassing caches so the newest commit is picked up. Throws on any
 * failure so callers can fall back to the bundled copy.
 */
export async function fetchRemoteJson<T>(file: string): Promise<T> {
  if (!REMOTE_DATA_ENABLED) {
    throw new Error('Remote data is not configured')
  }
  // Cache-bust so GitHub's CDN and the browser both serve fresh content.
  const url = `${rawUrl(file)}?t=${Date.now()}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`)
  return (await res.json()) as T
}
