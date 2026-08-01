// ============================================
// phiUture Type Definitions
// ============================================

export interface NavItem {
  label: string
  path: string
  children?: NavItem[]
}

export interface SocialLink {
  /** Stable unique key (primary key for a future DB). */
  id?: string
  platform: string
  url: string
  icon: string
  /** Surface this link in the compact footer row (not just the Contact page). */
  footer?: boolean
}

// --------------------------------------------
// Products
// --------------------------------------------

/** Purpose-based product categories (drive the filter bar). */
export type ProductCategory =
  | 'applications'
  | 'ai'
  | 'automation'
  | 'data'
  | 'research'
  | 'games'

/** Lifecycle status — rendered as a consistent badge. */
export type ProductStatus =
  | 'live'
  | 'beta'
  | 'research'
  | 'prototype'
  | 'opensource'
  | 'archived'

/**
 * Every link is optional — the UI only ever renders CTAs for links
 * that are present, so disabled buttons never appear.
 */
export interface ProductLinks {
  website?: string
  playStore?: string
  appStore?: string
  github?: string
  demo?: string
  dashboard?: string
  workflow?: string
  caseStudy?: string
  // Social
  youtube?: string
  facebook?: string
  instagram?: string
  x?: string
  linkedin?: string
}

export interface ProductMetric {
  label: string
  value: string
}

export interface ProductFeature {
  title: string
  description?: string
  icon?: string
}

export interface ProductGalleryItem {
  src: string
  caption?: string
}

export interface Product {
  // Identity
  id: string
  slug: string
  name: string
  tagline: string

  // Taxonomy
  category: ProductCategory
  /** Human-readable sub-label, e.g. "Mobile App", "RAG", "n8n Workflow". */
  subcategory?: string
  status: ProductStatus

  // Copy — one description shown everywhere: product card,
  // featured card and the detail-page overview.
  overview: string

  // Media (all optional — components fall back to branded placeholders)
  icon?: string
  heroImage?: string
  gallery?: ProductGalleryItem[]

  // Common
  technologies: string[]
  links: ProductLinks
  metrics?: ProductMetric[]

  // Detail-page narrative sections (all optional)
  problem?: string
  solution?: string
  features?: ProductFeature[]
  architecture?: string
  challenges?: string[]
  results?: string

  // Type-specific extras
  trigger?: string // automation
  process?: string[] // automation
  outcome?: string // automation
  dataFlow?: string[] // data pipeline
  kpis?: ProductMetric[] // dashboard
  insights?: string[] // dashboard
  motivation?: string // research
  findings?: string[] // research

  relatedProducts?: string[] // slugs
  date?: string
}

/**
 * Shape of src/data/products.json.
 * `featured` maps a rank ("1", "2", …) to a product slug, defining the
 * order of the featured carousel. Products no longer carry a featured flag.
 */
export interface ProductsData {
  featured: Record<string, string>
  products: Product[]
}

// --------------------------------------------
// Beyond — the creative side (multi-medium showcase)
// --------------------------------------------

/** Whether a creative medium has published work yet. */
export type BeyondMediumStatus = 'live' | 'coming-soon'

/** A single release on the Music medium (one embedded Spotify item). */
export interface BeyondMusicItem {
  id: string
  /** Stable, human-readable handle — what `featured["fresh release"]` points at. */
  slug?: string
  /** Spotify album ID (the segment after /album/ in the embed URL). */
  spotifyId: string
  /** Embed height in px — 152 for a compact single, 352 for a full tracklist. */
  height?: number
  /** Display title. Baked in so search/labels work without a network call;
      falls back to a live Spotify oEmbed lookup when omitted. */
  title?: string
  artist?: string
  /** Free-text tags used by the gallery search. */
  tags?: string[]
  /** Optional cover override; normally fetched live from Spotify. */
  cover?: string
}

/** A YouTube video on the Video medium. */
export interface BeyondVideo {
  id: string
  /** Stable, human-readable handle — what `featured["latest videos"]` points at. */
  slug?: string
  title: string
  youtubeId: string
  artist?: string
  tags?: string[]
}

/**
 * One creative medium (Music, Video, Writing…). The page is built to hold
 * several; each renders whichever content arrays it carries. Adding a new
 * medium — or promoting one from "coming-soon" to "live" — is data-only.
 */
export interface BeyondMedium {
  id: string
  label: string
  status: BeyondMediumStatus
  /** Icon key mapped to a lucide icon in the UI. */
  icon: string
  /** Short description — shown on the "coming soon" card for upcoming mediums. */
  blurb: string
  music?: BeyondMusicItem[]
  videos?: BeyondVideo[]
}

/**
 * Home-page picks, by slug — the equivalent of products.json's `featured`
 * block. Because beyond.json is loaded remotely at runtime, editing these two
 * lists reshuffles the home page's Beyond section without a redeploy.
 *
 * Slugs are resolved WITHIN the medium each field feeds, so a music item and a
 * video may safely share a slug. Unknown slugs are skipped, and an empty or
 * missing field falls back to the natural data order.
 */
export interface BeyondFeatured {
  /** Slug of the Music item embedded in the home page's "Fresh Release" card. */
  'fresh release'?: string
  /** Slugs of the Video items shown in the home page's "Latest Videos" grid,
      in the order they should appear (first four are used). */
  'latest videos'?: string[]
}

/** Shape of src/data/beyond.json. */
export interface BeyondData {
  featured?: BeyondFeatured
  mediums: BeyondMedium[]
}

// --------------------------------------------
// About page (src/data/about.json)
// --------------------------------------------

export interface AboutPerson {
  /** Stable unique key (primary key for a future DB). */
  id: string
  name: string
  /** Optional avatar image URL. When present it replaces the monogram. */
  avatar?: string
  /** Fallback initials shown when no avatar is set. */
  monogram: string
  location: string
  roles: string[]
  bio: string
  /** Label for the button that reveals this person's journey timeline. */
  journeyCta?: string
  /** This person's own timeline, shown in the journey modal. */
  journey: AboutJourneyItem[]
}

/**
 * A KPI tile's data source. Most values are derived live from other data so
 * the board never goes stale:
 *  • 'years'       — whole years since `since` (auto-increments over time)
 *  • 'github'      — public_repos for `githubUsername`, `githubReposFallback` if offline
 *  • 'products'    — total products shipped
 *  • 'ai-products' — products in the AI category
 *  • 'records'     — Beyond music releases
 *  • 'videos'      — Beyond videos
 */
export type AboutKpiKind =
  | 'years'
  | 'github'
  | 'products'
  | 'ai-products'
  | 'records'
  | 'videos'

export interface AboutKpi {
  /** Stable unique key (primary key for a future DB). */
  id: string
  kind: AboutKpiKind
  label: string
  sub?: string
  /** Appended after the number, e.g. "+". */
  suffix?: string
  /** kind 'years' — start month in ISO form, e.g. "2024-01". */
  since?: string
  /** kind 'github' — GitHub username to read the public repo count from. */
  githubUsername?: string
  /** kind 'github' — value used when the live fetch is unavailable. */
  githubReposFallback?: number
}

export interface AboutJourneyItem {
  /** Stable unique key (primary key for a future DB). */
  id: string
  year: string
  title: string
  description: string
  /** Icon key mapped to a lucide icon in the UI. */
  icon: string
  color: string
}

export interface AboutCapability {
  /** Stable unique key (primary key for a future DB). */
  id: string
  /** Icon key mapped to a lucide icon in the UI. */
  icon: string
  title: string
  description: string
  products: string[]
  color: string
  /** Optional internal link (e.g. "/beyond") that turns the card into a link. */
  href?: string
}

/**
 * Social presence, configurable at runtime from about.json.
 *
 * Three groups, matching the three identities behind the site and the three
 * tabs on the Contact page: the studio (`business`), the person (`people`), and
 * the musician (`artist`). Any link in any group can carry `footer: true` to
 * also appear in the compact footer row.
 *
 * The `people` key predates the "Engineer" label and is kept as-is: renaming it
 * would break any older copy of about.json fetched at runtime from the content
 * source, for no gain the UI can see.
 */
export interface AboutSocial {
  /** Business inbox. The Contact form composes to this, and it's shown in the
      page sidebar as the direct address. */
  email: string
  /** Bitan's own inbox, listed under the Engineer group. */
  founderEmail?: string
  /** The studio: site, channel, developer page, business inbox. */
  business?: SocialLink[]
  /** The person: code, professional and everyday social, direct inbox. */
  people?: SocialLink[]
  /** The musician: streaming and video profiles. Also surfaced on the Beyond
      page so a visitor who likes a track can go straight to it. */
  artist?: SocialLink[]

  // --------------------------------------------
  // Legacy shape (pre business/people/artist split). Still declared because
  // about.json is ALSO fetched at runtime from the content source: a deploy can
  // briefly be paired with an older copy of the file. `normalizeSocial` maps
  // these onto the groups above so the Contact page and footer degrade to the
  // old link set instead of rendering empty.
  // --------------------------------------------
  /** @deprecated use `people` / `business` */
  connect?: SocialLink[]
  /** @deprecated use `people` / `artist` */
  profiles?: SocialLink[]
}

/**
 * The social groups after normalization — every group present, so nothing
 * downstream has to guard for a missing or legacy key. Produced by
 * `normalizeSocial` (src/lib/social.ts); this is what components receive.
 */
export interface ResolvedSocial {
  email: string
  founderEmail?: string
  business: SocialLink[]
  people: SocialLink[]
  artist: SocialLink[]
}

/** Shape of src/data/about.json. */
export interface AboutData {
  /** One or more people. A single entry renders as one card; several render
      as a switchable stack. Each carries its own journey timeline. */
  people: AboutPerson[]
  kpis: AboutKpi[]
  capabilities: AboutCapability[]
  social: AboutSocial
}

/** `AboutData` as the app consumes it, with the social groups normalized. */
export interface ResolvedAboutData extends Omit<AboutData, 'social'> {
  social: ResolvedSocial
}
