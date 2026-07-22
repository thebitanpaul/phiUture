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
 * Shape of public/data/products.json.
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

/** Shape of public/data/beyond.json. */
export interface BeyondData {
  mediums: BeyondMedium[]
}

// --------------------------------------------
// About page (public/data/about.json)
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

/** Social presence, configurable at runtime from about.json. */
export interface AboutSocial {
  /** Address the Contact form composes to, and shown in the sidebar. */
  email: string
  /** Professional / direct-contact links (Contact page "Connect" tab). */
  connect: SocialLink[]
  /** Creator / audience channels (Contact page "Social" tab). `footer: true`
      also surfaces the link in the compact footer row. */
  profiles: SocialLink[]
  /** Artist / streaming profiles surfaced on the Beyond page so visitors can
      jump straight to the music & video. Independent of `profiles` so the
      Contact grid stays symmetrical. */
  artist?: SocialLink[]
}

/** Shape of public/data/about.json. */
export interface AboutData {
  /** One or more people. A single entry renders as one card; several render
      as a switchable stack. Each carries its own journey timeline. */
  people: AboutPerson[]
  kpis: AboutKpi[]
  capabilities: AboutCapability[]
  social: AboutSocial
}
