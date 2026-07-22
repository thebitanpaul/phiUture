// ============================================
// Products — shared selectors & display config
// Single source of truth consumed by the Products
// page, Product Detail pages and the Home page.
// ============================================

import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutGrid,
  AppWindow,
  Cpu,
  Workflow,
  Database,
  FlaskConical,
  Gamepad2,
  Globe,
  Smartphone,
  Github,
  Play,
  BarChart3,
  FileText,
  Youtube,
  Facebook,
  Instagram,
  Linkedin,
} from 'lucide-react'
import { XIcon } from '@/components/icons/BrandIcons'

/** Any icon component that accepts a size + className (lucide or custom). */
type IconComponent = ComponentType<{ size?: number | string; className?: string }>
import type {
  Product,
  ProductCategory,
  ProductStatus,
  ProductLinks,
} from './types'

// --------------------------------------------
// Categories (purpose-based) — drive filter bar
// --------------------------------------------

export type FilterId = ProductCategory | 'all'

export interface CategoryMeta {
  id: FilterId
  label: string
  icon: LucideIcon
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'applications', label: 'Applications', icon: AppWindow },
  { id: 'ai', label: 'AI', icon: Cpu },
  { id: 'automation', label: 'Automation', icon: Workflow },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'research', label: 'Research', icon: FlaskConical },
  { id: 'games', label: 'Games', icon: Gamepad2 },
]

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  applications: 'Applications',
  ai: 'AI',
  automation: 'Automation',
  data: 'Data',
  research: 'Research',
  games: 'Games',
}

const CATEGORY_ICONS: Record<ProductCategory, LucideIcon> = {
  applications: AppWindow,
  ai: Cpu,
  automation: Workflow,
  data: Database,
  research: FlaskConical,
  games: Gamepad2,
}

export const getCategoryIcon = (category: ProductCategory): LucideIcon =>
  CATEGORY_ICONS[category] ?? LayoutGrid

// --------------------------------------------
// Status badges — consistent styling per status
// --------------------------------------------

export interface StatusMeta {
  label: string
  /** Tailwind classes for bg / text / border. */
  className: string
  dot: string
}

export const STATUS_META: Record<ProductStatus, StatusMeta> = {
  live: {
    label: 'Live',
    className: 'bg-green-500/10 text-green-400 border-green-500/20',
    dot: 'bg-green-400',
  },
  beta: {
    label: 'Beta',
    className: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    dot: 'bg-amber-300',
  },
  research: {
    label: 'Research',
    className: 'bg-violet/10 text-violet border-violet/25',
    dot: 'bg-violet',
  },
  prototype: {
    label: 'Prototype',
    className: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    dot: 'bg-sky-300',
  },
  opensource: {
    label: 'Open Source',
    className: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    dot: 'bg-cyan-300',
  },
  archived: {
    label: 'Archived',
    className: 'bg-white/[0.04] text-text-muted border-white/10',
    dot: 'bg-text-muted',
  },
}

// --------------------------------------------
// Adaptive CTAs — only rendered when the link
// exists, so disabled buttons never appear.
// Array order defines primary-CTA priority.
// --------------------------------------------

export interface CTAMeta {
  key: keyof ProductLinks
  label: string
  icon: IconComponent
}

export const CTA_ORDER: CTAMeta[] = [
  { key: 'website', label: 'Visit Website', icon: Globe },
  { key: 'demo', label: 'See Demo', icon: Play },
  { key: 'playStore', label: 'View on Play Store', icon: Smartphone },
  { key: 'appStore', label: 'View on App Store', icon: Smartphone },
  { key: 'dashboard', label: 'View Dashboard', icon: BarChart3 },
  { key: 'workflow', label: 'Explore Workflow', icon: Workflow },
  { key: 'caseStudy', label: 'Read Case Study', icon: FileText },
  { key: 'github', label: 'View Source', icon: Github },
  // Social (kept last so they never become the primary CTA)
  { key: 'youtube', label: 'YouTube', icon: Youtube },
  { key: 'facebook', label: 'Facebook', icon: Facebook },
  { key: 'instagram', label: 'Instagram', icon: Instagram },
  { key: 'x', label: 'X', icon: XIcon },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
]

export interface ResolvedCTA extends CTAMeta {
  href: string
}

/** All available external CTAs for a product, in priority order. */
export function getProductCTAs(product: Product): ResolvedCTA[] {
  return CTA_ORDER.filter((c) => Boolean(product.links[c.key])).map((c) => ({
    ...c,
    href: product.links[c.key] as string,
  }))
}

/** The single highest-priority CTA, or null if the product has no links. */
export function getPrimaryCTA(product: Product): ResolvedCTA | null {
  return getProductCTAs(product)[0] ?? null
}

// --------------------------------------------
// Selectors
// --------------------------------------------
// These are PURE functions: pass in the current product list (from the
// ProductsProvider — bundled or remotely loaded). They never read a
// hard-coded array, so the same code works for both data sources.

/**
 * Resolves the featured ranking ({ "1": slug, "2": slug, … }) into an
 * ordered list of products. Ranks are sorted numerically and unknown
 * slugs are skipped.
 */
export function resolveFeaturedProducts(
  ranking: Record<string, string> | undefined,
  list: Product[]
): Product[] {
  if (!ranking) return []
  return Object.keys(ranking)
    .sort((a, b) => Number(a) - Number(b))
    .map((rank) => list.find((p) => p.slug === ranking[rank]))
    .filter((p): p is Product => Boolean(p))
}

export const getProductBySlug = (
  list: Product[],
  slug: string
): Product | undefined => list.find((p) => p.slug === slug)

/** Newest first; products without a date sink to the bottom. */
const byDateDesc = (a: Product, b: Product): number =>
  (b.date ?? '').localeCompare(a.date ?? '')

export const getProductsByCategory = (
  list: Product[],
  category: FilterId
): Product[] =>
  (category === 'all'
    ? [...list]
    : list.filter((p) => p.category === category)
  ).sort(byDateDesc)

export function getRelatedProducts(
  list: Product[],
  product: Product,
  limit = 3
): Product[] {
  const explicit = (product.relatedProducts ?? [])
    .map((slug) => getProductBySlug(list, slug))
    .filter((p): p is Product => Boolean(p))

  if (explicit.length >= limit) return explicit.slice(0, limit)

  const explicitSlugs = new Set(explicit.map((p) => p.slug))
  const sameCategory = list.filter(
    (p) =>
      p.category === product.category &&
      p.slug !== product.slug &&
      !explicitSlugs.has(p.slug)
  )

  return [...explicit, ...sameCategory].slice(0, limit)
}

/** Per-category product counts (used to hide empty filter tabs). */
export function getCategoryCounts(list: Product[]): Record<string, number> {
  return CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] =
      cat.id === 'all'
        ? list.length
        : list.filter((p) => p.category === cat.id).length
    return acc
  }, {} as Record<string, number>)
}

// --------------------------------------------
// Image URLs
// --------------------------------------------

/**
 * Resolves an image link into something an <img> tag can actually load.
 *
 * You can paste ANY of these into `icon` / `heroImage` / gallery:
 *   • A normal Google Drive share link — auto-converted to a direct link
 *   • A direct image URL from any host (Cloudinary, ImageKit, S3, GitHub…)
 *   • A local path in /public (e.g. "/products/foo.png")
 *
 * No redeploy needed for remotely-hosted images — update the link and
 * the site reflects it immediately.
 */
export function resolveImageUrl(url?: string): string | undefined {
  if (!url) return undefined

  // Google Drive: extract the file id from any of its share-link shapes
  // and rewrite to the embeddable thumbnail endpoint (reliable for <img>).
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    const id =
      url.match(/\/d\/([\w-]+)/)?.[1] ?? url.match(/[?&]id=([\w-]+)/)?.[1]
    if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1600`
  }

  return url
}

// --------------------------------------------
// YouTube
// --------------------------------------------

/**
 * Extracts an 11-character YouTube video id from any common URL shape
 * (watch, youtu.be, embed, shorts, live). Returns null for non-YouTube
 * URLs — so a gallery item can be either an image or a video, detected
 * automatically from its `src`.
 */
export function getYouTubeId(url?: string): string | null {
  if (!url) return null
  const patterns = [
    /youtube\.com\/watch\?[^#]*\bv=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
    /youtube\.com\/live\/([\w-]{11})/,
  ]
  for (const re of patterns) {
    const match = url.match(re)
    if (match) return match[1]
  }
  return null
}

// --------------------------------------------
// Video embeds (YouTube / Instagram / Facebook)
// --------------------------------------------

export interface MediaEmbed {
  kind: 'youtube' | 'instagram' | 'facebook'
  /** Ready-to-use iframe src. */
  embedUrl: string
  /** Vertical media (reels) — rendered in a portrait frame. */
  portrait: boolean
}

/**
 * Detects a playable video from a gallery `src` and returns its iframe
 * embed URL. Supports YouTube (incl. Shorts), Instagram reels/posts and
 * Facebook reels/videos (including share links). Returns null for plain
 * images so the same field can hold either.
 */
export function getMediaEmbed(url?: string): MediaEmbed | null {
  if (!url) return null

  const youTubeId = getYouTubeId(url)
  if (youTubeId) {
    return {
      kind: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youTubeId}?autoplay=1&rel=0`,
      portrait: false,
    }
  }

  // Instagram — reel / reels / p / tv
  const ig = url.match(/instagram\.com\/(reel|reels|p|tv)\/([\w-]+)/)
  if (ig) {
    const type = ig[1] === 'reels' ? 'reel' : ig[1]
    return {
      kind: 'instagram',
      embedUrl: `https://www.instagram.com/${type}/${ig[2]}/embed`,
      portrait: true,
    }
  }

  // Facebook — reels / videos / watch / share links
  if (
    /facebook\.com/.test(url) &&
    /(\/reel\/|\/videos?\/|\/watch|\/share\/[rv]\/)/.test(url)
  ) {
    return {
      kind: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        url
      )}&show_text=false&autoplay=true`,
      portrait: /(\/reel\/|\/share\/r\/)/.test(url),
    }
  }

  return null
}
