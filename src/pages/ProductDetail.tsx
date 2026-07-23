import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { Wordmark } from '@/components/ui/Wordmark'
import {
  CategoryBadge,
  StatusBadge,
  ProductThumbnail,
  ProductCTA,
  ProductCard,
  GalleryMedia,
  MediaLightbox,
  HorizontalCarousel,
  type LightboxItem,
} from '@/components/products'
import {
  getProductBySlug,
  getProductCTAs,
  getRelatedProducts,
  resolveImageUrl,
} from '@/lib/products'
import { useProducts } from '@/context/ProductsContext'
import { SEO } from '@/components/seo/SEO'
import type { ProductMetric } from '@/lib/types'

const EASE = [0.16, 1, 0.3, 1] as const

/* ------------------------------------------------------------------ */
/* Small presentational helpers                                        */
/* ------------------------------------------------------------------ */

function Reveal({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function Block({
  label,
  title,
  children,
}: {
  label: string
  title?: string
  children: ReactNode
}) {
  return (
    <Reveal className="border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-14">
        <span className="typo-label mb-3 block text-magenta">{label}</span>
        {title && (
          <h2 className="typo-section mb-5 text-2xl text-text-primary md:text-3xl">
            {title}
          </h2>
        )}
        {children}
      </div>
    </Reveal>
  )
}

function Prose({ children }: { children: ReactNode }) {
  return (
    <p className="typo-body max-w-3xl text-base leading-relaxed text-text-secondary">
      {children}
    </p>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="max-w-3xl space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-magenta/10">
            <Check size={12} className="text-magenta" />
          </span>
          <span className="typo-body text-text-secondary">{item}</span>
        </li>
      ))}
    </ul>
  )
}

function StepList({ items }: { items: string[] }) {
  return (
    <ol className="max-w-3xl space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="typo-label mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-magenta/10 text-magenta">
            {i + 1}
          </span>
          <span className="typo-body pt-0.5 text-text-secondary">{item}</span>
        </li>
      ))}
    </ol>
  )
}

/** KPI board — professional dashboard tiles: value on top, label below. */
function KpiBoard({ metrics }: { metrics: ProductMetric[] }) {
  return (
    <div className="flex flex-wrap gap-4">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="group relative flex min-w-[200px] flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-6 transition-colors duration-300 hover:border-magenta/25"
        >
          {/* Soft corner glow */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-15 transition-opacity duration-300 group-hover:opacity-25"
            style={{ background: 'radial-gradient(circle, #d946ef, transparent 70%)' }}
          />
          <span className="typo-display text-2xl leading-tight text-text-primary md:text-3xl">
            <span className="gradient-text">{m.value}</span>
          </span>
          <span className="typo-label mt-3 text-text-muted">{m.label}</span>
        </div>
      ))}
    </div>
  )
}

/** Results board — seamless card grid: value on top, label below. */
function MetricGrid({ metrics }: { metrics: ProductMetric[] }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] sm:grid-cols-3 lg:grid-cols-4">
      {metrics.map((m) => (
        <div key={m.label} className="bg-void/40 px-5 py-6">
          <div className="typo-display text-2xl leading-tight text-text-primary md:text-3xl">
            <span className="gradient-text">{m.value}</span>
          </div>
          <div className="typo-label mt-2 text-text-muted">{m.label}</div>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Not found                                                           */
/* ------------------------------------------------------------------ */

function NotFound() {
  return (
    <PageTransition>
      <SEO
        title="Product not found"
        description="We couldn't find that product. It may have moved or is still in the works."
        path="/products"
        noindex
      />
      <section className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="typo-section mb-4 text-3xl text-text-primary md:text-4xl">
            Product not found
          </h1>
          <p className="typo-body mb-8 text-text-secondary">
            We couldn't find that product. It may have moved or is still in the
            works.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full glass px-6 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowLeft size={15} />
            Back to Products
          </Link>
        </div>
      </section>
    </PageTransition>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const products = useProducts()
  const product = slug ? getProductBySlug(products, slug) : undefined

  const [lightbox, setLightbox] = useState<{
    items: LightboxItem[]
    index: number
  } | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!product) return <NotFound />

  const ctas = getProductCTAs(product)
  const related = getRelatedProducts(products, product)
  const heroSrc = product.heroImage || product.icon
  const featureItems = product.features ?? []
  const galleryItems = product.gallery ?? []

  return (
    <PageTransition>
      <SEO
        title={product.name}
        description={product.tagline || product.overview}
        path={`/products/${product.slug}`}
        image={resolveImageUrl(product.heroImage || product.icon)}
        type="article"
      />
      <article>
        {/* ===================== HERO ===================== */}
        <section className="relative overflow-hidden pb-10 pt-32 md:pt-36">
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute left-1/3 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full opacity-[0.05]"
              style={{
                background: 'radial-gradient(circle, #d946ef, transparent 70%)',
                filter: 'blur(90px)',
              }}
            />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link
                to="/products"
                className="group inline-flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
              >
                <ArrowLeft
                  size={15}
                  className="transition-transform duration-300 group-hover:-translate-x-1"
                />
                All Products
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
              className="mt-8 flex flex-wrap items-center gap-2.5"
            >
              <CategoryBadge
                category={product.category}
                subcategory={product.subcategory}
              />
              <StatusBadge status={product.status} />
              {product.date && (
                <span className="typo-body text-sm text-text-muted">
                  Launched · {product.date}
                </span>
              )}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
              className="typo-display mt-5 max-w-3xl text-4xl text-text-primary md:text-6xl"
            >
              {product.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
              className="typo-body mt-4 max-w-2xl text-lg text-text-secondary"
            >
              {product.tagline}
            </motion.p>

            {ctas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
                className="mt-8 flex flex-wrap gap-3"
              >
                {ctas.map((cta, i) => (
                  <ProductCTA
                    key={cta.key}
                    cta={cta}
                    size="md"
                    variant={i === 0 ? 'primary' : 'secondary'}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* ===================== HERO IMAGE ===================== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
          className="mx-auto max-w-6xl px-6"
        >
          {heroSrc ? (
            <button
              type="button"
              onClick={() =>
                setLightbox({
                  items: [{ src: heroSrc, caption: product.name }],
                  index: 0,
                })
              }
              className="block w-full cursor-zoom-in"
              aria-label={`Open image: ${product.name}`}
            >
              <ProductThumbnail
                product={product}
                hero
                fit="natural"
                className="rounded-2xl border border-white/[0.06]"
              />
            </button>
          ) : (
            <ProductThumbnail
              product={product}
              hero
              fit="natural"
              className="rounded-2xl border border-white/[0.06]"
            />
          )}
        </motion.div>

        {/* ===================== BODY ===================== */}
        <div className="pb-8 pt-2">
          {/* Overview */}
          {product.overview && (
            <Block label="Overview">
              <Prose>{product.overview}</Prose>
            </Block>
          )}

          {/* Features — horizontal scroll when there are several */}
          {featureItems.length > 1 ? (
            <HorizontalCarousel
              label="Features"
              title="What's inside"
              itemClassName="w-[80vw] max-w-[520px] lg:w-[42vw]"
              items={featureItems.map((f) => (
                <div className="glass flex h-full flex-col rounded-2xl p-7">
                  <h3 className="typo-section text-lg text-text-primary">
                    {f.title}
                  </h3>
                  {f.description && (
                    <p className="typo-body mt-2 text-sm leading-relaxed text-text-secondary">
                      {f.description}
                    </p>
                  )}
                </div>
              ))}
            />
          ) : featureItems.length === 1 ? (
            <Block label="Features" title="What's inside">
              <div className="glass rounded-2xl p-7">
                <h3 className="typo-section text-lg text-text-primary">
                  {featureItems[0].title}
                </h3>
                {featureItems[0].description && (
                  <p className="typo-body mt-2 text-sm leading-relaxed text-text-secondary">
                    {featureItems[0].description}
                  </p>
                )}
              </div>
            </Block>
          ) : null}

          {/* Problem */}
          {product.problem && (
            <Block label="Problem" title="The challenge">
              <Prose>{product.problem}</Prose>
            </Block>
          )}

          {/* Solution */}
          {product.solution && (
            <Block label="Solution" title="How we solved it">
              <Prose>{product.solution}</Prose>
            </Block>
          )}

          {/* Gallery — images and/or playable YouTube videos */}
          {galleryItems.length > 1 ? (
            <HorizontalCarousel
              label="Gallery"
              title="A closer look"
              itemClassName="w-[86vw] max-w-[860px] lg:w-[58vw]"
              items={galleryItems.map((item, i) => (
                <GalleryMedia
                  src={item.src}
                  caption={item.caption}
                  alt={item.caption || `${product.name} — media ${i + 1}`}
                  onOpen={() => setLightbox({ items: galleryItems, index: i })}
                />
              ))}
            />
          ) : galleryItems.length === 1 ? (
            <Block label="Gallery" title="A closer look">
              <div className="mx-auto max-w-3xl">
                <GalleryMedia
                  src={galleryItems[0].src}
                  caption={galleryItems[0].caption}
                  alt={galleryItems[0].caption || `${product.name} — media 1`}
                  onOpen={() => setLightbox({ items: galleryItems, index: 0 })}
                />
              </div>
            </Block>
          ) : null}

          {/* Automation: Trigger / Process / Outcome */}
          {product.trigger && (
            <Block label="Trigger" title="What kicks it off">
              <Prose>{product.trigger}</Prose>
            </Block>
          )}
          {product.process && product.process.length > 0 && (
            <Block label="Process" title="How it runs">
              <StepList items={product.process} />
            </Block>
          )}
          {product.outcome && (
            <Block label="Outcome" title="The result">
              <Prose>{product.outcome}</Prose>
            </Block>
          )}

          {/* Data pipeline: Data flow */}
          {product.dataFlow && product.dataFlow.length > 0 && (
            <Block label="Data Flow" title="From source to insight">
              <StepList items={product.dataFlow} />
            </Block>
          )}

          {/* Dashboard: KPIs / Insights */}
          {product.kpis && product.kpis.length > 0 && (
            <Block label="KPIs" title="What it tracks">
              <KpiBoard metrics={product.kpis} />
            </Block>
          )}
          {product.insights && product.insights.length > 0 && (
            <Block label="Insights" title="Business impact">
              <BulletList items={product.insights} />
            </Block>
          )}

          {/* Research: Motivation / Findings */}
          {product.motivation && (
            <Block label="Motivation" title="Why we explored this">
              <Prose>{product.motivation}</Prose>
            </Block>
          )}
          {product.findings && product.findings.length > 0 && (
            <Block label="Findings" title="What we learned">
              <BulletList items={product.findings} />
            </Block>
          )}

          {/* Technologies */}
          {product.technologies.length > 0 && (
            <Block label="Stack" title="Technologies used">
              <div className="flex flex-wrap gap-2">
                {product.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3.5 py-1.5 text-sm text-text-secondary"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </Block>
          )}

          {/* Architecture */}
          {product.architecture && (
            <Block label="Architecture" title="How it's built">
              <Prose>{product.architecture}</Prose>
            </Block>
          )}

          {/* Challenges & Learnings */}
          {product.challenges && product.challenges.length > 0 && (
            <Block label="Learnings" title="Challenges & learnings">
              <BulletList items={product.challenges} />
            </Block>
          )}

          {/* Results / Metrics */}
          {(product.results ||
            (product.metrics && product.metrics.length > 0)) && (
            <Block label="Results" title="The impact">
              {product.results && (
                <div className="mb-6">
                  <Prose>{product.results}</Prose>
                </div>
              )}
              {product.metrics && product.metrics.length > 0 && (
                <MetricGrid metrics={product.metrics} />
              )}
            </Block>
          )}

          {/* External Links */}
          {ctas.length > 0 && (
            <Block label="Links" title="Explore further">
              <div className="flex flex-wrap gap-3">
                {ctas.map((cta) => (
                  <ProductCTA key={cta.key} cta={cta} size="md" />
                ))}
              </div>
            </Block>
          )}
        </div>

        {/* ===================== RELATED ===================== */}
        {related.length > 0 && (
          <section className="border-t border-white/[0.06]">
            <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
              <Reveal>
                <span className="typo-label mb-2 block text-magenta">
                  Related
                </span>
                <h2 className="typo-section mb-8 text-2xl text-text-primary md:text-3xl">
                  More from <Wordmark />
                </h2>
              </Reveal>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===================== CTA ===================== */}
        <section className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
            <Reveal>
              <h2 className="typo-display text-3xl text-text-primary md:text-4xl">
                Have a project in mind?
              </h2>
              <p className="typo-body mx-auto mt-4 max-w-xl text-text-secondary">
                Let's build something extraordinary together.
              </p>
              <Link
                to="/contact"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-magenta to-violet px-8 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-magenta/25 active:scale-[0.97]"
              >
                Get in Touch
                <ArrowRight size={15} />
              </Link>
            </Reveal>
          </div>
        </section>
      </article>

      {/* ===================== LIGHTBOX ===================== */}
      {lightbox && (
        <MediaLightbox
          items={lightbox.items}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onIndex={(index) =>
            setLightbox((state) => (state ? { ...state, index } : state))
          }
        />
      )}
    </PageTransition>
  )
}
