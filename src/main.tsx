import { ViteReactSSG } from 'vite-react-ssg'
import { routes, prefetchPages } from './App'
import './styles/globals.css'
import { registerServiceWorker } from './lib/registerServiceWorker'
import { primeStaticLoaderData } from './lib/staticLoaderData'
import { markStandaloneMode } from './lib/standaloneMode'

// The hydration crash guard has to run BEFORE ViteReactSSG builds the router,
// because the router's loaders fire during that first render. See the comments
// in lib/staticLoaderData.ts for what it prevents.
primeStaticLoaderData()

// Flags an installed-app (home-screen) window so the fixed chrome can clear the
// status bar. Must run before first paint to avoid a visible reflow.
markStandaloneMode()

// vite-react-ssg entry. It provides the HelmetProvider (react-helmet-async)
// and the React Router data router for us, hydrates the prerendered HTML on
// the client, and drives static generation at build time. Global data
// providers and page chrome live in the root Layout (see App routes).
export const createRoot = ViteReactSSG({
  routes,
  basename: import.meta.env.BASE_URL,
})

// Installability + offline shell. No-ops during the SSG pass and in dev.
registerServiceWorker()

// Warm every page chunk once idle so tab switches don't wait on the network.
prefetchPages()
