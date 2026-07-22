import { Link } from 'react-router-dom'
import { SITE_CONFIG } from '@/lib/constants'
import { useAbout } from '@/context/AboutContext'
import { socialIcon } from '@/components/icons/socialIcons'
import { Wordmark } from '@/components/ui/Wordmark'

export function Footer() {
  const { social } = useAbout()
  const year = new Date().getFullYear()

  // "Connect" links + the creator channels flagged for the footer — all
  // configurable at runtime from about.json.
  const footerLinks = [
    ...social.connect,
    ...social.profiles.filter((s) => s.footer),
  ]

  return (
    <footer className="relative border-t border-border">
      {/* Top gradient line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(217,70,239,0.4), rgba(168,85,247,0.4), transparent)',
        }}
      />

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="text-text-muted text-sm">
              <Wordmark className="text-text-secondary" /> &copy; {year}
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/about"
              className="text-text-muted text-sm hover:text-text-secondary transition-colors"
            >
              About
            </Link>
            <Link
              to="/products"
              className="text-text-muted text-sm hover:text-text-secondary transition-colors"
            >
              Products
            </Link>
            <Link
              to="/contact"
              className="text-text-muted text-sm hover:text-text-secondary transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Social */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {footerLinks.map((link) => {
              const Icon = socialIcon(link.icon)
              return (
                <a
                  key={link.id ?? link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted hover:text-magenta transition-colors duration-300"
                  aria-label={link.platform}
                >
                  {Icon && <Icon size={18} />}
                </a>
              )
            })}
          </div>
        </div>

        {/* Tagline */}
        <p className="text-center text-text-muted/40 text-xs mt-10 tracking-wide">
          {SITE_CONFIG.tagline}
        </p>
      </div>
    </footer>
  )
}
