import { Trademark } from '@/components/ui/Trademark'

interface ProductNameProps {
  name: string
  /** Passed through to the TM mark — e.g. to recolour it on a tinted surface. */
  className?: string
}

/**
 * A product name closed by the TM mark, the way the brand wordmark is.
 *
 * Every place the UI shows a product name renders it through this, so the lockup
 * is identical on the detail hero, the grid cards, and the featured carousel —
 * and a new surface picks it up for free. Returns a fragment, so it drops into
 * whatever heading or link already carries the type styles.
 *
 * Deliberately NOT used for `alt`, `aria-label`, page titles, or Open Graph
 * metadata: those are plain strings where the bare name is the correct value.
 */
export function ProductName({ name, className }: ProductNameProps) {
  return (
    <>
      {name}
      <Trademark className={className} />
    </>
  )
}
