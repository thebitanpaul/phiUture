import { Fragment } from 'react'
import { Wordmark } from './Wordmark'

interface BrandTextProps {
  children: string
  /** Passed through to each rendered <Wordmark />. */
  className?: string
}

/**
 * Renders a plain string but swaps every occurrence of "phiUture" for the
 * styled <Wordmark />. Lets data-driven strings (page titles, section headings)
 * carry the brand lockup without hand-splitting them at each call site.
 */
export function BrandText({ children, className }: BrandTextProps) {
  return (
    <>
      {children.split(/(phiUture)/g).map((part, i) =>
        part === 'phiUture' ? (
          <Wordmark key={i} className={className} />
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  )
}
