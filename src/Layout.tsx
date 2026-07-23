import { Suspense, useEffect } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Navbar, Footer, ScrollProgress } from '@/components/layout'
import { ProductsProvider } from '@/context/ProductsContext'
import { AboutProvider } from '@/context/AboutContext'
import { StructuredData } from '@/components/seo/SEO'
import { organizationSchema, webSiteSchema } from '@/lib/seo'

// A fresh navigation to a page should start at the top — otherwise the previous
// page's scroll position carries over (e.g. 80% down on Home → land 80% down on
// Products). Keyed on pathname only, so in-page query changes (filter tabs,
// ?category=…) never trigger it. Hash links (#explore) are also untouched.
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-magenta/30 border-t-magenta animate-spin" />
    </div>
  )
}

// Renders the active route (via <Outlet/>) with the same page-transition
// behaviour as before: a keyed wrapper inside <AnimatePresence mode="wait">
// lets each page's <PageTransition> exit animation play before the next enters.
function AnimatedOutlet() {
  const location = useLocation()
  const outlet = useOutlet()
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <div key={location.pathname} className="contents">
          {outlet}
        </div>
      </AnimatePresence>
    </Suspense>
  )
}

/**
 * Root layout — the single element for the "/" route. Provides the app-wide
 * data providers, the persistent chrome (background glow, scroll progress,
 * navbar, footer) and the site-wide Organization + WebSite structured data.
 * Child routes render through <AnimatedOutlet/>.
 */
export default function Layout() {
  return (
    <ProductsProvider>
      <AboutProvider>
        <div className="relative min-h-screen bg-void text-text-primary">
          {/* Site-wide structured data — present on every page. Kept separate
              from per-page <SEO> so it never competes with canonical/OG tags. */}
          <StructuredData data={[organizationSchema(), webSiteSchema()]} />

          {/* Ambient background glow — fixed, behind everything */}
          <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
            <div
              className="absolute -top-[200px] -right-[100px] w-[600px] h-[600px] rounded-full opacity-[0.06]"
              style={{ background: 'radial-gradient(circle, #d946ef, transparent 70%)', filter: 'blur(100px)' }}
            />
            <div
              className="absolute -bottom-[200px] -left-[100px] w-[500px] h-[500px] rounded-full opacity-[0.05]"
              style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)', filter: 'blur(100px)' }}
            />
          </div>

          <ScrollToTop />
          <ScrollProgress />
          <Navbar />

          <main className="relative z-10">
            <AnimatedOutlet />
          </main>

          <Footer />
        </div>
      </AboutProvider>
    </ProductsProvider>
  )
}
