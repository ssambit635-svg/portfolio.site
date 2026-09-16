import type { ElementType, ReactNode } from 'react'
import { createElement, useRef } from 'react'
import { gsap, SplitText, useGSAP } from '../../lib/gsap'
import { usePrefersReducedMotion } from '../../hooks'
import { cn } from '../../lib/utils'

type RevealHeadingProps = {
  children: ReactNode
  as?: ElementType
  className?: string
  /** Words revealed per second-ish: bigger = slower, more deliberate. */
  stagger?: number
  delay?: number
  duration?: number
  /** ScrollTrigger start position. */
  start?: string
  /** Play immediately on mount instead of waiting for scroll. */
  immediate?: boolean
  mode?: 'words' | 'chars'
}

/**
 * Editorial heading reveal: each line is masked, words slide up from
 * underneath with a soft blur. Powered by GSAP SplitText + ScrollTrigger.
 */
export function RevealHeading({
  children,
  as: Tag = 'h2',
  className,
  stagger = 0.055,
  delay = 0,
  duration = 1.05,
  start = 'top 88%',
  immediate = false,
  mode = 'words'
}: RevealHeadingProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reduced) return

      const split = SplitText.create(el, {
        type: mode === 'chars' ? 'lines,chars' : 'lines,words',
        mask: 'lines',
        linesClass: 'line-mask',
        autoSplit: true,
        onSplit: (self) => {
          const targets = (mode === 'chars' ? self.chars : self.words) as HTMLElement[]
          return gsap.fromTo(
            targets,
            { yPercent: 118, opacity: 0, rotate: 2.4 },
            {
              yPercent: 0,
              opacity: 1,
              rotate: 0,
              duration,
              delay,
              ease: 'editorial',
              stagger,
              scrollTrigger: immediate ? undefined : { trigger: el, start, once: true }
            }
          )
        }
      })

      return () => split.revert()
    },
    { scope: ref, dependencies: [reduced, immediate], revertOnUpdate: true }
  )

  return createElement(Tag, { ref, className: cn('will-change-transform', className) }, children)
}
