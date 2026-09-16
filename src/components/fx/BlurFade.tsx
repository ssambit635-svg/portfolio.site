import { motion } from 'motion/react'
import type { ReactNode } from 'react'

/**
 * Fades content in with a soft blur and a small rise as it enters the
 * viewport — the reveal rhythm used across every section block.
 */
export function BlurFade({
  children,
  delay = 0,
  offset = 14,
  className
}: {
  children: ReactNode
  delay?: number
  offset?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: offset, filter: 'blur(5px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
