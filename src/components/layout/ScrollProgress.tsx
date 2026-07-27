import { motion, useScroll, useSpring } from 'framer-motion'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    // Offset by --pwa-top-inset (0 in a browser tab) so the bar isn't hidden
    // behind the status bar when the site runs as an installed app.
    <motion.div
      className="fixed left-0 right-0 h-[2px] z-[100] origin-left"
      style={{
        top: 'var(--pwa-top-inset)',
        scaleX,
        background: 'linear-gradient(90deg, #c026d3, #a855f7, #d946ef)',
      }}
    />
  )
}
