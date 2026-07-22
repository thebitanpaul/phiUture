import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface AnimatedGroupProps {
  children: ReactNode
  className?: string
  stagger?: number
  delay?: number
}

const container = (stagger: number, delay: number) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
})

export const animatedItem = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
}

export function AnimatedGroup({
  children,
  className,
  stagger = 0.08,
  delay = 0,
}: AnimatedGroupProps) {
  return (
    <motion.div
      variants={container(stagger, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div variants={animatedItem} className={className}>
      {children}
    </motion.div>
  )
}
