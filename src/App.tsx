import React from 'react'
import type { RouteRecord } from 'vite-react-ssg'
import Layout from './Layout'
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

export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, Component: React.lazy(() => import('@/pages/Home')) },
      { path: 'about', Component: React.lazy(() => import('@/pages/About')) },
      { path: 'products', Component: React.lazy(() => import('@/pages/Products')) },
      {
        path: 'products/:slug',
        Component: React.lazy(() => import('@/pages/ProductDetail')),
        // Enumerate every product page so each is prerendered at build time.
        getStaticPaths: () => productPaths,
      },
      { path: 'beyond', Component: React.lazy(() => import('@/pages/Beyond')) },
      { path: 'contact', Component: React.lazy(() => import('@/pages/Contact')) },
      { path: '*', Component: React.lazy(() => import('@/pages/NotFound')) },
    ],
  },
]

export default routes
