import { motion } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'
import { Construction } from 'lucide-react'
import { Link } from 'react-router-dom'

interface PlaceholderProps {
  title: string
  description?: string
}

export default function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <PageTransition>
      <section className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mx-auto mb-6">
            <Construction size={28} className="text-magenta" />
          </div>
          <h1 className="typo-section text-3xl md:text-4xl text-text-primary mb-4">
            {title}
          </h1>
          <p className="typo-body text-text-secondary mb-8">
            {description || 'This section is being crafted with care. Check back soon.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full glass text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Back to Home
          </Link>
        </motion.div>
      </section>
    </PageTransition>
  )
}
