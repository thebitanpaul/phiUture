import { Fragment } from 'react'
import { Wordmark } from './Wordmark'

interface BrandTextProps {
  children: string
  /** Passed through to each rendered <Wordmark />. */
  className?: string
}

/**
 * Renders a plain string but swaps every occurrence of the brand name for the
 * styled <Wordmark />. Detection is case-insensitive ("phiuture", "phiUture",
 * "PHIUTURE" … all match) and always renders the canonical lockup, so any
 * data-driven string — a page title, a section heading, or a journey entry
 * someone types tomorrow — carries the brand mark without hand-splitting it.
 */
export function BrandText({ children, className }: BrandTextProps) {
  return (
    <>
      {children.split(/(phiuture)/gi).map((part, i) =>
        part.toLowerCase() === 'phiuture' ? (
          <Wordmark key={i} className={className} />
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  )
}
