import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SectionProps {
  id?: string
  label?: string
  title?: string
  subtitle?: ReactNode
  children: ReactNode
  className?: string
  fullWidth?: boolean
}

export function Section({
  id,
  label,
  title,
  subtitle,
  children,
  className,
  fullWidth = false,
}: SectionProps) {
  return (
    <section id={id} className={cn('relative py-24 md:py-32', className)}>
      <div className={cn(fullWidth ? 'w-full' : 'max-w-6xl mx-auto px-6')}>
        {(label || title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16 md:mb-20"
          >
            {label && (
              <span className="typo-label text-magenta mb-4 block">{label}</span>
            )}
            {title && (
              <h2 className="typo-section text-3xl md:text-4xl lg:text-5xl text-text-primary max-w-3xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="typo-body text-text-secondary mt-5 max-w-2xl text-lg">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  )
}
