// ============================================
// phiUture service worker
// --------------------------------------------
// Makes the site installable and keeps a small offline shell. Served verbatim
// from public/, so it is plain JS with no build step and no imports.
//
// THE ONE RULE THIS FILE IS BUILT AROUND: never serve HTML from cache before
// trying the network. A cache-first document is how PWAs pin visitors to a dead
// build — the browser keeps replaying an old page whose asset and manifest URLs
// the server no longer has, which is exactly the "Unexpected token '<'" class of
// crash this site already had to fix. Documents are always network-first here;
// the cache is a fallback for offline only.
//
// Cache-first is reserved for URLs that are safe to keep forever because their
// content can never change behind the name: the content-hashed /assets/ output
// and a short list of static icons.
//
// Deliberately NOT cached:
//   • /api/*                      — dynamic, and cheap to re-fetch
//   • cross-origin requests       — Cloudinary media and Google Fonts already
//                                   ship immutable headers, so the browser HTTP
//                                   cache covers them. Copying hundreds of
//                                   Cloudinary animation frames into Cache
//                                   Storage would just risk a quota eviction
//                                   that takes the app shell with it.
//   • /*ScrollAnimation/*         — same reasoning for the local frame folders,
//                                   which are immutable via vercel.json headers.
//
// Bump VERSION to force every cache to be rebuilt on the next deploy.
// ============================================

const VERSION = 'v1'

const DOC_CACHE = `phiuture-doc-${VERSION}`
const ASSET_CACHE = `phiuture-asset-${VERSION}`
const ICON_CACHE = `phiuture-icon-${VERSION}`

const CURRENT_CACHES = [DOC_CACHE, ASSET_CACHE, ICON_CACHE]

const OFFLINE_URL = '/offline.html'

/** Enough to render something branded with no network at all. */
const PRECACHE = [
  OFFLINE_URL,
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/favicon.png',
  '/manifest.webmanifest',
]

/** Keep the document cache from growing without bound. */
const MAX_DOC_ENTRIES = 30

// --------------------------------------------
// Install / activate
// --------------------------------------------

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(ICON_CACHE)
      // Individually, so one missing file can't fail the whole install.
      await Promise.all(
        PRECACHE.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
        )
      )
      await self.skipWaiting()
    })()
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((key) => key.startsWith('phiuture-') && !CURRENT_CACHES.includes(key))
          .map((key) => caches.delete(key))
      )
      await self.clients.claim()
    })()
  )
})

// Lets the page ask a waiting worker to take over immediately.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})

// --------------------------------------------
// Fetch strategies
// --------------------------------------------

const FRAME_DIR = /^\/(Home|Products|Beyond|Hero)ScrollAnimation\//

function isDocumentRequest(request) {
  return (
    request.mode === 'navigate' ||
    (request.method === 'GET' &&
      (request.headers.get('accept') || '').includes('text/html'))
  )
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  // Cache Storage preserves insertion order, so the front of the list is oldest.
  for (const key of keys.slice(0, Math.max(0, keys.length - maxEntries))) {
    await cache.delete(key)
  }
}

/**
 * Stores a response WITHOUT ever being able to affect what the visitor gets.
 * Deliberately not awaited by the caller and swallowing its own failures: a
 * `cache.put` can legitimately reject (a redirected response, storage quota
 * exceeded, a partial response), and letting that bubble would turn a perfectly
 * good network response into a failed request — the offline page in place of a
 * page that loaded fine.
 */
function cacheInBackground(cacheName, request, response, maxEntries) {
  // Cache API refuses redirected and non-basic responses; skip rather than throw.
  if (!response || !response.ok || response.redirected) return
  if (response.type !== 'basic' && response.type !== 'default') return

  const copy = response.clone()
  const store = async () => {
    const cache = await caches.open(cacheName)
    await cache.put(request, copy)
    if (maxEntries) await trimCache(cacheName, maxEntries)
  }
  store().catch(() => {})
}

/** Documents: network first, cache only as an offline fallback. */
async function handleDocument(request) {
  let response
  try {
    response = await fetch(request)
  } catch {
    // Genuinely offline — this is the only path that may serve a stale document.
    const cached = await caches.match(request, { ignoreSearch: true })
    if (cached) return cached
    const offline = await caches.match(OFFLINE_URL)
    if (offline) return offline
    return new Response('Offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  cacheInBackground(DOC_CACHE, request, response, MAX_DOC_ENTRIES)
  return response
}

/** Immutable, content-addressed URLs: cache first, fill on miss. */
async function handleImmutable(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached

  const response = await fetch(request)
  cacheInBackground(cacheName, request, response)
  return response
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Only plain GETs. Never interfere with a POST, a range request, or a
  // cross-origin call — those go straight to the network.
  if (request.method !== 'GET') return
  if (request.headers.has('range')) return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // The content proxy is dynamic; the animation frames are already immutable at
  // the HTTP layer and far too numerous to hold in Cache Storage.
  if (url.pathname.startsWith('/api/')) return
  if (FRAME_DIR.test(url.pathname)) return

  if (isDocumentRequest(request)) {
    event.respondWith(handleDocument(request))
    return
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(handleImmutable(request, ASSET_CACHE))
    return
  }

  if (url.pathname.startsWith('/icons/')) {
    event.respondWith(handleImmutable(request, ICON_CACHE))
    return
  }

  // Everything else same-origin (robots.txt, sitemap, llms.txt, the manifest,
  // stray images) is left to the network and the browser's own HTTP cache.
})
