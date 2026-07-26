import { useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'
import { Section } from '@/components/layout/Section'
import { GlassCard } from '@/components/ui/GlassCard'
import { Send, CheckCircle, Mail, MapPin, Briefcase, User, Music } from 'lucide-react'
import { useAbout } from '@/context/AboutContext'
import { socialIcon } from '@/components/icons/socialIcons'
import type { ResolvedSocial, SocialLink } from '@/lib/types'
import { SEO } from '@/components/seo/SEO'

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

export default function Contact() {
  const { social } = useAbout()
  const contactEmail = social.email
  const [form, setForm] = useState<FormData>({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setStatus('sending')

    // Static site (no backend / secrets): compose the message and hand it to the
    // visitor's mail client, pre-addressed to the real inbox. They hit send and
    // the email lands at contactEmail, with their own address as the sender so
    // replies work.
    const subject = form.subject || `New message from ${form.name}`
    const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`

    window.location.href = mailto

    // The mail client opens over the page; reflect that the hand-off happened.
    setStatus('sent')
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  const inputClass =
    'w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-3.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-magenta/40 focus:ring-1 focus:ring-magenta/20 transition-all duration-300'

  return (
    <PageTransition>
      <SEO
        title="Contact"
        description="Have a project in mind, a question, or just want to connect with phiUture? Reach out and let's build something extraordinary."
        path="/contact"
      />
      {/* Header */}
      <section className="relative pt-40 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.03]"
            style={{ background: 'radial-gradient(circle, #d946ef, transparent 70%)' }}
          />
        </div>
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="typo-label text-magenta mb-4 block"
          >
            Contact
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="typo-display text-4xl md:text-6xl text-text-primary"
          >
            Let's build something
            <br />
            <span className="gradient-text">extraordinary</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="typo-body text-text-secondary text-lg mt-5 max-w-xl mx-auto"
          >
            Have a project in mind, a question, or just want to connect? Reach out and let's talk.
          </motion.p>
        </div>
      </section>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-3"
          >
            <GlassCard className="p-8 md:p-10" hoverTilt={false}>
              {status === 'sent' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <CheckCircle size={48} className="text-green-400 mx-auto mb-5" />
                  <h3 className="typo-section text-2xl text-text-primary mb-3">
                    Almost there
                  </h3>
                  <p className="typo-body text-text-secondary">
                    Your email client should have opened with the message ready —
                    just hit send and it lands in our inbox. We'll get back to you
                    shortly.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-8 px-6 py-2.5 rounded-full glass text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Send another
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="typo-label text-text-muted mb-2 block">Name</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your name"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="typo-label text-text-muted mb-2 block">Email</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="typo-label text-text-muted mb-2 block">Subject</label>
                    <input
                      type="text"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="What's this about?"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="typo-label text-text-muted mb-2 block">Message</label>
                    <textarea
                      required
                      rows={6}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us about your project, idea, or question..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-sm text-red-400">
                      Something went wrong. Please try again or email directly.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-magenta to-violet text-white font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-magenta/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === 'sending' ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </GlassCard>
          </motion.div>

          {/* Sidebar info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            {/* Coordinates — location + direct email, paired in one card so the
                column keeps an even rhythm instead of two stubby stubs. */}
            <GlassCard className="p-6" hoverTilt={false}>
              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-magenta/10 flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-magenta" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="typo-section text-sm text-text-primary mb-1">Location</h4>
                    <p className="typo-body text-text-secondary text-sm">India — Available worldwide</p>
                  </div>
                </div>

                <div className="h-px bg-white/[0.06]" />

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet/10 flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-violet" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="typo-section text-sm text-text-primary mb-1.5">Email</h4>
                    {/* Both inboxes, labelled — project enquiries and anything
                        personal genuinely go to different places. */}
                    <p className="typo-body text-sm">
                      <span className="text-text-muted text-xs">Business — </span>
                      <a
                        href={`mailto:${contactEmail}`}
                        className="text-text-secondary hover:text-magenta transition-colors break-all"
                      >
                        {contactEmail}
                      </a>
                    </p>
                    {social.personalEmail && (
                      <p className="typo-body text-sm mt-1">
                        <span className="text-text-muted text-xs">Founder — </span>
                        <a
                          href={`mailto:${social.personalEmail}`}
                          className="text-text-secondary hover:text-magenta transition-colors break-all"
                        >
                          {social.personalEmail}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Business / People / Artist — one card, three switchable tabs */}
            <GlassCard className="p-6" hoverTilt={false}>
              <SocialTabs social={social} />
            </GlassCard>

            {/* Quick note */}
            <div className="typo-body text-text-muted text-xs leading-relaxed px-1">
              Typical response time is within 24 hours. For urgent matters, reach out directly via email.
            </div>
          </motion.div>
        </div>
      </Section>
    </PageTransition>
  )
}

type TabId = 'business' | 'people' | 'artist'

/** One card, three tabs — the three identities behind the site: the studio, the
    person, and the musician. A sliding gradient pill (shared design language
    with the product / gallery filter bars) sits over a crossfading grid of
    chips. Every link comes from about.json, so all three sets are editable at
    runtime without a rebuild.

    Empty groups are dropped rather than rendered as a dead tab, which is what
    keeps this correct if an older copy of about.json is ever served. */
function SocialTabs({ social }: { social: ResolvedSocial }) {
  const tabs = [
    {
      id: 'business' as const,
      label: 'Business',
      icon: Briefcase,
      blurb: 'Official channels.',
      links: social.business,
    },
    {
      id: 'people' as const,
      label: 'Founder',
      icon: User,
      blurb: 'The founder behind phiUture.',
      links: social.people,
    },
    {
      id: 'artist' as const,
      label: 'Artist',
      icon: Music,
      blurb: 'Creativity beyond Technology.',
      links: social.artist,
    },
  ].filter((tab) => tab.links.length > 0)

  const [active, setActive] = useState<TabId>('business')
  const current = tabs.find((t) => t.id === active) ?? tabs[0]

  if (!current) return null

  return (
    <div>
      {/* Segmented tab control */}
      <div
        role="tablist"
        aria-label="Ways to connect"
        className="relative mb-4 flex gap-1 rounded-xl border border-white/[0.05] bg-white/[0.03] p-1"
      >
        {tabs.map((tab) => {
          const on = tab.id === current.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(tab.id)}
              className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors duration-300 sm:text-sm ${
                on ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {on && (
                <motion.span
                  layoutId="social-tab-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(217,70,239,0.16), rgba(168,85,247,0.08))',
                    border: '1px solid rgba(217,70,239,0.2)',
                  }}
                  transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                />
              )}
              <tab.icon size={14} className="relative z-10 shrink-0" aria-hidden="true" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Crossfading panel — `layout` smooths the height change between tabs. */}
      <motion.div layout transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            role="tabpanel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="typo-body mb-3.5 text-xs text-text-muted">{current.blurb}</p>
            <SocialGrid links={current.links} />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

/** A two-column grid of social chips, resolving each link's brand glyph.
    `mailto:` entries open the visitor's mail client in place, so they get no
    `target="_blank"` — a blank tab that immediately closes itself is worse than
    no tab at all. */
function SocialGrid({ links }: { links: SocialLink[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {links.map((link) => {
        const Icon = socialIcon(link.icon)
        const external = /^https?:\/\//i.test(link.url)
        return (
          <a
            key={link.id ?? link.platform}
            href={link.url}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-text-secondary text-sm hover:text-text-primary hover:border-white/10 transition-all duration-300"
          >
            {Icon && <Icon size={16} className="shrink-0" aria-hidden="true" />}
            <span className="truncate">{link.platform}</span>
          </a>
        )
      })}
    </div>
  )
}
