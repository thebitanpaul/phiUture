import React, { type ComponentType } from 'react'
import type { RouteRecord } from 'vite-react-ssg'
import Layout from './Layout'
import RouteError from '@/components/layout/RouteError'
import {
  beginRecovery,
  canAttemptRecovery,
  describeError,
  isStaleDeployMessage,
} from '@/lib/staleDeploy'
import productsData from '@data/products.json'

// ============================================
// Routes — the data-router route table consumed by vite-react-ssg.
// --------------------------------------------
// Same React Router, same URLs, same pages as before; expressed as a route
// array (instead of <BrowserRouter><Routes>) so vite-react-ssg can prerender
// each route to static HTML at build time.
//
// The single dynamic route (/products/:slug) enumerates its prerender targets
// from products.json via getStaticPaths — so adding a product to the JSON and
// pushing is all it takes for the next Vercel build to emit its static page.
// ============================================

const productPaths = (productsData.products ?? []).map(
  (p) => `products/${p.slug}`
)

// Page chunks, named so they can be both lazily rendered AND warmed ahead of
// time (see prefetchPages). ESM caches modules per specifier, so the prefetch
// and the React.lazy import resolve to the very same module — warming one means
// the navigation never has to wait on the network.
const pageImports = {
  Home: () => import('@/pages/Home'),
  About: () => import('@/pages/About'),
  Products: () => import('@/pages/Products'),
  ProductDetail: () => import('@/pages/ProductDetail'),
  Beyond: () => import('@/pages/Beyond'),
  Contact: () => import('@/pages/Contact'),
  NotFound: () => import('@/pages/NotFound'),
}

type PageLoader = () => Promise<{ default: ComponentType }>

/**
 * `React.lazy`, with the two things a plain lazy() gets wrong on a live site.
 *
 * 1. ONE QUIET RETRY. A dropped request on a flaky mobile connection rejects the
 *    import, and React.lazy memoises that rejection FOREVER — the route stays
 *    broken for the life of the document even once the network is back. A failed
 *    module is not entered into the ESM module map, so simply asking again
 *    re-fetches it.
 *
 * 2. SELF-HEAL A STALE DEPLOY. If the second attempt fails with a chunk-miss
 *    signature, this tab is holding a build the server has replaced (see
 *    lib/staleDeploy.ts). Purge and reload once; the fresh HTML names chunks
 *    that exist. The returned promise deliberately never settles, so React keeps
 *    showing the Suspense fallback for the moment the reload is in flight rather
 *    than flashing an error page about a build that is already gone.
 *
 * Anything else rethrows and lands on the route error boundary as before.
 */
function lazyPage(load: PageLoader) {
  return React.lazy(async () => {
    try {
      return await load()
    } catch {
      try {
        return await load()
      } catch (error) {
        if (isStaleDeployMessage(describeError(error)) && canAttemptRecovery()) {
          beginRecovery()
          return new Promise<{ default: ComponentType }>(() => {})
        }
        throw error
      }
    }
  })
}

/**
 * Downloads every page chunk once the browser is idle, so switching tabs never
 * suspends on a cold chunk. Purely an optimisation — the Suspense boundary in
 * Layout still covers a cold navigation — but it removes the visible loader on
 * the common path. Skipped when the visitor has asked to save data.
 */
export function prefetchPages(): void {
  if (typeof window === 'undefined') return

  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection
  if (connection?.saveData) return

  const run = () => {
    for (const load of Object.values(pageImports)) {
      // A prefetch failure is not a problem: the route's own lazy import will
      // retry (and the route error boundary handles a genuine chunk miss).
      void load().catch(() => {})
    }
  }

  // requestIdleCallback is missing on Safari before 18 — fall back to a timer.
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(run, { timeout: 4000 })
  } else {
    window.setTimeout(run, 2000)
  }
}

export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <Layout />,
    // Catches anything a route throws while loading or rendering — including
    // the chunk/manifest misses a browser holding a previous deploy hits, which
    // it heals by purging caches and reloading once. Imported eagerly on
    // purpose: a lazily-loaded boundary would fail the same way as the chunk it
    // is meant to recover from.
    ErrorBoundary: RouteError,
    children: [
      { index: true, Component: lazyPage(pageImports.Home) },
      { path: 'about', Component: lazyPage(pageImports.About) },
      { path: 'products', Component: lazyPage(pageImports.Products) },
      {
        path: 'products/:slug',
        Component: lazyPage(pageImports.ProductDetail),
        // Enumerate every product page so each is prerendered at build time.
        getStaticPaths: () => productPaths,
      },
      { path: 'beyond', Component: lazyPage(pageImports.Beyond) },
      { path: 'contact', Component: lazyPage(pageImports.Contact) },
      { path: '*', Component: lazyPage(pageImports.NotFound) },
    ],
  },
]

export default routes
