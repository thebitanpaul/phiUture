// ============================================================================
// Rate limiter for the serverless functions
// ----------------------------------------------------------------------------
// The leading underscore is load-bearing: Vercel turns every file under api/
// into a route EXCEPT those prefixed with `_`, which is the convention for
// shared code. Renaming this file without the underscore would publish it as a
// public endpoint.
//
// Fixed-window counter, keyed by client IP, held in the function instance's
// memory. Fluid Compute reuses instances across requests, so a burst from one
// client lands on a warm instance and gets counted.
//
// WHAT THIS IS FOR, AND WHAT IT IS NOT
//
// This is the application's own backstop: it stops a single script from
// hammering /api/content in a loop, which is the one route here that costs real
// money (a function invocation plus an upstream fetch). It is cheap, has no
// dependencies, and adds no latency.
//
// It is NOT a DDoS defence, and nothing written in application code can be.
// A flood has already cost you the invocation by the time this function runs,
// and a distributed attack spreads across enough IPs and enough regions that
// per-instance counters never see it. Volumetric traffic has to be dropped
// BEFORE it reaches the app:
//
//   • Vercel's platform DDoS mitigation (L3/L4/L7) is always on, every plan,
//     no configuration, and blocked traffic is not billed.
//   • Vercel WAF rate-limit rules count at the edge across the whole project
//     and are the real per-IP throttle for the static pages, which never invoke
//     a function at all and so can never reach this code. README.md has the
//     exact `vercel firewall` commands to add them.
//   • Attack Challenge Mode is the switch to flip during an active attack.
//
// Two known limits of the in-memory approach, both acceptable here:
//   1. Counters are per instance, so N warm instances allow up to N× the limit.
//      The edge rules are what enforce a hard global ceiling.
//   2. A cold start begins with an empty counter.
// Swapping the Map for a shared store (e.g. Upstash Redis via the Vercel
// Marketplace) would fix both, at the cost of a dependency, a paid add-on, and
// a network round-trip on every request — not a trade worth making for a route
// that serves three small JSON files.
// ============================================================================

/** Rolling map of `key -> { count, resetAt }`. Reset lazily, on read. */
const buckets = new Map()

/** Hard cap on tracked keys, so a spray of spoofed IPs can't grow the map
    without bound. Oldest entries are evicted first (Map keeps insertion order). */
const MAX_TRACKED_KEYS = 5000

/**
 * Best-effort client IP. On Vercel `x-forwarded-for` is set by the platform and
 * its FIRST entry is the real client; `x-real-ip` is a fallback. Both are
 * spoofable in principle, which is fine — a spoofing client just lands in
 * another bucket, and the edge rules catch that pattern.
 */
export function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return String(forwarded[0]).split(',')[0].trim()
  }
  const realIp = req.headers['x-real-ip']
  if (typeof realIp === 'string' && realIp.length > 0) return realIp
  return req.socket?.remoteAddress ?? 'unknown'
}

function evictIfNeeded() {
  if (buckets.size <= MAX_TRACKED_KEYS) return
  const overflow = buckets.size - MAX_TRACKED_KEYS
  let removed = 0
  for (const key of buckets.keys()) {
    buckets.delete(key)
    if (++removed >= overflow) break
  }
}

/**
 * Counts one request against `key`.
 *
 * @param {string} key             Bucket identity, usually the client IP.
 * @param {object} [options]
 * @param {number} [options.limit]      Requests allowed per window.
 * @param {number} [options.windowMs]   Window length in milliseconds.
 * @returns {{ allowed: boolean, limit: number, remaining: number, resetAt: number, retryAfter: number }}
 */
export function rateLimit(key, { limit = 30, windowMs = 60_000 } = {}) {
  const now = Date.now()
  let bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs }
    // Re-insert so the key moves to the end of the eviction order.
    buckets.delete(key)
    buckets.set(key, bucket)
    evictIfNeeded()
  }

  bucket.count += 1

  const remaining = Math.max(0, limit - bucket.count)
  return {
    allowed: bucket.count <= limit,
    limit,
    remaining,
    resetAt: bucket.resetAt,
    retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  }
}

/**
 * Applies `rateLimit` and writes the standard headers. Returns `true` when the
 * caller should stop — a 429 has already been sent.
 *
 * Usage:
 *   if (enforceRateLimit(req, res, { limit: 30, windowMs: 60_000 })) return
 */
export function enforceRateLimit(req, res, options) {
  const result = rateLimit(clientIp(req), options)

  res.setHeader('RateLimit-Limit', String(result.limit))
  res.setHeader('RateLimit-Remaining', String(result.remaining))
  res.setHeader('RateLimit-Reset', String(result.retryAfter))

  if (result.allowed) return false

  res.setHeader('Retry-After', String(result.retryAfter))
  // Never let a 429 be cached — the next request from a different client behind
  // the same edge must not be served this response.
  res.setHeader('Cache-Control', 'no-store')
  res.status(429).json({
    error: 'Too many requests',
    retryAfter: result.retryAfter,
  })
  return true
}
