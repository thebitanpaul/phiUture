import type { CSSProperties } from 'react'

// Brand transparent logo, via Cloudinary. `e_trim` strips the surrounding
// transparent padding baked into the export (that padding is what made the mark
// look small and detached from adjacent text); `f_auto,q_auto` serve an
// optimized, tiny image instead of the 1.3 MB source PNG.
const SRC =
  'https://res.cloudinary.com/b0tb1mho/image/upload/e_trim,f_auto,q_auto/v1784753097/aj9rycbehzhpwepoc3g0.png'

interface PhiLogoProps {
  className?: string
  /** Accessible label. Omit to render the mark as decorative. */
  alt?: string
  style?: CSSProperties
}

/**
 * The phiUture logo mark — the brand-kit transparent logo, rendered as an
 * `<img>` so it looks identical on every OS and device. It sizes to the current
 * font-size (`height: 1em`) and keeps its natural width, so it behaves like a
 * glyph: drop it into the same `text-*` classes as the surrounding text and it
 * sits inline with no extra gap.
 */
export function PhiLogo({ className, alt = '', style }: PhiLogoProps) {
  return (
    <img
      src={SRC}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={className}
      style={{
        height: '1em',
        width: 'auto',
        display: 'inline-block',
        verticalAlign: '-0.15em',
        ...style,
      }}
    />
  )
}
