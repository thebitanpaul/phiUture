import { useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'
import { Section } from '@/components/layout/Section'
import { GlassCard } from '@/components/ui/GlassCard'
import { Send, CheckCircle, Mail, MapPin, Link2, Share2 } from 'lucide-react'
import { useAbout } from '@/context/AboutContext'
import { socialIcon } from '@/components/icons/socialIcons'
import type { SocialLink } from '@/lib/types'

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
                    <Mail size={18} className="text-violet" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="typo-section text-sm text-text-primary mb-1">Email</h4>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="typo-body text-text-secondary text-sm hover:text-magenta transition-colors break-all"
                    >
                      {contactEmail}
                    </a>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Connect / Social — one card, two switchable tabs */}
            <GlassCard className="p-6" hoverTilt={false}>
              <SocialTabs connect={social.connect} profiles={social.profiles} />
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

type TabId = 'connect' | 'social'

/** One card, two tabs: a sliding gradient pill (shared design language with the
    product / gallery filter bars) over a crossfading grid of social chips.
    Both link sets come from about.json, so they're editable at runtime. */
function SocialTabs({
  connect,
  profiles,
}: {
  connect: SocialLink[]
  profiles: SocialLink[]
}) {
  const tabs = [
    { id: 'connect' as const, label: 'Connect', icon: Link2, links: connect },
    { id: 'social' as const, label: 'Social', icon: Share2, links: profiles },
  ]
  const [active, setActive] = useState<TabId>('connect')
  const current = tabs.find((t) => t.id === active) ?? tabs[0]

  return (
    <div>
      {/* Segmented tab control */}
      <div
        role="tablist"
        aria-label="Ways to connect"
        className="relative mb-5 flex gap-1 rounded-xl border border-white/[0.05] bg-white/[0.03] p-1"
      >
        {tabs.map((tab) => {
          const on = tab.id === active
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(tab.id)}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors duration-300 ${
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
              <tab.icon size={15} className="relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Crossfading panel — `layout` smooths the height change between tabs. */}
      <motion.div layout transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            role="tabpanel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <SocialGrid links={current.links} />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

/** A two-column grid of social chips, resolving each link's brand glyph. */
function SocialGrid({ links }: { links: SocialLink[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {links.map((link) => {
        const Icon = socialIcon(link.icon)
        return (
          <a
            key={link.id ?? link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-text-secondary text-sm hover:text-text-primary hover:border-white/10 transition-all duration-300"
          >
            {Icon && <Icon size={16} className="shrink-0" />}
            <span className="truncate">{link.platform}</span>
          </a>
        )
      })}
    </div>
  )
}
