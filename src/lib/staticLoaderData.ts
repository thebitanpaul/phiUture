// ============================================
// Hydration crash guard
// --------------------------------------------
// THE BUG THIS FIXES
//
// Intermittently, on a first load, the site died with React Router's default
// error screen:
//
//   Unexpected Application Error!
//   Unexpected token '<', "<!DOCTYPE "... is not valid JSON
//
// Cause: vite-react-ssg wraps EVERY route in a loader that resolves its
// prerendered loader data from a build-stamped manifest:
//
//   /static-loader-data-manifest-${window.__VITE_REACT_SSG_HASH__}.json
//
// It fetches that file and calls `.json()` on the response with no status check
// and no try/catch. The hash comes from the served HTML document, so any
// mismatch — a browser or CDN replaying a previous deploy's HTML, a URL served
// through the SPA rewrite, a redeploy mid-session — requests a manifest that no
// longer exists. Vercel answers the miss with an HTML page, `.json()` throws a
// SyntaxError inside a route loader, and React Router escalates it to the route
// error boundary. It's unreachable from app code: the fetch lives inside the
// library, so no amount of error handling in our components can catch it.
//
// THE FIX
//
// The library skips the fetch entirely when the data is already on `window`.
// Since not one route in this app declares a `loader` or `getStaticData`, the
// generated manifest is a map of nulls — every lookup resolves to `null`
// whether it comes from the network or from an empty object. So we hand the
// library an empty object up front: same resolved data, zero network calls, and
// the crash becomes structurally impossible instead of merely unlikely.
//
// IF YOU ADD A ROUTE LOADER: a route with `loader`/`getStaticData` needs the
// real manifest, so delete this guard (and re-audit the crash above) rather
// than trying to make the two coexist.
// ============================================

// `window.__VITE_REACT_SSG_STATIC_LOADER_DATA__` is declared by vite-react-ssg's
// own ambient types, so there is nothing to declare here.

/**
 * Seeds vite-react-ssg's static loader data so it never fetches the
 * build-stamped manifest on the client. Must be called before the router is
 * created. No-ops during the SSG/Node pass, where there is no `window`.
 */
export function primeStaticLoaderData(): void {
  if (typeof window === 'undefined') return
  if (window.__VITE_REACT_SSG_STATIC_LOADER_DATA__) return
  window.__VITE_REACT_SSG_STATIC_LOADER_DATA__ = {}
}
