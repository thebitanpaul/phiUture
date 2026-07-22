import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { NAV_ITEMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import logoSrc from '@/assets/Favicon_Trans.png'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => { setIsOpen(false) }, [location.pathname])

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/') {
      event.preventDefault()
      window.scrollTo(0, 0)
      return
    }

    event.preventDefault()
    navigate('/')
    window.scrollTo(0, 0)
  }

  // Top-level nav items (flatten nested groups, just show top label)
  const topItems = NAV_ITEMS.filter((item) => !item.children || item.path === '/products')
    .map((item) => ({ label: item.label, path: item.path }))

  return (
    <>
      {/* Navbar is pinned (always visible) so the hero heading has a stable
          target to fly into, and constant padding so that target never drifts. */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 py-4"
      >
        <nav
          className="mx-auto max-w-6xl px-6 flex items-center justify-between rounded-2xl py-2.5 glass-strong"
          style={{ border: '1px solid transparent', boxShadow: '0 10px 40px rgba(0,0,0,0.4)' }}
        >
          {/* Logo */}
          <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2.5 group">
            <img
              src={logoSrc}
              alt="phiUture"
              className="w-8 h-8 rounded-md transition-transform duration-500 group-hover:scale-110"
              style={{ filter: 'brightness(0.88) saturate(0.72) contrast(0.96)' }}
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {topItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300',
                    isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, rgba(217,70,239,0.1), rgba(168,85,247,0.05))',
                        border: '1px solid rgba(217,70,239,0.15)',
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-3">
            <Link
              to="/contact"
              className="hidden sm:flex px-5 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-magenta to-violet text-white transition-all duration-300 hover:shadow-lg hover:shadow-magenta/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get in Touch
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile slide-out */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-elevated border-l border-border p-6 pt-24 flex flex-col gap-2"
            >
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'px-4 py-3 rounded-xl text-base font-medium transition-colors duration-200',
                    location.pathname === item.path
                      ? 'text-text-primary bg-white/5'
                      : 'text-text-muted hover:text-text-secondary'
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-auto pt-6 border-t border-border">
                <Link
                  to="/contact"
                  className="flex items-center justify-center w-full px-5 py-3 text-sm font-medium rounded-full bg-gradient-to-r from-magenta to-violet text-white"
                >
                  Get in Touch
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}