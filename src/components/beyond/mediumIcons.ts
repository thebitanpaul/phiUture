import { Music2, Clapperboard, Images, Sparkles, type LucideIcon } from 'lucide-react'

const MEDIUM_ICONS: Record<string, LucideIcon> = {
  music: Music2,
  video: Clapperboard,
  images: Images,
}

/** Icon for a medium's `icon` key, with a safe fallback for unknown mediums. */
export function mediumIcon(key: string): LucideIcon {
  return MEDIUM_ICONS[key] ?? Sparkles
}
