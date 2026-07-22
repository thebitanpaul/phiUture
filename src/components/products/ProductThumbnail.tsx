import { cn } from '@/lib/utils'
import { getCategoryIcon, resolveImageUrl } from '@/lib/products'
import type { Product } from '@/lib/types'

interface ProductThumbnailProps {
  product: Product
  /** Use the larger hero image if available (detail / featured). */
  hero?: boolean
  className?: string
  imgClassName?: string
  /**
   * Apply the brand tint overlay over real images so screenshots with
   * any colour scheme blend into the phiUture theme. Default: true.
   */
  tint?: boolean
  /**
   * How the image fills its box:
   *  • 'cover'   — crop to fill the container's aspect ratio (cards).
   *  • 'natural' — show the whole image at its own aspect ratio, never
   *                cropped, so 1:1 and 16:9 both look right (detail hero).
   */
  fit?: 'cover' | 'natural'
}

/**
 * Renders a product image with lazy loading, or a branded gradient
 * placeholder (with the category glyph) when no image is provided.
 * Real images receive a subtle magenta/violet tint so they stay
 * consistent with the site regardless of their own colours.
 */
export function ProductThumbnail({
  product,
  hero = false,
  className,
  imgClassName,
  tint = true,
  fit = 'cover',
}: ProductThumbnailProps) {
  const raw = hero ? product.heroImage || product.icon : product.icon
  const src = resolveImageUrl(raw)
  const Icon = getCategoryIcon(product.category)

  // Neutral depth gradient only — keeps the category/status badges legible over
  // the image without tinting the actual screenshot (true-to-source colours).
  const overlay = tint && (
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/25" />
  )

  // Natural fit: the box shrink-wraps the image so it displays at its own
  // aspect ratio (1:1 or 16:9), centred, capped in height — never cropped.
  if (src && fit === 'natural') {
    return (
      <div
        className={cn(
          'relative mx-auto w-fit max-w-full overflow-hidden bg-elevated',
          className
        )}
      >
        <img
          src={src}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={cn(
            'block h-auto max-h-[72vh] w-auto max-w-full',
            imgClassName
          )}
        />
        {overlay}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-elevated',
        // Give the placeholder a sensible frame when the caller asked for
        // natural sizing but there is no image to size against.
        !src && fit === 'natural' && 'aspect-[16/9]',
        className
      )}
    >
      {src ? (
        <>
          <img
            src={src}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={cn(
              'h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]',
              imgClassName
            )}
          />
          {overlay}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Branded gradient wash */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(120% 120% at 30% 20%, rgba(217,70,239,0.16), transparent 55%), radial-gradient(120% 120% at 80% 90%, rgba(168,85,247,0.14), transparent 55%)',
            }}
          />
          {/* Fine grid texture */}
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <Icon
            size={hero ? 64 : 44}
            className="relative text-magenta/40 transition-transform duration-700 ease-out group-hover:scale-110"
            strokeWidth={1.25}
          />
        </div>
      )}
    </div>
  )
}
