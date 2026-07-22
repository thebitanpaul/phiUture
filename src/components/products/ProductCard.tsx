import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { getPrimaryCTA } from '@/lib/products'
import type { Product } from '@/lib/types'
import { CategoryBadge } from './CategoryBadge'
import { StatusBadge } from './StatusBadge'
import { ProductThumbnail } from './ProductThumbnail'
import { ProductCTA } from './ProductCTA'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const primary = getPrimaryCTA(product)
  const detailPath = `/products/${product.slug}`

  return (
    <GlassCard hoverTilt={false} className="group flex h-full flex-col">
      {/* Media */}
      <Link to={detailPath} className="relative block" aria-label={product.name}>
        <ProductThumbnail product={product} className="aspect-square" />
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <CategoryBadge
            category={product.category}
            subcategory={product.subcategory}
          />
          <StatusBadge status={product.status} />
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        <Link
          to={detailPath}
          className="typo-section text-lg text-text-primary transition-colors duration-300 hover:text-magenta"
        >
          {product.name}
        </Link>
        <p className="typo-body mt-1 flex-1 text-sm text-text-muted">
          {product.tagline}
        </p>

        {/* Adaptive CTA row */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/[0.05] pt-4">
          {primary ? (
            <>
              <ProductCTA cta={primary} variant="primary" />
              <Link
                to={detailPath}
                className="group/details inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-text-muted transition-colors duration-300 hover:text-text-primary"
              >
                Details
                <ArrowRight
                  size={13}
                  className="transition-transform duration-300 group-hover/details:translate-x-0.5"
                />
              </Link>
            </>
          ) : (
            <Link
              to={detailPath}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-magenta to-violet px-3.5 py-1.5 text-xs font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-magenta/25 active:scale-[0.98]"
            >
              View Details
              <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
