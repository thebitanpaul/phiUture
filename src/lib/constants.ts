import type { NavItem } from './types'

export const SITE_CONFIG = {
  name: 'phiUture',
  tagline: 'Beautifully engineered technology, crafted for you, shaping the future.',
  description: 'phiUture — Premium technology solutions designed with the golden ratio of innovation.',
  url: 'https://phiuture.com',
  founder: 'Bitan Paul',
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/' },
  {
    label: 'Products',
    path: '/products',
    children: [
      { label: 'All Products', path: '/products' },
      { label: 'Applications', path: '/products?category=applications' },
      { label: 'AI', path: '/products?category=ai' },
      { label: 'Automation', path: '/products?category=automation' },
      { label: 'Data', path: '/products?category=data' },
      { label: 'Research', path: '/products?category=research' },
      { label: 'Games', path: '/products?category=games' },
    ],
  },
  { label: 'Beyond', path: '/beyond' },
  { label: 'About', path: '/about' },
]

// Social links and the contact email now live in public/data/about.json
// (see AboutContext / useAbout) so they can be changed at runtime without a
// rebuild. The Footer and Contact page read them from there.

export const ANIMATION_CONFIG = {
  stagger: 0.08,
  duration: 0.7,
  ease: [0.16, 1, 0.3, 1] as const,
  spring: { type: 'spring' as const, stiffness: 100, damping: 20 },
}
