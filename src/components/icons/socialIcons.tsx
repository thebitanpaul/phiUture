import type { ComponentType } from 'react'
import { Github, Linkedin, Mail } from 'lucide-react'
import {
  XIcon,
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
  SpotifyIcon,
  AppleMusicIcon,
  AmazonMusicIcon,
  YouTubeMusicIcon,
  GooglePlayIcon,
  SnapchatIcon,
} from './BrandIcons'

export type SocialIcon = ComponentType<{ size?: number | string; className?: string }>

// One place that maps a SocialLink `icon` key to its glyph — lucide for the
// generic ones, hand-rolled brand SVGs for the rest. Shared by the footer row
// and the Contact page so both stay in sync.
const ICONS: Record<string, SocialIcon> = {
  github: Github,
  linkedin: Linkedin,
  mail: Mail,
  x: XIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  youtube: YoutubeIcon,
  spotify: SpotifyIcon,
  applemusic: AppleMusicIcon,
  amazonmusic: AmazonMusicIcon,
  youtubemusic: YouTubeMusicIcon,
  googleplay: GooglePlayIcon,
  snapchat: SnapchatIcon,
}

export function socialIcon(key: string): SocialIcon | undefined {
  return ICONS[key]
}
