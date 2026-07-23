import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/lib/utils'
import { getPrimaryCTA } from '@/lib/products'
import type { Product } from '@/lib/types'
import { CategoryBadge } from './CategoryBadge'
import { StatusBadge } from './StatusBadge'
import { ProductThumbnail } from './ProductThumbnail'
import { ProductCTA } from './ProductCTA'

interface FeaturedProductCardProps {
  product: Product
  /** Flip the media to the right on desktop for visual rhythm. */
  reverse?: boolean
}

export function FeaturedProductCard({
  product,
  reverse = false,
}: FeaturedProductCardProps) {
  const primary = getPrimaryCTA(product)
  const detailPath = `/products/${product.slug}`

  return (
    <GlassCard hoverTilt={false} className="group grid h-full grid-cols-1 overflow-hidden md:grid-cols-2">
      {/* Media */}
      <Link
        to={detailPath}
        className={cn('relative block md:self-center', reverse && 'md:order-2')}
        aria-label={product.name}
      >
        <ProductThumbnail
          product={product}
          className="aspect-square w-full"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-2"
        >
          <CategoryBadge
            category={product.category}
            subcategory={product.subcategory}
          />
          <StatusBadge status={product.status} />
        </div>
      </Link>

      {/* Content */}
      <div
        className={cn(
          'flex flex-col justify-center p-7 md:p-9',
          reverse && 'md:order-1'
        )}
      >
        <span className="typo-label mb-3 flex items-center gap-2 text-magenta">
          <span className="h-px w-6 bg-magenta/40" />
          Featured
        </span>
        <Link
          to={detailPath}
          className="typo-section text-2xl text-text-primary transition-colors duration-300 hover:text-magenta md:text-3xl"
        >
          {product.name}
        </Link>
        <p className="typo-body mt-2 text-base text-text-secondary">
          {product.tagline}
        </p>

        {/* Technologies */}
        <div className="mt-5 flex flex-wrap gap-1.5">
          {product.technologies.slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-white/[0.05] bg-white/[0.03] px-2.5 py-0.5 text-xs text-text-muted"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          {primary && <ProductCTA cta={primary} variant="primary" size="md" />}
          <Link
            to={detailPath}
            className="group/details inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors duration-300 hover:text-text-primary"
          >
            Learn more<span className="sr-only"> about {product.name}</span>
            <ArrowRight
              size={15}
              className="transition-transform duration-300 group-hover/details:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </GlassCard>
  )
}
