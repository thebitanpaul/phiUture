import Placeholder from '@/pages/Placeholder'
import { SEO } from '@/components/seo/SEO'

/**
 * 404 route. Reuses the shared Placeholder UI and marks the page noindex so
 * search engines don't index unknown URLs.
 */
export default function NotFound() {
  return (
    <>
      <SEO
        title="Page not found"
        description="The page you're looking for doesn't exist."
        path="/404"
        noindex
      />
      <Placeholder title="404" description="This page doesn't exist yet." />
    </>
  )
}
