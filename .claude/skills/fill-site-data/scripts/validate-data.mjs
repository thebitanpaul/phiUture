// ============================================
// Content-file validator
// --------------------------------------------
// Checks the invariants that the app's types cannot enforce, because all three
// files under src/data are ALSO fetched at runtime from the content source and
// so are never typechecked against the shapes in src/lib/types.ts.
//
// Catches the failures that are silent at runtime and therefore easy to ship:
// a duplicate id, a featured slug with a typo (renders as a missing card, not an
// error), an enum value the UI has no case for, a product whose fields are in the
// wrong order.
//
// Run from the repo root:
//   node .claude/skills/fill-site-data/scripts/validate-data.mjs
//
// Exits 1 on any error. Warnings do not fail the run.
// ============================================

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const DATA = resolve(process.cwd(), 'src/data')

const errors = []
const warnings = []
const err = (where, msg) => errors.push(`${where}: ${msg}`)
const warn = (where, msg) => warnings.push(`${where}: ${msg}`)

// --------------------------------------------
// Allowed values — keep in sync with src/lib/types.ts
// --------------------------------------------

const CATEGORIES = ['applications', 'ai', 'automation', 'data', 'research', 'games']
const STATUSES = ['live', 'beta', 'research', 'prototype', 'opensource', 'archived']
const MEDIUM_STATUSES = ['live', 'coming-soon']
const MEDIUM_ICONS = ['music', 'video', 'images']
const KPI_KINDS = ['years', 'github', 'products', 'ai-products', 'records', 'videos']
const JOURNEY_ICONS = [
  'graduation', 'cpu', 'smartphone', 'award', 'briefcase', 'lightbulb', 'target',
]
const CAPABILITY_ICONS = ['appwindow', 'cpu', 'database', 'flask', 'sparkles', 'workflow']
const SOCIAL_ICONS = [
  'github', 'linkedin', 'mail', 'globe', 'x', 'instagram', 'facebook', 'youtube',
  'spotify', 'applemusic', 'amazonmusic', 'youtubemusic', 'googleplay',
  'snapchat', 'threads', 'jiosaavn',
]

/** Canonical product field order — see references/products.md. */
const PRODUCT_FIELD_ORDER = [
  'id', 'slug', 'date',
  'name', 'tagline', 'category', 'subcategory', 'status',
  'overview', 'icon', 'heroImage',
  'features', 'problem', 'solution', 'gallery',
  'trigger', 'process', 'outcome',
  'dataFlow', 'kpis', 'insights',
  'motivation', 'findings',
  'technologies', 'architecture', 'challenges',
  'results', 'metrics',
  'links', 'relatedProducts',
]

// --------------------------------------------
// Helpers
// --------------------------------------------

function load(file) {
  try {
    return JSON.parse(readFileSync(resolve(DATA, file), 'utf-8'))
  } catch (e) {
    err(file, `does not parse — ${e.message}`)
    return null
  }
}

/** Flags any id or slug used twice within one collection. */
function checkUnique(where, items, key) {
  const seen = new Map()
  for (const [i, item] of items.entries()) {
    const value = item?.[key]
    if (value === undefined || value === '') {
      err(where, `[${i}] is missing "${key}"`)
      continue
    }
    if (seen.has(value)) {
      err(where, `duplicate ${key} "${value}" at [${i}] and [${seen.get(value)}]`)
    } else {
      seen.set(value, i)
    }
  }
}

function checkEnum(where, value, allowed, field) {
  if (value === undefined) return
  if (!allowed.includes(value)) {
    err(where, `"${field}" is "${value}" — must be one of ${allowed.join(', ')}`)
  }
}

function checkRequired(where, item, fields) {
  for (const f of fields) {
    const v = item?.[f]
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) {
      err(where, `missing required "${f}"`)
    }
  }
}

/** `phi-<prefix>-NNN`, and reports the next free number for the caller. */
function checkIdFormat(where, items, prefix) {
  const pattern = new RegExp(`^phi-${prefix}-\\d{3}$`)
  let max = 0
  for (const item of items) {
    const id = item?.id
    if (typeof id !== 'string') continue
    if (!pattern.test(id)) {
      warn(where, `id "${id}" does not match phi-${prefix}-NNN`)
      continue
    }
    max = Math.max(max, Number(id.slice(-3)))
  }
  return max
}

// --------------------------------------------
// products.json
// --------------------------------------------

const products = load('products.json')
const productSlugs = new Set()

if (products) {
  const list = Array.isArray(products.products) ? products.products : []
  if (!list.length) err('products.json', '"products" is missing or empty')

  checkUnique('products.json', list, 'id')
  checkUnique('products.json', list, 'slug')
  const maxId = checkIdFormat('products.json', list, 'prod')

  for (const p of list) {
    const where = `products.json → ${p?.slug ?? p?.id ?? '?'}`
    productSlugs.add(p?.slug)

    checkRequired(where, p, [
      'id', 'slug', 'name', 'tagline', 'category', 'status', 'overview',
    ])
    checkEnum(where, p?.category, CATEGORIES, 'category')
    checkEnum(where, p?.status, STATUSES, 'status')

    // Field order — compare the entry's own keys against the canonical order
    // with the absent ones removed, so an omitted field is never an error.
    const keys = Object.keys(p ?? {})
    const unknown = keys.filter((k) => !PRODUCT_FIELD_ORDER.includes(k))
    if (unknown.length) warn(where, `unknown field(s): ${unknown.join(', ')}`)
    const expected = PRODUCT_FIELD_ORDER.filter((k) => keys.includes(k))
    const actual = keys.filter((k) => PRODUCT_FIELD_ORDER.includes(k))
    if (actual.join() !== expected.join()) {
      // Point at the first divergence rather than dumping the whole order —
      // that is the field that actually has to move.
      const at = actual.findIndex((k, i) => k !== expected[i])
      err(
        where,
        `field order differs from canonical — at position ${at + 1} expected ` +
          `"${expected[at]}" but found "${actual[at]}". Canonical order is in ` +
          `references/products.md.`
      )
    }

    if (p?.date !== undefined && !/^\d{4}$/.test(String(p.date))) {
      warn(where, `"date" is "${p.date}" — expected a 4-digit year string`)
    }
    if (p?.links !== undefined && (typeof p.links !== 'object' || p.links === null)) {
      err(where, '"links" must be an object')
    }
  }

  // Deliberately NOT checked: whether the array is in date order. New products
  // belong at the TOP (see references/products.md), but the existing entries are
  // not strictly date-sorted and the UI sorts by date at render time anyway — so
  // a check here would warn on every run and train everyone to ignore the tool.

  if (maxId) console.log(`  next product id: phi-prod-${String(maxId + 1).padStart(3, '0')}`)

  // featured → slug must resolve
  const featured = products.featured
  if (!featured || typeof featured !== 'object') {
    err('products.json', '"featured" is missing')
  } else {
    for (const [rank, slug] of Object.entries(featured)) {
      if (!/^\d+$/.test(rank)) err('products.json → featured', `rank "${rank}" is not a number`)
      if (!productSlugs.has(slug)) {
        err('products.json → featured', `rank "${rank}" points at "${slug}", which is not a product slug`)
      }
    }
  }

  // relatedProducts → slug must resolve, and must not be self
  for (const p of list) {
    for (const slug of p?.relatedProducts ?? []) {
      if (slug === p.slug) {
        warn(`products.json → ${p.slug}`, 'lists itself in relatedProducts')
      } else if (!productSlugs.has(slug)) {
        err(`products.json → ${p.slug}`, `relatedProducts has "${slug}", which is not a product slug`)
      }
    }
  }
}

// --------------------------------------------
// beyond.json
// --------------------------------------------

const beyond = load('beyond.json')

if (beyond) {
  const mediums = Array.isArray(beyond.mediums) ? beyond.mediums : []
  if (!mediums.length) err('beyond.json', '"mediums" is missing or empty')

  checkUnique('beyond.json', mediums, 'id')

  const musicSlugs = new Set()
  const videoSlugs = new Set()

  for (const m of mediums) {
    const where = `beyond.json → ${m?.id ?? '?'}`
    checkRequired(where, m, ['id', 'label', 'status', 'icon', 'blurb'])
    checkEnum(where, m?.status, MEDIUM_STATUSES, 'status')
    checkEnum(where, m?.icon, MEDIUM_ICONS, 'icon')

    if (Array.isArray(m?.music)) {
      checkUnique(`${where}.music`, m.music, 'id')
      checkUnique(`${where}.music`, m.music, 'slug')
      const max = checkIdFormat(`${where}.music`, m.music, 'music')
      if (max) console.log(`  next music id: phi-music-${String(max + 1).padStart(3, '0')}`)
      for (const item of m.music) {
        const iw = `${where}.music → ${item?.slug ?? item?.id ?? '?'}`
        checkRequired(iw, item, ['id', 'slug', 'spotifyId'])
        if (item?.spotifyId && !/^[A-Za-z0-9]{22}$/.test(item.spotifyId)) {
          warn(iw, `spotifyId "${item.spotifyId}" is not a 22-character Spotify id`)
        }
        if (!item?.title) warn(iw, 'no "title" — the UI will fall back to a live Spotify lookup')
        musicSlugs.add(item?.slug)
      }
    }

    if (Array.isArray(m?.videos)) {
      checkUnique(`${where}.videos`, m.videos, 'id')
      checkUnique(`${where}.videos`, m.videos, 'slug')
      const max = checkIdFormat(`${where}.videos`, m.videos, 'video')
      if (max) console.log(`  next video id: phi-video-${String(max + 1).padStart(3, '0')}`)
      for (const item of m.videos) {
        const iw = `${where}.videos → ${item?.slug ?? item?.id ?? '?'}`
        checkRequired(iw, item, ['id', 'slug', 'title', 'youtubeId'])
        if (item?.youtubeId && !/^[\w-]{11}$/.test(item.youtubeId)) {
          warn(iw, `youtubeId "${item.youtubeId}" is not an 11-character YouTube id`)
        }
        videoSlugs.add(item?.slug)
      }
    }

    if (m?.status === 'live' && !m?.music?.length && !m?.videos?.length) {
      warn(where, 'status is "live" but it has no music or videos')
    }
  }

  // featured → resolved WITHIN the medium each key feeds
  const featured = beyond.featured ?? {}
  const fresh = featured['fresh release']
  if (fresh && !musicSlugs.has(fresh)) {
    err('beyond.json → featured', `"fresh release" is "${fresh}", which is not a music slug`)
  }
  const latest = featured['latest videos']
  if (latest !== undefined && !Array.isArray(latest)) {
    err('beyond.json → featured', '"latest videos" must be an array of video slugs')
  } else {
    for (const slug of latest ?? []) {
      if (!videoSlugs.has(slug)) {
        err('beyond.json → featured', `"latest videos" has "${slug}", which is not a video slug`)
      }
    }
    if (Array.isArray(latest) && latest.length < 4) {
      warn('beyond.json → featured', `"latest videos" has ${latest.length} of the 4 the grid shows`)
    }
  }
}

// --------------------------------------------
// about.json
// --------------------------------------------

const about = load('about.json')

if (about) {
  const people = Array.isArray(about.people) ? about.people : []
  if (!people.length) err('about.json', '"people" is missing or empty')
  checkUnique('about.json → people', people, 'id')
  checkIdFormat('about.json → people', people, 'people')

  const journeyAll = []
  for (const p of people) {
    const where = `about.json → ${p?.name ?? p?.id ?? '?'}`
    checkRequired(where, p, ['id', 'name', 'monogram', 'location', 'roles', 'bio', 'journey'])
    for (const j of p?.journey ?? []) {
      journeyAll.push(j)
      const jw = `${where} → journey ${j?.id ?? '?'}`
      checkRequired(jw, j, ['id', 'year', 'title', 'description', 'icon', 'color'])
      checkEnum(jw, j?.icon, JOURNEY_ICONS, 'icon')
      if (j?.color && !/^#[0-9a-fA-F]{6}$/.test(j.color)) {
        warn(jw, `color "${j.color}" is not a 6-digit hex`)
      }
    }
  }
  checkUnique('about.json → journey', journeyAll, 'id')
  const maxJourney = checkIdFormat('about.json → journey', journeyAll, 'jrny')
  if (maxJourney) console.log(`  next journey id: phi-jrny-${String(maxJourney + 1).padStart(3, '0')}`)

  const kpis = Array.isArray(about.kpis) ? about.kpis : []
  checkUnique('about.json → kpis', kpis, 'id')
  checkIdFormat('about.json → kpis', kpis, 'kpi')
  for (const k of kpis) {
    const where = `about.json → kpi ${k?.id ?? '?'}`
    checkRequired(where, k, ['id', 'kind', 'label'])
    checkEnum(where, k?.kind, KPI_KINDS, 'kind')
    // Values are derived at render time; a hardcoded one is silently ignored,
    // which is worse than an error because the board looks authored.
    if (k?.value !== undefined) err(where, 'has a "value" — KPI values are derived, never authored')
    if (k?.kind === 'years' && !/^\d{4}(-\d{2})?$/.test(String(k?.since ?? ''))) {
      err(where, 'kind "years" needs "since" as "YYYY-MM"')
    }
    if (k?.kind === 'github' && !k?.githubUsername) {
      err(where, 'kind "github" needs "githubUsername"')
    }
  }

  const caps = Array.isArray(about.capabilities) ? about.capabilities : []
  checkUnique('about.json → capabilities', caps, 'id')
  checkIdFormat('about.json → capabilities', caps, 'cap')
  for (const c of caps) {
    const where = `about.json → capability ${c?.id ?? '?'}`
    checkRequired(where, c, ['id', 'icon', 'title', 'description', 'products', 'color'])
    checkEnum(where, c?.icon, CAPABILITY_ICONS, 'icon')
    // `products` is NOT cross-referenced: the UI renders these as plain text
    // chips, and they are display labels rather than slugs — usually a product's
    // `name`, but legitimately a content kind too ("Records", "Images (soon)").
    for (const label of c?.products ?? []) {
      if (typeof label !== 'string' || !label.trim()) {
        err(where, 'products contains an empty label')
      }
    }
  }

  const social = about.social
  if (!social || typeof social !== 'object') {
    err('about.json', '"social" is missing')
  } else {
    if (!social.email) err('about.json → social', 'missing "email"')
    const links = []
    for (const group of ['business', 'people', 'artist']) {
      const value = social[group]
      if (value === undefined) continue
      if (!Array.isArray(value)) {
        err('about.json → social', `"${group}" must be an array`)
        continue
      }
      for (const l of value) {
        links.push(l)
        const where = `about.json → social.${group} → ${l?.platform ?? l?.id ?? '?'}`
        checkRequired(where, l, ['id', 'platform', 'url', 'icon'])
        checkEnum(where, l?.icon, SOCIAL_ICONS, 'icon')
        if (l?.url && !/^(https?:\/\/|mailto:)/i.test(l.url)) {
          err(where, `url "${l.url}" must be absolute http(s) or mailto:`)
        }
      }
    }
    checkUnique('about.json → social', links, 'id')
    const seenUrls = new Set()
    for (const l of links) {
      if (l?.url && seenUrls.has(l.url)) {
        warn('about.json → social', `url "${l.url}" appears more than once (later copies are dropped)`)
      }
      seenUrls.add(l?.url)
    }
    if (social.connect || social.profiles) {
      warn('about.json → social', 'uses the legacy "connect"/"profiles" keys — prefer business/people/artist')
    }
  }
}

// --------------------------------------------
// Report
// --------------------------------------------

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`)
  for (const w of warnings) console.log(`  ! ${w}`)
}

if (errors.length) {
  console.log(`\n${errors.length} error(s):`)
  for (const e of errors) console.log(`  x ${e}`)
  console.log('\nFAILED — fix the errors above.')
  process.exit(1)
}

console.log(`\nOK — all three content files valid${warnings.length ? ' (with warnings)' : ''}.`)
