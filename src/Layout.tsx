import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { Navbar, Footer, ScrollProgress, InstallPrompt } from '@/components/layout'
import { useBlankPageGuard } from '@/hooks/useBlankPageGuard'
import { ProductsProvider } from '@/context/ProductsContext'
import { AboutProvider } from '@/context/AboutContext'
import { StructuredData } from '@/components/seo/SEO'
import { organizationSchema, webSiteSchema, personSchema } from '@/lib/seo'

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

// Renders the active route (via <Outlet/>).
//
// There is no <AnimatePresence> here, and that is the fix for the "page goes
// black and blank until you reload it" bug on navbar tab switches. In wait mode
// AnimatePresence withholds the incoming page until every motion component in
// the outgoing one confirms its exit animation finished — a handshake that this
// site could lose (a remote products.json / about.json arriving mid-exit
// re-renders the outgoing page, and a motion component that unmounts while
// exiting is dropped from the tally without the tally being re-checked). The
// old page was gone, the new page was never rendered, and only a reload cleared
// it. Two earlier attempts moved the <Suspense> boundary around to dodge this;
// the handshake itself was the hazard.
//
// Now the route swaps immediately and the incoming page fades itself in with a
// CSS animation (see PageTransition). Nothing has to complete for the next page
// to appear, so there is no state this can get stuck in.
//
// The boundary is keyed by pathname so each route gets a fresh one: a cold lazy
// chunk shows the loader for the incoming page only, and the enter animation
// replays on every navigation. `healKey` is part of that key so the blank-page
// guard can force a clean remount of the route without a reload.
function RouteOutlet({ healKey }: { healKey: number }) {
  const { pathname } = useLocation()
  const outlet = useOutlet()
  return (
    <Suspense key={`${pathname}#${healKey}`} fallback={<PageLoader />}>
      {outlet}
    </Suspense>
  )
}

/**
 * Root layout — the single element for the "/" route. Provides the app-wide
 * data providers, the persistent chrome (background glow, scroll progress,
 * navbar, footer) and the site-wide Organization + WebSite structured data.
 * Child routes render through <RouteOutlet/>.
 */
export default function Layout() {
  // Blank-page guard: if the page area ends up empty (or invisible) after a
  // navigation or a tab switch, remount the route — and only if that fails,
  // reload. See hooks/useBlankPageGuard.
  const mainRef = useRef<HTMLElement>(null)
  const [healKey, setHealKey] = useState(0)
  const heal = useCallback(() => setHealKey((k) => k + 1), [])
  useBlankPageGuard(mainRef, heal)

  return (
    <ProductsProvider>
      <AboutProvider>
        <div className="relative min-h-screen bg-void text-text-primary">
          {/* Site-wide structured data — present on every page. Kept separate
              from per-page <SEO> so it never competes with canonical/OG tags. */}
          <StructuredData data={[organizationSchema(), webSiteSchema(), personSchema()]} />

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

          <main ref={mainRef} className="relative z-10">
            <RouteOutlet healKey={healKey} />
          </main>

          <Footer />

          {/* Offers installation only when the browser reports the site is
              installable, and only once — see useInstallPrompt. */}
          <InstallPrompt />
        </div>
      </AboutProvider>
    </ProductsProvider>
  )
}
