import { useId, type CSSProperties } from 'react'

interface PhiMarkProps {
  className?: string
  /** Fill with the brand magenta→violet gradient (default) or `currentColor`. */
  gradient?: boolean
  /** Accessible label. When omitted the mark is decorative (aria-hidden). */
  title?: string
  style?: CSSProperties
}

/**
 * The phiUture **φ**, drawn as vector geometry so it renders pixel-identically
 * on every OS and device.
 *
 * The literal “φ” character was the problem: Space Grotesk carries no Greek
 * glyphs, so the letter fell back to each platform's system font — Segoe UI on
 * Windows, San Francisco on macOS/iOS, Roboto on Android — and looked different
 * everywhere. This SVG removes that dependency entirely: one shape, one look.
 *
 * It sizes to the current font-size by default (`width/height: 1em`), so it can
 * drop straight into the same `text-*` classes the old glyph used, and it can
 * sit inline in a sentence or stand alone as the brand logo.
 */
export function PhiMark({ className, gradient = true, title, style }: PhiMarkProps) {
  // Unique per instance so multiple gradient marks on one page never collide.
  const gid = useId()
  const paint = gradient ? `url(#${gid})` : 'currentColor'

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{
        width: '1em',
        height: '1em',
        display: 'inline-block',
        verticalAlign: '-0.125em',
        ...style,
      }}
    >
      {gradient && (
        <defs>
          {/* 135° magenta→violet, matching the site's `.gradient-text`. */}
          <linearGradient id={gid} x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#d946ef" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      )}
      {/* The bowl — an open ring so the stem reads through it */}
      <ellipse cx="50" cy="50" rx="26" ry="23" fill="none" stroke={paint} strokeWidth="8.5" />
      {/* The stem — a vertical bar through the centre, past the bowl top & bottom */}
      <rect x="45.75" y="6" width="8.5" height="88" rx="4.25" fill={paint} />
    </svg>
  )
}
