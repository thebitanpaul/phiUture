import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Navbar, Footer, ScrollProgress } from '@/components/layout'

const Home = lazy(() => import('@/pages/Home'))
const About = lazy(() => import('@/pages/About'))
const Products = lazy(() => import('@/pages/Products'))
const ProductDetail = lazy(() => import('@/pages/ProductDetail'))
const Beyond = lazy(() => import('@/pages/Beyond'))
const Contact = lazy(() => import('@/pages/Contact'))
const Placeholder = lazy(() => import('@/pages/Placeholder'))

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

export default function App() {
  const location = useLocation()

  return (
    <div className="relative min-h-screen bg-void text-text-primary">
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
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageLoader />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/beyond" element={<Beyond />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<Placeholder title="404" description="This page doesn't exist yet." />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}
