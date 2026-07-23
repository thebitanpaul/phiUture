import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './App'
import './styles/globals.css'

// vite-react-ssg entry. It provides the HelmetProvider (react-helmet-async)
// and the React Router data router for us, hydrates the prerendered HTML on
// the client, and drives static generation at build time. Global data
// providers and page chrome live in the root Layout (see App routes).
export const createRoot = ViteReactSSG({
  routes,
  basename: import.meta.env.BASE_URL,
})
